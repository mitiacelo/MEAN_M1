import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Interface Promotion pour typage
export interface Promotion {
  _id?: string;
  product: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PromotionService {

  private baseUrl = `${environment.apiUrl}/promotions`; // pas de /api

  constructor(private http: HttpClient) {}

  // Création d'une promotion pour un produit
  createProductPromotion(data: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.baseUrl}/product`, data);
  }

  // Récupérer toutes les promotions
  getAllPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.baseUrl);
  }
}