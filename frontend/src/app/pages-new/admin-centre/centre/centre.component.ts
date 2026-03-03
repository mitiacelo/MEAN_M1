import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Centre, CentreService, ChiffreAtout } from '../../../services/centre.service';

@Component({
  selector: 'app-parametres-centre',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './centre.component.html',
  styleUrls: ['./centre.component.css']
})
export class ParametresCentreComponent implements OnInit {

  centre: Centre = {
    nom: '', slogan: '', logo: '', banniere: '',
    adresse: '', ville: '', telephone: '', email: '', siteWeb: '',
    description: '', heureOuverture: '', nombreBoutiques: 0,
    nombreVisiteurs: '', anneeFondation: null,
    chiffresEtAtouts: [], facebook: '', instagram: ''
  };

  // État UI
  loading        = true;
  saving         = false;
  saved          = false;
  error          = '';
  activeTab      = 'identite'; // identite | infos | landing | chiffres | social

  // Previews images
  logoPreview     = '';
  bannierePreview = '';
  logoFile: File | null     = null;
  banniereFile: File | null = null;

  constructor(private centreService: CentreService) {}

  ngOnInit() {
    this.centreService.getCentre().subscribe({
      next: c => {
        this.centre         = { ...c, chiffresEtAtouts: c.chiffresEtAtouts || [] };
        this.logoPreview    = c.logo || '';
        this.bannierePreview = c.banniere || '';
        this.loading        = false;
      },
      error: () => {
        this.error   = 'Impossible de charger les informations du centre.';
        this.loading = false;
      }
    });
  }

  // ── Images ────────────────────────────────────────
  onLogoSelected(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.logoFile = f;
    const r = new FileReader();
    r.onload = ev => this.logoPreview = ev.target?.result as string;
    r.readAsDataURL(f);
  }

  onBanniereSelected(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.banniereFile = f;
    const r = new FileReader();
    r.onload = ev => this.bannierePreview = ev.target?.result as string;
    r.readAsDataURL(f);
  }

  removeLogo()     { this.logoPreview = ''; this.logoFile = null; this.centre.logo = ''; }
  removeBanniere() { this.bannierePreview = ''; this.banniereFile = null; this.centre.banniere = ''; }

  // ── Chiffres & Atouts ─────────────────────────────
  addChiffre() {
    this.centre.chiffresEtAtouts.push({ icone: '🏬', valeur: '', label: '' });
  }

  removeChiffre(i: number) {
    this.centre.chiffresEtAtouts.splice(i, 1);
  }

  // ── Save ──────────────────────────────────────────
  save() {
    this.saving = true;
    this.saved  = false;
    this.error  = '';

    const saveAll = () => {
      this.centreService.updateCentre(this.centre).subscribe({
        next: () => { this.saving = false; this.saved = true; setTimeout(() => this.saved = false, 3500); },
        error: () => { this.saving = false; this.error = 'Erreur lors de la sauvegarde.'; }
      });
    };

    // Uploads en séquence si nécessaire
    if (this.logoFile) {
      this.centreService.uploadLogo(this.logoFile).subscribe({
        next: res => {
          this.centre.logo = res.logo;
          this.logoFile = null;
          if (this.banniereFile) {
            this.centreService.uploadBanniere(this.banniereFile!).subscribe({
              next: r2 => { this.centre.banniere = r2.banniere; this.banniereFile = null; saveAll(); },
              error: () => { this.saving = false; this.error = 'Erreur upload bannière.'; }
            });
          } else saveAll();
        },
        error: () => { this.saving = false; this.error = 'Erreur upload logo.'; }
      });
    } else if (this.banniereFile) {
      this.centreService.uploadBanniere(this.banniereFile).subscribe({
        next: r => { this.centre.banniere = r.banniere; this.banniereFile = null; saveAll(); },
        error: () => { this.saving = false; this.error = 'Erreur upload bannière.'; }
      });
    } else {
      saveAll();
    }
  }

  getAdresseComplete(): string {
    return [this.centre.adresse, this.centre.ville].filter(Boolean).join(', ');
  }
}