import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contract {
  _id: string;
  shop: any;
  user: any;
  loyer: number;
  charges: number;
  dateDebut: string;
  dateFin: string;
  dureeContrat: string;
  clauses: string;
  depot: number;
  statut: 'brouillon' | 'signé_admin' | 'signé_client' | 'actif' | 'résilié';
  dateSignatureAdmin?: string;
  dateSignatureClient?: string;
  createdAt: string;
}

export interface CreateContractPayload {
  shopId: string;
  userId: string;
  loyer: number;
  charges: number;
  dateDebut: string;
  dateFin: string;
  dureeContrat: string;
  clauses: string;
  depot: number;
}

@Injectable({ providedIn: 'root' })
export class ContractService {
  private apiUrl = `${environment.apiUrl}/contracts`;

  constructor(private http: HttpClient) {}

  createContract(payload: CreateContractPayload): Observable<Contract> {
    return this.http.post<Contract>(this.apiUrl, payload);
  }

  getContractByShop(shopId: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/shop/${shopId}`);
  }

  getContractsByUser(userId: string): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.apiUrl}/user/${userId}`);
  }

  getContractById(id: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/${id}`);
  }

  updateContract(id: string, payload: Partial<CreateContractPayload>): Observable<Contract> {
    return this.http.put<Contract>(`${this.apiUrl}/${id}`, payload);
  }

  signerAdmin(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/signer-admin`, {});
  }

  signerClientApp(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/signer-client-app`, {});
  }

  signerClientToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signer-client/${token}`, {});
  }

  resilier(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/resilier`, {});
  }

  getPdfUrl(id: string): string {
    return `${this.apiUrl}/${id}/pdf`;
  }
}