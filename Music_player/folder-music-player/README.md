# 🎵 Folder Music Player

Un lecteur de musique moderne et élégant qui peut scanner et lire directement vos dossiers de musique locaux.

## ✨ Fonctionnalités Principales

### 📁 **Scan de Dossiers Intelligent**
- **Sélection de dossier** : Choisissez n'importe quel dossier contenant de la musique
- **Scan automatique** : Détection automatique de tous les fichiers audio
- **Formats supportés** : MP3, WAV, OGG, M4A, AAC, FLAC, WMA
- **Organisation intelligente** : Extraction automatique des métadonnées

### 🎵 **Lecteur Audio Complet**
- **Interface moderne** : Design élégant avec animations fluides
- **Contrôles complets** : Play/Pause, Suivant/Précédent, Volume, Muet
- **Modes de lecture** : Répétition (aucune/une/toutes), Lecture aléatoire
- **Disque vinyle animé** : Animation de rotation pendant la lecture
- **Barre de progression** : Navigation précise dans les pistes

### 🎼 **Gestion de Playlist**
- **Génération automatique** : Playlist créée à partir du dossier scanné
- **Tri intelligent** : Classement par titre, artiste
- **Informations détaillées** : Titre, artiste, format, durée
- **Navigation rapide** : Clic pour changer de piste

### 🖥️ **Interface Utilisateur**
- **Design responsive** : Adapté à tous les écrans (desktop, tablette, mobile)
- **Thème moderne** : Dégradés colorés et effets visuels
- **Panneau explorateur** : Vue arborescente des dossiers
- **Panneau playlist** : Liste complète des pistes
- **Barre de statut** : Informations en temps réel

### ⌨️ **Raccourcis Clavier**
- **Espace** : Play/Pause
- **Flèches gauche/droite** : Piste précédente/suivante
- **M** : Muet/Son
- **S** : Lecture aléatoire
- **R** : Mode de répétition

## 🚀 Installation et Utilisation

### **Installation**
1. Téléchargez tous les fichiers du projet
2. Ouvrez `index.html` dans votre navigateur moderne
3. Le lecteur s'initialise automatiquement

### **Utilisation**
1. **Sélectionner un dossier** :
   - Cliquez sur "📁 Choisir Dossier" dans le header
   - Sélectionnez le dossier contenant vos fichiers musicaux
   - Le scan se lance automatiquement

2. **Navigation** :
   - **Panneau gauche** : Affiche l'arborescence du dossier sélectionné
   - **Panneau central** : Contrôles de lecture et informations de la piste
   - **Panneau droit** : Playlist complète avec toutes les pistes

3. **Lecture** :
   - Cliquez sur une piste dans la playlist pour la jouer
   - Utilisez les contrôles centraux pour naviguer
   - Le disque vinyle tourne pendant la lecture

4. **Personnalisation** :
   - Ajustez le volume avec le curseur
   - Activez le mode aléatoire ou répétition
   - Triez la playlist selon vos préférences

## 🛠️ Technologies Utilisées

- **HTML5** : Structure sémantique et API File System
- **CSS3** : Grid Layout, Flexbox, animations, glassmorphisme
- **JavaScript ES6+** : Classes, modules, async/await
- **Web Audio API** : Gestion audio avancée
- **FileSystem Access API** : Lecture de dossiers locaux

## 📱 Compatibilité

### **Navigateurs**
- **Chrome/Chromium** : Support complet (recommandé)
- **Edge** : Support complet
- **Firefox** : Support partiel (pas de sélection de dossier)
- **Safari** : Support limité

### **Appareils**
- **Desktop** : Expérience complète
- **Tablette** : Interface adaptée
- **Mobile** : Interface simplifiée

## 🎯 Fonctionnalités Avancées

### **Extraction de Métadonnées**
- **Titre** : Extraction intelligente du nom de fichier
- **Artiste** : Détection à partir du dossier ou nom de fichier
- **Format** : Identification automatique du type de fichier
- **Durée** : Calcul précis de la longueur des pistes

### **Gestion de la Mémoire**
- **URLs optimisées** : Gestion efficace des ressources
- **Nettoyage automatique** : Libération de la mémoire
- **Performance** : Interface fluide même avec de grandes bibliothèques

### **Sauvegarde des Préférences**
- **Volume** : Mémorisation du niveau sonore
- **Modes de lecture** : Conservation des préférences
- **État de l'interface** : Restauration de la session

## 📂 Structure des Fichiers

```
folder-music-player/
├── index.html          # Interface utilisateur
├── styles.css          # Styles et animations
├── script.js           # Logique du lecteur
├── manifest.json       # Configuration PWA
└── README.md          # Documentation
```

## 🎨 Personnalisation

Le lecteur utilise des variables CSS pour faciliter la personnalisation :

```css
:root {
  --primary-bg: #1a1a2e;      /* Arrière-plan principal */
  --primary-color: #e94560;    /* Couleur d'accent */
  --secondary-color: #f39c12;  /* Couleur secondaire */
  --text-primary: #ffffff;     /* Texte principal */
}
```

## 🔧 Dépannage

### **Dossier non reconnu**
- Vérifiez que le dossier contient des fichiers audio supportés
- Assurez-vous d'utiliser un navigateur compatible (Chrome recommandé)

### **Fichiers non lisibles**
- Vérifiez le format du fichier (MP3, WAV, etc.)
- Certains fichiers corrompus peuvent être ignorés

### **Performance lente**
- Les très gros dossiers (1000+ fichiers) peuvent prendre du temps à scanner
- Fermez les autres onglets pour libérer de la mémoire

---

**Créé avec ❤️ pour les amateurs de musique qui veulent un lecteur moderne et efficace** 🎵✨
