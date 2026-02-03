import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-list',
  standalone: true,          // ← si tu utilises standalone (recommandé)
  imports: [CommonModule, FormsModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css'
})
export class ArticleListComponent implements OnInit {
  articles: any[] = [];
  newArticle = { title: '', content: '' };

  // Pour l'édition
  editingArticleId: string | null = null;
  editingArticle: any = { title: '', content: '' };

  constructor(private articleService: ArticleService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (data) => (this.articles = data),
      error: (err) => console.error('Erreur chargement articles', err)
    });
  }

  addArticle(): void {
    if (this.newArticle.title.trim() && this.newArticle.content.trim()) {
      this.articleService.addArticle(this.newArticle).subscribe({
        next: () => {
          this.loadArticles();
          this.newArticle = { title: '', content: '' };
        },
        error: (err) => console.error('Erreur ajout', err)
      });
    }
  }

  deleteArticle(id: string): void {
    if (confirm('Supprimer cet article ?')) {
      this.articleService.deleteArticle(id).subscribe({
        next: () => this.loadArticles(),
        error: (err) => console.error('Erreur suppression', err)
      });
    }
  }

  startEdit(article: any): void {
    this.editingArticleId = article._id;
    this.editingArticle = { ...article }; // copie pour édition
  }

  saveEdit(): void {
    if (this.editingArticleId && this.editingArticle.title.trim() && this.editingArticle.content.trim()) {
      this.articleService.updateArticle(this.editingArticleId, this.editingArticle).subscribe({
        next: () => {
          this.loadArticles();
          this.cancelEdit();
        },
        error: (err) => console.error('Erreur mise à jour', err)
      });
    }
  }

  cancelEdit(): void {
    this.editingArticleId = null;
    this.editingArticle = { title: '', content: '' };
  }
}