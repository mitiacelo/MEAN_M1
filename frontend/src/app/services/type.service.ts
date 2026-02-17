// src/app/services/type.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Type {
  _id: string;
  name: string;
  id_category: any; // ou string
}

@Injectable({ providedIn: 'root' })
export class TypeService {
  constructor(private http: HttpClient) {}

  getAllTypes(): Observable<Type[]> {
    return this.http.get<Type[]>(`${environment.apiUrl}/types`);
  }
}