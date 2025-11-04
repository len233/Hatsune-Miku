/**
 * Advanced Modern Audio Player
 * ES6+ Modules, Web Audio API, Visualizer, PWA Features
 */

class ModernAudioPlayer {
  constructor() {
    // Configuration
    this.config = {
      storageKey: 'linjunjie-player-data',
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
      theme: 'dark'
    };

    // Playlist data
    this.playlist = [
      // Example tracks - update with your Lin Junjie files
      // { title: 'Song Title', artist: 'Lin Junjie', src: 'tracks/song.mp3', cover: 'tracks/cover.jpg', duration: 240 }
    ];

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
      'disc', 'coverImg', 'volumeSlider', 'muteBtn', 'themeToggle',
      'statusDisplay', 'playlistStats', 'visualizer', 'loadingScreen',
      'dropZone', 'fileInput', 'importBtn', 'clearBtn', 'shortcutsModal', 'closeShortcuts'
    ];

    ids.forEach(id => {
      this.elements[id] = document.getElementById(id);
    });

    // Additional elements
    this.elements.playIcon = document.getElementById('playIcon');
    this.elements.pauseIcon = document.getElementById('pauseIcon');
    this.elements.progressTrack = document.querySelector('.progress-track');
  }

  async init() {
    try {
      this.loadStoredData();
      this.setupEventListeners();
      this.setupKeyboardShortcuts();
      this.setupDragAndDrop();
      this.setupWebAudioAPI();
      this.applyTheme();
      this.buildPlaylistUI();
      this.loadTrack(this.state.currentIndex);
      this.hideLoadingScreen();
      this.updateStatus('Lecteur initialisé');
      
      // Register service worker for PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js');
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
        this.playlist = data.playlist || this.playlist;
      }
    } catch (error) {
      console.warn('Failed to load stored data:', error);
    }
  }

  saveData() {
    try {
      const data = {
        state: this.state,
        playlist: this.playlist,
        timestamp: Date.now()
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save data:', error);
    }
  }

  setupEventListeners() {
    // Playback controls
    this.elements.playBtn.addEventListener('click', () => this.togglePlay());
    this.elements.prevBtn.addEventListener('click', () => this.previousTrack());
    this.elements.nextBtn.addEventListener('click', () => this.nextTrack());
    this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
    this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());

    // Progress and volume
    this.elements.progress.addEventListener('input', (e) => this.seekTo(e.target.value));
    this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value / 100));
    this.elements.muteBtn.addEventListener('click', () => this.toggleMute());

    // Theme toggle
    this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

    // File operations
    this.elements.importBtn.addEventListener('click', () => this.elements.fileInput.click());
    this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelection(e.target.files));
    this.elements.clearBtn.addEventListener('click', () => this.clearPlaylist());

    // Audio events
    this.elements.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.elements.audio.addEventListener('loadedmetadata', () => this.updateDuration());
    this.elements.audio.addEventListener('play', () => this.onPlay());
    this.elements.audio.addEventListener('pause', () => this.onPause());
    this.elements.audio.addEventListener('ended', () => this.onTrackEnd());
    this.elements.audio.addEventListener('error', (e) => this.onError(e));

    // Disc interaction
    this.elements.disc.addEventListener('click', () => this.togglePlay());

    // Modal
    this.elements.closeShortcuts.addEventListener('click', () => this.hideModal());
    document.addEventListener('click', (e) => {
      if (e.target === this.elements.shortcutsModal) this.hideModal();
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'arrowleft':
          e.preventDefault();
          this.previousTrack();
          break;
        case 'arrowright':
          e.preventDefault();
          this.nextTrack();
          break;
        case 'arrowup':
          e.preventDefault();
          this.adjustVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          this.adjustVolume(-0.1);
          break;
        case 'm':
          this.toggleMute();
          break;
        case 's':
          this.toggleShuffle();
          break;
        case 'r':
          this.toggleRepeat();
          break;
        case '?':
          this.showModal();
          break;
        case 'escape':
          this.hideModal();
          break;
      }
    });
  }

  setupDragAndDrop() {
    const dropZone = this.elements.dropZone;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'));
    });

    dropZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      this.handleFileSelection(files);
    });
  }

  async setupWebAudioAPI() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Connect audio element to analyser
      if (!this.source) {
        this.source = this.audioContext.createMediaElementSource(this.elements.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
      }

      this.setupVisualizer();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  setupVisualizer() {
    const canvas = this.elements.visualizer;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!this.analyser || !this.state.isPlaying) {
        requestAnimationFrame(draw);
        return;
      }

      this.analyser.getByteFrequencyData(this.dataArray);

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      const barWidth = width / this.dataArray.length;
      let x = 0;

      for (let i = 0; i < this.dataArray.length; i++) {
        const barHeight = (this.dataArray[i] / 255) * height * 0.8;

        const hue = (i / this.dataArray.length) * 360;
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;

        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }

      requestAnimationFrame(draw);
    };

    draw();
  }

  async handleFileSelection(files) {
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    
    for (const file of audioFiles) {
      try {
        const track = await this.createTrackFromFile(file);
        this.playlist.push(track);
      } catch (error) {
        console.error('Error processing file:', file.name, error);
      }
    }

    if (audioFiles.length > 0) {
      this.buildPlaylistUI();
      this.updatePlaylistStats();
      this.saveData();
      this.updateStatus(`${audioFiles.length} fichier(s) ajouté(s)`);
    }
  }

  async createTrackFromFile(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      audio.addEventListener('loadedmetadata', () => {
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Lin Junjie',
          src: url,
          duration: audio.duration,
          size: file.size,
          type: file.type
        });
      });

      audio.addEventListener('error', () => {
        resolve({
          title: file.name.replace(/\.[^/.]+$/, ""),
          artist: 'Lin Junjie',
          src: url,
          duration: 0,
          size: file.size,
          type: file.type
        });
      });
    });
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  loadTrack(index) {
    if (!this.playlist.length) {
      this.elements.trackTitle.textContent = 'Aucune piste chargée';
      this.elements.trackArtist.textContent = '';
      this.elements.audio.removeAttribute('src');
      this.elements.coverImg.src = 'cover.png';
      return;
    }

    const track = this.playlist[index];
    this.state.currentIndex = index;

    this.elements.audio.src = track.src;
    this.elements.trackTitle.textContent = track.title || `Piste ${index + 1}`;
    this.elements.trackArtist.textContent = track.artist || 'Lin Junjie';
    this.elements.coverImg.src = track.cover || 'cover.png';

    // Update playlist UI
    document.querySelectorAll('.playlist li').forEach((li, i) => {
      li.classList.toggle('active', i === index);
    });

    this.updateStatus(`Chargé: ${track.title}`);
    this.saveData();
  }

  async togglePlay() {
    if (!this.elements.audio.src) return;

    try {
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.elements.audio.paused) {
        await this.elements.audio.play();
      } else {
        this.elements.audio.pause();
      }
    } catch (error) {
      console.error('Playback error:', error);
      this.updateStatus('Erreur de lecture');
    }
  }

  previousTrack() {
    if (!this.playlist.length) return;
    
    this.state.currentIndex = this.state.currentIndex === 0 
      ? this.playlist.length - 1 
      : this.state.currentIndex - 1;
    
    this.loadTrack(this.state.currentIndex);
    if (this.state.isPlaying) {
      this.elements.audio.play();
    }
  }

  nextTrack() {
    if (!this.playlist.length) return;
    
    if (this.state.isShuffled) {
      this.state.currentIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.state.currentIndex = (this.state.currentIndex + 1) % this.playlist.length;
    }
    
    this.loadTrack(this.state.currentIndex);
    if (this.state.isPlaying) {
      this.elements.audio.play();
    }
  }

  toggleShuffle() {
    this.state.isShuffled = !this.state.isShuffled;
    this.elements.shuffleBtn.setAttribute('aria-pressed', this.state.isShuffled);
    this.elements.shuffleBtn.classList.toggle('active', this.state.isShuffled);
    this.updateStatus(`Aléatoire: ${this.state.isShuffled ? 'activé' : 'désactivé'}`);
    this.saveData();
  }

  toggleRepeat() {
    const modes = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(this.state.repeatMode);
    this.state.repeatMode = modes[(currentIndex + 1) % modes.length];
    
    this.elements.repeatBtn.setAttribute('aria-pressed', this.state.repeatMode !== 'none');
    this.elements.repeatBtn.classList.toggle('active', this.state.repeatMode !== 'none');
    
    const modeText = { none: 'désactivé', all: 'playlist', one: 'piste' }[this.state.repeatMode];
    this.updateStatus(`Répéter: ${modeText}`);
    this.saveData();
  }

  seekTo(percent) {
    if (!this.elements.audio.duration) return;
    const time = (percent / 100) * this.elements.audio.duration;
    this.elements.audio.currentTime = time;
  }

  setVolume(volume) {
    this.state.volume = Math.max(0, Math.min(1, volume));
    this.elements.audio.volume = this.state.volume;
    this.elements.volumeSlider.value = this.state.volume * 100;
    this.saveData();
  }

  adjustVolume(delta) {
    this.setVolume(this.state.volume + delta);
  }

  toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    this.elements.audio.muted = this.state.isMuted;
    this.elements.muteBtn.classList.toggle('muted', this.state.isMuted);
    this.updateStatus(`Son: ${this.state.isMuted ? 'coupé' : 'activé'}`);
  }

  toggleTheme() {
    this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.saveData();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.state.theme);
    this.elements.themeToggle.textContent = this.state.theme === 'dark' ? '☀️' : '🌙';
  }

  clearPlaylist() {
    if (confirm('Êtes-vous sûr de vouloir vider la playlist ?')) {
      this.playlist = [];
      this.state.currentIndex = 0;
      this.elements.audio.pause();
      this.elements.audio.removeAttribute('src');
      this.buildPlaylistUI();
      this.loadTrack(0);
      this.saveData();
      this.updateStatus('Playlist vidée');
    }
  }

  buildPlaylistUI() {
    const playlistEl = this.elements.playlist;
    playlistEl.innerHTML = '';

    if (this.playlist.length === 0) {
      playlistEl.innerHTML = '<li class="empty">Aucune piste dans la playlist</li>';
      return;
    }

    this.playlist.forEach((track, index) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('tabindex', '0');
      
      li.innerHTML = `
        <div class="track-info">
          <div class="track-name">${track.title}</div>
          <div class="track-meta">${track.artist} • ${this.formatTime(track.duration)}</div>
        </div>
        <button class="remove-btn" title="Supprimer">×</button>
      `;

      li.addEventListener('click', (e) => {
        if (!e.target.classList.contains('remove-btn')) {
          this.state.currentIndex = index;
          this.loadTrack(index);
          this.elements.audio.play();
        }
      });

      li.querySelector('.remove-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeTrack(index);
      });

      playlistEl.appendChild(li);
    });

    this.updatePlaylistStats();
  }

  removeTrack(index) {
    this.playlist.splice(index, 1);
    
    if (index === this.state.currentIndex) {
      this.state.currentIndex = Math.min(this.state.currentIndex, this.playlist.length - 1);
      this.loadTrack(this.state.currentIndex);
    } else if (index < this.state.currentIndex) {
      this.state.currentIndex--;
    }

    this.buildPlaylistUI();
    this.saveData();
  }

  updatePlaylistStats() {
    const totalDuration = this.playlist.reduce((sum, track) => sum + (track.duration || 0), 0);
    const statsText = `${this.playlist.length} piste${this.playlist.length !== 1 ? 's' : ''} • ${this.formatTime(totalDuration)}`;
    this.elements.playlistStats.textContent = statsText;
  }

  updateProgress() {
    const { currentTime, duration } = this.elements.audio;
    if (!duration) return;

    const percent = (currentTime / duration) * 100;
    this.elements.progress.value = percent;
    this.elements.progressTrack.style.width = `${percent}%`;
    this.elements.currentTime.textContent = this.formatTime(currentTime);
  }

  updateDuration() {
    const { duration } = this.elements.audio;
    this.elements.duration.textContent = this.formatTime(duration);
  }

  onPlay() {
    this.state.isPlaying = true;
    this.elements.playIcon.style.display = 'none';
    this.elements.pauseIcon.style.display = 'block';
    this.elements.disc.classList.add('playing');
    this.updateStatus('Lecture en cours...');
  }

  onPause() {
    this.state.isPlaying = false;
    this.elements.playIcon.style.display = 'block';
    this.elements.pauseIcon.style.display = 'none';
    this.elements.disc.classList.remove('playing');
    this.updateStatus('Lecture en pause');
  }

  onTrackEnd() {
    if (this.state.repeatMode === 'one') {
      this.elements.audio.currentTime = 0;
      this.elements.audio.play();
    } else if (this.state.repeatMode === 'all' || this.state.currentIndex < this.playlist.length - 1) {
      this.nextTrack();
    } else {
      this.updateStatus('Playlist terminée');
    }
  }

  onError(error) {
    console.error('Audio error:', error);
    this.updateStatus('Erreur de lecture audio');
  }

  updateStatus(message) {
    this.elements.statusDisplay.textContent = message;
    setTimeout(() => {
      this.elements.statusDisplay.textContent = 'Prêt à jouer';
    }, 3000);
  }

  showModal() {
    this.elements.shortcutsModal.setAttribute('aria-hidden', 'false');
  }

  hideModal() {
    this.elements.shortcutsModal.setAttribute('aria-hidden', 'true');
  }

  hideLoadingScreen() {
    setTimeout(() => {
      this.elements.loadingScreen.classList.add('hidden');
    }, 1000);
  }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.audioPlayer = new ModernAudioPlayer();
});

// Export for module usage
export default ModernAudioPlayer;
