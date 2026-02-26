import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { EmailPayload, EmailService } from '../../../services/email.service';
import { Notification, NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  filter: 'all' | 'nouveau' | 'contacté' | 'archivé' = 'all';

  // Modale
  selectedNotification: Notification | null = null;
  showModal = false;
  activeTab: 'detail' | 'email' | 'history' = 'detail';

  // Formulaire email
  emailSubject = '';
  emailBody = '';
  sendingEmail = false;
  emailSuccess = '';
  emailError = '';

  // Admin connecté
  adminName = '';
  adminEmail = '';

  constructor(
    private notifService: NotificationService,
    private emailService: EmailService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAdminInfo();
    this.load();
  }

  loadAdminInfo(): void {
    const user = this.authService.currentUser;
    if (user) {
      this.adminName = `${user.firstname ?? ''} ${user.name ?? ''}`.trim();
      this.adminEmail = user.email ?? '';
    }
  }

  load(): void {
    this.loading = true;
    this.notifService.getAll().subscribe({
      next: (data) => { this.notifications = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  get filtered(): Notification[] {
    if (this.filter === 'all') return this.notifications;
    return this.notifications.filter(n => n.status === this.filter);
  }

  get nouveauCount(): number {
    return this.notifications.filter(n => n.status === 'nouveau').length;
  }

  setFilter(f: typeof this.filter): void {
    this.filter = f;
  }

  // ── Modale ──────────────────────────────────────────────
  openNotification(notif: Notification): void {
    this.selectedNotification = notif;
    this.showModal = true;
    this.activeTab = 'detail';
    this.prefillEmail(notif);
    this.emailSuccess = '';
    this.emailError = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedNotification = null;
  }

  prefillEmail(notif: Notification): void {
    const shopName = this.getShopName(notif);
    const clientFirstname = this.getUserFirstname(notif);
    this.emailSubject = ` Demande de location – ${shopName}`;
    this.emailBody =
      `Bonjour ${clientFirstname},\n\n` +
      `Suite à votre demande concernant la boutique "${shopName}", ` +
      `nous avons bien pris en compte votre message.\n\n` +
      `[Votre réponse ici]\n\n` +
      `Nous restons à votre disposition pour tout renseignement complémentaire.`;
  }

  // ── Envoi email ─────────────────────────────────────────
  sendEmail(): void {
    if (!this.selectedNotification || !this.emailSubject.trim() || !this.emailBody.trim()) return;

    this.sendingEmail = true;
    this.emailSuccess = '';
    this.emailError = '';

    const payload: EmailPayload = {
      subject: this.emailSubject,
      body: this.emailBody,
      adminName: this.adminName,
      adminEmail: this.adminEmail
    };

    this.emailService.sendEmail(this.selectedNotification._id, payload).subscribe({
      next: (res) => {
        this.sendingEmail = false;
        this.emailSuccess = 'Email envoyé avec succès !';
        const idx = this.notifications.findIndex(n => n._id === this.selectedNotification!._id);
        if (idx !== -1) this.notifications[idx] = res.request;
        this.selectedNotification = res.request;
        this.activeTab = 'history';
      },
      error: (err) => {
        this.sendingEmail = false;
        this.emailError = err?.error?.message ?? "Échec de l'envoi.";
      }
    });
  }

  // ── Archiver ────────────────────────────────────────────
  archive(notif: Notification): void {
    this.notifService.updateStatus(notif._id, 'archivé').subscribe({
      next: (updated) => {
        const idx = this.notifications.findIndex(n => n._id === notif._id);
        if (idx !== -1) this.notifications[idx] = { ...this.notifications[idx], status: updated.status };
        if (this.selectedNotification?._id === notif._id) {
          this.selectedNotification = { ...this.selectedNotification, status: updated.status };
        }
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────
  getUserName(notif: Notification): string {
    const u = notif.user as any;
    if (u && typeof u === 'object') return `${u.firstname ?? ''} ${u.name ?? ''}`.trim();
    return 'Utilisateur';
  }

  getUserFirstname(notif: Notification): string {
    const u = notif.user as any;
    if (u && typeof u === 'object') return u.firstname ?? 'Madame/Monsieur';
    return 'Madame/Monsieur';
  }

  getShopName(notif: Notification): string {
    const s = notif.shop as any;
    if (s && typeof s === 'object') return s.name;
    return 'Boutique';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      nouveau: 'Nouveau',
      'contacté': 'Contacté',
      'archivé': 'Archivé'
    };
    return map[status] ?? status;
  }
}