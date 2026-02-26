import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmailSent {
  subject: string;
  body: string;
  sentAt: string;
  sentBy: string;
}

export interface Notification {
  _id: string;
  user: { _id: string; name: string; firstname: string; email: string } | string;
  shop: { _id: string; name: string } | string;
  phone: string;
  email: string;
  message: string;
  status: 'nouveau' | 'contacté' | 'archivé';
  emailsSent: EmailSent[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  updateStatus(id: string, status: 'nouveau' | 'contacté' | 'archivé'): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/${id}/status`, { status });
  }

  createNotification(data: any): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, data);
  }

  checkIfRequestExists(userId: string, shopId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/exists?user=${userId}&shop=${shopId}`);
  }
}