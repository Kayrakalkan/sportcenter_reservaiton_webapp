import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:5246/api';

  constructor(private http: HttpClient) { }

  // Create headers for better CORS handling
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Create an event or block time slot
  createEvent(event: Partial<Reservation>): Observable<Reservation> {
    console.log('Creating event with data:', event);
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, event, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError('createEvent'))
    );
  }

  // Get all reservations (including training and events)
  getAllReservations(): Observable<Reservation[]> {
    console.log('Admin: Fetching all reservations from:', `${this.apiUrl}/reservations`);
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Admin: Error fetching reservations:', error);
        console.error('Admin: Error response body:', error.error);
        // Return an empty array to allow the application to continue
        return of([]);
      })
    );
  }

  // Delete a reservation
  deleteReservation(id: string): Observable<any> {
    console.log('Deleting reservation with id:', id);
    return this.http.delete(`${this.apiUrl}/reservations/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError('deleteReservation'))
    );
  }
  
  // Error handler
  private handleError(operation = 'operation', result?: any) {
    return (error: any): Observable<any> => {
      console.error(`${operation} failed: ${error.message}`);
      console.log('Error details:', error);
      
      // Let the app keep running by returning an empty result or the provided default
      return throwError(() => new Error(`${operation} failed: ${error.message}`));
    };
  }
}
