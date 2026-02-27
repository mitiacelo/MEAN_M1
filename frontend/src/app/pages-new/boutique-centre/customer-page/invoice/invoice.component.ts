import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PurchaseService } from '../../../../services/purchase.service';
import { AuthService } from '../../../../services/auth.service';
import { Purchase } from '../../../../services/purchase.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit {
  @ViewChild('invoice') invoiceElement!: ElementRef<HTMLDivElement>;

  purchase: Purchase | null = null;
  loading = true;
  generatingPdf = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private purchaseService: PurchaseService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const purchaseId = this.route.snapshot.paramMap.get('id');
    if (!purchaseId) {
      this.error = 'ID de facture manquant';
      this.loading = false;
      return;
    }

    this.purchaseService.getPurchase(purchaseId).subscribe({
      next: (purchase) => {
        if (!purchase) {
          this.error = 'Facture introuvable';
          this.loading = false;
          return;
        }
        this.purchase = purchase;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur chargement facture : ' + (err.error?.message || 'Erreur inconnue');
        this.loading = false;
      }
    });
  }

  generatePdf(): void {
    if (!this.invoiceElement?.nativeElement) {
      console.warn('Élément #invoice non trouvé dans le DOM');
      alert('La page de facture n\'est pas encore prête.');
      return;
    }
  
    if (!this.purchase) {
      console.warn('Aucune facture chargée');
      alert('Aucune facture disponible.');
      return;
    }
  
    const currentPurchase: Purchase = this.purchase; // safe après guard
  
    this.generatingPdf = true;
  
    // Recherche de .invoice-container
    const contentToCapture = this.invoiceElement.nativeElement.querySelector('.invoice-container');
  
    if (!contentToCapture) {
      console.warn('Aucune div avec class="invoice-container" trouvée');
      alert('Structure de la facture incorrecte (classe invoice-container manquante)');
      this.generatingPdf = false;
      return; 
    }
  
    console.log('Contenu à capturer trouvé, dimensions :', contentToCapture.scrollWidth, contentToCapture.scrollHeight);
  
    html2canvas(contentToCapture as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: true,  // ← active pour debug
      backgroundColor: '#ffffff',
      windowWidth: contentToCapture.scrollWidth,
      windowHeight: contentToCapture.scrollHeight
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      let heightLeft = imgHeight;
      let position = 0;
  
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  
      heightLeft -= pdfHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
  
      const fileName = `facture_${currentPurchase._id}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
  
      this.generatingPdf = false;
    }).catch(err => {
      console.error('Erreur html2canvas :', err);
      alert('Erreur lors de la génération du PDF');
      this.generatingPdf = false;
    });
  }

  printInvoice(): void {
    window.print();
  }

  get grandTotalDisplay(): number {
    return this.purchase?.grandTotal || 0;
  }
}