import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  _id: string;
  user: string;
  shop: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  createNotification(data: any): Observable<Notification> {
    return this.http.post<Notification>(`${environment.apiUrl}/notifications`, data);
  }
}