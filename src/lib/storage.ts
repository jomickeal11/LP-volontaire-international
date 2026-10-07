import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

/** Documents privés (candidatures, partenaires) — accès restreint */
export const files = new Files({ adapter: neon({ bucket: "documents" }) });

/** Médias publics (images CMS, PDF ressources) — lecture anonyme */
export const mediaFiles = new Files({ adapter: neon({ bucket: "media" }) });
