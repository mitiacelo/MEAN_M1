import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { CentreService, Centre } from '../../../services/centre.service';
import { SalleComponent } from '../../boutique-centre/admin-boutique/salle/salle.component';
import { BoutiquesListComponent } from '../../boutique-centre/admin-boutique/boutiques/boutiques-list/boutiques-list.component';
import { HeaderComponent } from '../../../components-new/layouts/header/header.component';
import { DomaineService } from '../../../services/domaine.service';
import { Boutique, BoutiqueService } from '../../../services/boutique.service';
interface Domaine {
  _id: string;
  name: string;
}


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule, SalleComponent, BoutiquesListComponent, HeaderComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  centre: Centre | null = null;
  boutiques: Boutique[] = [];
  filteredBoutiques: Boutique[] = [];
  domaines: Domaine[] = [];
  selectedDomaineId: string = '';
  loading = false;
  errorMessage = '';

  constructor(
    public authService: AuthService,
    private centreService: CentreService,
    private domaineService: DomaineService,
    private boutiqueService: BoutiqueService,
  ) {}

  ngOnInit(): void {
    const cached = this.centreService.currentCentre;
    if (cached) {
      this.centre = cached;
      this.loadDomaines();
      this.loadBoutiques();
    } else {
      this.centreService.getCentre().subscribe({
        next: c  => {
          this.centre = c;
          this.loadDomaines();
          this.loadBoutiques();
        },
        error: () => {}
      });
    }
  }
  
  // Charger les domaines
  loadDomaines() {
    this.domaineService.getAllDomaines().subscribe({
      next: data => this.domaines = data,
      error: err => console.error('Erreur récupération domaines', err)
    });
  }
  
  // Charger les boutiques
  loadBoutiques() {
    this.boutiqueService.getAllBoutiques().subscribe({
      next: (data: Boutique[]) => {
        this.boutiques = data;
        this.applyFilter();
        console.log('Toutes les boutiques:', this.boutiques);
      },
      error: err => console.error('Erreur récupération boutiques', err)
    });
  }
  
  // Appliquer le filtre
  applyFilter() {
    if (!this.selectedDomaineId) {
      this.filteredBoutiques = this.boutiques;
    } else {
      this.filteredBoutiques = this.boutiques.filter(
        b => b.id_domaine === this.selectedDomaineId
      );
    }
    console.log('Filtered Boutiques:', this.filteredBoutiques);
  }
  
  // Quand on change de domaine
  onDomaineChange(event: any) {
    this.selectedDomaineId = event.target.value;
    this.applyFilter();
  }
}