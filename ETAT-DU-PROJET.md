# SunuCare Shop : état du projet (29 octobre 2026)

## Terminé et vérifié
- 16 pages : accueil, boutique, 5 catégories, promotions, à propos, contact, panier, validation de commande, FAQ, livraison et retours, confidentialité, CGV (+ page 404 et fiches produits).
- Accueil avec la bannière fournie (affichée entière, sans déformation ; texte posé dans la zone ivoire vide sur ordinateur, sous la bannière sur téléphone), logo officiel non modifié (seules les marges blanches ont été réduites).
- Catalogue de 34 fiches (32 visibles), recherche par nom, filtre par catégorie, tri par prix croissant/décroissant, filtre « disponibles ». Le filtre promotion n'apparaît que si une vraie promotion existe.
- Fiches produits : galerie, prix, disponibilité, description, caractéristiques, mode d'utilisation, précautions, quantité, ajout au panier, commande WhatsApp, produits similaires.
- Panier conservé dans le navigateur (ajout, quantité, retrait, sous-total, total).
- Commande WhatsApp vers le 78 242 65 72 : message prérempli (produits, quantités, prix unitaires, total, nom, téléphone, adresse, zone, notes). Le site ne dit jamais « commande validée » : il indique que la boutique confirmera disponibilité, livraison et total.
- Administration protégée par mot de passe (session HttpOnly 8 h, limitation des essais, protection CSRF) : produits, prix, stocks, photos, catégories, demandes de commande.
- Référencement : titre et méta-description par page, URL lisibles, données structurées (boutique, produits, FAQ), textes alternatifs, images WebP optimisées.
- Build de production sans erreur, rendu testé sur ordinateur (1440 px) et téléphone (390 px), parcours panier → commande → WhatsApp testé.

## À compléter de votre côté
- **Prix manquants** : Sumifun, ENVISHA, Sérum anti-mycose, South Moon et les 22 parfums (affichés « Prix sur demande »).
- **Photos manquantes** (emplacement « Photo à venir ») : Foot Massager, Fascial Gun SK-368, Hoygi Collagen Night Mask, Whitening Strips, MOOYAM, OUHOE Lipoma, Private Antibacterial Cream.
- **Disponibilités** : les produits avec un prix communiqué sont marqués « Disponible », les autres « Disponibilité à confirmer ». À ajuster dans l'admin.
- **Masqués en attente** : Sérum anti-mycose (marque, prix, usage) et South Moon (retiré en septembre, réapparu dans la liste).
- **Parfums** : volumes et notes olfactives non renseignés (non vérifiés).
- **Politique de retour** : la règle « produits de soin et parfums ouverts non repris, sauf défaut à la livraison » est une proposition à valider.
- **Paiement** : aucun paiement en ligne (aucun compte Wave / Orange Money / carte configuré). Les moyens de paiement sont annoncés à la confirmation.
- **Réseaux sociaux** : aucun lien fourni, donc aucun affiché.
- **Hébergement** : choisir l'hébergeur et le nom de domaine (voir GUIDE-LANCEMENT.md).
- **Compte client** : non prévu (la commande passe par WhatsApp, sans inscription).
