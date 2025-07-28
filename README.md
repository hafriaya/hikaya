# 🌈 Hikaya - Suivi de Lecture pour les Élèves de Préscolaire

![Hikaya Landing Page](./landing-page.png)

> Une plateforme web moderne et ludique pour le suivi de lecture des enfants de 3 à 6 ans, connectant enseignants, parents et élèves dans une aventure magique de découverte littéraire.

## 📚 À Propos du Projet

**Hikaya** est une application web progressive (PWA) développée avec Next.js et Firebase, conçue pour rendre la lecture magique et engageante pour les jeunes enfants. La plateforme offre une interface intuitive et colorée qui encourage les enfants à découvrir des histoires tout en permettant aux enseignants et parents de suivre leurs progrès.

### 🎯 Objectifs
- **Encourager la lecture** chez les enfants de 3-6 ans
- **Faciliter le suivi** des progrès par les enseignants
- **Impliquer les parents** dans l'éducation de leurs enfants
- **Créer une expérience ludique** et engageante

## ✨ Fonctionnalités Principales

### 👨‍🏫 **Espace Enseignant**
- **Tableau de bord** avec statistiques en temps réel
- **Gestion des élèves** (ajout, modification, suppression)
- **Gestion des histoires** avec upload d'illustrations
- **Gestion des classes** et niveaux
- **Suivi des progrès** avec graphiques interactifs
- **Interface responsive** optimisée pour mobile

### 👨‍👩‍👧‍👦 **Espace Parent**
- **Tableau de bord** avec vue d'ensemble des progrès
- **Suivi des enfants** et de leurs lectures
- **Historique des histoires** lues
- **Statistiques personnalisées**

### 👶 **Espace Élève**
- **Interface kid-friendly** avec design coloré et ludique
- **Bibliothèque d'histoires** avec illustrations
- **Système de favoris** pour marquer les histoires préférées
- **Marquage "J'ai lu"** pour suivre les progrès
- **Design responsive** optimisé pour tablettes et mobiles

### 👑 **Espace Administrateur**
- **Gestion des utilisateurs** (enseignants, parents, élèves)
- **Création de comptes** avec authentification flexible
- **Tableau de bord** avec statistiques globales
- **Interface sécurisée** avec contrôle d'accès

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 14** - Framework React avec App Router
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes
- **Recharts** - Graphiques et visualisations
- **React Hook Form** - Gestion des formulaires

### Backend & Services
- **Firebase Authentication** - Authentification sécurisée
- **Firestore** - Base de données NoSQL
- **Firebase Storage** - Stockage des images
- **Firebase Hosting** - Déploiement

### Outils de Développement
- **ESLint** - Linting du code
- **PostCSS** - Traitement CSS
- **Git** - Contrôle de version

## 🚀 Installation et Configuration

### Prérequis
- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Compte Firebase** avec projet configuré

### 1. Cloner le Repository
```bash
git clone https://github.com/votre-username/hikaya.git
cd hikaya
```

### 2. Installer les Dépendances
```bash
npm install
# ou
yarn install
```

### 3. Configuration Firebase

#### Créer un Projet Firebase
1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez **Authentication** avec Email/Password et Google
4. Créez une base de données **Firestore**
5. Activez **Storage** pour les images

#### Configurer les Variables d'Environnement
Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_projet_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id
```

#### Configurer Firebase Storage CORS
Créez un fichier `cors.json` :
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-meta-*"]
  }
]
```

Puis exécutez :
```bash
gsutil cors set cors.json gs://votre_bucket_name
```

### 4. Initialiser Firebase
```bash
npm install -g firebase-tools
firebase login
firebase init
```

Sélectionnez :
- **Firestore** : Configuration des règles de sécurité
- **Storage** : Configuration du stockage
- **Hosting** : Configuration du déploiement

### 5. Déployer les Règles Firebase
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 6. Lancer le Serveur de Développement
```bash
npm run dev
# ou
yarn dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📱 Utilisation

### Première Connexion
1. **Accédez** à l'application via [http://localhost:3000](http://localhost:3000)
2. **Créez un compte admin** directement dans Firebase Console
3. **Connectez-vous** avec les identifiants admin
4. **Créez** les premiers utilisateurs (enseignants, parents, élèves)

### Workflow Typique
1. **Admin** crée les comptes enseignants
2. **Enseignants** ajoutent leurs classes et élèves
3. **Enseignants** créent et partagent des histoires
4. **Parents** suivent les progrès de leurs enfants
5. **Élèves** lisent et marquent les histoires comme lues

## 🏗️ Structure du Projet

```
hikaya/
├── app/                          # Pages Next.js (App Router)
│   ├── login/                    # Page de connexion
│   ├── users/                    # Pages utilisateurs
│   │   ├── admin/               # Interface administrateur
│   │   ├── teacher/             # Interface enseignant
│   │   ├── parent/              # Interface parent
│   │   └── student/             # Interface élève
│   └── page.js                  # Page d'accueil
├── src/
│   └── lib/
│       └── firebase.js          # Configuration Firebase
├── public/                      # Assets statiques
├── firebase.json               # Configuration Firebase
├── firestore.rules             # Règles de sécurité Firestore
└── storage.rules               # Règles de sécurité Storage
```

## 🔐 Sécurité

### Authentification
- **Email/Password** : Authentification traditionnelle
- **Google OAuth** : Connexion avec compte Google
- **Rôles** : Admin, Enseignant, Parent, Élève

### Règles de Sécurité
- **Firestore** : Accès basé sur l'authentification et les rôles
- **Storage** : Upload sécurisé des images
- **Validation** : Vérification des données côté client et serveur

## 📊 Base de Données

### Collections Firestore
- **users** : Informations des utilisateurs
- **students** : Données des élèves
- **stories** : Histoires et métadonnées
- **classes** : Classes et niveaux
- **readingHistory** : Historique de lecture

## 🎨 Design et UX

### Principes de Design
- **Kid-friendly** : Interface colorée et ludique
- **Responsive** : Optimisé pour tous les écrans
- **Accessible** : Navigation intuitive
- **Mobile-first** : Expérience optimisée mobile

### Palette de Couleurs
- **Primaire** : Violet/Purple (#6366F1, #8B5CF6)
- **Secondaire** : Rose/Pink (#EC4899, #F472B6)
- **Accent** : Orange (#F59E0B), Vert (#10B981)
- **Neutre** : Gris/Slate (#64748B, #94A3B8)

## 🚀 Déploiement

### Déploiement sur Firebase Hosting
```bash
npm run build
firebase deploy
```

### Variables d'Environnement de Production
Configurez les variables d'environnement sur votre plateforme de déploiement.

## 🤝 Contribution

1. **Fork** le projet
2. **Créez** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commitez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Poussez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **Développeur** : [Votre Nom]
- **Design** : Interface kid-friendly et responsive
- **Architecture** : Next.js + Firebase

## 📞 Support

Pour toute question ou problème :
- **Issues** : [GitHub Issues](https://github.com/votre-username/hikaya/issues)
- **Email** : [votre-email@example.com]

---

**Hikaya** - Rendez la lecture magique pour les enfants ! 📚✨
