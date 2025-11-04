# 🎵 Lecteur Disque — Lin Junjie (JJ Lin)

Un lecteur audio moderne et immersif avec des technologies web avancées.

## ✨ Fonctionnalités

### 🎛️ Lecteur Audio Avancé
- **Lecture fluide** : Contrôles Play/Pause/Next/Prev intuitifs
- **Visualiseur audio** : Spectre de fréquences en temps réel avec Web Audio API
- **Gestion de playlist** : Ajout/suppression de pistes, lecture aléatoire/répétition
- **Contrôle de volume** : Slider de volume et bouton muet
- **Barre de progression** : Navigation temporelle interactive

### 🎨 Interface Moderne
- **Design glassmorphism** : Effets de verre moderne avec backdrop-filter
- **Animations CSS3** : Transitions fluides et animations de disque
- **Mode sombre/clair** : Bascule entre thèmes avec préférences système
- **Responsive design** : Adaptatif mobile, tablette et desktop
- **Accessibilité** : Support ARIA, navigation clavier, contraste élevé

### 📱 Progressive Web App (PWA)
- **Installation** : Installable comme application native
- **Cache offline** : Fonctionnement hors ligne avec Service Worker
- **Manifest** : Icônes et métadonnées pour l'installation
- **Performance** : Chargement optimisé et mise en cache

### 🔧 Fonctionnalités Avancées
- **Drag & Drop** : Glissez-déposez vos fichiers MP3 directement
- **Import de fichiers** : Sélection multiple de fichiers audio
- **Sauvegarde locale** : localStorage pour playlist et préférences
- **Raccourcis clavier** : Navigation rapide (voir touches ci-dessous)
- **Gestion d'erreurs** : Notifications et récupération automatique

## ⌨️ Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `Espace` / `K` | Lecture/Pause |
| `←` | Piste précédente |
| `→` | Piste suivante |
| `↑` | Volume + |
| `↓` | Volume - |
| `M` | Muet/Son |
| `S` | Aléatoire |
| `R` | Répéter |
| `?` | Aide (raccourcis) |
| `Échap` | Fermer modal |

## 🚀 Installation & Utilisation

### Méthode 1 : Drag & Drop (Recommandée)
1. Ouvrez `index.html` dans votre navigateur moderne
2. Glissez-déposez vos fichiers MP3 de Lin Junjie dans la zone prévue
3. Profitez de la musique ! 🎶

### Méthode 2 : Import manuel
1. Cliquez sur "📁 Importer" 
2. Sélectionnez vos fichiers MP3
3. Les pistes sont automatiquement ajoutées à la playlist

### Méthode 3 : Serveur local (Pour développement)
```bash
cd linjunjie_player
python3 -m http.server 8000
# Puis ouvrez http://localhost:8000
```

## 🎼 Configuration Avancée

### Personnalisation de la Playlist
Pour pré-remplir la playlist, éditez `script.js` :

```javascript
// Dans la classe ModernAudioPlayer, section playlist
this.playlist = [
  {
    title: 'Titre de la chanson',
    artist: 'Lin Junjie',
    src: 'tracks/fichier.mp3',
    cover: 'tracks/cover.jpg', // optionnel
    duration: 240 // en secondes, optionnel
  },
  // Ajoutez plus de pistes...
];
```

### Thèmes Personnalisés
Modifiez les variables CSS dans `styles.css` :

```css
:root {
  --primary-color: #votre-couleur;
  --accent-color: #votre-accent;
  --glass-bg: rgba(255, 255, 255, 0.08);
}
```

## 🛠️ Technologies Utilisées

- **HTML5** : Sémantique moderne, Web Audio API
- **CSS3** : Grid/Flexbox, animations, glassmorphism, variables CSS
- **JavaScript ES6+** : Classes, modules, async/await, Web APIs
- **PWA** : Service Worker, manifest, cache strategy
- **Accessibility** : ARIA labels, keyboard navigation, screen readers

## 📱 Compatibilité

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🔊 Formats Audio Supportés

- MP3 (recommandé)
- AAC, M4A
- OGG, WEBM
- WAV (plus volumineux)

## 📁 Structure des Fichiers

```
linjunjie_player/
├── index.html          # Interface principale
├── styles.css          # Styles modernes
├── script.js           # Logique JavaScript ES6+
├── manifest.json       # Manifest PWA
├── sw.js              # Service Worker
├── README.md          # Cette documentation
└── tracks/            # Dossier pour vos MP3
    └── .gitkeep       # Maintient le dossier vide
```

## 🎯 Prochaines Améliorations

- [ ] Égaliseur graphique 10 bandes
- [ ] Paroles synchronisées (LRC)
- [ ] Partage social
- [ ] Cloud sync (Google Drive, Dropbox)
- [ ] Playlists multiples
- [ ] Analyse BPM automatique
- [ ] Crossfade entre pistes

## 🐛 Dépannage

### Le lecteur ne charge pas
- Vérifiez que JavaScript est activé
- Utilisez un navigateur moderne (Chrome 90+)
- Servez depuis un serveur HTTP (pas file://)

### Audio ne joue pas
- Vérifiez le format du fichier (MP3 recommandé)
- Autorisez la lecture automatique dans le navigateur
- Vérifiez que le volume n'est pas à 0

### Visualiseur ne s'affiche pas
- Web Audio API requis (navigateurs modernes)
- Cliquez sur play pour initialiser le contexte audio
- Vérifiez la console pour d'éventuelles erreurs

---

🎶 **Profitez de la musique de Lin Junjie avec style !** 🎶
