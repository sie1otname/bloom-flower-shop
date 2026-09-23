# Architecture de Bloom

## Flux principal

```text
Navigateur
   ↓
React + Bootstrap
   ↓ requêtes JSON
Django REST Framework
   ↓
Django ORM
   ↓
PostgreSQL ou SQLite
```

## Responsabilités

### Frontend

- Afficher l'identité de L'Artisane Fleuriste.
- Présenter les collections et produits.
- Gérer l'état visuel du panier.
- Envoyer les demandes à l'API.

Routes disponibles en P5 :

- `/` : présentation de la marque et accès aux collections.
- `/boutique` : catalogue, recherche et filtres synchronisés avec l'URL.
- `/boutique/:slug` : fiche détaillée d'une création.
- `/panier` : consultation et modification du panier persistant.
- `/commande` : formulaire protégé de demande de commande.
- `/commandes` : historique privé et statut des demandes.
- `/connexion` et `/inscription` : accès au compte client.
- `/compte` : profil et adresses, protégé par authentification.

### API publique

- `GET /api/health/` : état du service.
- `GET /api/schema/` : contrat OpenAPI généré et validé.
- `GET /api/docs/` : interface Swagger UI interactive.
- `GET /api/categories/` : collections actives et nombre de produits.
- `GET /api/products/` : catalogue filtrable avec `q`, `category`, `occasion` et `featured`.
- `GET /api/products/:slug/` : détail d'une création active.
- `POST /api/orders/` : transforme le panier authentifié en demande sans paiement.
- `GET /api/orders/` et `/api/orders/:id/` : historique privé du client.
- `POST /api/auth/register/` : inscription et création du jeton.
- `POST /api/auth/login/` et `/logout/` : ouverture et fermeture de session.
- `GET/PATCH /api/auth/me/` : profil de l'utilisateur connecté.
- `/api/addresses/` : opérations sur les adresses du compte connecté.
- `GET /api/cart/` : panier actif du compte connecté.
- `POST /api/cart/items/` : ajout d'une création avec contrôle du stock.
- `PATCH/DELETE /api/cart/items/:id/` : quantité ou retrait d'un article appartenant au compte.

### Backend

- Valider les données reçues.
- Gérer le catalogue, le stock et les commandes.
- Calculer les montants à partir des prix enregistrés en base.
- Fournir l'administration à l'équipe de la boutique.

### Base de données

- Conserver les catégories et produits.
- Conserver les comptes et adresses.
- Enregistrer une copie du nom et du prix de chaque produit commandé.
- Conserver l'historique des statuts des demandes.

## Choix de sécurité

- Aucun prix envoyé par le navigateur n'est accepté comme source de vérité.
- Le backend recalcule chaque total depuis les produits enregistrés.
- Les secrets sont lus depuis les variables d'environnement.
- Le paiement et les données bancaires sont exclus du MVP.
- Les mots de passe sont hachés par Django et ne sont jamais renvoyés par l'API.
- Les endpoints privés exigent un jeton d'authentification.
- Les requêtes d'adresses sont toujours limitées au propriétaire connecté.
- Le navigateur n'envoie jamais de prix : les sous-totaux sont calculés depuis Django.
- Un utilisateur ne peut avoir qu'un seul panier actif ni modifier le panier d'un autre compte.
- Une demande ne peut utiliser qu'une adresse appartenant au compte connecté.
- Le stock et les prix sont revérifiés dans une transaction avant la création de la demande.
- Les coordonnées, noms et prix sont copiés dans la commande afin de préserver son historique.

## Qualité et livraison

- Vitest, Testing Library et axe-core couvrent les composants React critiques.
- Les routes principales comportent un lien d'évitement, des états annoncés et des focus visibles.
- `drf-spectacular` génère et valide le contrat OpenAPI de Django REST Framework.
- `render.yaml` prépare Django, PostgreSQL et les variables de production.
- `frontend/vercel.json` conserve les routes React lors d'un accès direct.
