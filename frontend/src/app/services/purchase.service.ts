// src/app/services/purchase.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PurchaseItem {
  product: { _id: string; name: string; prix_actuel?: number };
  quantity: number;
  priceAtPurchase: number;
}

export interface Purchase {
  _id: string;
  user: { id: string; name: string; email: string; phone?: string };
  items: PurchaseItem[];
  totalProducts: number;
  deliveryFee: number;
  grandTotal: number;
  deliveryAddress: { city: string; district: string; address: string; phone: string };
  status: string;
  createdAt: string;
}
@Injectable({ providedIn: 'root' })
export class PurchaseService {
  constructor(private http: HttpClient) {}

  getPurchase(purchaseId: string): Observable<Purchase> {
    return this.http.get<Purchase>(`${environment.apiUrl}/purchases/${purchaseId}`);
  }

  getPurchases(): Observable<Purchase[]> {
    return this.http.get<Purchase[]>(`${environment.apiUrl}/purchases`);
  }
}