import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  id_type: any;
  id_category: any;
  quantite: number;
  prix_actuel?: number;
  id_boutique: any;  // ← changé ici
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  // CHANGEMENT PRINCIPAL : utilise /boutique/:boutiqueId au lieu de /shop/:shopId
  getProductsByBoutique(boutiqueId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/boutique/${boutiqueId}`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${environment.apiUrl}/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/products/${id}`);
  }

  importProducts(products: any[]): Observable<Product[]> {
    return this.http.post<Product[]>(`${environment.apiUrl}/products/import`, products);
  }
}