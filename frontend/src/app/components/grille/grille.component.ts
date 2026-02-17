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

  // ✅ Map blockId -> couleur (ex: "A1" -> "hsl(200, 50%, 85%)")
  blockColors: Map<string, string> = new Map();

  constructor(
    private grilleService: GrilleService,
    private blockService: BlockService,
    private shopService: ShopService
  ) {}

  ngOnInit(): void {
    this.chargerGrille();
  }

  // ✅ On bloque le clic si le bloc a déjà une couleur
  toggleCell(lettre: string, numero: number): void {
    const id = this.getBlockId(lettre, numero);

    // 🔒 Bloc déjà assigné = on ne fait rien
    if (this.blockColors.has(id)) return;

    if (this.selectedCells.has(id)) {
      this.selectedCells.delete(id);
    } else {
      this.selectedCells.add(id);
    }
  }

  isSelected(lettre: string, numero: number): boolean {
    return this.selectedCells.has(this.getBlockId(lettre, numero));
  }

  // ✅ Retourne la couleur du bloc s'il est assigné
  getBlockColor(lettre: string, numero: number): string | null {
    return this.blockColors.get(this.getBlockId(lettre, numero)) || null;
  }

  // ✅ Vrai si le bloc est déjà assigné à un shop
  isAssigned(lettre: string, numero: number): boolean {
    return this.blockColors.has(this.getBlockId(lettre, numero));
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

          // ✅ Charger les couleurs des blocs existants
          this.chargerCouleurBlocs();
        }
      },
      error: (err) => console.error('❌ Erreur chargement grille:', err)
    });
  }

  // ✅ Récupère tous les blocs et stocke leurs couleurs dans la Map
  chargerCouleurBlocs(): void {
    this.blockService.getBlocksByGrille(this.grilleId).subscribe({
      next: (blocks: any[]) => {
        this.blockColors.clear();
        blocks.forEach(block => {
          if (block.color) {
            this.blockColors.set(block.blockId, block.color);
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
      next: (data) => {
        console.log('✅ Blocs sauvegardés:', data.length, 'blocs');
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

        // ✅ Assigner les blocs — le backend génère et retourne la couleur
        this.blockService.assignShop(blocksSelectionnes, shop._id.toString())
          .subscribe({
            next: (response: any) => {
              const color = response.color;

              // ✅ Mettre à jour la Map avec la couleur reçue
              blocksSelectionnes.forEach(blockId => {
                this.blockColors.set(blockId, color);
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
}