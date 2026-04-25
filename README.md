# 🗺️ LocalDeal API

> Marketplace de services locaux — API REST fullstack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)

## ✨ Fonctionnalités

- 🔐 Authentification JWT (register/login)
- 📍 Recherche géospatiale MongoDB ($near, index 2dsphere)
- 🖼️ Upload d'images via Cloudinary
- ⭐ Système de réservations et avis
- 🔍 Filtres avancés, tri et pagination

## 🛠️ Stack technique

| Technologie | Usage |
|---|---|
| Node.js + Express | Serveur HTTP |
| MongoDB + Mongoose | Base de données |
| JWT | Authentification |
| Cloudinary | Upload d'images |
| Multer | Gestion des fichiers |

## 🚀 Installation

```bash
git clone https://github.com/anguiivanguyanderson-lgtm/localdeal-api.git
cd localdeal-api
npm install
```

Crée un fichier `.env` :

```
MONGO_URI=mongodb+srv://...
JWT_SECRET=ton_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=5000
```

```bash
node server.js
```

## 📡 Routes API

| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Inscription |
| POST | `/api/auth/login` | ❌ | Connexion |
| GET | `/api/services` | ❌ | Liste des services |
| GET | `/api/services/nearby` | ❌ | Services proches (géospatial) |
| POST | `/api/services` | ✅ | Créer un service |
| POST | `/api/bookings` | ✅ | Réserver |
| PATCH | `/api/bookings/:id/status` | ✅ | Changer statut |
| POST | `/api/reviews` | ✅ | Laisser un avis |

## 👤 Auteur

**Anguii Van Guy Anderson** — [GitHub](https://github.com/anguiivanguyanderson-lgtm)
