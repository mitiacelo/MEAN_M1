import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes avec paramètres → Server Side Rendering
  { path: 'salle/:id', renderMode: RenderMode.Server },
  { path: 'salle-manager/:id', renderMode: RenderMode.Server },
  { path: 'boutique-manager/:id', renderMode: RenderMode.Server },
  { path: 'shop/:id/admin', renderMode: RenderMode.Server },
  { path: 'boutique/:id', renderMode: RenderMode.Server },
  { path: 'order-confirm/:id', renderMode: RenderMode.Server },
  { path: 'invoice/:id', renderMode: RenderMode.Server },
  { path: 'contrat/signer/:token', renderMode: RenderMode.Server },

  // Toutes les autres routes → Prerender
  { path: '**', renderMode: RenderMode.Prerender }
];