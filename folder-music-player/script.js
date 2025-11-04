/**
 * Folder Music Player
 * Lecteur de musique avec scan de dossiers
 */

class FolderMusicPlayer {
  constructor() {
    // Configuration
    this.config = {
      storageKey: 'folder-music-player-data',
      supportedFormats: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma'],
      defaultVolume: 0.7
    };

    // État du lecteur
    this.state = {
      currentIndex: 0,
      isPlaying: false,
      isShuffled: false,
      repeatMode: 'none', // 'none', 'one', 'all'
      volume: this.config.defaultVolume,
      isMuted: false,
      currentFolder: null,
      isDragging: false
    };

    // Données
    this.playlist = [];
    this.folderStructure = {};

    // Éléments DOM
    this.elements = {};
    this.bindElements();

    // Initialisation
    this.init();
  }

  bindElements() {
    const elementIds = [
      'folderBtn', 'folderInput', 'folderTree', 'folderInfo', 'folderPath',
      'audioPlayer', 'playBtn', 'prevBtn', 'nextBtn', 'shuffleBtn', 'repeatBtn',
      'progressSlider', 'progressFill', 'currentTime', 'totalTime',
      'volumeSlider', 'volumeFill', 'muteBtn', 'volumeIcon',
      'vinylDisc', 'albumCover', 'trackTitle', 'trackArtist', 'trackDuration', 'trackFormat',
      'playlist', 'playlistCount', 'totalDuration', 'sortBtn', 'clearBtn',
      'statusText', 'loadingScreen'
    ];

    elementIds.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });

    // Éléments supplémentaires
    this.elements.playIcon = document.querySelector('.play-icon');
    this.elements.pauseIcon = document.querySelector('.pause-icon');
  }

  async init() {
    try {
      this.loadStoredData();
      this.setupEventListeners();
      this.updateVolumeDisplay();
      this.hideLoadingScreen();
      this.updateStatus('Prêt - Sélectionnez un dossier pour commencer');
      
      // Charger la première piste si disponible
      if (this.playlist.length > 0) {
        this.loadTrack(this.state.currentIndex);
      }
    } catch (error) {
      console.error('Erreur d\'initialisation:', error);
      this.updateStatus('Erreur d\'initialisation');
    }
  }

  setupEventListeners() {
    // Événements de dossier
    this.elements.folderBtn.addEventListener('click', () => {
      this.elements.folderInput.click();
    });
    
    this.elements.folderInput.addEventListener('change', (e) => {
      this.handleFolderSelection(e);
    });

    // Événements audio
    this.elements.audioPlayer.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
    this.elements.audioPlayer.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.elements.audioPlayer.addEventListener('ended', () => this.onTrackEnded());
    this.elements.audioPlayer.addEventListener('error', () => this.onAudioError());

    // Contrôles de lecture
    this.elements.playBtn.addEventListener('click', () => this.togglePlay());
    this.elements.prevBtn.addEventListener('click', () => this.previousTrack());
    this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
    this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
    this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());

    // Contrôles de progression
    this.elements.progressSlider.addEventListener('input', () => this.onProgressChange());
    this.elements.progressSlider.addEventListener('mousedown', () => this.state.isDragging = true);
    this.elements.progressSlider.addEventListener('mouseup', () => this.state.isDragging = false);

    // Contrôles de volume
    this.elements.volumeSlider.addEventListener('input', () => this.onVolumeChange());
    this.elements.muteBtn.addEventListener('click', () => this.toggleMute());

    // Contrôles de playlist
    this.elements.sortBtn.addEventListener('click', () => this.sortPlaylist());
    this.elements.clearBtn.addEventListener('click', () => this.clearPlaylist());

    // Clic sur le disque vinyle
    this.elements.vinylDisc.addEventListener('click', () => this.togglePlay());

    // Raccourcis clavier
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  async handleFolderSelection(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    this.updateStatus('Scan du dossier en cours...');
    
    try {
      // Extraire le chemin du dossier
      const folderPath = files[0].webkitRelativePath.split('/')[0];
      this.state.currentFolder = folderPath;
      
      // Filtrer les fichiers audio
      const audioFiles = files.filter(file => 
        this.config.supportedFormats.some(format => 
          file.name.toLowerCase().endsWith(format)
        )
      );

      if (audioFiles.length === 0) {
        this.updateStatus('Aucun fichier audio trouvé dans ce dossier');
        return;
      }

      // Créer la playlist
      this.playlist = [];
      for (const file of audioFiles) {
        const track = await this.createTrackFromFile(file);
        this.playlist.push(track);
      }

      // Trier par nom
      this.playlist.sort((a, b) => a.title.localeCompare(b.title));

      // Construire la structure de dossiers
      this.buildFolderStructure(files);

      // Mettre à jour l'interface
      this.updateFolderDisplay();
      this.buildPlaylistUI();
      this.saveData();

      // Charger la première piste
      if (this.playlist.length > 0) {
        this.loadTrack(0);
      }

      this.updateStatus(`${audioFiles.length} piste(s) trouvée(s) dans ${folderPath}`);
      
    } catch (error) {
      console.error('Erreur lors du scan du dossier:', error);
      this.updateStatus('Erreur lors du scan du dossier');
    }
  }

  async createTrackFromFile(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      // Extraire les métadonnées du fichier
      const pathParts = file.webkitRelativePath.split('/');
      const fileName = file.name;
      const folderName = pathParts.slice(1, -1).join('/');
      
      audio.addEventListener('loadedmetadata', () => {
        const track = {
          title: this.extractTitle(fileName),
          artist: this.extractArtist(folderName, fileName),
          src: url,
          file: file,
          duration: audio.duration || 0,
          format: this.getFileFormat(fileName),
          path: file.webkitRelativePath,
          size: file.size
        };
        resolve(track);
      });

      audio.addEventListener('error', () => {
        resolve({
          title: this.extractTitle(fileName),
          artist: this.extractArtist(folderName, fileName),
          src: url,
          file: file,
          duration: 0,
          format: this.getFileFormat(fileName),
          path: file.webkitRelativePath,
          size: file.size
        });
      });
    });
  }

  extractTitle(fileName) {
    // Supprimer l'extension et nettoyer le nom
    let title = fileName.replace(/\.[^/.]+$/, '');
    
    // Supprimer les numéros de piste au début (01. 02. etc.)
    title = title.replace(/^\d+[\s.-]*/, '');
    
    // Remplacer les underscores et tirets par des espaces
    title = title.replace(/[-_]/g, ' ');
    
    // Nettoyer les espaces multiples
    title = title.replace(/\s+/g, ' ').trim();
    
    return title || 'Titre Inconnu';
  }

  extractArtist(folderName, fileName) {
    // Essayer d'extraire l'artiste du nom de dossier ou du nom de fichier
    if (folderName) {
      return folderName.replace(/[-_]/g, ' ').trim();
    }
    
    // Chercher des patterns comme "Artiste - Titre"
    const match = fileName.match(/^([^-]+)\s*-\s*(.+)/);
    if (match) {
      return match[1].trim();
    }
    
    return 'Artiste Inconnu';
  }

  getFileFormat(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    return extension.toUpperCase();
  }

  buildFolderStructure(files) {
    this.folderStructure = {};
    
    files.forEach(file => {
      if (this.config.supportedFormats.some(format => 
          file.name.toLowerCase().endsWith(format))) {
        const pathParts = file.webkitRelativePath.split('/');
        let current = this.folderStructure;
        
        for (let i = 1; i < pathParts.length - 1; i++) {
          if (!current[pathParts[i]]) {
            current[pathParts[i]] = {};
          }
          current = current[pathParts[i]];
        }
      }
    });
  }

  updateFolderDisplay() {
    this.elements.folderInfo.textContent = `${this.playlist.length} piste(s) trouvée(s)`;
    this.elements.folderPath.textContent = this.state.currentFolder || 'Aucun dossier';
    
    // Afficher l'arborescence (simplifié)
    const tree = this.elements.folderTree;
    tree.innerHTML = '';
    
    if (this.state.currentFolder) {
      const folderDiv = document.createElement('div');
      folderDiv.className = 'folder-item active';
      folderDiv.innerHTML = `
        <span class="icon">📁</span>
        <span>${this.state.currentFolder}</span>
        <span style="margin-left: auto; font-size: 0.8rem; opacity: 0.7;">${this.playlist.length} pistes</span>
      `;
      tree.appendChild(folderDiv);
    }
  }

  buildPlaylistUI() {
    const container = this.elements.playlist;
    
    if (this.playlist.length === 0) {
      container.innerHTML = `
        <div class="empty-playlist">
          <div class="empty-icon">🎵</div>
          <p>Aucune musique trouvée</p>
          <p class="empty-subtitle">Sélectionnez un dossier contenant des fichiers audio</p>
        </div>
      `;
      this.updatePlaylistStats();
      return;
    }

    container.innerHTML = this.playlist.map((track, index) => `
      <div class="playlist-item ${index === this.state.currentIndex ? 'active' : ''}" 
           data-index="${index}">
        <div class="track-number">${index + 1}</div>
        <div class="track-details">
          <div class="track-name">${track.title}</div>
          <div class="track-info-mini">${track.artist} • ${track.format}</div>
        </div>
        <div class="track-duration">${this.formatTime(track.duration)}</div>
      </div>
    `).join('');

    // Ajouter les événements
    container.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.loadTrack(index);
      });
    });

    this.updatePlaylistStats();
  }

  updatePlaylistStats() {
    const totalDuration = this.playlist.reduce((sum, track) => sum + (track.duration || 0), 0);
    this.elements.playlistCount.textContent = `${this.playlist.length} pistes`;
    this.elements.totalDuration.textContent = this.formatTime(totalDuration);
  }

  loadTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;

    this.state.currentIndex = index;
    const track = this.playlist[index];

    // Charger l'audio
    this.elements.audioPlayer.src = track.src;
    
    // Mettre à jour l'interface
    this.elements.trackTitle.textContent = track.title;
    this.elements.trackArtist.textContent = track.artist;
    this.elements.trackDuration.textContent = this.formatTime(track.duration);
    this.elements.trackFormat.textContent = track.format;

    // Image par défaut (pourrait être améliorée avec extraction de métadonnées)
    this.elements.albumCover.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23333'/><text x='100' y='110' text-anchor='middle' fill='%23fff' font-size='60'>🎵</text></svg>";

    // Mettre à jour la playlist
    this.buildPlaylistUI();
    this.updateStatus(`Chargé: ${track.title} - ${track.artist}`);
    this.saveData();
  }

  async togglePlay() {
    if (this.playlist.length === 0) {
      this.updateStatus('Aucune piste à jouer');
      return;
    }

    try {
      if (this.state.isPlaying) {
        this.elements.audioPlayer.pause();
        this.state.isPlaying = false;
        this.elements.vinylDisc.classList.remove('spinning');
        this.updateStatus('En pause');
      } else {
        await this.elements.audioPlayer.play();
        this.state.isPlaying = true;
        this.elements.vinylDisc.classList.add('spinning');
        this.updateStatus('En lecture');
      }

      this.updatePlayButton();
    } catch (error) {
      console.error('Erreur de lecture:', error);
      this.updateStatus('Erreur de lecture');
    }
  }

  previousTrack() {
    if (this.playlist.length === 0) return;

    let newIndex = this.state.currentIndex - 1;
    if (newIndex < 0) {
      newIndex = this.playlist.length - 1;
    }

    this.loadTrack(newIndex);
    if (this.state.isPlaying) {
      this.elements.audioPlayer.play();
    }
  }

  nextTrack() {
    if (this.playlist.length === 0) return;

    let newIndex;
    if (this.state.isShuffled) {
      newIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      newIndex = this.state.currentIndex + 1;
      if (newIndex >= this.playlist.length) {
        newIndex = 0;
      }
    }

    this.loadTrack(newIndex);
    if (this.state.isPlaying) {
      this.elements.audioPlayer.play();
    }
  }

  toggleShuffle() {
    this.state.isShuffled = !this.state.isShuffled;
    this.elements.shuffleBtn.classList.toggle('active', this.state.isShuffled);
    this.updateStatus(this.state.isShuffled ? 'Lecture aléatoire activée' : 'Lecture aléatoire désactivée');
    this.saveData();
  }

  toggleRepeat() {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(this.state.repeatMode);
    this.state.repeatMode = modes[(currentIndex + 1) % modes.length];

    this.elements.repeatBtn.classList.toggle('active', this.state.repeatMode !== 'none');
    
    const messages = {
      'none': 'Répétition désactivée',
      'one': 'Répéter la piste actuelle',
      'all': 'Répéter la playlist'
    };
    
    this.updateStatus(messages[this.state.repeatMode]);
    this.saveData();
  }

  sortPlaylist() {
    if (this.playlist.length === 0) return;

    // Cycle entre différents modes de tri
    const currentTrack = this.playlist[this.state.currentIndex];
    
    // Trier par titre
    this.playlist.sort((a, b) => a.title.localeCompare(b.title));
    
    // Retrouver l'index de la piste actuelle
    this.state.currentIndex = this.playlist.findIndex(track => track === currentTrack);
    
    this.buildPlaylistUI();
    this.updateStatus('Playlist triée par titre');
    this.saveData();
  }

  clearPlaylist() {
    if (this.playlist.length === 0) return;

    if (confirm('Êtes-vous sûr de vouloir vider la playlist ?')) {
      // Libérer les URLs
      this.playlist.forEach(track => {
        if (track.src.startsWith('blob:')) {
          URL.revokeObjectURL(track.src);
        }
      });

      this.playlist = [];
      this.state.currentIndex = 0;
      this.state.currentFolder = null;
      
      this.resetPlayer();
      this.buildPlaylistUI();
      this.updateFolderDisplay();
      this.saveData();
      this.updateStatus('Playlist vidée');
    }
  }

  // Événements audio
  onLoadedMetadata() {
    this.elements.totalTime.textContent = this.formatTime(this.elements.audioPlayer.duration);
  }

  onTimeUpdate() {
    if (this.state.isDragging) return;

    const current = this.elements.audioPlayer.currentTime;
    const duration = this.elements.audioPlayer.duration;
    
    if (duration) {
      const percentage = (current / duration) * 100;
      this.elements.progressSlider.value = percentage;
      this.elements.progressFill.style.width = `${percentage}%`;
    }
    
    this.elements.currentTime.textContent = this.formatTime(current);
  }

  onProgressChange() {
    const percentage = this.elements.progressSlider.value;
    const duration = this.elements.audioPlayer.duration;
    
    if (duration) {
      this.elements.audioPlayer.currentTime = (percentage / 100) * duration;
      this.elements.progressFill.style.width = `${percentage}%`;
    }
  }

  onTrackEnded() {
    if (this.state.repeatMode === 'one') {
      this.elements.audioPlayer.currentTime = 0;
      this.elements.audioPlayer.play();
    } else if (this.state.repeatMode === 'all' || this.state.currentIndex < this.playlist.length - 1) {
      this.nextTrack();
    } else {
      this.state.isPlaying = false;
      this.elements.vinylDisc.classList.remove('spinning');
      this.updatePlayButton();
      this.updateStatus('Lecture terminée');
    }
  }

  onVolumeChange() {
    const volume = this.elements.volumeSlider.value / 100;
    this.elements.audioPlayer.volume = volume;
    this.state.volume = volume;
    this.state.isMuted = volume === 0;
    this.updateVolumeDisplay();
    this.saveData();
  }

  toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    
    if (this.state.isMuted) {
      this.elements.audioPlayer.volume = 0;
      this.elements.volumeSlider.value = 0;
    } else {
      this.elements.audioPlayer.volume = this.state.volume;
      this.elements.volumeSlider.value = this.state.volume * 100;
    }
    
    this.updateVolumeDisplay();
    this.saveData();
  }

  onAudioError() {
    console.error('Erreur de lecture audio');
    this.updateStatus('Erreur de lecture - fichier inaccessible');
  }

  // Gestion du clavier
  handleKeyboard(event) {
    if (event.target.tagName === 'INPUT') return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousTrack();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.nextTrack();
        break;
      case 'KeyM':
        event.preventDefault();
        this.toggleMute();
        break;
      case 'KeyS':
        event.preventDefault();
        this.toggleShuffle();
        break;
      case 'KeyR':
        event.preventDefault();
        this.toggleRepeat();
        break;
    }
  }

  // Utilitaires
  updatePlayButton() {
    if (this.state.isPlaying) {
      this.elements.playIcon.style.display = 'none';
      this.elements.pauseIcon.style.display = 'inline';
    } else {
      this.elements.playIcon.style.display = 'inline';
      this.elements.pauseIcon.style.display = 'none';
    }
  }

  updateVolumeDisplay() {
    const volume = this.elements.audioPlayer.volume;
    this.elements.volumeFill.style.width = `${volume * 100}%`;
    
    if (volume === 0 || this.state.isMuted) {
      this.elements.volumeIcon.textContent = '🔇';
    } else if (volume < 0.3) {
      this.elements.volumeIcon.textContent = '🔈';
    } else if (volume < 0.7) {
      this.elements.volumeIcon.textContent = '🔉';
    } else {
      this.elements.volumeIcon.textContent = '🔊';
    }
  }

  updateStatus(message) {
    this.elements.statusText.textContent = message;
  }

  resetPlayer() {
    this.elements.audioPlayer.src = '';
    this.elements.trackTitle.textContent = 'Aucune piste sélectionnée';
    this.elements.trackArtist.textContent = 'Choisissez un dossier de musique';
    this.elements.trackDuration.textContent = '--:--';
    this.elements.trackFormat.textContent = '---';
    this.elements.currentTime.textContent = '0:00';
    this.elements.totalTime.textContent = '0:00';
    this.elements.progressSlider.value = 0;
    this.elements.progressFill.style.width = '0%';
    this.elements.albumCover.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23333'/><text x='100' y='110' text-anchor='middle' fill='%23fff' font-size='60'>🎵</text></svg>";
    this.state.isPlaying = false;
    this.updatePlayButton();
    this.elements.vinylDisc.classList.remove('spinning');
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  hideLoadingScreen() {
    setTimeout(() => {
      this.elements.loadingScreen.classList.add('hidden');
    }, 1000);
  }

  // Sauvegarde et chargement
  saveData() {
    try {
      const data = {
        state: {
          ...this.state,
          currentFolder: this.state.currentFolder
        }
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Impossible de sauvegarder les données:', error);
    }
  }

  loadStoredData() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.state = { ...this.state, ...data.state };
        
        // Appliquer le volume
        this.elements.audioPlayer.volume = this.state.volume;
        this.elements.volumeSlider.value = this.state.volume * 100;
        
        // Appliquer les états des boutons
        this.elements.shuffleBtn.classList.toggle('active', this.state.isShuffled);
        this.elements.repeatBtn.classList.toggle('active', this.state.repeatMode !== 'none');
      }
    } catch (error) {
      console.warn('Impossible de charger les données:', error);
    }
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  new FolderMusicPlayer();
});
