import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlockService } from '../../../services/block.service';
import { GrilleService } from '../../../services/grille.service';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  lignes: number = 5;
  colonnes: number = 5;
  grilleId: string = '';
  blockColors: Map<string, string> = new Map();
  blockShopIds: Map<string, string> = new Map();
  shops: any[] = [];

  constructor(
    private grilleService: GrilleService,
    private blockService: BlockService,
    private shopService: ShopService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerGrille();
    this.chargerShops();
  }

  chargerGrille(): void {
    this.grilleService.getGrille().subscribe({
      next: (grille) => {
        if (grille) {
          this.grilleId = grille._id;
          this.lignes = grille.lignes;
          this.colonnes = grille.colonnes;
          this.chargerBlocs();
        }
      },
      error: (err) => console.error('❌ Erreur grille:', err)
    });
  }

  chargerBlocs(): void {
    this.blockService.getBlocksByGrille(this.grilleId).subscribe({
      next: (blocks: any[]) => {
        this.blockColors.clear();
        this.blockShopIds.clear();
        blocks.forEach(block => {
          if (block.color) this.blockColors.set(block.blockId, block.color);
          if (block.shopId) this.blockShopIds.set(block.blockId, block.shopId);
        });
      },
      error: (err) => console.error('❌ Erreur blocs:', err)
    });
  }

  chargerShops(): void {
    this.shopService.getAllShops().subscribe({
      next: (shops) => this.shops = shops,
      error: (err) => console.error('❌ Erreur shops:', err)
    });
  }

  ouvrirShop(shop: any): void {
    this.router.navigate(['/shop', shop._id, 'admin']);
  }

  getLettres(): string[] {
    return Array.from({ length: this.lignes }, (_, i) => String.fromCharCode(65 + i));
  }

  getNumeros(): number[] {
    return Array.from({ length: this.colonnes }, (_, i) => i + 1);
  }

  getBlockId(lettre: string, numero: number): string {
    return `${lettre}${numero}`;
  }

  getBlockColor(lettre: string, numero: number): string | null {
    return this.blockColors.get(this.getBlockId(lettre, numero)) || null;
  }

  isAssigned(lettre: string, numero: number): boolean {
    return this.blockShopIds.has(this.getBlockId(lettre, numero));
  }

  getShopColor(shopId: string): string {
    for (const [blockId, sId] of this.blockShopIds) {
      if (sId === shopId) return this.blockColors.get(blockId) || '#e9ecef';
    }
    return '#e9ecef';
  }

  allerGrille(): void {
    this.router.navigate(['/grille']);
  }
}