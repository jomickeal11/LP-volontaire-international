import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    buckets: {
      // Documents privés (candidats, partenaires) — accès restreint, téléchargement via API protégée
      documents: {},
      // Médias publics (images CMS, PDF ressources) — lecture anonyme
      media: { access: "public_read" },
    },
  },
});
