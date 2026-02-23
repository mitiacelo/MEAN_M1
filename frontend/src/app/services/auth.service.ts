import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';               // ← AJOUTÉ
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  firstname: string;
  email: string;
  role: string;
  id_shop?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        this.currentUserSubject.next(JSON.parse(userStr));
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        console.log('LOGIN SUCCESS - User reçu :', res.user);

        if (this.isBrowser) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }

        const user = res.user as User;
        this.currentUserSubject.next(user);

        // REDIRECTION INTELLIGENTE APRÈS LOGIN
        if (user?.role === 'manager' && user?.id_shop) {
          this.router.navigate(['/dashboard-shop']);
        } else if (user?.role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          
          this.router.navigate(['/landing']);
        }
      })
    );
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/landing']);
  }

  get token(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get currentUser(): User | null {
    if (!this.isBrowser) return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  register(userData: {
    name: string;
    firstname: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, userData).pipe(
      tap(response => {
        if (this.isBrowser) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        this.currentUserSubject.next(response.user);

        
        const user = response.user as User;
        if (user?.role === 'manager' && user?.id_shop) {
          this.router.navigate(['/dashboard-shop']);
        } else {
          this.router.navigate(['/landing']);
        }
      })
    );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/auth/users`);
  }

  hasRole(role: string): boolean {
    const user = this.currentUser;
    if (!user || !user.role) return false;
    return user.role === role || user.role.includes(role); // au cas où c'est un tableau
  }
}