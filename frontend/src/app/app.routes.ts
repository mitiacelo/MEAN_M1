import { Routes } from '@angular/router';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { GrilleComponent } from './components/grille/grille.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  { path: 'articles', component: ArticleListComponent },
  { path: 'grille', component: GrilleComponent },
  { path: 'dashboard', component: DashboardComponent }, // ✅ NOUVEAU
  { path: '', redirectTo: 'grille', pathMatch: 'full' },
  {
    path: 'landing',
    component: LandingComponent
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
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
    loadComponent: () => import('./pages/shop/shop-edit/shop-edit.component')
      .then(m => m.ShopEditComponent)
  },
];