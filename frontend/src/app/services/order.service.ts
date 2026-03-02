import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrderItem {
  product: {
    _id: string;
    name: string;
    prix_actuel?: number;
  };
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  _id: string;
  cart: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})

export class OrderService {
  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders`);
  }

  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${orderId}`);
  }

  finalizeOrder(orderId: string, deliveryAddress: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/orders/${orderId}/finalize`, { deliveryAddress });
  }

  cancelOrder(orderId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/orders/${orderId}/cancel`, {});
  }

  getOrdersByUser(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${environment.apiUrl}/orders/user/${userId}`);
  }
}