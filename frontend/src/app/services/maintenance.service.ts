// services/maintenance.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MaintenanceTicket {
  _id: string;
  shop: { _id: string; name: string; superficie: number };
  signalePar: { _id: string; name: string; firstname: string; email: string; role: string };
  titre: string;
  description: string;
  categorie: 'électricité' | 'plomberie' | 'structure' | 'climatisation' | 'sécurité' | 'nettoyage' | 'autre';
  priorite: 'urgent' | 'normal' | 'faible';
  statut: 'ouvert' | 'en_cours' | 'résolu' | 'annulé';
  noteResolution: string;
  dateIntervention: string | null;
  dateResolution: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceStats {
  total: number;
  urgents: number;
  enCours: number;
  resolusThisMois: number;
}

export interface CreateMaintenancePayload {
  shopId: string;
  userId: string;
  titre: string;
  description?: string;
  categorie?: string;
  priorite?: string;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private apiUrl = `${environment.apiUrl}/maintenance`;

  constructor(private http: HttpClient) {}

  getAll(filters?: { statut?: string; priorite?: string; shopId?: string }): Observable<MaintenanceTicket[]> {
    const params: any = {};
    if (filters?.statut)   params['statut']   = filters.statut;
    if (filters?.priorite) params['priorite'] = filters.priorite;
    if (filters?.shopId)   params['shopId']   = filters.shopId;
    return this.http.get<MaintenanceTicket[]>(this.apiUrl, { params });
  }

  getStats(): Observable<MaintenanceStats> {
    return this.http.get<MaintenanceStats>(`${this.apiUrl}/stats`);
  }

  getById(id: string): Observable<MaintenanceTicket> {
    return this.http.get<MaintenanceTicket>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateMaintenancePayload): Observable<MaintenanceTicket> {
    return this.http.post<MaintenanceTicket>(this.apiUrl, payload);
  }

  updateStatut(id: string, statut: string, noteResolution?: string, dateIntervention?: string): Observable<MaintenanceTicket> {
    return this.http.patch<MaintenanceTicket>(`${this.apiUrl}/${id}/statut`, {
      statut,
      noteResolution,
      dateIntervention
    });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}