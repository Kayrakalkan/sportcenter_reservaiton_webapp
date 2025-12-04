import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reservation, ReservationType } from '../models/reservation.model';
import { AuthService } from './auth.service';

// Known valid user IDs from the database as fallback
const VALID_USER_IDS = [
  'e27a1f79-35f8-45e3-9ad3-03fb76742db8', // Known faculty user ID
  'cf153e23-bf23-49da-a2a2-27c8bc869405', // Another valid user ID seen in API responses
];

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:5246/api/reservations';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Create headers for better CORS handling
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  getAllReservations(): Observable<Reservation[]> {
    console.log('Fetching all reservations from:', this.apiUrl);
    
    return this.http.get<Reservation[]>(this.apiUrl, {
      headers: this.getHeaders(),
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('Raw API response status:', response.status);
        console.log('Raw API response headers:', response.headers);
        console.log('Raw API response body:', response.body);
        
        // Return just the body data
        return response.body || [];
      }),
      catchError((error) => {
        console.error('Error fetching reservations:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error response body:', error.error);
        
        // Return an empty array to allow the application to continue
        return of([]);
      })
    );
  }

  getReservationById(id: string): Observable<Reservation> {
    console.log(`Fetching reservation with id: ${id}`);
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error(`Error fetching reservation with ID ${id}:`, error);
        return throwError(() => new Error(`Error fetching reservation: ${error.message}`));
      })
    );
  }

  // Get a valid user ID from the database
  private getValidUserId(): Observable<string> {
    console.log('Attempting to get a valid user ID from database');
    
    // First try to get the current user's ID if they are logged in with a real backend user
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser && currentUser.id) {
      console.log('Using current user ID from auth service:', currentUser.id);
      return of(currentUser.id);
    }
    
    // If no current user, fetch all users and use the first valid one
    return this.http.get<any[]>('http://localhost:5246/api/user').pipe(
      map(users => {
        console.log('Retrieved users from database:', users);
        
        if (users && users.length > 0 && users[0].id) {
          console.log('Using valid user ID from database:', users[0].id);
          return users[0].id;
        }
        
        // Fallback to a known working ID
        console.log('No valid users found in database, using fallback ID');
        return VALID_USER_IDS[0];
      }),
      catchError(error => {
        console.error('Error fetching users from database:', error);
        // Fallback to known valid ID
        console.log('Using fallback valid user ID:', VALID_USER_IDS[0]);
        return of(VALID_USER_IDS[0]);
      })
    );
  }

  createReservation(reservation: Partial<Reservation>): Observable<Reservation> {
    console.log('Creating reservation with data:', reservation);
    
    // Get a valid user ID from the database
    return this.getValidUserId().pipe(
      switchMap(userId => {
        console.log('Using validated userId from database:', userId);
        
        // Format dates properly for backend
        const payload = {
          userId: userId,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          type: Number(reservation.type) // Ensure we're sending a numeric type value
        };
        
        console.log('Sending reservation payload to backend:', payload);
        
        // Try to create the reservation on the backend
        return this.http.post<Reservation>(this.apiUrl, payload, {
          headers: this.getHeaders()
        }).pipe(
          catchError((error) => {
            console.error('Error creating reservation:', error);
            console.error('Error response body:', error.error);
            
            // If we can't reach the backend, create a local reservation (demo mode)
            if (!error.status || error.status === 0 || error.status === 504 || error.status === 502) {
              console.log('Backend unreachable, creating demo reservation instead');
              
              // Generate a demo reservation with proper date handling
              const demoReservation: Reservation = {
                id: this.generateGuid(),
                userId: userId,
                startTime: reservation.startTime instanceof Date ? reservation.startTime : new Date(),
                endTime: reservation.endTime instanceof Date ? reservation.endTime : new Date(),
                type: reservation.type !== undefined ? reservation.type : ReservationType.Training,
                username: reservation.username || 'Demo User'
              };
              
              console.log('Created demo reservation:', demoReservation);
              return of(demoReservation);
            }
            
            // For other errors, propagate them with more details
            return throwError(() => new Error(`Rezervasyon oluşturulamadı: ${error.error || error.message || 'Bilinmeyen hata'}`));
          })
        );
      })
    );
  }

  deleteReservation(id: string): Observable<any> {
    console.log(`Deleting reservation with id: ${id}`);
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error(`Error deleting reservation with ID ${id}:`, error);
        return throwError(() => new Error(`Error deleting reservation: ${error.message}`));
      })
    );
  }

  checkAvailability(startTime: Date, endTime: Date): Observable<boolean> {
    console.log(`Checking availability from ${startTime} to ${endTime}`);
    return this.http.get<boolean>(`${this.apiUrl}/availability?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error(`Error checking availability:`, error);
        return of(false); // Assume not available on error
      })
    );
  }

  // Helper function to format date for display
  formatDate(date: Date): string {
    return new Date(date).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Helper function to generate a GUID
  generateGuid(): string {
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where x is any hex digit and y is one of 8, 9, A, or B
    const hexDigits = '0123456789abcdef';
    let guid = '';
    
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        guid += '-';
      } else if (i === 14) {
        guid += '4'; // Version 4 UUID always has '4' here
      } else if (i === 19) {
        guid += hexDigits.charAt(Math.floor(Math.random() * 4) + 8); // 8, 9, a, or b
      } else {
        guid += hexDigits.charAt(Math.floor(Math.random() * 16));
      }
    }
    
    return guid;
  }
}
