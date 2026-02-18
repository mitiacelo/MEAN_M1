import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Domaine {
  _id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class DomaineService {
  constructor(private http: HttpClient) {}

  getAllDomaines(): Observable<Domaine[]> {
    return this.http.get<Domaine[]>(`${environment.apiUrl}/domaines`);
  }
}