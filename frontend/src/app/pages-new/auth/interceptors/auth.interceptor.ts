import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Sur le serveur (SSR) → on skip complètement localStorage
  if (!isPlatformBrowser(platformId)) {
    console.log('SSR → skip auth interceptor pour', req.url);
    return next(req); // ← retourne directement l'observable sans rien ajouter
  }

  // Dans le navigateur → on ajoute le token
  const token = localStorage.getItem('token');

  if (token) {
    console.log('Browser → Token ajouté sur', req.url);
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  console.log('Browser → Pas de token pour', req.url);
  return next(req);
};