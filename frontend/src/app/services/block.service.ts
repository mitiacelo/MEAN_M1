import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private apiUrl = `${environment.apiUrl}/blocks`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les blocs d'une grille
  getBlocksByGrille(grilleId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/grille/${grilleId}`);
  }

  // Créer plusieurs blocs en une fois
  createBlocks(blocks: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, blocks);
  }

  // Supprimer tous les blocs d'une grille
  deleteBlocksByGrille(grilleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/grille/${grilleId}`);
  }

  // Mettre à jour un bloc
  updateBlock(id: string, block: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, block);
  }
  assignShop(blockIds: string[], shopId: string) {
    return this.http.put(`${this.apiUrl}/assign-shop`, {
      blockIds,
      shopId
    });
  }
  unassignShop(shopId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/unassign-shop`, { shopId });
  }
}