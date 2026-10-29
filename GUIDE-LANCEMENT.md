# SunuCare Shop : guide de lancement

Site e-commerce React + Vite + Tailwind, avec un petit serveur Node (Express) pour le catalogue, les demandes de commande et l'administration.

## 1. Prérequis

- Node.js 20 ou plus récent (https://nodejs.org)
- Un terminal ouvert dans ce dossier

## 2. Lancer le site sur votre ordinateur

```bash
npm install
npm run build
ADMIN_PASSWORD="un-mot-de-passe-long-et-secret" npm start
```

Ouvrez http://localhost:3000. L'administration est sur http://localhost:3000/admin.

Sous Windows (PowerShell) :

```powershell
npm install
npm run build
$env:ADMIN_PASSWORD="un-mot-de-passe-long-et-secret"; $env:NODE_ENV="production"; node server/index.js
```

Pour travailler sur le design avec rechargement instantané : `npm run dev:api` dans un terminal (avec ADMIN_PASSWORD), `npm run dev` dans un autre, puis http://localhost:5173.

## 3. Mettre le site en ligne

### Option A, recommandée : hébergeur Node (Render, Railway, VPS…)
Tout fonctionne : boutique, panier, commande WhatsApp, enregistrement des demandes, administration.

- Commande de build : `npm install && npm run build`
- Commande de démarrage : `npm start`
- Variables d'environnement :
  - `ADMIN_PASSWORD` : obligatoire pour l'administration (10 caractères minimum, gardez-le secret)
  - `DATA_DIR` et `UPLOAD_DIR` : dossiers **persistants** pour le catalogue, les commandes et les photos envoyées (sur Render : ajoutez un « Disk » et pointez ces variables dessus, sinon les modifications sont perdues à chaque redémarrage)
  - `TRUST_PROXY=1` si l'hébergeur place le site derrière un proxy (Render, Railway, Nginx)
- Le site doit être servi en **HTTPS** (le cookie de connexion admin est « Secure »).

### Option B : hébergement statique (Netlify, Vercel, cPanel…)
`npm run build`, puis envoyez le contenu du dossier `dist/`. Les fichiers `_redirects` (Netlify), `vercel.json` et `.htaccess` (Apache) sont fournis pour que les URL comme `/boutique/parfums` fonctionnent.
Dans ce mode, il n'y a **pas d'administration** ni d'enregistrement des commandes : le catalogue se modifie dans `src/data/catalogue.json`, puis on refait le build. Les commandes passent uniquement par WhatsApp.

### Et la boutique Adafrik ?
Ce site est indépendant d'Adafrik : Adafrik ne permet pas d'y installer un site React. Vous pouvez garder Adafrik en parallèle, ou faire pointer votre nom de domaine vers ce nouveau site.

### Après la mise en ligne
- Remplacez `VOTRE-DOMAINE` dans `public/robots.txt`, ajoutez un `sitemap.xml` avec vos vraies URL, puis déclarez le site dans Google Search Console.
- Ajoutez vos réseaux sociaux (liens exacts) dans `src/data/store.js`, champ `socials`.

## 4. Utiliser l'administration

- **Produits** : ajouter, modifier, masquer, supprimer. Prix vide = « Prix sur demande » côté client et « Prix à confirmer » dans l'admin. L'ancien prix ne sert qu'aux vraies promotions (il doit être supérieur au prix actuel). Stock facultatif, jamais affiché : à 0 le produit passe en rupture.
- **Photos** : JPEG, PNG ou WebP, 5 Mo maximum, format carré conseillé (environ 1000 × 1000 px).
- **Catégories** : renommer, réordonner, masquer, ajouter, changer la photo.
- **Commandes** : chaque demande envoyée depuis la page de commande est enregistrée (référence SC-…), avec les coordonnées du client. Statuts : nouvelle, confirmée, livrée, annulée. Supprimez les demandes dont vous n'avez plus besoin (données personnelles).

Le catalogue modifié est stocké dans `server/data/catalogue.json` (créé au premier démarrage à partir de `src/data/catalogue.json`).

## 5. Où modifier quoi

| Élément | Fichier |
|---|---|
| Numéros, adresse, réseaux sociaux | `src/data/store.js` |
| Catalogue de départ (mode statique) | `src/data/catalogue.json` |
| Couleurs et polices | `tailwind.config.js` |
| Textes des pages légales et FAQ | `src/pages/Info.jsx` |
| Page d'accueil | `src/pages/Home.jsx` |
| Message WhatsApp | `src/lib/whatsapp.js` |
