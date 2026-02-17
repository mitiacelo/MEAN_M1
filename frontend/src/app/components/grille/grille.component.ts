import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlockService } from '../../services/block.service';
import { GrilleService } from '../../services/grille.service';
import { ShopService } from '../../services/shop.service';

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

  // ✅ NOUVEAU
  blockShopIds: Map<string, string> = new Map();
  selectedShopId: string | null = null;
  modeModification: boolean = false;

  constructor(
    private grilleService: GrilleService,
    private blockService: BlockService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    this.chargerGrille();
  }

  toggleCell(lettre: string, numero: number): void {
    const id = this.getBlockId(lettre, numero);

    // ✅ Bloc assigné → sélectionne tout le groupe du shop
    if (this.blockShopIds.has(id)) {
      const shopId = this.blockShopIds.get(id)!;
      this.selectedShopId = shopId;
      this.modeModification = false;
      return;
    }

    // Bloc libre → sélection normale
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

  // ✅ NOUVEAU : bloc appartient au shop sélectionné
  isInSelectedShop(lettre: string, numero: number): boolean {
    const id = this.getBlockId(lettre, numero);
    return this.blockShopIds.get(id) === this.selectedShopId;
  }

  get format(): string {
    return `${this.lignes}×${this.colonnes}`;
  }

  getLettres(): string[] {
    return Array.from({ length: this.lignes }, (_, i) =>
      String.fromCharCode(65 + i)
    );
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
      error: (err) => console.error('❌ Erreur chargement grille:', err)
    });
  }

  chargerCouleurBlocs(): void {
    this.blockService.getBlocksByGrille(this.grilleId).subscribe({
      next: (blocks: any[]) => {
        this.blockColors.clear();
        this.blockShopIds.clear(); // ✅ NOUVEAU
        blocks.forEach(block => {
          if (block.color) {
            this.blockColors.set(block.blockId, block.color);
          }
          if (block.shopId) {
            this.blockShopIds.set(block.blockId, block.shopId); // ✅ NOUVEAU
          }
        });
      },
      error: (err) => console.error('❌ Erreur chargement couleurs blocs:', err)
    });
  }

  sauvegarder(): void {
    const grille = { lignes: this.lignes, colonnes: this.colonnes };
    this.grilleService.saveGrille(grille).subscribe({
      next: (data) => {
        this.grilleId = data._id;
        this.grilleExiste = true;
        this.sauvegarderBlocks();
      },
      error: (err) => console.error('❌ Erreur sauvegarde grille:', err)
    });
  }

  sauvegarderBlocks(): void {
    const blocks = this.genererBlocsVirtuels().map(block => ({
      ...block,
      grilleId: this.grilleId
    }));
    this.blockService.createBlocks(blocks).subscribe({
      next: () => {
        this.chargerCouleurBlocs(); // ✅ recharger pour garder les couleurs à jour
        alert('Grille sauvegardée avec succès ! 🎉');
      },
      error: (err) => console.error('❌ Erreur sauvegarde blocs:', err)
    });
  }

  genererBlocsVirtuels(): any[] {
    const blocks = [];
    const lettres = this.getLettres();
    const numeros = this.getNumeros();
    for (let lettre of lettres) {
      for (let numero of numeros) {
        blocks.push({
          blockId: `${lettre}${numero}`,
          ligne: lettre,
          colonne: numero,
          contenu: ''
        });
      }
    }
    return blocks;
  }

  creerShopDepuisSelection(): void {
    const blocksSelectionnes = Array.from(this.selectedCells);
    if (blocksSelectionnes.length === 0) {
      alert("Veuillez sélectionner au moins un bloc !");
      return;
    }

    const nouveauShop = {
      name: "Nouvelle boutique",
      description: "Créée depuis la grille",
      superficie: blocksSelectionnes.length * 5,
      status: "inactif",
    };

    this.shopService.createShop(nouveauShop).subscribe({
      next: (shop) => {
        if (!shop || !shop._id) {
          alert("Erreur lors de la création du shop !");
          return;
        }
        this.blockService.assignShop(blocksSelectionnes, shop._id.toString())
          .subscribe({
            next: (response: any) => {
              const color = response.color;
              blocksSelectionnes.forEach(blockId => {
                this.blockColors.set(blockId, color);
                this.blockShopIds.set(blockId, shop._id.toString()); // ✅ NOUVEAU
              });
              alert("Shop créé et blocs colorés 🎉");
              this.selectedCells.clear();
            },
            error: (err) => {
              console.error("Erreur assignation:", err);
              alert(err.error?.message || "Impossible d'assigner les blocs !");
            }
          });
      },
      error: (err) => {
        console.error("Erreur création shop:", err);
        alert("Impossible de créer le shop !");
      }
    });
  }

  // ✅ NOUVEAU : fermer le panneau
  annulerSelection(): void {
    this.selectedShopId = null;
    this.modeModification = false;
    this.selectedCells.clear();
  }

  // ✅ NOUVEAU : supprimer le shop + libérer ses blocs
  supprimerShop(): void {
    if (!this.selectedShopId) return;
    const shopId = this.selectedShopId;

    this.blockService.unassignShop(shopId).subscribe({
      next: () => {
        this.shopService.deleteShop(shopId).subscribe({
          next: () => {
            // Nettoyer les Maps localement
            this.blockShopIds.forEach((sId, blockId) => {
              if (sId === shopId) {
                this.blockColors.delete(blockId);
                this.blockShopIds.delete(blockId);
              }
            });
            this.selectedShopId = null;
            alert("Shop supprimé ✅");
          },
          error: (err) => console.error("Erreur suppression shop:", err)
        });
      },
      error: (err) => console.error("Erreur libération blocs:", err)
    });
  }

  // ✅ NOUVEAU : libérer les blocs, garder le shop, re-sélectionner
  modifierShop(): void {
    if (!this.selectedShopId) return;
    const shopId = this.selectedShopId;

    this.blockService.unassignShop(shopId).subscribe({
      next: () => {
        this.blockShopIds.forEach((sId, blockId) => {
          if (sId === shopId) {
            this.blockColors.delete(blockId);
            this.blockShopIds.delete(blockId);
          }
        });
        this.modeModification = true;
        this.selectedCells.clear();
      },
      error: (err) => console.error("Erreur libération blocs:", err)
    });
  }

  // ✅ NOUVEAU : réassigner les nouveaux blocs au shop existant
  reassignerShop(): void {
    const blocksSelectionnes = Array.from(this.selectedCells);
    if (blocksSelectionnes.length === 0) {
      alert("Sélectionnez au moins un bloc !");
      return;
    }

    this.blockService.assignShop(blocksSelectionnes, this.selectedShopId!).subscribe({
      next: (response: any) => {
        const color = response.color;
        blocksSelectionnes.forEach(blockId => {
          this.blockColors.set(blockId, color);
          this.blockShopIds.set(blockId, this.selectedShopId!);
        });
        this.selectedCells.clear();
        this.selectedShopId = null;
        this.modeModification = false;
        alert("Shop réassigné ✅");
      },
      error: (err) => alert(err.error?.message || "Erreur réassignation")
    });
  }
}