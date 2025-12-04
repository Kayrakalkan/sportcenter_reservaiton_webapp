import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private  apiUrl = 'http://localhost:5246/api';
  
  // Behavior subject to track backend connectivity status
  private backendConnected = new BehaviorSubject<boolean>(true); // Default to true to prevent loading issues
  public backendConnected$ = this.backendConnected.asObservable();
  
  // Keep track of the last error
  private lastConnectionError: any = null;

  constructor(private http: HttpClient) {
    // Don't assume connectivity
    this.backendConnected.next(false);
    
    // Check connectivity immediately but don't block app loading
    setTimeout(() => {
      this.checkBackendConnectivity().subscribe({
        next: (isConnected) => {
          console.log('Initial backend connectivity check result:', isConnected);
        },
        error: (err) => {
          console.error('Error checking connectivity:', err);
        }
      });
      
      // Set up periodic connectivity checks every 30 seconds
      timer(30000, 30000).pipe(
        switchMap(() => this.checkBackendConnectivity())
      ).subscribe();
    }, 1000);
  }

  /**
   * Check if the backend API is reachable
   */
  public checkBackendConnectivity(): Observable<boolean> {
    console.log('Checking backend connectivity...');
    
    // Try multiple endpoints to check connectivity
    const endpoints = [
      `${this.apiUrl}/user`,  // Standard user endpoint
      `${this.apiUrl}`,       // Root API endpoint
      'http://localhost:5246/swagger/index.html' // Swagger docs
    ];
    
    // Try each endpoint sequentially
    return this.http.get(endpoints[0], {
      observe: 'response'
    }).pipe(
      timeout(3000), // Add 3 second timeout
      map(response => {
        console.log('Backend connectivity check succeeded:', response);
        this.backendConnected.next(true);
        this.lastConnectionError = null;
        return true;
      }),
      catchError(error => {
        console.error('First endpoint check failed, trying alternative endpoint');
        
        // Try the second endpoint
        return this.http.get(endpoints[1], {
          observe: 'response'
        }).pipe(
          timeout(3000),
          map(response => {
            console.log('Second endpoint connectivity check succeeded:', response);
            this.backendConnected.next(true);
            this.lastConnectionError = null;
            return true;
          }),
          catchError(error2 => {
            console.error('All backend connectivity checks failed');
            this.lastConnectionError = error;
            this.backendConnected.next(false);
            return of(false);
          })
        );
      })
    );
  }

  /**
   * Get current backend connectivity status
   */
  public isBackendConnected(): boolean {
    return this.backendConnected.getValue();
  }

  /**
   * Get the last connection error
   */
  public getLastConnectionError(): any {
    return this.lastConnectionError;
  }
}
