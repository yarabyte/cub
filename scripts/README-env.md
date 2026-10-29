# Après avoir créé le fichier .env et la base MySQL

## 1. Créer les tables dans la base `cubafoussam`

Exécuter le script SQL d’initialisation (mot de passe MySQL demandé) :

```bash
npm run db:init
```

Ou manuellement avec le client MySQL (en utilisant le même utilisateur/mot de passe que dans `.env`) :

```bash
mysql -u root -p < scripts/init-db.sql
```

Cela crée la base `cubafoussam` si besoin, puis les tables `articles`, `categories`, `article_categories`, `contact_messages` et `admin_users`.

### Base existante : mise à jour du schéma

Si la base a été créée avant la page de synchronisation, le module Actualités ou le formulaire de contact, appliquer les changements (colonnes de synchronisation, statut brouillon/publié, mise à la une, corbeille, tables des catégories, reprise des catégories des articles déjà importés, table des messages de contact) :

```bash
npm run db:migrate
```

Le script peut être relancé sans risque : seules les modifications manquantes sont appliquées.

---

## 2. Créer le premier compte admin

Le script lit `ADMIN_EMAIL` et `ADMIN_PASSWORD` depuis `.env` (ou `.env.local`) :

```bash
npm run create-admin
```

À faire une seule fois (ou pour réinitialiser le mot de passe de l’admin).

---

## 3. Lancer l’application

```bash
npm run dev
```

Puis :

- **Site public :** http://localhost:3000  
- **Admin :** http://localhost:3000/admin — connexion avec l’email et le mot de passe définis dans `.env`.  
  La page **Actualités** (http://localhost:3000/admin/actualites) permet de créer, modifier, mettre à la corbeille et restaurer les articles ; la page **Catégories** gère les catégories. Les images à la une envoyées depuis l’admin sont redimensionnées (1200 px de large, WebP) et enregistrées dans `STORAGE_DIR`.  
  La page **Synchronisation** (http://localhost:3000/admin/synchronisation) importe les articles de WordPress un par un, pour l’année et les catégories choisies. Le contenu est enregistré en base, l’image à la une (taille « large ») sur le disque, dans `STORAGE_DIR`. Le bouton de suppression de cette page ne supprime que les articles importés de WordPress.

---

## Rappel des variables dans .env

- **MYSQL_*** : connexion à MySQL (obligatoire pour l’app et pour `create-admin`).  
- **ADMIN_EMAIL** / **ADMIN_PASSWORD** : utilisés uniquement par `npm run create-admin`.  
- **ADMIN_SESSION_SECRET** (ou **SESSION_SECRET**) : obligatoire pour que la connexion à `/admin` fonctionne (cookie de session).
- **SMTP_HOST** / **SMTP_PORT** / **SMTP_USER** / **SMTP_PASSWORD** : serveur d'envoi du formulaire de contact (boîte mail du domaine). Port 465 pour SSL, 587 pour STARTTLS. Sans `SMTP_HOST`, les messages sont seulement enregistrés et consultables dans `/admin/messages`.
- **SMTP_FROM** (optionnel) : expéditeur affiché, par défaut `SMTP_USER`. **CONTACT_EMAIL_TO** (optionnel) : destinataire, par défaut `contact@cubafoussam.cm`. L'adresse du visiteur est mise en « Répondre à ».
- **STORAGE_DIR** (optionnel) : dossier où sont enregistrées les images importées. Par défaut `storage/uploads` à la racine du projet. Les images sont servies par l’URL `/media/...`. En production, choisir un dossier persistant et sauvegardé (il n’est pas versionné dans git).
