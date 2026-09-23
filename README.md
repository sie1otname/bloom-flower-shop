# Bloom — L'Artisane Fleuriste

Bloom est une application full-stack de boutique florale construite pour mettre
en pratique les compétences de la formation Meta : React et JavaScript pour le
frontend, puis Python, Django, Django REST Framework et SQL pour le backend.

Cette branche est une reconstruction indépendante de l'ancien starter Medusa.
La version Medusa reste conservée comme référence visuelle.

## Objectif du MVP

Permettre à un client de découvrir les collections, consulter les produits,
préparer un panier et envoyer une demande de commande. Le paiement en ligne ne
fait volontairement pas partie du MVP.

## Stack

- React + Vite + JavaScript
- Bootstrap + CSS personnalisé
- Python + Django
- Django REST Framework
- PostgreSQL en production, SQLite pour un démarrage local rapide
- Docker Compose pour PostgreSQL

## Structure

```text
Bloom/
├── frontend/     Interface React
├── backend/      API Django et administration
├── docs/         Architecture et phases
└── docker-compose.yml
```

## Démarrage du backend

Prérequis : Python 3.10 ou plus récent. Python 3.12 est recommandé.

Placez-vous d'abord dans le backend :

```bash
cd backend
```

Sur macOS, si `python3 --version` affiche une version inférieure à 3.10 :

```bash
brew install python@3.12
"$(brew --prefix python@3.12)/bin/python3.12" -m venv .venv
```

Sinon, créez normalement l'environnement :

```bash
python3 -m venv .venv
```

Puis poursuivez :

```bash
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
python manage.py migrate
python manage.py seed_bloom
python manage.py createsuperuser
python manage.py runserver
```

L'API sera disponible sur `http://localhost:8000/api/` et l'administration sur
`http://localhost:8000/admin/`.

La documentation interactive est disponible sur
`http://localhost:8000/api/docs/` et le schéma OpenAPI sur
`http://localhost:8000/api/schema/`.

## Démarrage du frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173/`.

## Tests et qualité

```bash
# Backend
cd backend
source .venv/bin/activate
python manage.py test
python manage.py spectacular --file schema.yml --validate

# Frontend
cd ../frontend
npm test
npm run build
```

Les tests frontend utilisent Vitest, Testing Library et axe-core. Les tests
backend vérifient le catalogue, l'authentification, le panier, les commandes et
la documentation OpenAPI.

## PostgreSQL optionnel

SQLite est utilisé par défaut pour faciliter l'apprentissage. Pour PostgreSQL :

1. Définir `DB_ENGINE=postgres` dans `.env`.
2. Lancer `docker compose up -d database`.
3. Exécuter les migrations Django.

## État actuel

- P0 : cadrage et architecture terminés.
- P1 : modèles métier, API initiale, administration et fondation React.
- P2 : catalogue filtrable, recherche et fiches produits (ancien jeu de démonstration remplacé en P4).
- P3 : authentification par jeton, profil client, adresses et route privée.
- P4 : panier persistant, contrôles de stock et catalogue officiel de 9 créations en FCFA.
- P5 : demande de commande depuis le panier, livraison, message et historique client.
- P6 : tests frontend, accessibilité, OpenAPI et configuration Render/Vercel.
- Paiement : hors périmètre.

La suite détaillée se trouve dans [`docs/ROADMAP.md`](docs/ROADMAP.md).
Les étapes de publication se trouvent dans [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
