import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlockService } from '../../services/block.service';
import { GrilleService } from '../../services/grille.service';

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
  
  constructor(
    private grilleService: GrilleService,
    private blockService: BlockService
  ) {}

  ngOnInit(): void {
    this.chargerGrille();
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

  // ✅ Charger la grille au démarrage
  chargerGrille(): void {
    this.grilleService.getGrille().subscribe({
      next: (grille) => {
        if (grille) {
          this.grilleId = grille._id;
          this.lignes = grille.lignes;
          this.colonnes = grille.colonnes;
          this.grilleExiste = true;
          console.log('✅ Grille existante chargée:', grille);
        } else {
          console.log('ℹ️ Aucune grille existante');
        }
      },
      error: (err) => console.error('❌ Erreur chargement grille:', err)
    });
  }

  // ✅ Sauvegarder (créer ou mettre à jour)
  sauvegarder(): void {
    const grille = { lignes: this.lignes, colonnes: this.colonnes };
    
    this.grilleService.saveGrille(grille).subscribe({
      next: (data) => {
        this.grilleId = data._id;
        this.grilleExiste = true;
        
        const action = data.isUpdate ? 'mise à jour' : 'créée';
        console.log(`✅ Grille ${action}:`, data);
        
        // Créer les nouveaux blocs
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
}