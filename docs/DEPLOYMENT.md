# Déploiement de Bloom

Bloom est préparé pour un frontend Vite sur Vercel et une API Django avec
PostgreSQL sur Render. La publication nécessite les comptes du propriétaire et
n'est pas réalisée automatiquement par le projet.

## 1. Mettre le projet sur GitHub

Créer un dépôt avec le contenu du dossier `Bloom`, puis pousser la branche
principale. Ne jamais ajouter le fichier `.env`, la base SQLite ou les dossiers
`.venv` et `node_modules`.

## 2. Déployer l'API sur Render

1. Dans Render, créer un Blueprint depuis le dépôt GitHub.
2. Render détecte le fichier `render.yaml` et prépare `bloom-api` ainsi que
   PostgreSQL.
3. Renseigner `DJANGO_CORS_ALLOWED_ORIGINS` avec l'URL exacte du frontend,
   par exemple `https://bloom-example.vercel.app`.
4. Renseigner `DJANGO_CSRF_TRUSTED_ORIGINS` avec la même URL.
5. Après le premier déploiement, ouvrir un Shell Render et exécuter :

```bash
python manage.py seed_bloom
python manage.py createsuperuser
```

Vérifier ensuite :

- `https://VOTRE-API.onrender.com/api/health/`
- `https://VOTRE-API.onrender.com/api/docs/`

## 3. Déployer le frontend sur Vercel

1. Importer le même dépôt dans Vercel.
2. Définir `frontend` comme Root Directory.
3. Conserver `npm run build` et `dist` comme commande et dossier de sortie.
4. Ajouter la variable suivante :

```text
VITE_API_BASE_URL=https://VOTRE-API.onrender.com/api
```

5. Relancer le déploiement après l'ajout de la variable.

Le fichier `frontend/vercel.json` redirige les routes comme `/boutique/fresca`
vers React afin qu'elles restent disponibles lors d'un rafraîchissement.

## 4. Vérifications finales

- Créer un compte depuis le frontend public.
- Ajouter une adresse et un produit au panier.
- Envoyer une demande de commande.
- Vérifier la demande dans l'administration Django.
- Modifier son statut et confirmer qu'il apparaît dans l'espace client.
- Vérifier que le paiement reste absent du parcours.
