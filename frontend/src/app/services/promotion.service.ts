import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

// Interface Promotion pour typage
export interface Promotion {
  _id?: string;
  product: any; 
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

  // Supprimer une promotion
  deletePromotion(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  // Modifier une promotion
  updatePromotion(id: string, data: Promotion): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.baseUrl}/${id}`, data);
  }
}