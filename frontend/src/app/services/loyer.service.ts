import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoyerMois {
  _id: string;
  contract: string;
  shop: string;
  user: string;
  mois: number;
  annee: number;
  montant: number;
  loyer: number;
  charges: number;
  statut: 'en_attente' | 'payé' | 'en_retard';
  datePaiement: string | null;
  note: string;
}

export interface DashboardEntry {
  contract: {
    _id: string;
    loyer: number;
    charges: number;
    dateDebut: string;
    dateFin: string;
    user: { _id: string; name: string; firstname: string; email: string };
    shop: { _id: string; name: string; superficie: number };
  };
  loyerMois: LoyerMois;
}

@Injectable({ providedIn: 'root' })
export class LoyerService {
  private apiUrl = `${environment.apiUrl}/loyers`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardEntry[]> {
    return this.http.get<DashboardEntry[]>(`${this.apiUrl}/dashboard`);
  }

  getHistorique(contractId: string): Observable<LoyerMois[]> {
    return this.http.get<LoyerMois[]>(`${this.apiUrl}/historique/${contractId}`);
  }

  confirmerPaiement(loyerId: string, note?: string): Observable<LoyerMois> {
    return this.http.patch<LoyerMois>(`${this.apiUrl}/${loyerId}/payer`, { note });
  }

  annulerPaiement(loyerId: string): Observable<LoyerMois> {
    return this.http.patch<LoyerMois>(`${this.apiUrl}/${loyerId}/annuler-paiement`, {});
  }
}