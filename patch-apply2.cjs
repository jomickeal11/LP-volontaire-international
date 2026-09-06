const fs = require('fs');
let content = fs.readFileSync('src/views/ApplyPage.tsx', 'utf-8');

content = content.replace(
  'Candidature enregistrée avec succès !',
  '{t.apply.success.title}'
);

content = content.replace(
  /Merci, <strong>\{form\.firstName \|\| "Candidat"\}<\/strong> ! Votre\s*candidature a été transmise à l'équipe de coordination d'APTIC-R à\s*Agbélouvé\./,
  '{t.apply.success.p1_1}<strong>{form.firstName || "Candidat"}</strong>{t.apply.success.p1_2}'
);

content = content.replace(
  /Un email de confirmation vous sera envoyé à\{" "\}\s*<strong>\{form\.email\}<\/strong>\. Notre équipe étudiera votre dossier\s*sous 1 à 2 semaines\./,
  '{t.apply.success.p2_1}<strong>{form.email}</strong>{t.apply.success.p2_2}'
);

content = content.replace(
  />\s*Retour à l'accueil\s*<\/button>/,
  '>{t.apply.success.backHome}</button>'
);

content = content.replace(
  />\s*Voir dans le Back-office →\s*<\/button>/,
  '>{t.apply.success.backOffice}</button>'
);

content = content.replace(
  /Référence : \{submittedRef\}/,
  '{t.apply.success.ref} {submittedRef}'
);

content = content.replace(
  /Volunteer Application/,
  '{t.apply.header.tag}'
);

content = content.replace(
  /Apply to volunteer with APTIC-R/,
  '{t.apply.header.title}'
);

content = content.replace(
  /This application takes about 15–20 minutes\. All information is kept\s*confidential\./,
  '{t.apply.header.desc}'
);

fs.writeFileSync('src/views/ApplyPage.tsx', content, 'utf-8');
console.log('Successfully patched ApplyPage.tsx partially (2)');
