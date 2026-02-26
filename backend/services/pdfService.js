const PDFDocument = require('pdfkit');

/**
 * Génère un contrat de bail en PDF et retourne un Buffer
 * @param {Object} data - { contract, shop, user, centre }
 */
const genererContratPDF = (data) => {
  return new Promise((resolve, reject) => {
    const { contract, shop, user, centre } = data;
    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const primary = '#2d2d2d';
    const accent = '#c07a3a';
    const light = '#f5f5f5';

    // ── En-tête ──────────────────────────────────────────
    doc.fontSize(20).fillColor(accent).font('Helvetica-Bold')
      .text('CONTRAT DE BAIL COMMERCIAL', { align: 'center' });

    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#888').font('Helvetica')
      .text(`Centre Commercial — ${centre?.nom || 'Centre Commercial'}`, { align: 'center' });

    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor(accent).lineWidth(1.5).stroke();
    doc.moveDown(1);

    // ── Parties ──────────────────────────────────────────
    doc.fontSize(13).fillColor(primary).font('Helvetica-Bold').text('PARTIES AU CONTRAT');
    doc.moveDown(0.4);

    doc.fontSize(11).font('Helvetica-Bold').fillColor(accent).text('Le Bailleur :');
    doc.font('Helvetica').fillColor(primary)
      .text(`${centre?.nom || 'Centre Commercial'}`)
      .text(`Représenté par l'administration du centre`);

    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fillColor(accent).text('Le Locataire :');
    doc.font('Helvetica').fillColor(primary)
      .text(`${user.firstname} ${user.name}`)
      .text(`Email : ${user.email}`)
      .text(`Téléphone : ${user.phone || 'Non renseigné'}`);

    doc.moveDown(1);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    doc.moveDown(1);

    // ── Objet du contrat ─────────────────────────────────
    doc.fontSize(13).fillColor(primary).font('Helvetica-Bold').text('OBJET DU CONTRAT');
    doc.moveDown(0.4);
    doc.fontSize(11).font('Helvetica').fillColor(primary)
      .text(`Le présent contrat a pour objet la location de la boutique suivante :`);
    doc.moveDown(0.3);

    // Encadré boutique
    doc.roundedRect(60, doc.y, 475, 70, 6).fillColor(light).fill();
    const boxY = doc.y + 10;
    doc.fillColor(primary).font('Helvetica-Bold').fontSize(12)
      .text(`Boutique : ${shop.name}`, 75, boxY);
    doc.font('Helvetica').fontSize(11)
      .text(`Superficie : ${shop.superficie} m²`, 75, boxY + 18)
      .text(`Description : ${shop.description || 'Sans description'}`, 75, boxY + 34);
    doc.moveDown(4.5);

    doc.moveDown(1);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    doc.moveDown(1);

    // ── Durée ────────────────────────────────────────────
    doc.fontSize(13).fillColor(primary).font('Helvetica-Bold').text('DURÉE');
    doc.moveDown(0.4);

    const debut = new Date(contract.dateDebut).toLocaleDateString('fr-FR');
    const fin = new Date(contract.dateFin).toLocaleDateString('fr-FR');

    doc.fontSize(11).font('Helvetica').fillColor(primary)
      .text(`Date de début : ${debut}`)
      .text(`Date de fin : ${fin}`)
      .text(`Durée : ${contract.dureeContrat || 'Non précisée'}`);

    doc.moveDown(1);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    doc.moveDown(1);

    // ── Conditions financières ───────────────────────────
    doc.fontSize(13).fillColor(primary).font('Helvetica-Bold').text('CONDITIONS FINANCIÈRES');
    doc.moveDown(0.4);
    doc.fontSize(11).font('Helvetica').fillColor(primary)
      .text(`Loyer mensuel : ${contract.loyer} Ar`)
      .text(`Charges mensuelles : ${contract.charges} Ar`)
      .text(`Total mensuel : ${contract.loyer + contract.charges} Ar`)
      .text(`Dépôt de garantie : ${contract.depot} Ar`);

    doc.moveDown(1);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
    doc.moveDown(1);

    // ── Clauses ──────────────────────────────────────────
    if (contract.clauses) {
      doc.fontSize(13).fillColor(primary).font('Helvetica-Bold').text('CLAUSES PARTICULIÈRES');
      doc.moveDown(0.4);
      doc.fontSize(11).font('Helvetica').fillColor(primary).text(contract.clauses, { lineGap: 4 });
      doc.moveDown(1);
      doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#e0e0e0').lineWidth(0.5).stroke();
      doc.moveDown(1);
    }

    // ── Signatures ───────────────────────────────────────
    doc.fontSize(13).fillColor(primary).font('Helvetica-Bold').text('SIGNATURES');
    doc.moveDown(0.8);

    const sigY = doc.y;

    // Admin
    doc.fontSize(11).font('Helvetica-Bold').fillColor(accent)
      .text('Le Bailleur (Admin)', 60, sigY);
    doc.font('Helvetica').fillColor(primary);
    if (contract.dateSignatureAdmin) {
      doc.text(`Signé le : ${new Date(contract.dateSignatureAdmin).toLocaleDateString('fr-FR')}`, 60, sigY + 16);
      doc.moveTo(60, sigY + 50).lineTo(230, sigY + 50).strokeColor('#333').lineWidth(0.8).stroke();
      doc.fontSize(9).fillColor('#888').text('Signature admin', 60, sigY + 54);
    } else {
      doc.text('En attente de signature', 60, sigY + 16);
    }

    // Client
    doc.fontSize(11).font('Helvetica-Bold').fillColor(accent)
      .text('Le Locataire', 310, sigY);
    doc.font('Helvetica').fillColor(primary);
    if (contract.dateSignatureClient) {
      doc.text(`Signé le : ${new Date(contract.dateSignatureClient).toLocaleDateString('fr-FR')}`, 310, sigY + 16);
      doc.moveTo(310, sigY + 50).lineTo(535, sigY + 50).strokeColor('#333').lineWidth(0.8).stroke();
      doc.fontSize(9).fillColor('#888').text('Signature locataire', 310, sigY + 54);
    } else {
      doc.text('En attente de signature', 310, sigY + 16);
    }

    doc.end();
  });
};

module.exports = { genererContratPDF };