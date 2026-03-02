import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const user   = auth.currentUser;

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.role !== 'admin') {
    router.navigate(['/landing']);
    return false;
  }

  return true;
};

// Bloque cart, orders, favorites, invoice, order-confirm pour l'admin
export const customerGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);
  const user   = auth.currentUser;

  if (user?.role === 'admin') {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};