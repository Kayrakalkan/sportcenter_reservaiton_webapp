import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5246/api/user';

  constructor(private http: HttpClient) { }

  // Create headers for better CORS handling
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Get all users from database
  getAllUsers(): Observable<User[]> {
    console.log('Fetching all users from:', this.apiUrl);
    
    return this.http.get<User[]>(this.apiUrl, {
      headers: this.getHeaders()
    }).pipe(
      map(users => {
        console.log('Users fetched successfully:', users);
        return users;
      }),
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  // Get a specific user by ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error(`Error fetching user with ID ${id}:`, error);
        throw error;
      })
    );
  }
}
