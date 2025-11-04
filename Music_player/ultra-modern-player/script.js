/**
 * Ultra Modern Music Player
 * Advanced JavaScript with ES2023+ features, Web Components, and modern APIs
 */

// Modern utility functions with advanced JavaScript features
class AudioProcessor {
  static #instance = null;
  
  static getInstance() {
    if (!AudioProcessor.#instance) {
      AudioProcessor.#instance = new AudioProcessor();
    }
    return AudioProcessor.#instance;
  }
  
  #audioContext = null;
  #analyser = null;
  
  async initializeAudioContext() {
    try {
      this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.#analyser = this.#audioContext.createAnalyser();
      this.#analyser.fftSize = 256;
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }
  
  connectSource(audioElement) {
    if (!this.#audioContext || !this.#analyser) return null;
    
    try {
      const source = this.#audioContext.createMediaElementSource(audioElement);
      source.connect(this.#analyser);
      this.#analyser.connect(this.#audioContext.destination);
      return this.#analyser;
    } catch (error) {
      console.error('Failed to connect audio source:', error);
      return null;
    }
  }
  
  resumeContext() {
    if (this.#audioContext?.state === 'suspended') {
      return this.#audioContext.resume();
    }
  }
}

// Modern notification system with Web Components
class NotificationSystem extends HTMLElement {
  #notifications = new Map();
  #container = null;
  
  connectedCallback() {
    this.#container = document.getElementById('notificationContainer');
  }
  
  show(message, type = 'info', duration = 4000) {
    const id = crypto.randomUUID();
    const notification = this.#createNotification(id, message, type);
    
    this.#container.appendChild(notification);
    this.#notifications.set(id, notification);
    
    // Auto-remove after duration
    setTimeout(() => this.remove(id), duration);
    
    return id;
  }
  
  #createNotification(id, message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.dataset.id = id;
    
    notification.innerHTML = `
      <div class="notification-content">
        <p>${message}</p>
        <button class="notification-close" onclick="notificationSystem.remove('${id}')">×</button>
      </div>
    `;
    
    return notification;
  }
  
  remove(id) {
    const notification = this.#notifications.get(id);
    if (notification) {
      notification.style.animation = 'slideOut 250ms forwards';
      setTimeout(() => {
        notification.remove();
        this.#notifications.delete(id);
      }, 250);
    }
  }
}

// Particle animation system
class ParticleSystem {
  #canvas = null;
  #ctx = null;
  #particles = [];
  #animationId = null;
  
  constructor(canvas) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext('2d');
    this.#setupCanvas();
    this.#createParticles();
    this.#startAnimation();
  }
  
  #setupCanvas() {
    const updateCanvasSize = () => {
      this.#canvas.width = window.innerWidth;
      this.#canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
  }
  
  #createParticles() {
    const particleCount = Math.min(50, Math.floor((this.#canvas.width * this.#canvas.height) / 15000));
    
    for (let i = 0; i < particleCount; i++) {
      this.#particles.push({
        x: Math.random() * this.#canvas.width,
        y: Math.random() * this.#canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() * 60 + 300 // Purple to pink range
      });
    }
  }
  
  #updateParticles() {
    this.#particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.#canvas.width;
      if (particle.x > this.#canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.#canvas.height;
      if (particle.y > this.#canvas.height) particle.y = 0;
      
      // Subtle opacity animation
      particle.opacity += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.002;
      particle.opacity = Math.max(0.1, Math.min(0.6, particle.opacity));
    });
  }
  
  #drawParticles() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    
    this.#particles.forEach(particle => {
      this.#ctx.beginPath();
      this.#ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.#ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
      this.#ctx.fill();
    });
  }
  
  #startAnimation() {
    const animate = () => {
      this.#updateParticles();
      this.#drawParticles();
      this.#animationId = requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  destroy() {
    if (this.#animationId) {
      cancelAnimationFrame(this.#animationId);
    }
  }
}

// Main application class with modern JavaScript features
class UltraModernMusicPlayer {
  // Private fields
  #state = {
    currentIndex: 0,
    isPlaying: false,
    isShuffled: false,
    repeatMode: 'none', // 'none' | 'one' | 'all'
    volume: 0.7,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    isLoading: false
  };
  
  #playlist = [];
  #audioProcessor = null;
  #particleSystem = null;
  #elements = new Map();
  #eventAbortController = new AbortController();
  
  // Storage keys
  static #STORAGE_KEY = 'ultra-modern-player-state';
  static #PLAYLIST_KEY = 'ultra-modern-player-playlist';
  
  constructor() {
    this.#initializeApp();
  }
  
  async #initializeApp() {
    try {
      await this.#loadStoredData();
      this.#bindElements();
      this.#setupEventListeners();
      this.#initializeAudio();
      await this.#initializeParticles();
      
      // Hide loading screen with modern timing
      await new Promise(resolve => setTimeout(resolve, 1500));
      await this.#hideLoadingScreen();
      
      this.#updateUI();
      notificationSystem.show('Ultra Modern Player initialisé', 'success');
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      notificationSystem.show('Erreur d\'initialisation', 'error');
    }
  }
  
  #bindElements() {
    // Using modern Map for better performance
    const elementSelectors = new Map([
      ['loadingScreen', '#loadingScreen'],
      ['fileInput', '#fileInput'],
      ['searchInput', '#searchInput'],
      ['importBtn', '#importBtn'],
      ['audioElement', '#audioElement'],
      ['currentArtwork', '#currentArtwork'],
      ['currentTitle', '#currentTitle'],
      ['currentArtist', '#currentArtist'],
      ['mainPlayBtn', '#mainPlayBtn'],
      ['artworkPlayBtn', '#artworkPlayBtn'],
      ['prevBtn', '#prevBtn'],
      ['nextBtn', '#nextBtn'],
      ['shuffleBtn', '#shuffleBtn'],
      ['repeatBtn', '#repeatBtn'],
      ['favoriteBtn', '#favoriteBtn'],
      ['progressSlider', '#progressSlider'],
      ['progressFill', '#progressFill'],
      ['progressThumb', '#progressThumb'],
      ['currentTime', '#currentTime'],
      ['totalTime', '#totalTime'],
      ['volumeSlider', '#volumeSlider'],
      ['volumeFill', '#volumeFill'],
      ['muteBtn', '#muteBtn'],
      ['tracksContainer', '#tracksContainer'],
      ['dropZone', '#dropZone'],
      ['particleCanvas', '#particleCanvas']
    ]);
    
    for (const [key, selector] of elementSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.#elements.set(key, element);
      } else {
        console.warn(`Element not found: ${selector}`);
      }
    }
  }
  
  #setupEventListeners() {
    const { signal } = this.#eventAbortController;
    
    // File import
    this.#elements.get('importBtn')?.addEventListener('click', () => {
      this.#elements.get('fileInput')?.click();
    }, { signal });
    
    this.#elements.get('fileInput')?.addEventListener('change', (e) => {
      this.#handleFileImport(e);
    }, { signal });
    
    // Audio events
    const audioElement = this.#elements.get('audioElement');
    audioElement?.addEventListener('loadedmetadata', () => this.#onLoadedMetadata(), { signal });
    audioElement?.addEventListener('timeupdate', () => this.#onTimeUpdate(), { signal });
    audioElement?.addEventListener('ended', () => this.#onTrackEnded(), { signal });
    audioElement?.addEventListener('error', (e) => this.#onAudioError(e), { signal });
    
    // Control buttons
    this.#elements.get('mainPlayBtn')?.addEventListener('click', () => this.#togglePlay(), { signal });
    this.#elements.get('artworkPlayBtn')?.addEventListener('click', () => this.#togglePlay(), { signal });
    this.#elements.get('prevBtn')?.addEventListener('click', () => this.#previousTrack(), { signal });
    this.#elements.get('nextBtn')?.addEventListener('click', () => this.#nextTrack(), { signal });
    this.#elements.get('shuffleBtn')?.addEventListener('click', () => this.#toggleShuffle(), { signal });
    this.#elements.get('repeatBtn')?.addEventListener('click', () => this.#toggleRepeat(), { signal });
    
    // Progress control
    this.#elements.get('progressSlider')?.addEventListener('input', (e) => {
      this.#seekTo(parseFloat(e.target.value) / 100);
    }, { signal });
    
    // Volume control
    this.#elements.get('volumeSlider')?.addEventListener('input', (e) => {
      this.#setVolume(parseFloat(e.target.value) / 100);
    }, { signal });
    
    this.#elements.get('muteBtn')?.addEventListener('click', () => this.#toggleMute(), { signal });
    
    // Drag and drop
    this.#setupDragAndDrop();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.#handleKeyboardShortcuts(e), { signal });
    
    // Search functionality
    this.#elements.get('searchInput')?.addEventListener('input', (e) => {
      this.#handleSearch(e.target.value);
    }, { signal });
  }
  
  #setupDragAndDrop() {
    const { signal } = this.#eventAbortController;
    const dropZone = this.#elements.get('dropZone');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { signal });
    });
    
    // Show drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
      document.addEventListener(eventName, () => {
        dropZone?.classList.add('active');
      }, { signal });
    });
    
    // Hide drop zone
    ['dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        // Only hide if leaving the document
        if (!e.relatedTarget || !document.contains(e.relatedTarget)) {
          dropZone?.classList.remove('active');
        }
      }, { signal });
    });
    
    // Handle file drop
    document.addEventListener('drop', async (e) => {
      const files = Array.from(e.dataTransfer.files);
      await this.#processFiles(files);
    }, { signal });
  }
  
  async #handleFileImport(event) {
    const files = Array.from(event.target.files);
    await this.#processFiles(files);
    // Reset input
    event.target.value = '';
  }
  
  async #processFiles(files) {
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      notificationSystem.show('Aucun fichier audio trouvé', 'warning');
      return;
    }
    
    this.#state.isLoading = true;
    this.#updateLoadingState();
    
    try {
      const newTracks = await Promise.all(
        audioFiles.map(file => this.#createTrackFromFile(file))
      );
      
      this.#playlist.push(...newTracks);
      await this.#savePlaylist();
      this.#updateTracksView();
      
      // Load first track if playlist was empty
      if (this.#playlist.length === newTracks.length) {
        this.#loadTrack(0);
      }
      
      notificationSystem.show(
        `${audioFiles.length} piste(s) ajoutée(s)`,
        'success'
      );
      
    } catch (error) {
      console.error('Error processing files:', error);
      notificationSystem.show('Erreur lors du traitement des fichiers', 'error');
    } finally {
      this.#state.isLoading = false;
      this.#updateLoadingState();
    }
  }
  
  async #createTrackFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoad);
        audio.removeEventListener('error', onError);
      };
      
      const onLoad = () => {
        cleanup();
        resolve({
          id: crypto.randomUUID(),
          title: this.#extractTitle(file.name),
          artist: this.#extractArtist(file.name),
          duration: audio.duration || 0,
          src: url,
          file,
          size: file.size,
          type: file.type,
          addedAt: new Date().toISOString(),
          playCount: 0,
          isFavorite: false
        });
      };
      
      const onError = () => {
        cleanup();
        reject(new Error(`Failed to load audio file: ${file.name}`));
      };
      
      audio.addEventListener('loadedmetadata', onLoad);
      audio.addEventListener('error', onError);
    });
  }
  
  #extractTitle(filename) {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/^\d+[\s.-]*/, '') // Remove track numbers
      .replace(/[-_]/g, ' ') // Replace separators with spaces
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim() || 'Unknown Track';
  }
  
  #extractArtist(filename) {
    const match = filename.match(/^(.+?)\s*[-–]\s*(.+)/);
    return match ? match[1].trim() : 'Unknown Artist';
  }
  
  async #initializeAudio() {
    this.#audioProcessor = AudioProcessor.getInstance();
    await this.#audioProcessor.initializeAudioContext();
  }
  
  async #initializeParticles() {
    const canvas = this.#elements.get('particleCanvas');
    if (canvas) {
      this.#particleSystem = new ParticleSystem(canvas);
    }
  }
  
  async #hideLoadingScreen() {
    const loadingScreen = this.#elements.get('loadingScreen');
    loadingScreen?.classList.add('hidden');
    
    // Wait for transition to complete
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  #loadTrack(index) {
    if (index < 0 || index >= this.#playlist.length) return;
    
    const track = this.#playlist[index];
    const audioElement = this.#elements.get('audioElement');
    
    this.#state.currentIndex = index;
    audioElement.src = track.src;
    
    // Update UI
    this.#elements.get('currentTitle').textContent = track.title;
    this.#elements.get('currentArtist').textContent = track.artist;
    
    // Update play count
    track.playCount++;
    this.#savePlaylist();
    
    this.#updateTracksView();
    this.#saveState();
  }
  
  async #togglePlay() {
    if (this.#playlist.length === 0) {
      notificationSystem.show('Aucune piste disponible', 'warning');
      return;
    }
    
    const audioElement = this.#elements.get('audioElement');
    
    try {
      if (this.#state.isPlaying) {
        audioElement.pause();
        this.#state.isPlaying = false;
      } else {
        await this.#audioProcessor.resumeContext();
        await audioElement.play();
        this.#state.isPlaying = true;
      }
      
      this.#updatePlayButton();
      this.#saveState();
      
    } catch (error) {
      console.error('Playback error:', error);
      notificationSystem.show('Erreur de lecture', 'error');
    }
  }
  
  #previousTrack() {
    if (this.#playlist.length === 0) return;
    
    let newIndex = this.#state.currentIndex - 1;
    if (newIndex < 0) {
      newIndex = this.#playlist.length - 1;
    }
    
    this.#loadTrack(newIndex);
    
    if (this.#state.isPlaying) {
      this.#elements.get('audioElement').play();
    }
  }
  
  #nextTrack() {
    if (this.#playlist.length === 0) return;
    
    let newIndex;
    
    if (this.#state.isShuffled) {
      // Smart shuffle: avoid recently played tracks
      const recentTracks = this.#playlist
        .map((track, index) => ({ index, lastPlayed: track.lastPlayed || 0 }))
        .sort((a, b) => b.lastPlayed - a.lastPlayed)
        .slice(0, Math.min(5, this.#playlist.length - 1))
        .map(item => item.index);
      
      const availableIndexes = Array.from({ length: this.#playlist.length }, (_, i) => i)
        .filter(i => i !== this.#state.currentIndex && !recentTracks.includes(i));
      
      newIndex = availableIndexes.length > 0 
        ? availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
        : (this.#state.currentIndex + 1) % this.#playlist.length;
    } else {
      newIndex = (this.#state.currentIndex + 1) % this.#playlist.length;
    }
    
    // Mark current track as last played
    this.#playlist[this.#state.currentIndex].lastPlayed = Date.now();
    
    this.#loadTrack(newIndex);
    
    if (this.#state.isPlaying) {
      this.#elements.get('audioElement').play();
    }
  }
  
  #toggleShuffle() {
    this.#state.isShuffled = !this.#state.isShuffled;
    this.#elements.get('shuffleBtn')?.classList.toggle('active', this.#state.isShuffled);
    
    notificationSystem.show(
      this.#state.isShuffled ? 'Lecture aléatoire activée' : 'Lecture aléatoire désactivée',
      'info'
    );
    
    this.#saveState();
  }
  
  #toggleRepeat() {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(this.#state.repeatMode);
    this.#state.repeatMode = modes[(currentIndex + 1) % modes.length];
    
    this.#elements.get('repeatBtn')?.classList.toggle('active', this.#state.repeatMode !== 'none');
    
    const messages = {
      none: 'Répétition désactivée',
      one: 'Répéter la piste',
      all: 'Répéter la playlist'
    };
    
    notificationSystem.show(messages[this.#state.repeatMode], 'info');
    this.#saveState();
  }
  
  #seekTo(percentage) {
    const audioElement = this.#elements.get('audioElement');
    if (audioElement.duration) {
      audioElement.currentTime = percentage * audioElement.duration;
    }
  }
  
  #setVolume(volume) {
    this.#state.volume = Math.max(0, Math.min(1, volume));
    this.#state.isMuted = this.#state.volume === 0;
    
    const audioElement = this.#elements.get('audioElement');
    audioElement.volume = this.#state.volume;
    
    this.#updateVolumeUI();
    this.#saveState();
  }
  
  #toggleMute() {
    if (this.#state.isMuted) {
      this.#setVolume(this.#state.volume > 0 ? this.#state.volume : 0.7);
    } else {
      this.#state.isMuted = true;
      this.#elements.get('audioElement').volume = 0;
      this.#updateVolumeUI();
      this.#saveState();
    }
  }
  
  #handleKeyboardShortcuts(event) {
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT') return;
    
    const shortcuts = {
      Space: () => this.#togglePlay(),
      ArrowLeft: () => this.#previousTrack(),
      ArrowRight: () => this.#nextTrack(),
      KeyM: () => this.#toggleMute(),
      KeyS: () => this.#toggleShuffle(),
      KeyR: () => this.#toggleRepeat(),
      KeyI: () => this.#elements.get('fileInput')?.click()
    };
    
    const handler = shortcuts[event.code];
    if (handler) {
      event.preventDefault();
      handler();
    }
  }
  
  #handleSearch(query) {
    // Implement search functionality
    const filteredTracks = this.#playlist.filter(track =>
      track.title.toLowerCase().includes(query.toLowerCase()) ||
      track.artist.toLowerCase().includes(query.toLowerCase())
    );
    
    this.#updateTracksView(filteredTracks);
  }
  
  // Event handlers
  #onLoadedMetadata() {
    const audioElement = this.#elements.get('audioElement');
    this.#state.duration = audioElement.duration;
    this.#elements.get('totalTime').textContent = this.#formatTime(audioElement.duration);
    
    // Connect audio source for visualization
    this.#audioProcessor.connectSource(audioElement);
  }
  
  #onTimeUpdate() {
    const audioElement = this.#elements.get('audioElement');
    this.#state.currentTime = audioElement.currentTime;
    
    this.#elements.get('currentTime').textContent = this.#formatTime(audioElement.currentTime);
    
    if (audioElement.duration) {
      const percentage = (audioElement.currentTime / audioElement.duration) * 100;
      this.#elements.get('progressFill').style.width = `${percentage}%`;
      this.#elements.get('progressThumb').style.left = `${percentage}%`;
      this.#elements.get('progressSlider').value = percentage;
    }
  }
  
  #onTrackEnded() {
    if (this.#state.repeatMode === 'one') {
      this.#elements.get('audioElement').currentTime = 0;
      this.#elements.get('audioElement').play();
    } else if (this.#state.repeatMode === 'all' || this.#state.currentIndex < this.#playlist.length - 1) {
      this.#nextTrack();
    } else {
      this.#state.isPlaying = false;
      this.#updatePlayButton();
    }
  }
  
  #onAudioError(error) {
    console.error('Audio error:', error);
    notificationSystem.show('Erreur de lecture audio', 'error');
  }
  
  // UI update methods
  #updateUI() {
    this.#updatePlayButton();
    this.#updateVolumeUI();
    this.#updateControlButtons();
    this.#updateTracksView();
  }
  
  #updatePlayButton() {
    const buttons = [
      this.#elements.get('mainPlayBtn'),
      this.#elements.get('artworkPlayBtn')
    ];
    
    buttons.forEach(button => {
      if (!button) return;
      
      const playIcon = button.querySelector('.play-icon');
      const pauseIcon = button.querySelector('.pause-icon');
      
      if (this.#state.isPlaying) {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    });
  }
  
  #updateVolumeUI() {
    const volumeFill = this.#elements.get('volumeFill');
    const volumeSlider = this.#elements.get('volumeSlider');
    const muteBtn = this.#elements.get('muteBtn');
    
    const displayVolume = this.#state.isMuted ? 0 : this.#state.volume;
    
    volumeFill.style.width = `${displayVolume * 100}%`;
    volumeSlider.value = displayVolume * 100;
    
    // Update mute button icon
    const highIcon = muteBtn.querySelector('.volume-high');
    const mutedIcon = muteBtn.querySelector('.volume-muted');
    
    if (this.#state.isMuted || displayVolume === 0) {
      highIcon.style.display = 'none';
      mutedIcon.style.display = 'block';
    } else {
      highIcon.style.display = 'block';
      mutedIcon.style.display = 'none';
    }
  }
  
  #updateControlButtons() {
    this.#elements.get('shuffleBtn')?.classList.toggle('active', this.#state.isShuffled);
    this.#elements.get('repeatBtn')?.classList.toggle('active', this.#state.repeatMode !== 'none');
  }
  
  #updateTracksView(tracks = this.#playlist) {
    const container = this.#elements.get('tracksContainer');
    
    if (tracks.length === 0) {
      container.innerHTML = `
        <div class="empty-library">
          <div class="empty-illustration">
            <svg viewBox="0 0 120 120" fill="none">
              <circle cx="60" cy="60" r="50" stroke="currentColor" stroke-width="2" opacity="0.3"/>
              <circle cx="60" cy="60" r="30" stroke="currentColor" stroke-width="2" opacity="0.5"/>
              <circle cx="60" cy="60" r="10" fill="currentColor" opacity="0.7"/>
            </svg>
          </div>
          <h3>Votre bibliothèque est vide</h3>
          <p>Commencez par importer votre musique préférée</p>
          <button class="cta-btn" onclick="document.getElementById('fileInput').click()">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
            </svg>
            Importer de la musique
          </button>
        </div>
      `;
      return;
    }
    
    // Create tracks list
    container.innerHTML = `
      <div class="tracks-list">
        ${tracks.map((track, index) => `
          <div class="track-item ${index === this.#state.currentIndex ? 'active' : ''}" 
               data-index="${this.#playlist.indexOf(track)}">
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
              <h4 class="track-title">${track.title}</h4>
              <p class="track-artist">${track.artist}</p>
            </div>
            <div class="track-duration">${this.#formatTime(track.duration)}</div>
            <div class="track-actions">
              <button class="action-btn favorite-btn ${track.isFavorite ? 'active' : ''}" 
                      onclick="player.toggleFavorite('${track.id}')">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Add click handlers
    container.querySelectorAll('.track-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.track-actions')) {
          const index = parseInt(item.dataset.index);
          this.#loadTrack(index);
          if (!this.#state.isPlaying) {
            this.#togglePlay();
          }
        }
      });
    });
  }
  
  #updateLoadingState() {
    // Update UI loading indicators
    const importBtn = this.#elements.get('importBtn');
    if (this.#state.isLoading) {
      importBtn?.classList.add('loading');
    } else {
      importBtn?.classList.remove('loading');
    }
  }
  
  // Utility methods
  #formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // Storage methods
  async #saveState() {
    try {
      const stateData = {
        currentIndex: this.#state.currentIndex,
        isShuffled: this.#state.isShuffled,
        repeatMode: this.#state.repeatMode,
        volume: this.#state.volume,
        isMuted: this.#state.isMuted
      };
      
      localStorage.setItem(UltraModernMusicPlayer.#STORAGE_KEY, JSON.stringify(stateData));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }
  
  async #savePlaylist() {
    try {
      // Only save metadata, not file objects
      const playlistData = this.#playlist.map(track => ({
        ...track,
        file: undefined, // Don't serialize file objects
        src: undefined   // Don't serialize blob URLs
      }));
      
      localStorage.setItem(UltraModernMusicPlayer.#PLAYLIST_KEY, JSON.stringify(playlistData));
    } catch (error) {
      console.error('Failed to save playlist:', error);
    }
  }
  
  async #loadStoredData() {
    try {
      // Load state
      const stateData = localStorage.getItem(UltraModernMusicPlayer.#STORAGE_KEY);
      if (stateData) {
        const parsedState = JSON.parse(stateData);
        Object.assign(this.#state, parsedState);
      }
      
      // Note: We don't restore playlist from storage in this version
      // as file objects and blob URLs don't persist across sessions
      // This could be enhanced with IndexedDB for file storage
      
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  }
  
  // Public methods
  toggleFavorite(trackId) {
    const track = this.#playlist.find(t => t.id === trackId);
    if (track) {
      track.isFavorite = !track.isFavorite;
      this.#savePlaylist();
      this.#updateTracksView();
      
      notificationSystem.show(
        track.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
        'success'
      );
    }
  }
  
  // Cleanup
  destroy() {
    this.#eventAbortController.abort();
    this.#particleSystem?.destroy();
    
    // Revoke all blob URLs
    this.#playlist.forEach(track => {
      if (track.src?.startsWith('blob:')) {
        URL.revokeObjectURL(track.src);
      }
    });
  }
}

// Initialize custom elements
customElements.define('notification-system', NotificationSystem);

// Global instances
let player;
let notificationSystem;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  notificationSystem = new NotificationSystem();
  player = new UltraModernMusicPlayer();
  
  // Expose player globally for debugging
  window.player = player;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  player?.destroy();
});
