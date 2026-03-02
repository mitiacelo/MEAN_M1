import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // ← AJOUT
import { BehaviorSubject, Observable } from 'rxjs'; // ← AJOUT
import { map } from 'rxjs/operators'; // ← pour map
import { environment } from '../../environments/environment';

export interface Favorite {
  _id: string;
  product: {
    _id: string;
    name: string;
    description?: string;
    prix_actuel?: number;       // ← AJOUTE ÇA
    quantite: number;           // ← AJOUTE ÇA
    id_type?: {                 // ← optionnel si tu l'utilises
      name: string;
    };
  };
  boutique: any;
  addedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private favoriteCountSubject = new BehaviorSubject<number>(0);
  favoriteCount$ = this.favoriteCountSubject.asObservable();

  constructor(private http: HttpClient) {} // ← INJECTION ICI

  updateFavoriteCount(count: number) {
    this.favoriteCountSubject.next(count);
  }

  getFavorites(): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${environment.apiUrl}/favorites`);
  }

  addToFavorites(productId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/favorites`, { productId }).pipe(
      map(() => {
        this.favoriteCountSubject.next(this.favoriteCountSubject.value + 1);
      })
    );
  }

  removeFromFavorites(productId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/favorites/${productId}`).pipe(
      map(() => {
        this.favoriteCountSubject.next(Math.max(0, this.favoriteCountSubject.value - 1));
      })
    );
  }

  isFavorite(productId: string): Observable<boolean> {
    return this.getFavorites().pipe(
      map((favs: Favorite[]) => favs.some(f => f.product._id === productId))
    );
  }
}