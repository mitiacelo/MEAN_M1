import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Shop{
  _id: string;
  name: string;
  description?: string;
  status: 'actif' | 'inactif' | 'en attente';
  superficie: number;
  id_user: any; // ou string si pas populated
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ShopService {
  constructor(
    private http: HttpClient,
    private authService: AuthService  // ← injection pour récupérer id_shop
  ) {}
  createShop(shop: any) {
    return this.http.post<any>(`${environment.apiUrl}/shops`, shop);
  }

  getAvailableShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${environment.apiUrl}/shops/available`);
  }

  getActiveShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${environment.apiUrl}/shops/active`);
  }

  getShopById(id: string): Observable<Shop> {
    return this.http.get<Shop>(`${environment.apiUrl}/shops/${id}`);
  }
  deleteShop(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/shops/${id}`);
  }
  getAllShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(`${environment.apiUrl}/shops`);
  }
  updateShop(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/shops/${id}`, data);
  }

  //Récupère la boutique du manager connecté
  getMyShop(): Observable<Shop> {
    const user = this.authService.currentUser;
    if (!user || !user.id_shop) {
      throw new Error('Utilisateur non connecté ou pas de boutique associée');
    }

    return this.http.get<Shop>(`${environment.apiUrl}/shops/${user.id_shop}`);
  };
}