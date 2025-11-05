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

// Advanced Lyrics Engine
class LyricsEngine {
  #currentLyrics = [];
  #isEditing = false;
  #syncedLyrics = new Map();
  
  constructor() {
    this.bindEvents();
  }
  
  bindEvents() {
    // Lyrics modal events
    document.getElementById('lyricsBtn')?.addEventListener('click', () => this.openLyricsModal());
    document.getElementById('editLyricsBtn')?.addEventListener('click', () => this.toggleEdit());
    document.getElementById('autoSyncBtn')?.addEventListener('click', () => this.autoSync());
    document.getElementById('saveLyricsBtn')?.addEventListener('click', () => this.saveLyrics());
    document.getElementById('cancelEditBtn')?.addEventListener('click', () => this.cancelEdit());
    document.getElementById('addLyricsBtn')?.addEventListener('click', () => this.startEditing());
  }
  
  openLyricsModal() {
    document.getElementById('lyricsModal').style.display = 'flex';
    this.displayLyrics();
  }
  
  displayLyrics() {
    const container = document.getElementById('lyricsDisplay');
    const editor = document.getElementById('lyricsEditor');
    
    if (this.#currentLyrics.length === 0) {
      container.innerHTML = `
        <div class="no-lyrics">
          <div class="no-lyrics-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <h3>Aucunes paroles disponibles</h3>
          <p>Ajoutez des paroles synchronisées pour améliorer votre expérience d'écoute</p>
          <button class="add-lyrics-btn" id="addLyricsBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Ajouter des paroles
          </button>
        </div>
      `;
    } else {
      container.innerHTML = this.#currentLyrics.map((line, index) => 
        `<div class="lyrics-line" data-index="${index}" data-time="${line.time || 0}">
          ${line.text}
        </div>`
      ).join('');
      
      // Add click events for time sync
      container.querySelectorAll('.lyrics-line').forEach(line => {
        line.addEventListener('click', (e) => this.seekToLine(e.target));
      });
    }
    
    container.style.display = this.#isEditing ? 'none' : 'block';
    editor.style.display = this.#isEditing ? 'flex' : 'none';
  }
  
  toggleEdit() {
    this.#isEditing = !this.#isEditing;
    if (this.#isEditing) {
      const textarea = document.getElementById('lyricsTextarea');
      textarea.value = this.#currentLyrics.map(line => line.text).join('\n');
    }
    this.displayLyrics();
  }
  
  startEditing() {
    this.#isEditing = true;
    this.displayLyrics();
  }
  
  saveLyrics() {
    const textarea = document.getElementById('lyricsTextarea');
    const lines = textarea.value.split('\n').filter(line => line.trim());
    this.#currentLyrics = lines.map(text => ({ text, time: null }));
    this.#isEditing = false;
    this.displayLyrics();
  }
  
  cancelEdit() {
    this.#isEditing = false;
    this.displayLyrics();
  }
  
  autoSync() {
    // Simulate auto sync (would integrate with actual audio analysis)
    console.log('🎵 Auto-synchronizing lyrics...');
    // Implementation would analyze audio and match lyrics timing
  }
  
  seekToLine(lineElement) {
    const time = parseFloat(lineElement.dataset.time || 0);
    // Would trigger player to seek to this time
    console.log('⏱️ Seeking to:', time);
  }
  
  updateCurrentLine(currentTime) {
    document.querySelectorAll('.lyrics-line').forEach(line => {
      const time = parseFloat(line.dataset.time || 0);
      if (Math.abs(currentTime - time) < 2) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    });
  }
}

// Advanced Recording Engine
class RecordingEngine {
  #mediaRecorder = null;
  #audioStream = null;
  #recordedChunks = [];
  #isRecording = false;
  #startTime = null;
  #visualizer = null;
  
  constructor() {
    this.bindEvents();
    this.setupVisualizer();
  }
  
  bindEvents() {
    document.getElementById('recordBtn')?.addEventListener('click', () => this.openRecordModal());
    document.getElementById('startRecordBtn')?.addEventListener('click', () => this.startRecording());
    document.getElementById('pauseRecordBtn')?.addEventListener('click', () => this.pauseRecording());
    document.getElementById('stopRecordBtn')?.addEventListener('click', () => this.stopRecording());
    document.getElementById('downloadRecordBtn')?.addEventListener('click', () => this.downloadRecording());
  }
  
  openRecordModal() {
    document.getElementById('recordModal').style.display = 'flex';
    this.requestMicrophoneAccess();
  }
  
  async requestMicrophoneAccess() {
    try {
      this.#audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      this.setupMediaRecorder();
      this.startVisualizer();
    } catch (error) {
      console.error('Microphone access denied:', error);
    }
  }
  
  setupMediaRecorder() {
    const options = {
      mimeType: 'audio/webm;codecs=opus',
      audioBitsPerSecond: 128000
    };
    
    this.#mediaRecorder = new MediaRecorder(this.#audioStream, options);
    
    this.#mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.#recordedChunks.push(event.data);
      }
    };
    
    this.#mediaRecorder.onstop = () => {
      this.createRecordingBlob();
    };
  }
  
  setupVisualizer() {
    const canvas = document.getElementById('recordCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    this.#visualizer = { canvas, ctx };
  }
  
  startRecording() {
    if (!this.#mediaRecorder) return;
    
    this.#recordedChunks = [];
    this.#mediaRecorder.start(100);
    this.#isRecording = true;
    this.#startTime = Date.now();
    
    this.updateRecordingUI();
    this.startTimer();
  }
  
  pauseRecording() {
    if (this.#mediaRecorder && this.#isRecording) {
      this.#mediaRecorder.pause();
      this.#isRecording = false;
      this.updateRecordingUI();
    }
  }
  
  stopRecording() {
    if (this.#mediaRecorder) {
      this.#mediaRecorder.stop();
      this.#isRecording = false;
      this.updateRecordingUI();
    }
  }
  
  updateRecordingUI() {
    const status = document.getElementById('recordStatus');
    const startBtn = document.getElementById('startRecordBtn');
    const pauseBtn = document.getElementById('pauseRecordBtn');
    const stopBtn = document.getElementById('stopRecordBtn');
    
    if (this.#isRecording) {
      status.textContent = 'Enregistrement...';
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    } else {
      status.textContent = 'En pause';
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = false;
    }
  }
  
  startTimer() {
    const updateTime = () => {
      if (this.#isRecording && this.#startTime) {
        const elapsed = Date.now() - this.#startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        document.getElementById('recordTime').textContent = 
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.#isRecording) {
          requestAnimationFrame(updateTime);
        }
      }
    };
    requestAnimationFrame(updateTime);
  }
  
  startVisualizer() {
    if (!this.#audioStream || !this.#visualizer) return;
    
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(this.#audioStream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      const { canvas, ctx } = this.#visualizer;
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth;
      }
      
      requestAnimationFrame(draw);
    };
    
    draw();
  }
  
  createRecordingBlob() {
    const blob = new Blob(this.#recordedChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    
    // Enable download button
    const downloadBtn = document.getElementById('downloadRecordBtn');
    downloadBtn.disabled = false;
    downloadBtn.onclick = () => {
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
    };
  }
}

// AI Music Assistant
class AIAssistant {
  #conversationHistory = [];
  #musicDatabase = [];
  
  constructor() {
    this.bindEvents();
    this.initializeDatabase();
  }
  
  bindEvents() {
    document.getElementById('aiBtn')?.addEventListener('click', () => this.openAIModal());
    document.getElementById('aiSendBtn')?.addEventListener('click', () => this.sendMessage());
    document.getElementById('aiInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Suggestion buttons
    document.querySelectorAll('.ai-suggestion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleSuggestion(e.target.textContent));
    });
  }
  
  openAIModal() {
    document.getElementById('aiModal').style.display = 'flex';
    this.displayWelcomeMessage();
  }
  
  displayWelcomeMessage() {
    if (this.#conversationHistory.length === 0) {
      this.addMessage('ai', `Bonjour ! Je suis votre assistant musical intelligent. Je peux vous aider à :
      
      • Découvrir de nouveaux artistes et genres
      • Créer des playlists personnalisées  
      • Analyser votre musique préférée
      • Recommander des morceaux similaires
      • Expliquer les techniques musicales
      
      Comment puis-je vous aider aujourd'hui ?`);
    }
  }
  
  async sendMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    if (!message) return;
    
    this.addMessage('user', message);
    input.value = '';
    
    // Simulate AI thinking
    this.addMessage('ai', 'Je réfléchis...', true);
    
    setTimeout(() => {
      this.removeLastMessage();
      const response = this.generateResponse(message);
      this.addMessage('ai', response);
    }, 1500);
  }
  
  addMessage(type, content, isTemporary = false) {
    const chat = document.getElementById('aiChat');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${type === 'user' ? 'ai-message-user' : ''}`;
    if (isTemporary) messageDiv.classList.add('temporary');
    
    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.textContent = type === 'user' ? '👤' : '🤖';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'ai-text';
    textDiv.innerHTML = content.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(textDiv);
    
    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
    
    if (!isTemporary) {
      this.#conversationHistory.push({ type, content });
    }
  }
  
  removeLastMessage() {
    const chat = document.getElementById('aiChat');
    const temporary = chat.querySelector('.temporary');
    if (temporary) temporary.remove();
  }
  
  generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Simple AI simulation with pattern matching
    if (lowerMessage.includes('recommand') || lowerMessage.includes('suggest')) {
      return this.generateRecommendations();
    } else if (lowerMessage.includes('genre') || lowerMessage.includes('style')) {
      return this.explainGenres();
    } else if (lowerMessage.includes('playlist')) {
      return this.helpWithPlaylist();
    } else if (lowerMessage.includes('analys') || lowerMessage.includes('explain')) {
      return this.analyzeMusic();
    } else {
      return this.getGeneralHelp();
    }
  }
  
  generateRecommendations() {
    const recommendations = [
      'Voici quelques recommandations basées sur vos goûts :',
      '• Pour de la musique électronique : Daft Punk, Justice, Moderat',
      '• Pour du jazz moderne : Kamasi Washington, GoGo Penguin, Nils Frahm',
      '• Pour de l\'indie : Tame Impala, Mac DeMarco, King Gizzard',
      '• Pour de la musique classique contemporaine : Max Richter, Ólafur Arnalds'
    ].join('\n');
    
    return recommendations;
  }
  
  explainGenres() {
    return `Les genres musicaux sont fascinants ! Voici quelques genres populaires :

    🎵 **Électronique** : Utilise des synthétiseurs et des logiciels
    🎸 **Rock** : Guitares amplifiées, batterie énergique
    🎺 **Jazz** : Improvisation, harmonies complexes
    🎼 **Classique** : Orchestres, compositions structurées
    🎤 **Pop** : Mélodies accrocheuses, structure verse-chorus
    
    Quel genre vous intéresse le plus ?`;
  }
  
  helpWithPlaylist() {
    return `Créer une playlist parfaite, c'est un art ! Voici mes conseils :

    ✨ **Flow émotionnel** : Commencez doux, montez en énergie, puis redescendez
    🎯 **Cohérence** : Gardez un thème (époque, genre, ambiance)
    ⏱️ **Durée** : 45-60 minutes pour une écoute complète
    🔄 **Transitions** : Attention aux changements de tempo et tonalité
    
    Voulez-vous que je vous aide à créer une playlist pour une occasion spéciale ?`;
  }
  
  analyzeMusic() {
    return `L'analyse musicale révèle la richesse des compositions :

    🎼 **Harmonie** : Les accords créent l'émotion
    🥁 **Rythme** : Le tempo influence l'énergie
    🎹 **Mélodie** : La ligne principale que vous fredonnez
    🎨 **Timbre** : La couleur unique de chaque instrument
    📊 **Structure** : Intro, verse, chorus, bridge, outro
    
    Envoyez-moi le nom d'un morceau pour une analyse détaillée !`;
  }
  
  getGeneralHelp() {
    return `Je peux vous aider avec de nombreux aspects musicaux :

    🔍 **Découverte** : Nouveaux artistes et genres
    📋 **Playlists** : Création et organisation
    📊 **Analyse** : Comprendre les structures musicales
    🎯 **Recommandations** : Basées sur vos préférences
    🎓 **Éducation** : Histoire et théorie musicale
    
    Posez-moi une question spécifique pour commencer !`;
  }
  
  handleSuggestion(suggestion) {
    document.getElementById('aiInput').value = suggestion;
    this.sendMessage();
  }
  
  initializeDatabase() {
    // Initialize with sample music data
    this.#musicDatabase = [
      { artist: 'Daft Punk', genre: 'Electronic', mood: 'Energetic' },
      { artist: 'Miles Davis', genre: 'Jazz', mood: 'Contemplative' },
      { artist: 'The Beatles', genre: 'Rock', mood: 'Happy' },
      { artist: 'Chopin', genre: 'Classical', mood: 'Melancholic' }
    ];
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
  
  // New advanced features
  #lyricsEngine = null;
  #recordingEngine = null;
  #aiAssistant = null;
  
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
      this.#initializeLyrics();
      this.#initializeRecording();
      this.#initializeAIAssistant();
      
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

    // Modal close events
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.style.display = 'none';
      }, { signal });
    });

    // Click outside modal to close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      }, { signal });
    });
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

  #initializeLyrics() {
    this.#lyricsEngine = new LyricsEngine();
    console.log('🎤 Lyrics engine initialized');
  }

  #initializeRecording() {
    this.#recordingEngine = new RecordingEngine();
    console.log('🎙️ Recording engine initialized');
  }

  #initializeAIAssistant() {
    this.#aiAssistant = new AIAssistant();
    console.log('🤖 AI Assistant initialized');
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

// Advanced Audio Visualizer Class
class AudioVisualizer {
  #canvas = null;
  #ctx = null;
  #analyser = null;
  #animationId = null;
  #mode = 'bars';
  #sensitivity = 5;
  #color = '#8b5cf6';
  
  constructor(canvas, analyser) {
    this.#canvas = canvas;
    this.#ctx = canvas.getContext('2d');
    this.#analyser = analyser;
    this.#setupCanvas();
  }
  
  #setupCanvas() {
    const resize = () => {
      this.#canvas.width = this.#canvas.offsetWidth * window.devicePixelRatio;
      this.#canvas.height = this.#canvas.offsetHeight * window.devicePixelRatio;
      this.#ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resize();
    window.addEventListener('resize', resize);
  }
  
  start() {
    const animate = () => {
      this.#draw();
      this.#animationId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  stop() {
    if (this.#animationId) {
      cancelAnimationFrame(this.#animationId);
    }
  }
  
  setMode(mode) {
    this.#mode = mode;
  }
  
  setSensitivity(sensitivity) {
    this.#sensitivity = sensitivity;
  }
  
  setColor(color) {
    this.#color = color;
  }
  
  #draw() {
    if (!this.#analyser) return;
    
    const bufferLength = this.#analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.#analyser.getByteFrequencyData(dataArray);
    
    const width = this.#canvas.offsetWidth;
    const height = this.#canvas.offsetHeight;
    
    this.#ctx.clearRect(0, 0, width, height);
    
    switch (this.#mode) {
      case 'bars':
        this.#drawBars(dataArray, width, height);
        break;
      case 'circle':
        this.#drawCircle(dataArray, width, height);
        break;
      case 'wave':
        this.#drawWave(dataArray, width, height);
        break;
      case 'spiral':
        this.#drawSpiral(dataArray, width, height);
        break;
      case 'particles':
        this.#drawParticles(dataArray, width, height);
        break;
    }
  }
  
  #drawBars(dataArray, width, height) {
    const barWidth = width / dataArray.length * 2;
    const centerX = width / 2;
    
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * (this.#sensitivity / 5);
      const x = centerX + (i - dataArray.length / 2) * barWidth;
      
      const gradient = this.#ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, this.#color);
      gradient.addColorStop(1, this.#color + '40');
      
      this.#ctx.fillStyle = gradient;
      this.#ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
    }
  }
  
  #drawCircle(dataArray, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 4;
    
    this.#ctx.beginPath();
    this.#ctx.strokeStyle = this.#color;
    this.#ctx.lineWidth = 2;
    
    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * Math.PI * 2;
      const amplitude = (dataArray[i] / 255) * radius * (this.#sensitivity / 5);
      const x = centerX + Math.cos(angle) * (radius + amplitude);
      const y = centerY + Math.sin(angle) * (radius + amplitude);
      
      if (i === 0) {
        this.#ctx.moveTo(x, y);
      } else {
        this.#ctx.lineTo(x, y);
      }
    }
    
    this.#ctx.closePath();
    this.#ctx.stroke();
  }
  
  #drawWave(dataArray, width, height) {
    this.#ctx.beginPath();
    this.#ctx.strokeStyle = this.#color;
    this.#ctx.lineWidth = 3;
    
    const sliceWidth = width / dataArray.length;
    let x = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] / 255) * (this.#sensitivity / 5);
      const y = (height / 2) + (v * height / 2);
      
      if (i === 0) {
        this.#ctx.moveTo(x, y);
      } else {
        this.#ctx.lineTo(x, y);
      }
      
      x += sliceWidth;
    }
    
    this.#ctx.stroke();
  }
  
  #drawSpiral(dataArray, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) / 2;
    
    this.#ctx.beginPath();
    this.#ctx.strokeStyle = this.#color;
    this.#ctx.lineWidth = 2;
    
    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * Math.PI * 8;
      const radius = (i / dataArray.length) * maxRadius;
      const amplitude = (dataArray[i] / 255) * 50 * (this.#sensitivity / 5);
      
      const x = centerX + Math.cos(angle) * (radius + amplitude);
      const y = centerY + Math.sin(angle) * (radius + amplitude);
      
      if (i === 0) {
        this.#ctx.moveTo(x, y);
      } else {
        this.#ctx.lineTo(x, y);
      }
    }
    
    this.#ctx.stroke();
  }
  
  #drawParticles(dataArray, width, height) {
    for (let i = 0; i < dataArray.length; i += 4) {
      const amplitude = dataArray[i] / 255;
      if (amplitude > 0.1) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = amplitude * 10 * (this.#sensitivity / 5);
        
        this.#ctx.beginPath();
        this.#ctx.arc(x, y, size, 0, Math.PI * 2);
        this.#ctx.fillStyle = this.#color + Math.floor(amplitude * 255).toString(16).padStart(2, '0');
        this.#ctx.fill();
      }
    }
  }
}

// Advanced Equalizer Class
class AudioEqualizer {
  #audioContext = null;
  #bands = [];
  #presets = {
    flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    rock: [3, 2, -1, -1, 0, 1, 3, 4, 4, 4],
    pop: [-1, 0, 2, 3, 1, -1, -2, -2, 0, 1],
    jazz: [4, 3, 1, 2, -1, -1, 0, 1, 2, 3],
    classical: [4, 3, 2, 1, -1, -1, 0, 2, 3, 4],
    electronic: [4, 3, 1, 0, -1, 1, 0, 1, 3, 4]
  };
  
  constructor(audioContext) {
    this.#audioContext = audioContext;
    this.#initializeBands();
  }
  
  #initializeBands() {
    const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    
    frequencies.forEach(freq => {
      const filter = this.#audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      this.#bands.push(filter);
    });
    
    // Connect filters in series
    for (let i = 0; i < this.#bands.length - 1; i++) {
      this.#bands[i].connect(this.#bands[i + 1]);
    }
  }
  
  connectSource(source) {
    source.connect(this.#bands[0]);
    return this.#bands[this.#bands.length - 1];
  }
  
  setBandGain(index, gain) {
    if (this.#bands[index]) {
      this.#bands[index].gain.value = gain;
    }
  }
  
  applyPreset(presetName) {
    const preset = this.#presets[presetName];
    if (preset) {
      preset.forEach((gain, index) => {
        this.setBandGain(index, gain);
      });
    }
  }
}

// Immersive Mode Class
class ImmersiveMode {
  #canvas = null;
  #ctx = null;
  #analyser = null;
  #animationId = null;
  #particles = [];
  
  constructor() {
    this.#canvas = document.getElementById('immersiveCanvas');
    this.#ctx = this.#canvas.getContext('2d');
    this.#setupCanvas();
    this.#createParticles();
  }
  
  #setupCanvas() {
    const resize = () => {
      this.#canvas.width = window.innerWidth;
      this.#canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
  }
  
  #createParticles() {
    for (let i = 0; i < 100; i++) {
      this.#particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 360
      });
    }
  }
  
  start(analyser) {
    this.#analyser = analyser;
    const animate = () => {
      this.#draw();
      this.#animationId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  stop() {
    if (this.#animationId) {
      cancelAnimationFrame(this.#animationId);
    }
  }
  
  #draw() {
    this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    
    // Update and draw particles
    this.#particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      if (particle.x < 0 || particle.x > this.#canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.#canvas.height) particle.vy *= -1;
      
      this.#ctx.beginPath();
      this.#ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.#ctx.fillStyle = `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`;
      this.#ctx.fill();
    });
    
    // Audio reactive effects
    if (this.#analyser) {
      const dataArray = new Uint8Array(this.#analyser.frequencyBinCount);
      this.#analyser.getByteFrequencyData(dataArray);
      
      const bassLevel = dataArray.slice(0, 10).reduce((a, b) => a + b) / 10 / 255;
      
      // Pulse effect based on bass
      this.#ctx.shadowBlur = bassLevel * 50;
      this.#ctx.shadowColor = '#8b5cf6';
      
      // Draw central pulse
      this.#ctx.beginPath();
      this.#ctx.arc(
        this.#canvas.width / 2,
        this.#canvas.height / 2,
        bassLevel * 200,
        0,
        Math.PI * 2
      );
      this.#ctx.fillStyle = `rgba(139, 92, 246, ${bassLevel * 0.3})`;
      this.#ctx.fill();
      
      this.#ctx.shadowBlur = 0;
    }
  }
}

// Enhanced UltraModernMusicPlayer with new features
class UltraModernMusicPlayer {
  // Private fields
  #state = {
    currentIndex: 0,
    isPlaying: false,
    isShuffled: false,
    repeatMode: 'none',
    volume: 0.7,
    isMuted: false,
    currentTime: 0,
    duration: 0,
    isLoading: false
  };
  
  #playlist = [];
  #audioProcessor = null;
  #audioVisualizer = null;
  #audioEqualizer = null;
  #immersiveMode = null;
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
      console.log('[Player] Starting initialization...');
      
      // Bind elements first
      this.#bindElements();
      console.log('[Player] Elements bound');
      
      // Load stored data
      await this.#loadStoredData();
      console.log('[Player] Data loaded');
      
      // Setup events
      this.#setupEventListeners();
      console.log('[Player] Event listeners set up');
      
      // Initialize audio
      await this.#initializeAudio();
      console.log('[Player] Audio initialized');
      
      // Initialize advanced features
      await this.#initializeAdvancedFeatures();
      console.log('[Player] Advanced features initialized');
      
      // Update UI
      this.#updateUI();
      console.log('[Player] UI updated');
      
      // Hide loading screen after a short delay
      setTimeout(() => {
        this.#hideLoadingScreen();
        console.log('[Player] Loading screen hidden');
        notificationSystem?.show('Ultra Modern Player initialisé avec succès!', 'success');
      }, 800);
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.#hideLoadingScreen();
      notificationSystem?.show('Erreur d\'initialisation: ' + error.message, 'error');
    }
  }
  
  async #initializeAdvancedFeatures() {
    try {
      // Initialize immersive mode
      this.#immersiveMode = new ImmersiveMode();
      console.log('[Player] Immersive mode initialized');
      
      // Setup advanced event listeners
      this.#setupAdvancedEventListeners();
      console.log('[Player] Advanced event listeners set up');
      
      // Initialize theme system
      this.#initializeThemeSystem();
      console.log('[Player] Theme system initialized');
      
    } catch (error) {
      console.warn('[Player] Some advanced features failed to initialize:', error);
      // Continue anyway, don't block the app
    }
  }
  
  #setupAdvancedEventListeners() {
    const { signal } = this.#eventAbortController;
    
    // Visualizer controls
    document.getElementById('visualizerBtn')?.addEventListener('click', () => {
      this.#toggleVisualizer();
    }, { signal });
    
    document.getElementById('closeVisualizerBtn')?.addEventListener('click', () => {
      this.#closeVisualizer();
    }, { signal });
    
    document.getElementById('visualizerMode')?.addEventListener('change', (e) => {
      this.#audioVisualizer?.setMode(e.target.value);
    }, { signal });
    
    document.getElementById('visualizerSensitivity')?.addEventListener('input', (e) => {
      this.#audioVisualizer?.setSensitivity(parseFloat(e.target.value));
    }, { signal });
    
    document.getElementById('visualizerColor')?.addEventListener('input', (e) => {
      this.#audioVisualizer?.setColor(e.target.value);
    }, { signal });
    
    // Equalizer controls
    document.getElementById('equalizerBtn')?.addEventListener('click', () => {
      this.#toggleEqualizer();
    }, { signal });
    
    document.getElementById('closeEqualizerBtn')?.addEventListener('click', () => {
      this.#closeEqualizer();
    }, { signal });
    
    // EQ presets
    document.querySelectorAll('.eq-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.eq-preset').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.#audioEqualizer?.applyPreset(e.target.dataset.preset);
      }, { signal });
    });
    
    // EQ sliders
    document.querySelectorAll('.eq-slider').forEach((slider, index) => {
      slider.addEventListener('input', (e) => {
        this.#audioEqualizer?.setBandGain(index, parseFloat(e.target.value));
      }, { signal });
    });
    
    // Immersive mode
    document.getElementById('fullscreenBtn')?.addEventListener('click', () => {
      this.#toggleImmersiveMode();
    }, { signal });
    
    document.getElementById('exitImmersiveBtn')?.addEventListener('click', () => {
      this.#exitImmersiveMode();
    }, { signal });
    
    // Immersive controls
    document.getElementById('immersivePlay')?.addEventListener('click', () => {
      this.#togglePlay();
    }, { signal });
    
    document.getElementById('immersivePrev')?.addEventListener('click', () => {
      this.#previousTrack();
    }, { signal });
    
    document.getElementById('immersiveNext')?.addEventListener('click', () => {
      this.#nextTrack();
    }, { signal });
  }
  
  #initializeThemeSystem() {
    // Theme selector functionality would go here
    // For now, we'll add basic theme switching
    document.documentElement.setAttribute('data-theme', 'default');
  }
  
  async #initializeAudio() {
    try {
      this.#audioProcessor = AudioProcessor.getInstance();
      const initialized = await this.#audioProcessor.initializeAudioContext();
      
      if (initialized) {
        // Initialize equalizer
        this.#audioEqualizer = new AudioEqualizer(this.#audioProcessor._audioContext);
        console.log('[Player] Audio equalizer initialized');
      }
    } catch (error) {
      console.warn('[Player] Audio initialization failed:', error);
      // Continue without audio features
    }
  }
  
  #toggleVisualizer() {
    const modal = document.getElementById('visualizerModal');
    modal.classList.add('active');
    
    if (this.#audioProcessor._analyser && !this.#audioVisualizer) {
      const canvas = document.getElementById('visualizerCanvas');
      this.#audioVisualizer = new AudioVisualizer(canvas, this.#audioProcessor._analyser);
      this.#audioVisualizer.start();
    }
  }
  
  #closeVisualizer() {
    const modal = document.getElementById('visualizerModal');
    modal.classList.remove('active');
    this.#audioVisualizer?.stop();
  }
  
  #toggleEqualizer() {
    const modal = document.getElementById('equalizerModal');
    modal.classList.add('active');
  }
  
  #closeEqualizer() {
    const modal = document.getElementById('equalizerModal');
    modal.classList.remove('active');
  }
  
  #toggleImmersiveMode() {
    const immersive = document.getElementById('immersiveMode');
    immersive.classList.add('active');
    
    // Update immersive display
    const currentTrack = this.#playlist[this.#state.currentIndex];
    if (currentTrack) {
      document.getElementById('immersiveTitle').textContent = currentTrack.title;
      document.getElementById('immersiveArtist').textContent = currentTrack.artist;
    }
    
    this.#immersiveMode.start(this.#audioProcessor._analyser);
  }
  
  #exitImmersiveMode() {
    const immersive = document.getElementById('immersiveMode');
    immersive.classList.remove('active');
    this.#immersiveMode.stop();
  }
  
  // Rest of the existing methods remain the same...
  // [Previous implementation continues here]
  
  // Enhanced bindElements method
  #bindElements() {
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
    
    // Control buttons
    this.#elements.get('mainPlayBtn')?.addEventListener('click', () => this.#togglePlay(), { signal });
    this.#elements.get('artworkPlayBtn')?.addEventListener('click', () => this.#togglePlay(), { signal });
    this.#elements.get('prevBtn')?.addEventListener('click', () => this.#previousTrack(), { signal });
    this.#elements.get('nextBtn')?.addEventListener('click', () => this.#nextTrack(), { signal });
    
    // Setup drag and drop
    this.#setupDragAndDrop();
  }
  
  #setupDragAndDrop() {
    const { signal } = this.#eventAbortController;
    const dropZone = this.#elements.get('dropZone');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      document.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, { signal });
    });
    
    document.addEventListener('drop', async (e) => {
      const files = Array.from(e.dataTransfer.files);
      await this.#processFiles(files);
    }, { signal });
  }
  
  async #handleFileImport(event) {
    const files = Array.from(event.target.files);
    await this.#processFiles(files);
    event.target.value = '';
  }
  
  async #processFiles(files) {
    const audioFiles = files.filter(file => file.type.startsWith('audio/'));
    
    if (audioFiles.length === 0) {
      notificationSystem.show('Aucun fichier audio trouvé', 'warning');
      return;
    }
    
    try {
      const newTracks = await Promise.all(
        audioFiles.map(file => this.#createTrackFromFile(file))
      );
      
      this.#playlist.push(...newTracks);
      this.#updateTracksView();
      
      if (this.#playlist.length === newTracks.length) {
        this.#loadTrack(0);
      }
      
      notificationSystem.show(`${audioFiles.length} piste(s) ajoutée(s)`, 'success');
      
    } catch (error) {
      console.error('Error processing files:', error);
      notificationSystem.show('Erreur lors du traitement des fichiers', 'error');
    }
  }
  
  async #createTrackFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      const onLoad = () => {
        audio.removeEventListener('loadedmetadata', onLoad);
        audio.removeEventListener('error', onError);
        resolve({
          id: crypto.randomUUID(),
          title: this.#extractTitle(file.name),
          artist: this.#extractArtist(file.name),
          duration: audio.duration || 0,
          src: url,
          file,
          addedAt: new Date().toISOString(),
          playCount: 0,
          isFavorite: false
        });
      };
      
      const onError = () => {
        audio.removeEventListener('loadedmetadata', onLoad);
        audio.removeEventListener('error', onError);
        reject(new Error(`Failed to load audio file: ${file.name}`));
      };
      
      audio.addEventListener('loadedmetadata', onLoad);
      audio.addEventListener('error', onError);
    });
  }
  
  #extractTitle(filename) {
    return filename
      .replace(/\.[^/.]+$/, '')
      .replace(/^\d+[\s.-]*/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Unknown Track';
  }
  
  #extractArtist(filename) {
    const match = filename.match(/^(.+?)\s*[-–]\s*(.+)/);
    return match ? match[1].trim() : 'Unknown Artist';
  }
  
  #loadTrack(index) {
    if (index < 0 || index >= this.#playlist.length) return;
    
    const track = this.#playlist[index];
    const audioElement = this.#elements.get('audioElement');
    
    this.#state.currentIndex = index;
    audioElement.src = track.src;
    
    this.#elements.get('currentTitle').textContent = track.title;
    this.#elements.get('currentArtist').textContent = track.artist;
    
    track.playCount++;
    this.#updateTracksView();
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
        await audioElement.play();
        this.#state.isPlaying = true;
      }
      
      this.#updatePlayButton();
      
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
    
    const newIndex = (this.#state.currentIndex + 1) % this.#playlist.length;
    this.#loadTrack(newIndex);
    
    if (this.#state.isPlaying) {
      this.#elements.get('audioElement').play();
    }
  }
  
  #onLoadedMetadata() {
    const audioElement = this.#elements.get('audioElement');
    this.#state.duration = audioElement.duration;
    this.#elements.get('totalTime').textContent = this.#formatTime(audioElement.duration);
  }
  
  #onTimeUpdate() {
    const audioElement = this.#elements.get('audioElement');
    this.#state.currentTime = audioElement.currentTime;
    
    this.#elements.get('currentTime').textContent = this.#formatTime(audioElement.currentTime);
    
    if (audioElement.duration) {
      const percentage = (audioElement.currentTime / audioElement.duration) * 100;
      this.#elements.get('progressFill').style.width = `${percentage}%`;
    }
  }
  
  #onTrackEnded() {
    if (this.#state.currentIndex < this.#playlist.length - 1) {
      this.#nextTrack();
    } else {
      this.#state.isPlaying = false;
      this.#updatePlayButton();
    }
  }
  
  #updateUI() {
    this.#updatePlayButton();
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
  
  #updateTracksView() {
    const container = this.#elements.get('tracksContainer');
    
    if (this.#playlist.length === 0) {
      container.innerHTML = `
        <div class="empty-library">
          <h3>Votre bibliothèque est vide</h3>
          <p>Commencez par importer votre musique préférée</p>
          <button class="cta-btn" onclick="document.getElementById('fileInput').click()">
            Importer de la musique
          </button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="tracks-list">
        ${this.#playlist.map((track, index) => `
          <div class="track-item ${index === this.#state.currentIndex ? 'active' : ''}" 
               data-index="${index}">
            <div class="track-number">${index + 1}</div>
            <div class="track-info">
              <h4 class="track-title">${track.title}</h4>
              <p class="track-artist">${track.artist}</p>
            </div>
            <div class="track-duration">${this.#formatTime(track.duration)}</div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.querySelectorAll('.track-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        this.#loadTrack(index);
        if (!this.#state.isPlaying) {
          this.#togglePlay();
        }
      });
    });
  }
  
  #formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  async #loadStoredData() {
    // Basic implementation for now
    try {
      const stateData = localStorage.getItem('ultra-modern-player-state');
      if (stateData) {
        const parsedState = JSON.parse(stateData);
        Object.assign(this.#state, parsedState);
      }
    } catch (error) {
      console.error('Failed to load stored data:', error);
    }
  }
  
  #hideLoadingScreen() {
    console.log('[Player] Hiding loading screen...');
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      console.log('[Player] Loading screen hidden successfully');
      
      // Remove from DOM after transition
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    } else {
      console.error('[Player] Loading screen element not found');
    }
  }
  
  // Public methods
  toggleFavorite(trackId) {
    const track = this.#playlist.find(t => t.id === trackId);
    if (track) {
      track.isFavorite = !track.isFavorite;
      this.#updateTracksView();
      notificationSystem.show(
        track.isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
        'success'
      );
    }
  }
  
  destroy() {
    this.#eventAbortController.abort();
    this.#audioVisualizer?.stop();
    this.#immersiveMode?.stop();
    
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
  console.log('[App] DOM loaded, initializing...');
  
  // Show skip button after 3 seconds
  setTimeout(() => {
    const skipBtn = document.getElementById('skipLoadingBtn');
    if (skipBtn) {
      skipBtn.style.display = 'block';
    }
  }, 3000);
  
  // Safety timeout to hide loading screen if something goes wrong
  setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
      console.warn('[App] Force hiding loading screen after timeout');
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 10000); // 10 second timeout
  
  try {
    notificationSystem = new NotificationSystem();
    console.log('[App] Notification system initialized');
    
    player = new UltraModernMusicPlayer();
    console.log('[App] Player initialized');
    
    // Expose player globally for debugging
    window.player = player;
  } catch (error) {
    console.error('[App] Critical initialization error:', error);
    
    // Force hide loading screen and show error
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  player?.destroy();
});
