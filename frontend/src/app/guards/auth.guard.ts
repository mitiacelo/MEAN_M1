import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;

  // Pas connecté → login
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Connecté mais pas admin → landing
  if (user.role !== 'admin') {
    router.navigate(['/landing']);
    return false;
  }

  return true;
};