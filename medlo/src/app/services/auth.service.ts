import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap, timeout } from 'rxjs/operators';
import { User, UserRole, UserLogin } from '../models/user.model';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseApiUrl = 'http://localhost:5246/api';
  private apiUrl = `${this.baseApiUrl}/user`; // Make sure this matches your backend URL
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;
  // Used for tracking connection status
  private serverConnected: boolean = false;
  // Store connection error details for debugging
  private connectionError: any = null;
  // Store real user credentials
  private realUserCredentials: {username: string, password: string, isAdmin: boolean}[] = [
    { username: 'admin', password: 'admin123', isAdmin: true },
    { username: 'faculty', password: 'faculty123', isAdmin: false },
    { username: 'test', password: 'test123', isAdmin: false },
    { username: 'user', password: 'user123', isAdmin: false },
    { username: 'demo', password: 'demo123', isAdmin: false }
  ];

  constructor(private http: HttpClient, private router: Router) {
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    
    // Check if user is already logged in (only in browser)
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  login(userLogin: UserLogin): Observable<User> {
    console.log('Login attempt for user:', userLogin.username);
    
    // Always accept hardcoded credentials for development convenience
    if (this.isHardcodedValidCredential(userLogin)) {
      console.log('Using hardcoded credentials for login');
      // Create a proper GUID format for the user ID that will be compatible with the backend
      const user: User = {
        id: this.generateValidGuid(),
        username: userLogin.username,
        role: userLogin.username.toLowerCase().includes('admin') ? UserRole.Admin : UserRole.Faculty
      };
      
      if (this.isBrowser) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      this.currentUserSubject.next(user);
      return of(user);
    }
    
    // First check if server is reachable - but only if not using hardcoded credentials
    return this.checkServerConnection().pipe(
      switchMap((isConnected: boolean) => {
        console.log('Server connection status:', isConnected);
        
        if (!isConnected) {
          return throwError(() => new Error('Server bağlantısı kurulamadı. Lütfen demo bilgilerini kullanın: admin/admin123'));
        }
        
        // If server is connected, try the actual API          // First, log to console what we're sending
        console.log('Sending user credentials:', JSON.stringify(userLogin));
        
        const endpoint = userLogin.username.toLowerCase().includes('admin') ? 
          `${this.apiUrl}/login/admin` : 
          `${this.apiUrl}/login/faculty`;

        console.log('Attempting login with backend API at:', endpoint);
        
        return this.http.post<any>(endpoint, userLogin, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }).pipe(
          map(response => {
            console.log('Backend login successful:', response);
            
            // Create a user object based on the login information and API response
            const user: User = {
              // If the response contains an ID, use it; otherwise use a valid ID from the database
              id: response.id || 'e27a1f79-35f8-45e3-9ad3-03fb76742db8',
              username: userLogin.username,
              role: userLogin.username.toLowerCase().includes('admin') ? UserRole.Admin : UserRole.Faculty
            };
            
            // Store user in local storage (only in browser)
            if (this.isBrowser) {
              localStorage.setItem('currentUser', JSON.stringify(user));
            }
            
            // Update current user subject
            this.currentUserSubject.next(user);
            return user;
          }),
        );
      }),
      catchError(error => {
        console.error('Login failed:', error);
        console.log('Error details:', { status: error.status, message: error.message, error });
        
        // First check if we have valid hardcoded credentials
        // This ensures hardcoded credentials always work even when the server is down
        if (this.isHardcodedValidCredential(userLogin)) {
          console.log('Using hardcoded credentials as fallback after API failure');
          const user: User = {
            id: this.generateValidGuid(), // Generate valid GUID format
            username: userLogin.username,
            role: userLogin.username.toLowerCase().includes('admin') ? UserRole.Admin : UserRole.Faculty
          };
          
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          
          this.currentUserSubject.next(user);
          return of(user);
        }
        
        // Special case for "real" user login - try direct login if using faculty or admin endpoint fails
        if (error.status === 401 || error.status === 403) {
          console.log('Regular login failed, trying direct authentication...');
          
          // Try the other endpoint as a fallback
          const alternateEndpoint = userLogin.username.toLowerCase().includes('admin') ? 
            `${this.baseApiUrl}/user/login/faculty` : 
            `${this.baseApiUrl}/user/login/admin`;
            
          console.log('Trying alternate endpoint:', alternateEndpoint);
          
          return this.http.post<any>(alternateEndpoint, userLogin, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }).pipe(
            map(response => {
              console.log('Alternate endpoint login successful:', response);
              
              // Create user from alternate endpoint - use valid ID from database
              const user: User = {
                // Use ID from response if available, or use a known valid ID
                id: (response && response.id) ? response.id : 'e27a1f79-35f8-45e3-9ad3-03fb76742db8',
                username: userLogin.username,
                role: alternateEndpoint.includes('admin') ? UserRole.Admin : UserRole.Faculty
              };
              
              if (this.isBrowser) {
                localStorage.setItem('currentUser', JSON.stringify(user));
              }
              
              this.currentUserSubject.next(user);
              return user;
            }),
            catchError(alternateError => {
              console.error('Both login endpoints failed:', alternateError);
              
              // If both endpoints fail, handle server errors
              if (!error.status || error.status === 0 || error.status === 504 || error.status === 502) {
                return throwError(() => new Error(`Server bağlantısı kurulamadı (${error.status || 'bağlantı hatası'}). Lütfen demo bilgilerini kullanın: admin/admin123`));
              }
              
              return throwError(() => new Error('Geçersiz kullanıcı adı veya şifre. Lütfen bilgilerinizi kontrol edin veya demo hesabı kullanın: admin/admin123'));
            })
          );
        }
        
        // If credentials are not in our hardcoded list, then handle server errors
        if (!error.status || error.status === 0 || error.status === 504 || error.status === 502) {
          return throwError(() => new Error(`Server bağlantısı kurulamadı (${error.status || 'bağlantı hatası'}). Lütfen demo bilgilerini kullanın: admin/admin123`));
        }
        
        // Provide more specific error messages based on status code
        if (error.status === 401) {
          return throwError(() => new Error('Geçersiz kullanıcı adı veya şifre. Lütfen aşağıdaki demo bilgilerini deneyin: admin/admin123'));
        } else if (error.status === 404) {
          return throwError(() => new Error('API endpoint bulunamadı (404). Lütfen demo bilgilerini kullanın: admin/admin123'));
        } else if (error.status === 403) {
          return throwError(() => new Error('Bu işlem için yetkiniz bulunmamaktadır (403). Lütfen demo bilgilerini kullanın: admin/admin123'));
        }
        
        return throwError(() => new Error(`Giriş yapılamadı (Hata: ${error.status || 'bilinmeyen'}). Lütfen demo bilgilerini kullanın: admin/admin123`));
      })
    );
  }
  
  // Helper method to check for hardcoded credentials (for demo/development)
  private isHardcodedValidCredential(userLogin: UserLogin): boolean {
    console.log('Checking if credentials are valid hardcoded credentials:', userLogin.username);
    console.log('Available hardcoded credentials:', this.realUserCredentials);
    
    // Define hardcoded credentials for testing
    const validCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'faculty', password: 'faculty123' },
      { username: 'test', password: 'test123' },
      // Add more test users if needed
      { username: 'user', password: 'user123' },
      { username: 'demo', password: 'demo123' }
    ];
    
    console.log('Checking hardcoded credentials for:', userLogin.username);
    
    // Check against hardcoded credentials
    const hardcodedMatch = validCredentials.some(cred => {
      const match = cred.username.toLowerCase() === userLogin.username.toLowerCase() && 
                   cred.password === userLogin.password;
      if (match) console.log('Found matching hardcoded credential');
      return match;
    });

    // Also check against real user credentials
    const realUserMatch = this.realUserCredentials.some(cred => {
      const match = cred.username.toLowerCase() === userLogin.username.toLowerCase() && 
                   cred.password === userLogin.password;
      if (match) console.log('Found matching real user credential');
      return match;
    });
    
    return hardcodedMatch || realUserMatch;
  }
  
  // Helper method to add real user credentials to the hardcoded list
  public addRealUserCredentials(username: string, password: string, isAdmin: boolean = false): void {
    console.log(`Adding real user credentials for: ${username}`);
    this.realUserCredentials.push({
      username: username,
      password: password,
      isAdmin: isAdmin
    });
  }
  
  // Method to check if the server is reachable
  public checkServerConnection(): Observable<boolean> {
    console.log('Checking server connection at:', this.apiUrl);
    
    // Use a GET request to test connectivity
    return this.http.get(`${this.apiUrl}`, { 
      observe: 'response',
      responseType: 'text',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
      .pipe(
        timeout(5000), // Add timeout of 5 seconds
        map(response => {
          console.log('Server connection successful:', response);
          this.serverConnected = true;
          return true;
        }),
        catchError(error => {
          console.error('Server connection failed:', error);
          console.log('Status:', error.status, error.statusText);
          // Store error details for debugging
          this.connectionError = error;
          this.serverConnected = false;
          return of(false);
        })
      );
  }
  
  // Get server connection status
  public isServerConnected(): boolean {
    return this.serverConnected;
  }
  
  // Get the last connection error
  public getConnectionError(): any {
    return this.connectionError;
  }
  
  // Get list of users (for debugging/testing purposes)
  public getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Get valid user IDs from the database
  getValidUserIds(): Observable<string[]> {
    return this.http.get<any[]>(`${this.baseApiUrl}/user`).pipe(
      map(users => {
        console.log('Retrieved valid user IDs from database:', users);
        return users.map(user => user.id);
      }),
      catchError(error => {
        console.error('Failed to retrieve valid user IDs:', error);
        // Fallback to known working IDs
        return of([
          'e27a1f79-35f8-45e3-9ad3-03fb76742db8',
          'cf153e23-bf23-49da-a2a2-27c8bc869405'
        ]);
      })
    );
  }

  // Get a user by username from the database
  getUserByUsername(username: string): Observable<User> {
    console.log(`Fetching user with username: ${username}`);
    return this.http.get<any[]>(`${this.baseApiUrl}/user`).pipe(
      map(users => {
        console.log('Retrieved users from database:', users);
        
        // Return a fallback user if we can't find a match
        const fallbackUser: User = {
          id: 'e27a1f79-35f8-45e3-9ad3-03fb76742db8', // Known valid user ID
          username: username,
          role: username.toLowerCase().includes('admin') ? UserRole.Admin : UserRole.Faculty
        };
        
        // If no users found, return fallback
        if (!users || !Array.isArray(users) || users.length === 0) {
          console.log('No users found in database, using fallback');
          return fallbackUser;
        }
        
        // Find the user with the matching username
        const foundUser = users.find(user => 
          user.username && user.username.toLowerCase() === username.toLowerCase()
        );
        
        if (!foundUser) {
          console.warn(`User with username ${username} not found in database, using fallback`);
          return fallbackUser;
        }
        
        console.log('Found user in database:', foundUser);
        
        // Make sure we have a properly formed user to return
        const dbUser: User = {
          id: foundUser.id || 'e27a1f79-35f8-45e3-9ad3-03fb76742db8',
          username: foundUser.username || username,
          role: (foundUser.role === 'Admin' || foundUser.username?.toLowerCase().includes('admin')) 
            ? UserRole.Admin 
            : UserRole.Faculty
        };
        
        return dbUser;
      }),
      catchError(error => {
        console.error(`Error fetching user with username ${username}:`, error);
        // If we can't fetch users, fallback to a known working ID
        return of({
          id: 'e27a1f79-35f8-45e3-9ad3-03fb76742db8', // Known valid user ID
          username: username,
          role: username.toLowerCase().includes('admin') ? UserRole.Admin : UserRole.Faculty
        });
      })
    );
  }

  logout(): void {
    // Remove user from local storage (only in browser)
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    
    // Reset current user subject
    this.currentUserSubject.next(null);
    
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return !!user && user.role === UserRole.Admin;
  }

  /**
   * Generates a valid GUID that is compatible with C#'s Guid type
   * This ensures the backend can correctly process user IDs
   */
  private generateValidGuid(): string {
    // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // where x is any hexadecimal digit and y is one of 8, 9, A, or B
    const hexDigits = '0123456789abcdef';
    let guid = '';
    
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        guid += '-';
      } else if (i === 14) {
        guid += '4'; // Version 4 UUID always has a '4' in this position
      } else if (i === 19) {
        guid += hexDigits.charAt(Math.floor(Math.random() * 4) + 8); // 8, 9, a, or b
      } else {
        guid += hexDigits.charAt(Math.floor(Math.random() * 16));
      }
    }
    
    return guid;
  }
}
