import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// Create Auth service using function instead of class
export const isAuthenticated = (): boolean => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return false; // In server context, always return false
  }
  const user = localStorage.getItem('currentUser');
  return !!user;
};

export const isAdmin = (): boolean => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return false; // In server context, always return false
  }
  const userStr = localStorage.getItem('currentUser');
  if (!userStr) return false;
  const user = JSON.parse(userStr);
  return user.role === 'Admin';
};

// Functional guard implementation
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);

  // Check if user is logged in
  if (isAuthenticated()) {
    // Check if route requires admin role
    if (route.data['requiresAdmin'] && !isAdmin()) {
      router.navigate(['/calendar']);
      return false;
    }
    return true;
  }

  // Not logged in, redirect to login
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
