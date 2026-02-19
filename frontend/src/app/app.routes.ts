import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'grille', pathMatch: 'full' },
  {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
  },

  // ✅ Toutes les routes admin/gestionnaire dans le layout avec sidebar
  {
    path: '',
    loadComponent: () => import('./layouts/layouts.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'grille',
        loadComponent: () => import('./components/grille/grille.component').then(m => m.GrilleComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
      {
        path: 'articles',
        loadComponent: () => import('./components/article-list/article-list.component').then(m => m.ArticleListComponent)
      },
      {
        path: 'shop',
        loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent)
      },
      {
        path: 'shop/:id',
        loadComponent: () => import('./pages/shop/shop-details/shop-details.component').then(m => m.ShopDetailsComponent)
      },
      {
        path: 'shop/:id/admin',
        loadComponent: () => import('./pages/shop/shop-edit/shop-edit.component').then(m => m.ShopEditComponent)
      },
      {
        path: 'dashboard-shop',
        loadComponent: () => import('./pages/dashboard/dashboard-shop/dashboard-shop.component').then(m => m.DashboardShopComponent)
      },
      {
        path: 'boutique/:id',
        loadComponent: () => import('./components/boutiques/boutiques-details/boutiques-details.component').then(m => m.BoutiqueDetailsComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
      }
    ]
  }
];