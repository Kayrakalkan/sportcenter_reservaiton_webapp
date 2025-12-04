import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService } from '../../services/auth.service';
import { User, UserLogin } from '../../models/user.model';
import { ConnectivityService } from '../../services/connectivity.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatExpansionModule,
    MatCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  error = '';
  isLoading = false;
  serverConnected = false;
  serverStatusChecked = false;
  
  // For saving real credentials
  savedUsername = '';
  savedPassword = '';
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private connectivityService: ConnectivityService
  ) {
    // Initialize the form
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    
    // Check server connection on startup
    this.checkServerStatus();
  }
  
  // Highlight the demo credentials section  
  highlightDemoCredentials(): void {
    // Pre-fill with demo values
    this.loginForm.patchValue({
      username: 'admin',
      password: 'admin123'
    });
    
    // Highlight the demo info box
    setTimeout(() => {
      const demoInfo = document.querySelector('.demo-info');
      if (demoInfo) {
        demoInfo.classList.add('highlight');
        setTimeout(() => {
          demoInfo?.classList.remove('highlight');
        }, 3000);
      }
    }, 500);
  }

  // Check if the backend server is available
  checkServerStatus(): void {
    this.isLoading = true;
    console.log('Checking server status...');
    
    this.connectivityService.checkBackendConnectivity().subscribe({
      next: (connected: boolean) => {
        this.isLoading = false;
        this.serverStatusChecked = true;
        this.serverConnected = connected;
        console.log('Server connection check result:', connected);
        
        if (!connected) {
          const errorDetails = this.connectivityService.getLastConnectionError();
          console.log('Connection error details:', errorDetails);
          
          // Provide more detailed error message
          this.error = `Server bağlantısı kurulamadı. (${errorDetails?.status || 'Unknown error'}) Lütfen demo bilgilerini kullanın.`;
          
          // Highlight demo credentials
          this.highlightDemoCredentials();
        } else {
          console.log('Server is connected and ready');
          // Get actual login credentials from backend for testing - fetch first user
          this.fetchTestUsers();
        }
      },
      error: (err) => {
        console.error('Error during server status check:', err);
        this.isLoading = false;
        this.error = 'Error checking server status. Please try demo credentials.';
      }
    });
  }
  
  // Fetch test users from backend for debugging
  fetchTestUsers(): void {
    this.authService.getUsers().subscribe({
      next: (users: any[]) => {
        console.log('Available users from backend:', users);
        if (users && users.length > 0) {
          // Show a hint about actual backend users
          const testUser = users[0];
          console.log(`Hint: Try username: ${testUser.username}`);
        }
      },
      error: (err) => {
        console.error('Failed to fetch test users:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoading = true;
    this.error = '';

    const userLogin: UserLogin = this.loginForm.value;
    
    console.log('Attempting to log in user:', userLogin.username);
    
    this.authService.login(userLogin).subscribe({
      next: (user: User) => {
        this.isLoading = false;
        console.log('Login successful, user:', user);
        
        if (user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/calendar']);
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Login error details:', err);
        
        // Display the actual error message if available
        if (err && err.message) {
          this.error = err.message;
          
          if (this.error.includes('Server') || this.error.includes('server') || 
              this.error.includes('bağlantı') || this.error.includes('API')) {
            this.highlightDemoCredentials();
          }
        } else {
          this.error = 'Geçersiz kullanıcı adı veya şifre. Lütfen tekrar deneyiniz.';
        }
        
        // If any other error happens, suggest the demo credentials
        if (!this.serverConnected) {
          this.highlightDemoCredentials();
        }
      }
    });
  }
  
  // Save real user credentials 
  saveRealCredentials(): void {
    if (!this.savedUsername || !this.savedPassword) {
      this.error = 'Kullanıcı adı ve şifre boş olamaz.';
      return;
    }
    
    this.authService.addRealUserCredentials(this.savedUsername, this.savedPassword, this.isAdmin);
    
    // Clear fields after saving
    this.savedUsername = '';
    this.savedPassword = '';
    this.isAdmin = false;
    
    // Show confirmation message
    this.error = 'Bilgileriniz başarıyla kaydedildi! Şimdi bu bilgilerle giriş yapabilirsiniz.';
    
    // Auto-fill the login form with these credentials
    this.loginForm.patchValue({
      username: this.savedUsername,
      password: this.savedPassword
    });
  }
}
