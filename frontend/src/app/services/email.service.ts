import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from './notification.service';

export interface EmailPayload {
  subject: string;
  body: string;
  adminName: string;
  adminEmail: string;
}

export interface EmailSent {
  subject: string;
  body: string;
  sentAt: string;
  sentBy: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  sendEmail(notificationId: string, payload: EmailPayload): Observable<{ message: string; request: Notification }> {
    return this.http.post<{ message: string; request: Notification }>(
      `${this.apiUrl}/${notificationId}/send-email`,
      payload
    );
  }
}