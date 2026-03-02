import { Routes } from '@angular/router';
import { adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Route par défaut → landing
  { path: '', redirectTo: 'landing', pathMatch: 'full' },

  // Pages publiques / auth
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages-new/home-page/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages-new/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages-new/auth/register/register.component').then(m => m.RegisterComponent)
  },

  {
    path: 'salle',
    loadComponent: () =>
      import('./pages-new/boutique-centre/admin-boutique/salle/salle.component').then(m => m.SalleComponent)
  },
  {
    path: 'salle/:id',
    loadComponent: () =>
      import('./pages-new/boutique-centre/admin-boutique/salle/salle-details/salle-details.component')
        .then(m => m.SalleDetailsComponent)
  },

  // ══════════════════════════════════════════════
  // Routes ADMIN — protégées par adminGuard
  // ══════════════════════════════════════════════
  {
    path: '',
    loadComponent: () =>
      import('./components-new/layouts/header/header-admin/header-admin.component')
        .then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],          // ← guard sur le layout parent
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages-new/admin-centre/dashboard-center/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'grille',
        loadComponent: () =>
          import('./pages-new/admin-centre/store/grille.component').then(m => m.GrilleComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages-new/admin-centre/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'location',
        loadComponent: () =>
          import('./pages-new/admin-centre/location/location.component')
            .then(m => m.LocationComponent)
      },
      {
        path: 'maintenance',
        loadComponent: () =>
          import('./pages-new/admin-centre/maintenance/maintenance.component')
            .then(m => m.MaintenanceComponent)
      }
    ]
  },

  // Routes boutique manager
  {
    path: '',
    loadComponent: () =>
      import('./components-new/layouts/sidebar-shop/sidebar-shop.component')
        .then(m => m.SidebarShopComponent),
    children: [
      {
        path: 'dashboard-shop',
        loadComponent: () =>
          import('./pages-new/boutique-centre/admin-boutique/dashboard-shop/dashboard-shop.component')
            .then(m => m.DashboardShopComponent)
      },
      {
        path: 'suivi-donnees',
        loadComponent: () =>
          import('./pages-new/boutique-centre/admin-boutique/suivi-donnees/suivi-donnees.component')
            .then(m => m.SuiviDonneesComponent)
      },
      {
        path: 'salle-manager/:id',
        loadComponent: () =>
          import('./pages-new/boutique-centre/admin-boutique/salle/salle-manager/salle-manager.component')
            .then(m => m.SalleManagerComponent)
      },
      {
        path: 'mes-boutiques',
        loadComponent: () =>
          import('./pages-new/boutique-centre/admin-boutique/mes-boutiques/mes-boutiques.component')
            .then(m => m.MesBoutiquesComponent)
      },
      {
        path: 'boutique-manager/:id',
        loadComponent: () =>
          import('./pages-new/boutique-centre/admin-boutique/boutique-manager/boutique-manager.component')
            .then(m => m.BoutiqueManagerComponent)
      },
      { path: '', redirectTo: 'dashboard-shop', pathMatch: 'full' }
    ]
  },

  // Routes boutique / customer
  {
    path: 'articles',
    loadComponent: () =>
      import('./components/article-list/article-list.component').then(m => m.ArticleListComponent)
  },
  {
    path: 'shop/:id/admin',
    loadComponent: () =>
      import('./pages-new/admin-centre/shop/shop-edit/shop-edit.component').then(m => m.ShopEditComponent)
  },
  {
    path: 'boutique/:id',
    loadComponent: () =>
      import('./pages-new/boutique-centre/admin-boutique/boutiques/boutiques-details/boutiques-details.component')
        .then(m => m.BoutiqueDetailsComponent)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./pages-new/boutique-centre/customer-page/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages-new/boutique-centre/customer-page/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'order-confirm/:id',
    loadComponent: () =>
      import('./pages-new/boutique-centre/customer-page/order-confirm/order-confirm.component')
        .then(m => m.OrderConfirmComponent)
  },
  {
    path: 'invoice/:id',
    loadComponent: () =>
      import('./pages-new/boutique-centre/customer-page/invoice/invoice.component').then(m => m.InvoiceComponent)
  },
  {
    path: 'mon-contrat',
    loadComponent: () =>
      import('./pages-new/admin-centre/contract/contract.component').then(m => m.MonContratComponent)
  },
  {
    path: 'contrat/signer/:token',
    loadComponent: () =>
      import('./pages-new/admin-centre/contract/contract.component').then(m => m.MonContratComponent)
  }
];