import { Routes } from '@angular/router';
import { ArticleListComponent } from './components/article-list/article-list.component';
import { GrilleComponent } from './components/grille/grille.component';
export const routes: Routes = [
 { path: 'articles', component: ArticleListComponent }, // Route pour article-list
 { path: 'grille', component: GrilleComponent }, // Route pour article-list
 { path: '', redirectTo: 'grille', pathMatch: 'full' } // Redirection par défaut
];
