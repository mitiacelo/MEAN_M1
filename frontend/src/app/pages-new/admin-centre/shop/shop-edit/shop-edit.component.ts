import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Contract, ContractService, CreateContractPayload } from '../../../../services/contract.service';
import { ShopService } from '../../../../services/shop.service';

@Component({
  selector: 'app-shop-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './shop-edit.component.html',
  styleUrl: './shop-edit.component.css'
})
export class ShopEditComponent implements OnInit {
  shop: any = null;
  users: any[] = [];
  loading = true;
  error = '';

  editNom: string = '';
  editSuperficie: number = 0;
  editDescription: string = '';
  editUserId: string = '';

  // ── Contrat ───────────────────────────────────────────
  contract: Contract | null = null;
  showContratForm = false;
  savingContrat = false;
  signingAdmin = false;
  resiliating = false;

  contratForm = {
    loyer: 0,
    charges: 0,
    depot: 0,
    dateDebut: '',
    dateFin: '',
    dureeContrat: '',
    clauses: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopService: ShopService,
    private authService: AuthService,
    private contractService: ContractService
  ) {}

  ngOnInit(): void {
    const shopId = this.route.snapshot.paramMap.get('id');
    if (!shopId) {
      this.error = 'ID manquant';
      this.loading = false;
      return;
    }

    this.shopService.getShopById(shopId).subscribe({
      next: (shop) => {
        this.shop = shop;
        this.editNom = shop.name;
        this.editSuperficie = shop.superficie;
        this.editDescription = shop.description || '';
        this.editUserId = shop.id_user?._id || shop.id_user || '';
        this.loading = false;
        this.chargerContrat(shopId);
      },
      error: () => {
        this.error = 'Impossible de charger le shop';
        this.loading = false;
      }
    });

    this.authService.getUsers().subscribe({
      next: (users) => this.users = users,
      error: (err) => console.error('❌ Erreur users:', err)
    });
  }

  chargerContrat(shopId: string): void {
    this.contractService.getContractByShop(shopId).subscribe({
      next: (contract) => this.contract = contract,
      error: () => this.contract = null
    });
  }

  // ── Infos boutique ───────────────────────────────────
  sauvegarderInfos(): void {
    const updates = {
      name: this.editNom,
      superficie: this.editSuperficie,
      description: this.editDescription
    };
    this.shopService.updateShop(this.shop._id, updates).subscribe({
      next: (shop) => { this.shop = shop; alert('Informations sauvegardées ✅'); },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  // ── Locataire ────────────────────────────────────────
  assignerUser(): void {
    if (!this.editUserId) return;
    this.shopService.updateShop(this.shop._id, { id_user: this.editUserId }).subscribe({
      next: (shop) => { this.shop = shop; },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  desassignerUser(): void {
    this.shopService.updateShop(this.shop._id, { id_user: null, status: 'inactif' }).subscribe({
      next: (shop) => { this.shop = shop; this.editUserId = ''; },
      error: (err) => console.error('❌ Erreur:', err)
    });
  }

  getUserNom(): string {
    if (!this.shop?.id_user) return '—';
    const user = this.users.find(u => u._id === (this.shop.id_user?._id || this.shop.id_user));
    return user ? `${user.firstname} ${user.name}` : '—';
  }

  // ── Contrat ──────────────────────────────────────────
  ouvrirFormulaireContrat(): void {
    if (this.contract) {
      // Pré-remplir avec les données existantes
      this.contratForm = {
        loyer: this.contract.loyer,
        charges: this.contract.charges,
        depot: this.contract.depot,
        dateDebut: this.contract.dateDebut?.substring(0, 10) || '',
        dateFin: this.contract.dateFin?.substring(0, 10) || '',
        dureeContrat: this.contract.dureeContrat,
        clauses: this.contract.clauses
      };
    }
    this.showContratForm = true;
  }

  sauvegarderContrat(): void {
    if (!this.editUserId && !this.shop.id_user) {
      alert('Veuillez d\'abord assigner un locataire avant de créer un contrat.');
      return;
    }

    this.savingContrat = true;
    const userId = this.shop.id_user?._id || this.shop.id_user || this.editUserId;

    const payload: CreateContractPayload = {
      shopId: this.shop._id,
      userId,
      ...this.contratForm
    };

    const action$ = this.contract
      ? this.contractService.updateContract(this.contract._id, payload)
      : this.contractService.createContract(payload);

    action$.subscribe({
      next: (contract) => {
        this.contract = contract;
        this.showContratForm = false;
        this.savingContrat = false;
      },
      error: (err) => {
        alert('Erreur : ' + (err?.error?.message || 'Impossible de sauvegarder'));
        this.savingContrat = false;
      }
    });
  }

  signerContratAdmin(): void {
    if (!this.contract) return;
    if (!confirm('Confirmer la signature du contrat ? Un email sera envoyé au locataire.')) return;

    this.signingAdmin = true;
    this.contractService.signerAdmin(this.contract._id).subscribe({
      next: (res) => {
        this.contract = res.contract;
        this.signingAdmin = false;
        alert('✅ Contrat signé et envoyé au locataire par email.');
      },
      error: (err) => {
        alert('Erreur : ' + (err?.error?.message || 'Échec de la signature'));
        this.signingAdmin = false;
      }
    });
  }

  resilierContrat(): void {
    if (!this.contract) return;
    if (!confirm('Résilier ce contrat ? Le locataire perdra son accès manager.')) return;

    this.resiliating = true;
    this.contractService.resilier(this.contract._id).subscribe({
      next: () => {
        this.contract = null;
        this.shop.status = 'inactif';
        this.shop.id_user = null;
        this.editUserId = '';
        this.resiliating = false;
        alert('Contrat résilié.');
      },
      error: (err) => {
        alert('Erreur : ' + (err?.error?.message || 'Échec résiliation'));
        this.resiliating = false;
      }
    });
  }

  voirPDF(): void {
    if (!this.contract) return;
    window.open(this.contractService.getPdfUrl(this.contract._id), '_blank');
  }

  statutContratLabel(statut: string): string {
    const map: Record<string, string> = {
      brouillon: '📝 Brouillon',
      'signé_admin': '✅ Signé par l\'admin — en attente client',
      'signé_client': '✅ Signé par le client',
      actif: '🟢 Actif',
      'résilié': '🔴 Résilié'
    };
    return map[statut] ?? statut;
  }

  retourDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}