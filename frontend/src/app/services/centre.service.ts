import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChiffreAtout {
  icone: string;
  valeur: string;
  label: string;
}

export interface Centre {
  _id?: string;
  nom: string;
  slogan: string;
  logo: string;
  banniere: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  siteWeb: string;
  description: string;
  heureOuverture: string;
  nombreBoutiques: number;
  nombreVisiteurs: string;
  anneeFondation: number | null;
  chiffresEtAtouts: ChiffreAtout[];
  facebook: string;
  instagram: string;
}

@Injectable({ providedIn: 'root' })
export class CentreService {
  private api = `${environment.apiUrl}/centre`;
  private centreSubject = new BehaviorSubject<Centre | null>(null);
  centre$ = this.centreSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCentre(): Observable<Centre> {
    return this.http.get<Centre>(this.api).pipe(
      tap(c => this.centreSubject.next(c))
    );
  }

  updateCentre(data: Partial<Centre>): Observable<Centre> {
    return this.http.put<Centre>(this.api, data).pipe(
      tap(c => this.centreSubject.next(c))
    );
  }

  uploadLogo(file: File): Observable<{ logo: string; centre: Centre }> {
    const form = new FormData();
    form.append('logo', file);
    return this.http.post<{ logo: string; centre: Centre }>(`${this.api}/logo`, form).pipe(
      tap(res => this.centreSubject.next(res.centre))
    );
  }

  uploadBanniere(file: File): Observable<{ banniere: string; centre: Centre }> {
    const form = new FormData();
    form.append('banniere', file);
    return this.http.post<{ banniere: string; centre: Centre }>(`${this.api}/banniere`, form).pipe(
      tap(res => this.centreSubject.next(res.centre))
    );
  }

  get currentCentre(): Centre | null {
    return this.centreSubject.value;
  }
}