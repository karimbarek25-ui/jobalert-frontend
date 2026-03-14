# Vérification des appels API — JobAlert frontend

## ✅ Ce qui est correct

| Route API | Utilisation frontend | Auth | Body / Méthode |
|-----------|----------------------|------|----------------|
| `POST /cv/extraire` | Upload CV (onboarding + mise à jour profil) | ✅ Bearer JWT | FormData (file) |
| `POST /ia/analyser-cv` | Après extraction, analyse du profil | ✅ Bearer JWT | `{ texte_cv }` |
| `POST /offres/toutes` | Chargement liste offres (dashboard) | ✅ Bearer JWT | `{ motsCles, typeContrat, nbResultats: 20 }` |
| `POST /ia/package-complet` | Modal offre : score + lettre + CV adapté | ✅ Bearer JWT | `{ profil, offre, cv_original }` |

- **API_URL** : `https://jobalert-ia-production.up.railway.app` (Railway).
- **getAuthHeaders()** : récupère `session.access_token` Supabase et envoie `Authorization: Bearer <token>`.
- Gestion d’erreur : `res.ok` vérifié sur `/cv/extraire` ; `data.success` sur les autres ; message "Impossible de charger" si échec offres.

## ✅ Appels ajoutés (corrigé)

| Route API | Utilisation frontend | Quand |
|-----------|----------------------|--------|
| `GET /candidatures/me` | `chargerCandidatures()` | À l’ouverture de l’onglet "Mes candidatures". |
| `GET /stats/me` | `chargerStats()` | Au chargement du dashboard et à l’ouverture de l’onglet "Statistiques". |
| `POST /candidatures` | Après succès de `package-complet` dans la modal | Enregistre la candidature (offre, score, lettre, CV adapté) ; si 402 (limite gratuit), affiche un toast. |

## ⚠️ Comportement à noter

- **Score des offres en liste** : le front affiche un score aléatoire (60–95 %) pour chaque offre. Le score réel est celui renvoyé par `/ia/package-complet` à l’ouverture de la modal. Donc liste = estimation visuelle, modal = score IA réel.
- **CORS** : l’API doit avoir `https://jobalertkb.fr` et `https://www.jobalertkb.fr` dans `CORS_ORIGINS` pour que le front en production appelle l’API sans erreur.

## Suite

Les appels manquants sont ajoutés dans `index.html` : chargement candidatures et stats au dashboard, et enregistrement d’une candidature après succès de `package-complet`.
