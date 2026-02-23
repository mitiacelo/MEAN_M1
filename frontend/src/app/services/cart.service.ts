import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CartItem {
  product: {
    _id: string;
    name: string;
    description?: string;
    quantite: number;
    prix_actuel?: number;
    id_type?: {
      _id: string;
      name: string;
    };
  };
  quantity: number;
  priceAtAddition: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${environment.apiUrl}/cart`);
  }

  addToCart(productId: string, quantity: number = 1): Observable<Cart> {
    return this.http.post<Cart>(`${environment.apiUrl}/cart`, { productId, quantity });
  }

  removeFromCart(productId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/cart/${productId}`);
  }

  updateCartItem(productId: string, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${environment.apiUrl}/cart/${productId}`, { quantity });
  }

  createOrder(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/orders`, {});
  }
}