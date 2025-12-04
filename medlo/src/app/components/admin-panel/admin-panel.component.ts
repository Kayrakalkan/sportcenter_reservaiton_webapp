import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Reservation, ReservationType } from '../../models/reservation.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  
  currentUser: User | null = null;
  reservations: Reservation[] = [];
  displayedColumns: string[] = ['id', 'username', 'startTime', 'endTime', 'type', 'actions'];
  eventForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  hours: number[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    // Generate hours from 8 to 18
    for (let hour = 8; hour <= 18; hour++) {
      this.hours.push(hour);
    }

    // Initialize event form
    this.eventForm = this.fb.group({
      date: ['', Validators.required],
      startHour: ['', Validators.required],
      duration: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadReservations();
  }

  loadReservations(): void {
    this.isLoading = true;
    this.adminService.getAllReservations().subscribe({
      next: (reservations: Reservation[]) => {
        this.reservations = reservations;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load reservations:', error);
        this.isLoading = false;
        
        // For demo purposes, generate sample data if API fails
        this.generateSampleReservations();
      }
    });
  }

  generateSampleReservations(): void {
    // Sample data for demonstration
    const sampleData: Reservation[] = [
      {
        id: '1',
        userId: 'user1',
        startTime: new Date(2025, 4, 14, 10, 0), // May 14, 2025, 10:00 AM
        endTime: new Date(2025, 4, 14, 11, 0),   // May 14, 2025, 11:00 AM
        type: ReservationType.Training,
        username: 'faculty'
      },
      {
        id: '2',
        userId: 'admin1',
        startTime: new Date(2025, 4, 15, 14, 0), // May 15, 2025, 2:00 PM
        endTime: new Date(2025, 4, 15, 15, 0),   // May 15, 2025, 3:00 PM
        type: ReservationType.Event,
        username: 'admin'
      }
    ];
    this.reservations = sampleData;
  }

  createEvent(): void {
    if (this.eventForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    
    const formValue = this.eventForm.value;
    const startDate = new Date(formValue.date);
    startDate.setHours(formValue.startHour, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + formValue.duration);
    
    const event: Partial<Reservation> = {
      userId: this.currentUser?.id || '',
      startTime: startDate,
      endTime: endDate,
      type: ReservationType.Event
    };
    
    this.adminService.createEvent(event).subscribe({
      next: (createdEvent: Reservation) => {
        this.isSubmitting = false;
        this.snackBar.open('Etkinlik başarıyla oluşturuldu!', 'Tamam', {
          duration: 3000
        });
        this.eventForm.reset({
          duration: 1
        });
        this.loadReservations();
      },
      error: (error: any) => {
        console.error('Event creation failed:', error);
        this.isSubmitting = false;
        this.snackBar.open('Etkinlik oluşturulamadı. Lütfen tekrar deneyin.', 'Tamam', {
          duration: 3000
        });
        
        // For demo, add the event anyway
        if (this.currentUser) {
          const newEvent: Reservation = {
            id: Math.random().toString(36).substr(2, 9),
            userId: this.currentUser.id,
            startTime: startDate,
            endTime: endDate,
            type: ReservationType.Event,
            username: this.currentUser.username
          };
          this.reservations.push(newEvent);
          this.eventForm.reset({
            duration: 1
          });
        }
      }
    });
  }

  deleteReservation(reservation: Reservation): void {
    const dialogRef = this.dialog.open(this.confirmDialog);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.deleteReservation(reservation.id).subscribe({
          next: () => {
            this.snackBar.open('Rezervasyon başarıyla silindi!', 'Tamam', {
              duration: 3000
            });
            this.loadReservations();
          },
          error: (error: any) => {
            console.error('Reservation deletion failed:', error);
            this.snackBar.open('Rezervasyon silinemedi. Lütfen tekrar deneyin.', 'Tamam', {
              duration: 3000
            });
            
            // For demo, remove from local array anyway
            this.reservations = this.reservations.filter(r => r.id !== reservation.id);
          }
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
