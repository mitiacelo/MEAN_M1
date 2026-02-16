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
  id_shop: any;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private http: HttpClient) {}

  getProductsByShop(shopId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${environment.apiUrl}/products/shop/${shopId}`);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${environment.apiUrl}/products/${id}`);
  }
}