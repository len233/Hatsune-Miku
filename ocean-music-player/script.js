/**
 * Ocean Music Player
 * Modern Audio Player with Ocean Theme
 */

class OceanMusicPlayer {
  constructor() {
    // Configuration
    this.config = {
      storageKey: 'ocean-player-data',
      visualizerBarCount: 64,
      defaultVolume: 0.5,
      crossfadeDuration: 300,
    };

    // State
    this.state = {
      currentIndex: 0,
      isPlaying: false,
      isShuffled: false,
      repeatMode: 'none', // 'none', 'one', 'all'
      volume: this.config.defaultVolume,
      isMuted: false,
      isDragging: false
    };

    // Playlist data
    this.playlist = [];

    // DOM elements
    this.elements = {};
    this.bindElements();

    // Audio context for visualizer
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null;

    // Initialize
    this.init();
  }

  bindElements() {
    const ids = [
      'audio', 'playBtn', 'prevBtn', 'nextBtn', 'shuffleBtn', 'repeatBtn',
      'progress', 'currentTime', 'duration', 'playlist', 'trackTitle', 'trackArtist',
      'disc', 'coverImg', 'volumeSlider', 'muteBtn', 'statusDisplay', 
      'playlistStats', 'visualizer', 'loadingScreen', 'dropZone', 'fileInput', 
      'importBtn', 'clearBtn'
    ];

    ids.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });

    // Additional elements
    this.elements.playIcon = document.getElementById('playIcon');
    this.elements.pauseIcon = document.getElementById('pauseIcon');
    this.elements.volumeIcon = document.getElementById('volumeIcon');
    this.elements.progressFill = document.querySelector('.progress-fill');
  }

  async init() {
    try {
      this.loadStoredData();
      this.setupEventListeners();
      this.setupDragAndDrop();
      this.setupWebAudioAPI();
      this.buildPlaylistUI();
      this.updateVolumeIcon();
      this.hideLoadingScreen();
      this.updateStatus('Lecteur océanique initialisé');
      
      // Load first track if available
      if (this.playlist.length > 0) {
        this.loadTrack(this.state.currentIndex);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      this.updateStatus('Erreur d\'initialisation');
    }
  }

  loadStoredData() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.state = { ...this.state, ...data.state };
        this.playlist = data.playlist || [];
      }
    } catch (error) {
      console.warn('Failed to load stored data:', error);
    }
  }

  saveData() {
    try {
      const data = {
        state: this.state,
        playlist: this.playlist.map(track => ({
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          src: track.src // Note: File URLs may not persist
        }))
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save data:', error);
    }
  }

  setupEventListeners() {
    // Audio events
    this.elements.audio.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
    this.elements.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.elements.audio.addEventListener('ended', () => this.onTrackEnded());
    this.elements.audio.addEventListener('error', (e) => this.onAudioError(e));

    // Control events
    this.elements.playBtn.addEventListener('click', () => this.togglePlay());
    this.elements.prevBtn.addEventListener('click', () => this.previousTrack());
    this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
    this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
    this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());

    // Progress events
    this.elements.progress.addEventListener('input', () => this.onProgressChange());
    this.elements.progress.addEventListener('mousedown', () => this.state.isDragging = true);
    this.elements.progress.addEventListener('mouseup', () => this.state.isDragging = false);

    // Volume events
    this.elements.volumeSlider.addEventListener('input', () => this.onVolumeChange());
    this.elements.muteBtn.addEventListener('click', () => this.toggleMute());

    // Import events
    this.elements.importBtn.addEventListener('click', () => this.elements.fileInput.click());
    this.elements.fileInput.addEventListener('change', (e) => this.handleFileImport(e));
    this.elements.clearBtn.addEventListener('click', () => this.clearPlaylist());

    // Disc click
    this.elements.disc.addEventListener('click', () => this.togglePlay());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  setupDragAndDrop() {
    const dropZone = this.elements.dropZone;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      document.addEventListener(eventName, () => {
        dropZone.style.display = 'grid';
        dropZone.classList.add('active');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, () => {
        dropZone.classList.remove('active');
        setTimeout(() => {
          if (!dropZone.classList.contains('active')) {
            dropZone.style.display = 'none';
          }
        }, 300);
      });
    });

    dropZone.addEventListener('drop', (e) => this.handleFileDrop(e));
    dropZone.addEventListener('click', () => this.elements.fileInput.click());
  }

  async setupWebAudioAPI() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.config.visualizerBarCount * 2;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      // Connect audio element when playing
      this.elements.audio.addEventListener('play', () => {
        if (!this.source) {
          this.source = this.audioContext.createMediaElementSource(this.elements.audio);
          this.source.connect(this.analyser);
          this.analyser.connect(this.audioContext.destination);
        }
        this.startVisualizer();
      });
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  startVisualizer() {
    if (!this.analyser) return;

    const canvas = this.elements.visualizer;
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      if (!this.state.isPlaying) return;

      requestAnimationFrame(draw);
      
      this.analyser.getByteFrequencyData(this.dataArray);
      
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / this.dataArray.length;
      let x = 0;
      
      for (let i = 0; i < this.dataArray.length; i++) {
        const barHeight = (this.dataArray[i] / 255) * canvas.height * 0.8;
        
        const hue = 200 + (i / this.dataArray.length) * 60; // Ocean colors
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.6)`;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };
    
    draw();
  }

  async handleFileImport(event) {
    const files = Array.from(event.target.files);
    await this.processFiles(files);
    event.target.value = '';
  }

  async handleFileDrop(event) {
    const files = Array.from(event.dataTransfer.files);
    await this.processFiles(files);
  }

  async processFiles(files) {
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      this.updateStatus('Aucun fichier audio trouvé');
      return;
    }

    this.updateStatus(`Traitement de ${audioFiles.length} fichier(s)...`);

    for (const file of audioFiles) {
      try {
        const track = await this.createTrackFromFile(file);
        this.playlist.push(track);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
      }
    }

    this.buildPlaylistUI();
    this.saveData();
    this.updateStatus(`${audioFiles.length} piste(s) ajoutée(s)`);

    // Load first track if this is the first import
    if (this.playlist.length === audioFiles.length) {
      this.loadTrack(0);
    }
  }

  async createTrackFromFile(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      audio.addEventListener('loadedmetadata', () => {
        const track = {
          title: this.extractTitle(file.name),
          artist: 'Artiste Inconnu',
          src: url,
          file: file,
          duration: audio.duration || 0
        };
        resolve(track);
      });

      audio.addEventListener('error', () => {
        resolve({
          title: this.extractTitle(file.name),
          artist: 'Artiste Inconnu',
          src: url,
          file: file,
          duration: 0
        });
      });
    });
  }

  extractTitle(filename) {
    return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
  }

  buildPlaylistUI() {
    const container = this.elements.playlist;
    
    if (this.playlist.length === 0) {
      container.innerHTML = `
        <div class="empty-playlist">
          <div class="empty-icon"></div>
          <p>Votre océan musical est vide</p>
          <p class="empty-subtitle">Importez vos fichiers audio pour commencer</p>
        </div>
      `;
      this.elements.playlistStats.textContent = '0 pistes';
      return;
    }

    container.innerHTML = this.playlist.map((track, index) => `
      <div class="playlist-item ${index === this.state.currentIndex ? 'active' : ''}" 
           data-index="${index}">
        <div class="track-number">${index + 1}</div>
        <div class="track-details">
          <div class="track-name">${track.title}</div>
          <div class="track-duration">${this.formatTime(track.duration)}</div>
        </div>
        <button class="remove-btn" data-index="${index}" title="Supprimer">❌</button>
      </div>
    `).join('');

    // Add event listeners
    container.querySelectorAll('.playlist-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-btn')) {
          const index = parseInt(item.dataset.index);
          this.loadTrack(index);
        }
      });
    });

    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.removeTrack(index);
      });
    });

    this.elements.playlistStats.textContent = `${this.playlist.length} piste(s)`;
  }

  removeTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;

    // Revoke object URL to free memory
    if (this.playlist[index].src.startsWith('blob:')) {
      URL.revokeObjectURL(this.playlist[index].src);
    }

    this.playlist.splice(index, 1);

    // Adjust current index
    if (index < this.state.currentIndex) {
      this.state.currentIndex--;
    } else if (index === this.state.currentIndex) {
      if (this.state.currentIndex >= this.playlist.length) {
        this.state.currentIndex = Math.max(0, this.playlist.length - 1);
      }
      if (this.playlist.length > 0) {
        this.loadTrack(this.state.currentIndex);
      } else {
        this.resetPlayer();
      }
    }

    this.buildPlaylistUI();
    this.saveData();
  }

  clearPlaylist() {
    if (this.playlist.length === 0) return;

    if (confirm('Êtes-vous sûr de vouloir vider la playlist ?')) {
      // Revoke all object URLs
      this.playlist.forEach(track => {
        if (track.src.startsWith('blob:')) {
          URL.revokeObjectURL(track.src);
        }
      });

      this.playlist = [];
      this.state.currentIndex = 0;
      this.resetPlayer();
      this.buildPlaylistUI();
      this.saveData();
      this.updateStatus('Playlist vidée');
    }
  }

  loadTrack(index) {
    if (index < 0 || index >= this.playlist.length) return;

    this.state.currentIndex = index;
    const track = this.playlist[index];

    this.elements.audio.src = track.src;
    this.elements.trackTitle.textContent = track.title;
    this.elements.trackArtist.textContent = track.artist;
    
    // Update cover image (placeholder for now)
    this.elements.coverImg.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><rect width='300' height='300' fill='%23001122'/><text x='150' y='160' text-anchor='middle' fill='%2300CCDD' font-size='60'>🎵</text></svg>";
    
    this.buildPlaylistUI();
    this.updateStatus(`Chargé: ${track.title}`);
    this.saveData();
  }

  resetPlayer() {
    this.elements.audio.src = '';
    this.elements.trackTitle.textContent = 'Aucune piste sélectionnée';
    this.elements.trackArtist.textContent = 'Importez votre musique';
    this.elements.coverImg.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><rect width='300' height='300' fill='%23001122'/><text x='150' y='160' text-anchor='middle' fill='%2300CCDD' font-size='60'>🌊</text></svg>";
    this.elements.currentTime.textContent = '0:00';
    this.elements.duration.textContent = '0:00';
    this.elements.progress.value = 0;
    this.elements.progressFill.style.width = '0%';
    this.state.isPlaying = false;
    this.updatePlayButton();
    this.elements.disc.classList.remove('spinning');
  }

  async togglePlay() {
    if (this.playlist.length === 0) {
      this.updateStatus('Aucune musique à jouer');
      return;
    }

    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.state.isPlaying) {
        this.elements.audio.pause();
        this.state.isPlaying = false;
        this.elements.disc.classList.remove('spinning');
        this.updateStatus('En pause');
      } else {
        await this.elements.audio.play();
        this.state.isPlaying = true;
        this.elements.disc.classList.add('spinning');
        this.updateStatus('En lecture');
      }

      this.updatePlayButton();
    } catch (error) {
      console.error('Playback error:', error);
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
      this.elements.audio.play();
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
      this.elements.audio.play();
    }
  }

  toggleShuffle() {
    this.state.isShuffled = !this.state.isShuffled;
    this.elements.shuffleBtn.classList.toggle('active', this.state.isShuffled);
    this.updateStatus(this.state.isShuffled ? 'Aléatoire activé' : 'Aléatoire désactivé');
    this.saveData();
  }

  toggleRepeat() {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(this.state.repeatMode);
    this.state.repeatMode = modes[(currentIndex + 1) % modes.length];

    this.elements.repeatBtn.classList.toggle('active', this.state.repeatMode !== 'none');
    
    const messages = {
      'none': 'Répétition désactivée',
      'one': 'Répéter la piste',
      'all': 'Répéter la playlist'
    };
    
    this.updateStatus(messages[this.state.repeatMode]);
    this.saveData();
  }

  onLoadedMetadata() {
    this.elements.duration.textContent = this.formatTime(this.elements.audio.duration);
  }

  onTimeUpdate() {
    if (this.state.isDragging) return;

    const current = this.elements.audio.currentTime;
    const duration = this.elements.audio.duration;
    
    if (duration) {
      const percentage = (current / duration) * 100;
      this.elements.progress.value = percentage;
      this.elements.progressFill.style.width = `${percentage}%`;
    }
    
    this.elements.currentTime.textContent = this.formatTime(current);
  }

  onProgressChange() {
    const percentage = this.elements.progress.value;
    const duration = this.elements.audio.duration;
    
    if (duration) {
      this.elements.audio.currentTime = (percentage / 100) * duration;
      this.elements.progressFill.style.width = `${percentage}%`;
    }
  }

  onTrackEnded() {
    if (this.state.repeatMode === 'one') {
      this.elements.audio.currentTime = 0;
      this.elements.audio.play();
    } else if (this.state.repeatMode === 'all' || this.state.currentIndex < this.playlist.length - 1) {
      this.nextTrack();
    } else {
      this.state.isPlaying = false;
      this.elements.disc.classList.remove('spinning');
      this.updatePlayButton();
      this.updateStatus('Lecture terminée');
    }
  }

  onVolumeChange() {
    const volume = this.elements.volumeSlider.value / 100;
    this.elements.audio.volume = volume;
    this.state.volume = volume;
    this.state.isMuted = volume === 0;
    this.updateVolumeIcon();
    this.saveData();
  }

  toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    
    if (this.state.isMuted) {
      this.elements.audio.volume = 0;
      this.elements.volumeSlider.value = 0;
    } else {
      this.elements.audio.volume = this.state.volume;
      this.elements.volumeSlider.value = this.state.volume * 100;
    }
    
    this.updateVolumeIcon();
    this.saveData();
  }

  updatePlayButton() {
    if (this.state.isPlaying) {
      this.elements.playIcon.style.display = 'none';
      this.elements.pauseIcon.style.display = 'block';
    } else {
      this.elements.playIcon.style.display = 'block';
      this.elements.pauseIcon.style.display = 'none';
    }
  }

  updateVolumeIcon() {
    const volume = this.elements.audio.volume;
    if (volume === 0 || this.state.isMuted) {
      this.elements.volumeIcon.textContent = '🔇';
    } else if (volume < 0.5) {
      this.elements.volumeIcon.textContent = '🔉';
    } else {
      this.elements.volumeIcon.textContent = '🔊';
    }
  }

  updateStatus(message) {
    this.elements.statusDisplay.textContent = message;
  }

  onAudioError(error) {
    console.error('Audio error:', error);
    this.updateStatus('Erreur de lecture audio');
  }

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
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OceanMusicPlayer();
});

// Handle page visibility for audio context
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Resume audio context if needed
  }
});
