import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GrilleService {
  private apiUrl = `${environment.apiUrl}/grille`;

  constructor(private http: HttpClient) {}

  // Récupérer LA grille unique
  getGrille(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Créer ou mettre à jour la grille
  saveGrille(grille: any): Observable<any> {
    return this.http.post(this.apiUrl, grille);
  }

  // Supprimer la grille
  deleteGrille(): Observable<any> {
    return this.http.delete(this.apiUrl);
  }
}