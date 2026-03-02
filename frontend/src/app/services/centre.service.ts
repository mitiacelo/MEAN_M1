import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Centre {
  _id?: string;
  nom: string;
  slogan: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  logo: string;
}

@Injectable({ providedIn: 'root' })
export class CentreService {
  private api = `${environment.apiUrl}/centre`;

  private centreSubject = new BehaviorSubject<Centre | null>(null);
  centre$ = this.centreSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer les infos du centre (utilisable partout dans l'app)
  getCentre(): Observable<Centre> {
    return this.http.get<Centre>(this.api).pipe(
      tap(c => this.centreSubject.next(c))
    );
  }

  // Mettre à jour les infos texte
  updateCentre(data: Partial<Centre>): Observable<Centre> {
    return this.http.put<Centre>(this.api, data).pipe(
      tap(c => this.centreSubject.next(c))
    );
  }

  // Uploader le logo
  uploadLogo(file: File): Observable<{ logo: string; centre: Centre }> {
    const form = new FormData();
    form.append('logo', file);
    return this.http.post<{ logo: string; centre: Centre }>(`${this.api}/logo`, form).pipe(
      tap(res => this.centreSubject.next(res.centre))
    );
  }

  // Valeur courante synchrone (pour les composants qui en ont besoin)
  get currentCentre(): Centre | null {
    return this.centreSubject.value;
  }
}