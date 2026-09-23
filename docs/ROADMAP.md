# Feuille de route

## P0 — Cadrage

- [x] Définir les utilisateurs : visiteur, client et administrateur.
- [x] Choisir React, JavaScript, Bootstrap, Python et Django.
- [x] Retirer le paiement du MVP.
- [x] Séparer clairement frontend, API et base de données.

## P1 — Fondation technique

- [x] Créer le projet Django et l'application `store`.
- [x] Créer les modèles du catalogue, du panier et des commandes.
- [x] Créer l'administration Django.
- [x] Créer les premiers endpoints REST.
- [x] Créer la fondation React et l'identité visuelle.

## P2 — Catalogue fonctionnel

- [x] Connecter la page boutique à l'API.
- [x] Ajouter la recherche et les filtres visuels par catégorie, occasion et produits vedettes.
- [x] Conserver les filtres dans l'URL pour rendre les vues partageables.
- [x] Créer les pages de détails.
- [x] Ajouter les données de démonstration.
- [x] Ajouter les états de chargement, erreur, résultat vide et page introuvable.

## P3 — Authentification et profils

- [x] Inscription, connexion et déconnexion par jeton.
- [x] Consultation et modification du profil.
- [x] Ajout, consultation et suppression des adresses enregistrées.
- [x] Protection des routes privées côté React et Django.
- [x] Isolation des adresses par utilisateur.

## P4 — Panier

- [x] Ajouter, modifier et retirer un article.
- [x] Conserver le panier du compte entre les visites.
- [x] Recalculer les montants depuis les prix Django.
- [x] Vérifier les quantités demandées par rapport au stock.
- [x] Afficher le nombre total d'articles dans la navigation.
- [x] Intégrer le catalogue et les photos autorisées du site officiel.

## P5 — Demandes de commande

- [x] Coordonnées et adresse de livraison.
- [x] Message cadeau et date souhaitée.
- [x] Création d'une demande sans paiement.
- [x] Suivi du statut dans le compte client.
- [x] Gestion du statut depuis l'administration Django.

## P6 — Qualité portfolio

- [x] Ajouter les premiers tests backend automatisés.
- [x] Ajouter les tests frontend et compléter la couverture backend.
- [x] Améliorer l'accessibilité et le responsive design.
- [x] Ajouter la documentation OpenAPI et Swagger UI.
- [x] Préparer le déploiement Render et Vercel.
- [ ] Publier la démonstration sur les comptes du propriétaire.

## Phase future — Paiement

Le paiement restera séparé du MVP. Il ne sera étudié qu'après validation du
catalogue, du panier et du parcours de commande.
