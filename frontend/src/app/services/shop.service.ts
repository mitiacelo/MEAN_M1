import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  constructor(private http: HttpClient) {}
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
}