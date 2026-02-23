// src/app/services/purchase.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Purchase } from '../pages-new/boutique-centre/customer-page/invoice/invoice.component';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  constructor(private http: HttpClient) {}

  getPurchase(purchaseId: string): Observable<Purchase> {
    return this.http.get<Purchase>(`${environment.apiUrl}/purchases/${purchaseId}`);
  }
}