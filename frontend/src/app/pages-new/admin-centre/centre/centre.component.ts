import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Centre, CentreService } from '../../../services/centre.service';

@Component({
  selector: 'app-parametres-centre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centre.component.html',
  styleUrls: ['./centre.component.css']
})
export class ParametresCentreComponent implements OnInit {

  centre: Centre = {
    nom: '', slogan: '', adresse: '',
    ville: '', telephone: '', email: '', logo: ''
  };

  loading     = true;
  saving      = false;
  saved       = false;
  error       = '';
  logoPreview = '';
  logoFile: File | null = null;

  constructor(private centreService: CentreService) {}

  ngOnInit() {
    this.centreService.getCentre().subscribe({
      next: c => {
        this.centre      = { ...c };
        this.logoPreview = c.logo || '';
        this.loading     = false;
      },
      error: () => {
        this.error   = 'Impossible de charger les informations du centre.';
        this.loading = false;
      }
    });
  }

  // Prévisualiser le logo avant upload
  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.logoFile = input.files[0];
    const reader = new FileReader();
    reader.onload = e => this.logoPreview = e.target?.result as string;
    reader.readAsDataURL(this.logoFile);
  }

  removeLogo() {
    this.logoPreview = '';
    this.logoFile    = null;
    this.centre.logo = '';
  }

  save() {
    this.saving = true;
    this.saved  = false;
    this.error  = '';

    const saveInfos = () => {
      this.centreService.updateCentre({
        nom:       this.centre.nom,
        slogan:    this.centre.slogan,
        adresse:   this.centre.adresse,
        ville:     this.centre.ville,
        telephone: this.centre.telephone,
        email:     this.centre.email,
      }).subscribe({
        next: () => {
          this.saving = false;
          this.saved  = true;
          setTimeout(() => this.saved = false, 3000);
        },
        error: () => {
          this.saving = false;
          this.error  = 'Erreur lors de la sauvegarde.';
        }
      });
    };

    // Si nouveau logo sélectionné → uploader d'abord
    if (this.logoFile) {
      this.centreService.uploadLogo(this.logoFile).subscribe({
        next: res => {
          this.centre.logo = res.logo;
          this.logoFile    = null;
          saveInfos();
        },
        error: () => {
          this.saving = false;
          this.error  = 'Erreur lors de l\'upload du logo.';
        }
      });
    } else {
      saveInfos();
    }
  }

  // ✅ Méthode pour afficher adresse + ville
  getAdresseComplete(): string {
    return [this.centre.adresse, this.centre.ville].filter(x => !!x).join(', ');
  }

  get apiUrl() {
    return 'http://localhost:3000'; // ajuste selon ton env
  }
}