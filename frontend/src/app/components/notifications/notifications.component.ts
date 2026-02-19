import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Notification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  loading = true;
  filter: 'all' | 'pending' | 'processed' | 'rejected' = 'all';

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.notificationService.getAll().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement notifications:', err);
        this.loading = false;
      }
    });
  }

  get filtered(): Notification[] {
    if (this.filter === 'all') return this.notifications;
    return this.notifications.filter(n => n.status === this.filter);
  }

  get pendingCount(): number {
    return this.notifications.filter(n => n.status === 'pending').length;
  }

  setFilter(f: 'all' | 'pending' | 'processed' | 'rejected'): void {
    this.filter = f;
  }

  accept(notif: Notification): void {
    this.notificationService.updateStatus(notif._id, 'processed').subscribe({
      next: (updated) => {
        notif.status = updated.status;
      },
      error: (err) => console.error(err)
    });
  }

  reject(notif: Notification): void {
    this.notificationService.updateStatus(notif._id, 'rejected').subscribe({
      next: (updated) => {
        notif.status = updated.status;
      },
      error: (err) => console.error(err)
    });
  }

  getUserName(notif: Notification): string {
    const u = notif.user as any;
    if (u && typeof u === 'object') return `${u.firstname ?? ''} ${u.name ?? ''}`.trim();
    return 'Utilisateur';
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
}