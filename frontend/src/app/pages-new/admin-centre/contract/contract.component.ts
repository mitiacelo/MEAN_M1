import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Contract, ContractService } from '../../../services/contract.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-mon-contrat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contract.component.html',
  styleUrl: './contract.component.css'
})
export class MonContratComponent implements OnInit {
  contracts: Contract[] = [];
  loading = true;
  signing = false;
  error = '';
  successMsg = '';

  // Pour signature via token (lien email)
  tokenMode = false;
  token = '';
  contractToken: Contract | null = null;

  constructor(
    private contractService: ContractService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si on arrive via un lien de signature par token
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (this.token) {
      this.tokenMode = true;
      this.chargerContratParToken();
    } else {
      this.chargerMesContrats();
    }
  }

  chargerMesContrats(): void {
    const user = this.authService.currentUser;
    if (!user) { this.router.navigate(['/login']); return; }
  
    this.contractService.getContractsByUser(user.id).subscribe({  // ← user.id
      next: (contracts) => {
        this.contracts = contracts;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  chargerContratParToken(): void {
    // On charge juste le contrat via la route normale après signature
    this.loading = false;
  }

  signerDepuisApp(contract: Contract): void {
    if (!confirm('En cliquant sur "Accepter", vous signez électroniquement ce contrat de bail.')) return;

    this.signing = true;
    this.contractService.signerClientApp(contract._id).subscribe({
      next: () => {
        this.signing = false;
        this.successMsg = '✅ Contrat signé avec succès ! Vous êtes maintenant manager de la boutique.';
        this.chargerMesContrats();
      },
      error: (err) => {
        this.signing = false;
        this.error = err?.error?.message || 'Erreur lors de la signature';
      }
    });
  }

  signerDepuisToken(): void {
    if (!confirm('En cliquant sur "Accepter", vous signez électroniquement ce contrat de bail.')) return;

    this.signing = true;
    this.contractService.signerClientToken(this.token).subscribe({
      next: () => {
        this.signing = false;
        this.successMsg = '✅ Contrat signé avec succès ! Connectez-vous pour accéder à votre espace manager.';
      },
      error: (err) => {
        this.signing = false;
        this.error = err?.error?.message || 'Lien invalide ou expiré';
      }
    });
  }

  voirPDF(contract: Contract): void {
    window.open(this.contractService.getPdfUrl(contract._id), '_blank');
  }

  statutLabel(statut: string): string {
    const map: Record<string, string> = {
      brouillon: 'Brouillon',
      'signé_admin': 'En attente de votre signature',
      'signé_client': 'Signé',
      actif: 'Actif',
      'résilié': 'Résilié'
    };
    return map[statut] ?? statut;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}