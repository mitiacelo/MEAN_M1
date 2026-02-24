import { Routes } from '@angular/router';

export const routes: Routes = [
  // Route par défaut
  { path: '', redirectTo: 'grille', pathMatch: 'full' },

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

  // Routes shop standalone (pas dans le layout admin)
  {
    path: 'dashboard-shop',
    loadComponent: () =>
      import('./pages-new/boutique-centre/admin-boutique/dashboard-shop/dashboard-shop.component')
        .then(m => m.DashboardShopComponent)
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

  // Routes encadrées par le layout admin
  {
    path: '',
    loadComponent: () =>
      import('./components-new/layouts/header/header-admin/header-admin.component')
        .then(m => m.AdminLayoutComponent),
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
      }
    ]
  },

  // Routes boutique / customer qui ne passent pas par le layout admin
  {
    path: 'articles',
    loadComponent: () =>
      import('./components/article-list/article-list.component').then(m => m.ArticleListComponent)
  },
  {
    path: 'shop/:id/admin',
    loadComponent: () =>
      import('./pages/shop/shop-edit/shop-edit.component').then(m => m.ShopEditComponent)
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
  }
];