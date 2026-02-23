import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../pages-new/boutique-centre/customer-page/orders/orders.component';

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
}