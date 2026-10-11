# Guide d’utilisation du back-office APTIC-R

Ce guide s’adresse au responsable de l’association et aux personnes autorisées à administrer le site. Il décrit les écrans et commandes présents dans le projet. Les intitulés peuvent varier légèrement selon la langue sélectionnée et l’évolution du déploiement.

## 1. Accéder au back-office

### Se connecter

1. Ouvrez l’adresse du site suivie de `/backoffice/login`.
2. Saisissez l’adresse e-mail et le mot de passe de votre compte, puis choisissez **Se connecter**.
3. Une fois connecté, vous arrivez sur votre espace de travail ou sur le tableau de bord selon votre rôle.

Un compte doit avoir été créé par un super-administrateur ou initialisé par le responsable technique. Il n’existe pas d’inscription publique.

### Se déconnecter

Choisissez votre nom ou votre avatar dans la barre supérieure, puis **Se déconnecter**. Le même accès à la déconnexion est disponible en bas du menu latéral. Sur un ordinateur partagé, déconnectez-vous et fermez la fenêtre du navigateur.

### Mot de passe oublié

1. Sur la page de connexion, choisissez **Mot de passe oublié ?**.
2. Saisissez l’adresse du compte et choisissez **Envoyer le lien**.
3. Si le compte existe et que le service e-mail est disponible, utilisez le lien reçu pour définir un nouveau mot de passe.

La confirmation affichée ne révèle pas si l’adresse correspond à un compte et ne garantit pas qu’un e-mail a été délivré. Si aucun message n’arrive, vérifiez les courriers indésirables puis contactez le super-administrateur. Le lien peut être expiré ou déjà utilisé ; dans ce cas, demandez-en un nouveau.

### Mon compte et changement d’adresse

Dans le menu latéral ou le menu du profil, ouvrez **Mon compte**. La page permet de modifier le nom d’affichage, de consulter l’adresse et le rôle, et de changer son mot de passe.

Pour changer d’adresse, saisissez la nouvelle adresse et demandez le lien de confirmation. L’adresse actuelle reste utilisée tant que la nouvelle n’a pas été confirmée. Si l’envoi échoue ou si le lien expire, la page affiche l’état en attente ou l’échec et permet de redemander le lien. Pour changer le mot de passe, saisissez le mot de passe actuel, puis le nouveau et sa confirmation. Le rôle et la date de création du compte sont en lecture seule.

Ces parcours nécessitent un fournisseur d’e-mails opérationnel pour recevoir les liens. Leur disponibilité réelle dépend de la configuration du site.

## 2. Rôles et accès

Les rubriques visibles sont adaptées au rôle du compte. Les droits sont aussi contrôlés côté serveur ; l’absence d’une rubrique ou un refus d’accès ne doit pas être contourné en saisissant une adresse directe.

| Rôle | Utilisation principale | Accès général |
| --- | --- | --- |
| **SUPER_ADMIN** | Responsable du site et des accès | Toutes les rubriques, y compris gestion des administrateurs, suppressions définitives autorisées et lancement réel des campagnes. |
| **CONTENT_ADMIN** | Équipe éditoriale | Articles, projets, domaines, événements, ressources, médias, albums, témoignages, pages et réglages de contenu, gestion des abonnés et préparation des campagnes. Peut envoyer un e-mail de test à une adresse saisie, si le fournisseur est configuré. Ne traite pas les dossiers et ne lance pas une campagne réelle. |
| **REQUEST_MANAGER** | Équipe de traitement des demandes | Candidatures et répertoire candidats, demandes de partenariat, propositions de projets, adhésions et membres, demandes de participation aux événements et messages de contact. Peut consulter les documents rattachés aux dossiers auxquels son rôle donne accès et exporter les données autorisées. Ne gère pas les contenus ni les comptes administrateurs. |

Les suppressions définitives de dossiers confidentiels et la gestion des comptes/rôles sont réservées au super-administrateur. Les données personnelles ne sont exportables que depuis les modules autorisés au rôle.

## 3. Navigation et tableau de bord

Le menu latéral regroupe les rubriques en sections. Sur petit écran, ouvrez-le avec le bouton de menu dans la barre supérieure. Le profil en bas du menu permet d’ouvrir **Mon compte** ; la barre supérieure propose aussi le profil et la déconnexion.

- **SUPER_ADMIN** voit le tableau de bord avec les indicateurs de candidature, leur évolution et les répartitions disponibles, ainsi que **Statistiques**.
- **CONTENT_ADMIN** arrive sur **Votre espace de travail**, qui donne des raccourcis vers les articles, projets/événements et campagnes newsletter.
- **REQUEST_MANAGER** arrive sur **Votre espace de travail**, avec des raccourcis vers les candidatures, demandes de partenariat, propositions de projets et messages de contact.

Le compteur dans le menu peut signaler des demandes de participation non consultées. Il s’agit d’un repère de navigation, pas d’une notification par e-mail.

Les rubriques courantes comprennent : **Candidatures volontaires**, **Répertoire candidats**, **Demandes d’adhésion**, **Membres**, **Demandes** de partenariat, **Propositions de projets**, **Partenaires**, **Articles & Actualités**, **Projets terrain**, **Domaines d’action**, **Événements & Formations**, **Ressources documentaires**, **Messages de contact**, **Newsletter & Abonnés**, **Campagnes newsletter**, **Médias & Galerie**, **Albums**, **Témoignages**, **Paramètres** et, pour le super-administrateur, **Gestion des administrateurs**. Certaines entrées sont masquées selon le rôle.

## 4. Gérer les contenus du site

Les rubriques éditoriales sont accessibles aux super-administrateurs et administrateurs de contenu. Les noms des boutons ci-dessous sont ceux présents dans l’interface française.

### Articles et actualités

1. Ouvrez **Articles & Actualités**, puis **Créer un nouvel article**.
2. Renseignez les champs proposés. Le formulaire comporte les langues FR, EN et DE ainsi que des commandes de traduction assistée.
3. Enregistrez l’article. Dans la liste, utilisez **Modifier** pour le reprendre ; la publication peut être activée séparément pour chaque langue.
4. Vérifiez le texte et la langue sur le site public avant d’activer la publication.

La traduction assistée dépend de la configuration du service de traduction ; relisez toujours les textes produits.

### Projets terrain

Dans **Projets terrain**, choisissez **Nouveau projet** pour ouvrir le formulaire, ou **Modifier** sur une ligne existante. Le formulaire permet de renseigner les contenus FR/EN/DE, les éléments de présentation et l’image. La publication est gérée par langue. La liste propose aussi une mise en avant et la suppression, qui demande confirmation et peut être irréversible.

Lorsqu’un projet provient d’une proposition, le formulaire peut afficher les informations de cette proposition pour aider à créer la fiche projet.

### Événements et formations

Ouvrez **Événements & Formations**, choisissez **Planifier un événement** ou **Modifier**. Renseignez le contenu, le format, les dates et les paramètres proposés. **Enregistrer le brouillon** conserve les modifications sans publication ; **Publier** rend l’événement public.

Dans la liste, le bouton **Demandes** ouvre les inscriptions liées à l’événement. Vous pouvez consulter puis **Valider** ou **Refuser** une demande. La validation peut être bloquée si l’événement a atteint sa capacité. Consultez le détail de la demande avant de répondre.

### Domaines d’action

Dans **Domaines d’action**, créez un domaine ou utilisez **Modifier** dans la liste. Vous pouvez le publier/masquer et le supprimer ; une confirmation est demandée avant suppression. Vérifiez l’effet sur les formulaires ou contenus qui font référence au domaine avant de le retirer.

### Ressources documentaires

Dans **Ressources documentaires**, choisissez **Ajouter une ressource**, complétez les informations, sélectionnez le fichier demandé, puis enregistrez. La liste permet de rechercher, ouvrir/télécharger, modifier, publier/masquer et supprimer une ressource. Les ressources affichées sur le site sont destinées à être publiques : n’y déposez aucun document confidentiel ou contenant des données de candidature.

### Médias et albums

- Dans **Médias & Galerie**, choisissez **Ajouter un média**, complétez le formulaire et téléversez le fichier. Vous pouvez ensuite modifier ou supprimer une entrée existante.
- Dans **Albums**, choisissez **Créer un album**, renseignez le titre et la description selon les langues disponibles, vérifiez le slug, l’image de couverture et l’ordre, puis enregistrez. La liste permet de modifier, publier/dépublier et supprimer l’album.

Les téléversements nécessitent un stockage objet correctement configuré. L’interface ne prouve pas à elle seule que le fichier a été rendu accessible au public.

### Témoignages

Dans **Témoignages**, choisissez **Ajouter un témoignage**, renseignez le formulaire, puis **Créer** ou **Enregistrer**. Une entrée existante peut être modifiée ou supprimée. Vérifiez que la personne a autorisé la publication de son témoignage et de sa photo avant de le rendre public.

### Pages du site et réglages de contenu

Ouvrez **Paramètres**. Les onglets présents comprennent **Équipe & Rôles**, **Page Accueil**, **Page Actualités**, **Page Soutien**, **Page Devenir membre**, **Page À Propos**, **Page Volontariat**, **Page Partenaires**, **Page Contact** et **Coordonnées & Réseaux**.

Dans un éditeur de page, sélectionnez la langue, développez les sections utiles, modifiez les champs puis utilisez la commande d’enregistrement. Les pages multilingues affichent un indicateur de complétude et un aperçu public ; certaines ont un contrôle de publication propre à chaque langue. Les actions qui remplacent des contenus existants peuvent demander une confirmation. Vérifiez l’aperçu et le contenu FR/EN/DE avant publication.

Je n’ai pas identifié de rubrique dédiée à l’édition des menus de navigation. Ne supposez pas que **Paramètres** permet de réorganiser les menus ; demandez au responsable technique si cette modification est nécessaire.

## 5. Traiter les demandes et les dossiers

Ces rubriques sont destinées au rôle **REQUEST_MANAGER** et au **SUPER_ADMIN**. Les listes comportent selon le module une recherche, des filtres et l’ouverture d’une fiche détaillée.

### Candidatures et candidats

Dans **Candidatures volontaires**, recherchez ou filtrez par statut, pays ou compétence. Sélectionnez une ligne pour ouvrir la fiche. Celle-ci présente les informations du dossier, les pièces jointes, l’historique et les notes disponibles. Mettez à jour le statut, ajoutez une note interne si nécessaire, puis enregistrez. Les documents se téléchargent depuis leur entrée dans la fiche lorsque le rôle et le dossier l’autorisent.

Le bouton **Exporter CSV** produit un fichier contenant des données personnelles : ne l’utilisez que pour un besoin autorisé, stockez-le dans un emplacement protégé puis supprimez-le dès qu’il n’est plus nécessaire. **Répertoire candidats** permet de retrouver les profils candidats associés.

### Demandes de partenariat et partenaires

Dans **Demandes** sous la section Partenariats, recherchez une organisation ou un contact et ouvrez la demande pour consulter sa fiche. Vous pouvez y modifier son statut, consulter les pièces jointes autorisées ou utiliser **Envoyer un e-mail direct**. La liste contient également **Exporter en CSV**.

Le changement de statut peut déclencher une notification. L’interface indique si l’envoi a réussi ou échoué ; ne confirmez pas à l’extérieur qu’un e-mail est parti sans ce retour. **Partenaires** permet de consulter ou gérer les partenaires déjà enregistrés selon les droits affichés.

### Propositions de projets

Dans **Propositions de projets**, utilisez la recherche et le filtre de statut, puis ouvrez une proposition. La fiche permet de consulter les informations et documents, de modifier le statut, d’ajouter une note interne et, lorsqu’elle est recevable, de choisir **Créer un projet à partir de cette proposition**. Cette création produit un contenu projet à vérifier avant publication. Les notifications e-mail peuvent échouer même si le statut a été enregistré.

### Adhésions et membres

- **Demandes d’adhésion** liste les demandes et propose un export CSV. Ouvrez une fiche pour consulter/modifier les informations. Selon son statut, vous pouvez **Valider** ou **Refuser la demande** ; un motif est demandé pour le refus. La validation crée le membre officiel. Les actions de réexamen ou révocation suivent le statut affiché et leurs confirmations.
- **Membres** permet de rechercher la liste, d’exporter en CSV et, via **Ajouter un membre**, de créer une fiche directement depuis l’administration. Vérifiez les informations et le statut avant d’enregistrer.

### Messages de contact

Dans **Messages de contact**, recherchez un message et ouvrez-le pour examiner la demande. Vous pouvez modifier son statut, ajouter une note de suivi interne, archiver ou supprimer le message. Une suppression demande confirmation et peut être définitive. Une note interne n’est pas une réponse envoyée au demandeur.

## 6. Newsletter et campagnes

### Abonnés

Dans **Newsletter & Abonnés**, la synthèse distingue notamment les abonnés actifs, désinscrits et ceux dont le consentement reste à vérifier. La recherche, les filtres de statut et de langue aident à retrouver une fiche.

- **Ajouter un abonné** ouvre un formulaire ; le serveur exige un consentement explicite. Ne cochez pas ou ne renseignez pas un consentement au nom d’une personne sans preuve.
- Une personne désinscrite ne peut pas être réactivée par simple bascule : l’interface indique qu’un **nouveau consentement est requis**.
- **Exporter les abonnés** propose des filtres et un CSV. Ce fichier contient des adresses et des informations relatives au consentement : traitez-le comme un fichier confidentiel.
- Un bouton **Exporter par langue (ZIP)** est présent, mais le code actuel renvoie un contenu JSON encodé tout en lui donnant une extension `.zip`. Ne vous fiez pas à ce téléchargement comme à une archive ZIP exploitable ; utilisez l’export CSV et faites confirmer/corriger le ZIP avant de le transmettre.

### Préparer une campagne

Ouvrez **Campagnes newsletter**, puis créez une campagne ou sélectionnez un brouillon. Saisissez le nom, puis le sujet et le contenu des langues FR, EN et DE. Les sujets et contenus requis sont signalés ; **Enregistrer le brouillon** n’est disponible que lorsque les champs requis sont valides. La prévisualisation montre le gabarit d’e-mail, la signature et le lien de désabonnement pour la langue sélectionnée.

### Envoyer un e-mail de test

Saisissez une adresse contrôlée dans le champ **Adresse email de test**, puis choisissez **Envoyer un test** et confirmez. C’est un véritable e-mail envoyé à cette adresse par le fournisseur configuré ; ce n’est pas un simple aperçu et ce bouton ne cible pas la liste des abonnés. Faites ce test uniquement avec une boîte autorisée. Le fournisseur, le domaine d’expédition et la délivrabilité doivent être configurés ; un succès d’interface ne remplace pas une vérification de réception.

### Lancer une campagne réelle

Le lancement réel est réservé au **SUPER_ADMIN**.

1. Vérifiez le contenu, les langues, l’aperçu et le résultat de l’e-mail de test.
2. Choisissez **Vérifier les destinataires**. L’écran présente le nombre exact d’abonnés actifs dont le consentement est vérifiable, ventilé par langue.
3. Si un sujet ou contenu manque pour une langue présente dans le public, complétez-le avant de continuer.
4. Lisez le décompte et l’avertissement : les e-mails envoyés ne peuvent pas être rappelés. Choisissez **Confirmer et lancer** uniquement si vous autorisez l’envoi réel.

L’écran de suivi affiche le statut, la progression, les messages envoyés, échoués, en attente et en cours. Si une campagne est interrompue avec des destinataires en attente, **Reprendre les en attente** ne doit traiter que ceux qui n’ont pas déjà été terminés. N’appuyez pas plusieurs fois sur les commandes pendant qu’une opération est en cours. Les erreurs du fournisseur restent visibles comme échecs ; elles ne signifient pas que l’e-mail a été livré.

## 7. Gérer les administrateurs

Cette rubrique est réservée au **SUPER_ADMIN**. Ouvrez **Gestion des administrateurs**.

### Inviter une personne

1. Dans **Inviter un administrateur**, renseignez le nom, l’adresse e-mail et le rôle adapté.
2. Choisissez **Envoyer l’invitation**. Le compte n’est créé qu’après que la personne a ouvert le lien et défini son mot de passe.
3. Consultez **Invitations en attente** pour leur état et leur expiration. **Renvoyer** demande un nouvel envoi ; **Invalider** rend l’invitation inutilisable.

Ces actions dépendent du fournisseur d’e-mails. Une invitation marquée en échec n’a pas été remise ; vérifiez la configuration avant de la renvoyer.

### Modifier un compte

La liste **Comptes** propose une recherche. Le sélecteur de rôle applique le rôle choisi. **Désactiver** bloque le compte ; **Réactiver** le rétablit. **Supprimer** affiche une confirmation et supprime définitivement le compte. Ne supprimez pas un compte pour résoudre un simple problème de mot de passe.

Le dernier super-administrateur actif ne peut pas être désactivé, rétrogradé ou supprimé. L’interface peut aussi fermer votre session si vous désactivez ou supprimez votre propre compte. Avant toute opération, assurez-vous qu’un autre super-administrateur est actif et joignable.

## 8. Sécurité et confidentialité

- Utilisez un mot de passe long, unique et non partagé. Changez-le depuis **Mon compte** si vous pensez qu’il a été divulgué.
- Chaque personne doit utiliser son propre compte. Ne partagez pas un compte super-administrateur pour simplifier le travail.
- Attribuez le rôle le moins élevé nécessaire et demandez au super-administrateur de retirer rapidement un accès devenu inutile.
- Les dossiers, pièces d’identité, CV, coordonnées et exports sont confidentiels. Ouvrez uniquement les dossiers nécessaires à votre mission ; ne téléchargez pas de copie locale sans besoin autorisé et ne transmettez pas de document dans un canal personnel.
- Les URLs de téléchargement peuvent être temporaires ; ne les copiez pas dans un message ou document partagé.
- Les notes internes sont réservées au suivi de l’équipe : restez factuel et professionnel.
- Vérifiez deux fois le destinataire, la langue, le nombre de destinataires et le contenu avant un envoi. Un envoi de test est réel ; un lancement de campagne contacte les abonnés éligibles.
- Avant suppression, export ou modification de statut importante, relisez la fiche et la confirmation affichée. Les suppressions de contenus ou dossiers peuvent être irréversibles.
- Rangez les exports CSV dans un espace restreint et supprimez-les quand leur usage autorisé est terminé.

## 9. Problèmes fréquents

| Problème | Action recommandée |
| --- | --- |
| « Session invalide » ou retour à la connexion | Reconnectez-vous. Si cela se répète, demandez au super-administrateur de vérifier que le compte est actif et qu’aucun changement de sécurité récent n’a invalidé les sessions. |
| Aucun lien de récupération, de confirmation ou d’invitation reçu | Vérifiez les courriers indésirables et l’adresse saisie. Contactez le super-administrateur ; le fournisseur ou son domaine peut ne pas être configuré. Utilisez la commande de renvoi uniquement après vérification. |
| Lien expiré, invalide ou déjà utilisé | Revenez à la page concernée et demandez un nouveau lien. Ne réutilisez pas un ancien message. |
| Rubrique absente ou accès refusé | Vérifiez votre rôle avec le super-administrateur. N’essayez pas de contourner les droits en ouvrant une URL directe. |
| Impossible d’enregistrer ou de publier | Vérifiez les champs obligatoires et les traductions nécessaires. Si le message persiste, notez le nom de la rubrique et l’action, puis transmettez-les au responsable technique. |
| Téléversement ou téléchargement impossible | Réessayez une fois. Si le problème persiste, le stockage ou les droits du bucket peuvent être indisponibles ; contactez le responsable technique et ne placez pas les documents dans un canal non sécurisé. |
| Notification e-mail en échec | Le statut peut avoir été enregistré sans que le courriel soit envoyé. Vérifiez le message de résultat et contactez l’administrateur technique ; ne promettez pas la réception au demandeur. |
| Un événement refuse une validation de participation | Vérifiez la capacité et le statut de l’événement. L’interface bloque la validation lorsque l’événement est complet. |
| Une campagne ne peut pas être lancée | Vérifiez qu’il existe des abonnés éligibles et que le sujet et le contenu existent dans chacune des langues nécessaires. Le fournisseur doit également être configuré. |
| Export newsletter `.zip` illisible | Utilisez le CSV. Le téléchargement ZIP n’est pas fiable dans la version actuelle du code ; signalez le besoin au responsable technique. |

## 10. Ce qui reste à confirmer dans l’interface déployée

Ce guide décrit le code du dépôt ; il ne constitue pas un test de chaque écran sur le site hébergé. Les points dépendant de l’environnement restent à vérifier : réception des e-mails de récupération et d’invitation, envoi test et campagne avec le fournisseur configuré, téléversements et téléchargements sur les buckets de la branche active, droits réels attribués à chaque compte et rendu des contenus après publication.

Le parcours d’export newsletter ZIP est explicitement signalé comme non fiable. Aucun envoi à un abonné, aucune modification de dossier, aucune suppression ni aucune action réelle d’administration n’a été effectué pour rédiger ce guide.
