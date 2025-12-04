import { Routes } from '@angular/router';
import { LoginNewComponent } from './components/login-new/login-new.component';
import { ReservationCalendarComponent } from './components/reservation-calendar/reservation-calendar.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginNewComponent },
  {
    path: 'calendar',
    component: ReservationCalendarComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [authGuard],
    data: { requiresAdmin: true }
  },
  { path: '**', redirectTo: '/login' }
];
