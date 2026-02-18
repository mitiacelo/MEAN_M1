import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Boutique {
  _id: string;
  name: string;
  description?: string;
  id_shop: string | any;
  id_domaine: string | any;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class BoutiqueService {
  constructor(private http: HttpClient) {}

  /**
   * Récupère la boutique de l'utilisateur connecté via son userId
   * Retourne null si aucune boutique n'existe
   */
  getMyBoutique(userId: string): Observable<Boutique | null> {
    if (!userId) {
      return throwError(() => new Error('ID utilisateur manquant'));
    }

    return this.http.get<Boutique>(`${environment.apiUrl}/boutiques/my-shop/${userId}`).pipe(
      map(boutique => boutique || null),
      catchError(err => {
        if (err.status === 404) return [null];
        console.error('Erreur getMyBoutique', err);
        return throwError(() => err);
      })
    );
  }

  createBoutique(data: {
    name: string;
    description?: string;
    id_shop: string;
    id_domaine: string;
  }): Observable<Boutique> {
    return this.http.post<Boutique>(`${environment.apiUrl}/boutiques`, data);
  }

  updateBoutique(id: string, data: Partial<Boutique>): Observable<Boutique> {
    return this.http.put<Boutique>(`${environment.apiUrl}/boutiques/${id}`, data);
  }

  hasBoutique(userId: string): Observable<boolean> {
    return this.getMyBoutique(userId).pipe(
      map(boutique => !!boutique)
    );
  }

  getBoutiqueById(id: string): Observable<Boutique> {
    return this.http.get<Boutique>(`${environment.apiUrl}/boutiques/${id}`).pipe(
      catchError(err => {
        console.error('Erreur getBoutiqueById', err);
        return throwError(() => err);
      })
    );
  }

  // Ajoute cette fonction à la classe BoutiqueService
getAllBoutiques(): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(`${environment.apiUrl}/boutiques/all`).pipe(
      catchError(err => {
        console.error('Erreur getAllBoutiques', err);
        return throwError(() => err);
      })
    );
  }


}