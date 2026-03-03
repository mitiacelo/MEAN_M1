import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BlockService } from '../../../services/block.service';
import { GrilleService } from '../../../services/grille.service';
import { ShopService } from '../../../services/shop.service';

@Component({
  selector: 'app-grille',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grille.component.html',
  styleUrls: ['./grille.component.css']
})
export class GrilleComponent implements OnInit {
  lignes: number = 5;
  colonnes: number = 5;
  options: number[] = [5, 10, 15, 20];
  grilleId: string = '';
  grilleExiste: boolean = false;
  selectedCells: Set<string> = new Set();
  blockColors: Map<string, string> = new Map();
  blockShopIds: Map<string, string> = new Map();
  selectedShopId: string | null = null;
  modeModification: boolean = false;
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

  chargerShops(): void {
    this.shopService.getAllShops().subscribe({
      next: (shops) => this.shops = shops,
      error: (err) => console.error('Erreur shops:', err)
    });
  }

  ouvrirShop(shopId: string): void {
    this.router.navigate(['/shop', shopId, 'admin']);
  }

  getShopColor(shopId: string): string {
    for (const [blockId, sId] of this.blockShopIds.entries()) {
      if (sId === shopId) return this.blockColors.get(blockId) || '#cccccc';
    }
    return '#cccccc';
  }

  getShopBlockCount(shopId: string): number {
    let count = 0;
    this.blockShopIds.forEach(sId => { if (sId === shopId) count++; });
    return count;
  }

  toggleCell(lettre: string, numero: number): void {
    const id = this.getBlockId(lettre, numero);
    if (this.blockShopIds.has(id)) {
      this.selectedShopId = this.blockShopIds.get(id)!;
      this.modeModification = false;
      return;
    }
    if (this.selectedCells.has(id)) {
      this.selectedCells.delete(id);
    } else {
      this.selectedCells.add(id);
    }
  }

  isSelected(lettre: string, numero: number): boolean {
    return this.selectedCells.has(this.getBlockId(lettre, numero));
  }

  getBlockColor(lettre: string, numero: number): string | null {
    return this.blockColors.get(this.getBlockId(lettre, numero)) || null;
  }

  isAssigned(lettre: string, numero: number): boolean {
    return this.blockShopIds.has(this.getBlockId(lettre, numero));
  }

  isInSelectedShop(lettre: string, numero: number): boolean {
    const id = this.getBlockId(lettre, numero);
    return this.blockShopIds.get(id) === this.selectedShopId;
  }

  get format(): string {
    return `${this.lignes}x${this.colonnes}`;
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

  chargerGrille(): void {
    this.grilleService.getGrille().subscribe({
      next: (grille) => {
        if (grille) {
          this.grilleId = grille._id;
          this.lignes = grille.lignes;
          this.colonnes = grille.colonnes;
          this.grilleExiste = true;
          this.chargerCouleurBlocs();
        }
      },
      error: (err) => console.error('Erreur grille:', err)
    });
  }

  chargerCouleurBlocs(): void {
    this.blockService.getBlocksByGrille(this.grilleId).subscribe({
      next: (blocks: any[]) => {
        this.blockColors.clear();
        this.blockShopIds.clear();
        blocks.forEach(block => {
          if (block.color) this.blockColors.set(block.blockId, block.color);
          if (block.shopId) this.blockShopIds.set(block.blockId, block.shopId);
        });
      },
      error: (err) => console.error('Erreur couleurs:', err)
    });
  }

  sauvegarder(): void {
    this.grilleService.saveGrille({ lignes: this.lignes, colonnes: this.colonnes }).subscribe({
      next: (data) => {
        this.grilleId = data._id;
        this.grilleExiste = true;
        this.sauvegarderBlocks();
      },
      error: (err) => console.error('Erreur sauvegarde:', err)
    });
  }

  sauvegarderBlocks(): void {
    const blocks = this.genererBlocsVirtuels().map(b => ({ ...b, grilleId: this.grilleId }));
    this.blockService.createBlocks(blocks).subscribe({
      next: () => { this.chargerCouleurBlocs(); alert('Grille sauvegardee !'); },
      error: (err) => console.error('Erreur blocs:', err)
    });
  }

  genererBlocsVirtuels(): any[] {
    const blocks = [];
    for (let l of this.getLettres())
      for (let n of this.getNumeros())
        blocks.push({ blockId: `${l}${n}`, ligne: l, colonne: n, contenu: '' });
    return blocks;
  }

  creerShopDepuisSelection(): void {
    const sel = Array.from(this.selectedCells);
    if (!sel.length) { alert("Selectionnez au moins un bloc !"); return; }
    const shop = { name: "Nouvelle boutique", description: "Creee depuis la grille", superficie: sel.length * 5, status: "inactif" };
    this.shopService.createShop(shop).subscribe({
      next: (shop) => {
        if (!shop?._id) { alert("Erreur creation shop !"); return; }
        this.blockService.assignShop(sel, shop._id.toString()).subscribe({
          next: (res: any) => {
            sel.forEach(id => { this.blockColors.set(id, res.color); this.blockShopIds.set(id, shop._id.toString()); });
            this.shops.push(shop);
            alert("Shop cree !");
            this.selectedCells.clear();
          },
          error: (err) => alert(err.error?.message || "Erreur assignation")
        });
      },
      error: () => alert("Erreur creation shop !")
    });
  }

  annulerSelection(): void {
    this.selectedShopId = null;
    this.modeModification = false;
    this.selectedCells.clear();
  }

  supprimerShop(): void {
    if (!this.selectedShopId) return;
    const shopId = this.selectedShopId;
    this.blockService.unassignShop(shopId).subscribe({
      next: () => {
        this.shopService.deleteShop(shopId).subscribe({
          next: () => {
            this.blockShopIds.forEach((sId, blockId) => {
              if (sId === shopId) { this.blockColors.delete(blockId); this.blockShopIds.delete(blockId); }
            });
            this.shops = this.shops.filter(s => s._id !== shopId);
            this.selectedShopId = null;
            alert("Shop supprime !");
          },
          error: (err) => console.error(err)
        });
      },
      error: (err) => console.error(err)
    });
  }

  modifierShop(): void {
    if (!this.selectedShopId) return;
    const shopId = this.selectedShopId;
    this.blockService.unassignShop(shopId).subscribe({
      next: () => {
        this.blockShopIds.forEach((sId, blockId) => {
          if (sId === shopId) { this.blockColors.delete(blockId); this.blockShopIds.delete(blockId); }
        });
        this.modeModification = true;
        this.selectedCells.clear();
      },
      error: (err) => console.error(err)
    });
  }

  reassignerShop(): void {
    const sel = Array.from(this.selectedCells);
    if (!sel.length) { alert("Selectionnez au moins un bloc !"); return; }
    this.blockService.assignShop(sel, this.selectedShopId!).subscribe({
      next: (res: any) => {
        sel.forEach(id => { this.blockColors.set(id, res.color); this.blockShopIds.set(id, this.selectedShopId!); });
        this.selectedCells.clear();
        this.selectedShopId = null;
        this.modeModification = false;
        alert("Shop reassigne !");
      },
      error: (err) => alert(err.error?.message || "Erreur reassignation")
    });
  }

  validerGrille(): void {
    this.router.navigate(['/dashboard']);
  }
}