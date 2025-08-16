export type InputSource = 'microphone' | 'teams' | 'zoom' | 'slack';

export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: number;
  speaker?: string;
  confidence?: number;
  source: InputSource;
  isFinal: boolean;
}

export interface TranscriptionConfig {
  source: InputSource;
  language: string;
  continuous: boolean;
  interimResults: boolean;
}

export class TranscriptionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private shouldRestart = false;
  private config: TranscriptionConfig;
  private onTranscript?: (chunk: TranscriptChunk) => void;
  private onError?: (error: string) => void;
  private onStatusChange?: (status: 'listening' | 'stopped' | 'error') => void;

  constructor(config: TranscriptionConfig) {
    console.log('🎙️ TranscriptionService: Initializing with config:', config);
    this.config = config;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    console.log('🔧 TranscriptionService: Initializing speech recognition...');
    console.log('🌍 Environment check:');
    console.log('  - window.SpeechRecognition:', !!window.SpeechRecognition);
    console.log('  - window.webkitSpeechRecognition:', !!window.webkitSpeechRecognition);
    console.log('  - navigator.mediaDevices:', !!navigator.mediaDevices);
    console.log('  - navigator.getUserMedia:', !!navigator.getUserMedia);
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('❌ TranscriptionService: Speech recognition not supported in this browser');
      this.onError?.('Speech recognition not supported in this browser');
      return;
    }
    
    console.log('✅ TranscriptionService: SpeechRecognition found:', SpeechRecognition.name);

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = this.config.continuous;
      this.recognition.interimResults = this.config.interimResults;
      this.recognition.lang = this.config.language;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        console.log('Transcription started');
        this.isListening = true;
        this.shouldRestart = true;
        this.onStatusChange?.('listening');
      };

      this.recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (transcript.trim()) {
            const chunk: TranscriptChunk = {
              id: `${Date.now()}-${i}`,
              text: transcript,
              timestamp: Date.now(),
              confidence: result[0].confidence,
              source: this.config.source,
              isFinal: result.isFinal
            };

            this.onTranscript?.(chunk);
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        this.onStatusChange?.('error');
        
        let errorMessage = 'Speech recognition error';
        switch (event.error) {
          case 'network':
            errorMessage = 'Network connection required for speech recognition';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not found or not working';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not available';
            break;
        }
        
        this.onError?.(errorMessage);
      };

      this.recognition.onend = () => {
        console.log('Transcription ended');
        this.isListening = false;
        this.onStatusChange?.('stopped');
        
        // Automatically restart if we expect to be listening
        // This prevents the common issue of recognition stopping after a few seconds
        setTimeout(() => {
          if (this.shouldRestart && this.config.continuous && !this.isListening) {
            console.log('Auto-restarting transcription...');
            this.start();
          }
        }, 100);
      };

    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      this.onError?.('Failed to initialize speech recognition');
    }
  }

  public start() {
    if (!this.recognition) {
      this.onError?.('Speech recognition not initialized');
      return;
    }

    if (this.isListening) {
      return;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting transcription:', error);
      this.onError?.('Failed to start transcription');
    }
  }

  public stop() {
    this.shouldRestart = false;
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public setSource(source: InputSource) {
    this.config.source = source;
    // For MVP, all sources use microphone. Future: integrate with APIs
    console.log(`Transcription source set to: ${source}`);
  }

  public setLanguage(language: string) {
    this.config.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  public onTranscriptReceived(callback: (chunk: TranscriptChunk) => void) {
    this.onTranscript = callback;
  }

  public onErrorReceived(callback: (error: string) => void) {
    this.onError = callback;
  }

  public onStatusChanged(callback: (status: 'listening' | 'stopped' | 'error') => void) {
    this.onStatusChange = callback;
  }

  public getStatus(): 'listening' | 'stopped' | 'error' {
    if (!this.recognition) return 'error';
    return this.isListening ? 'listening' : 'stopped';
  }

  // Future: Integrate with external APIs
  private async connectToTeams() {
    // Teams integration placeholder
    console.log('Teams integration not yet implemented');
  }

  private async connectToZoom() {
    // Zoom integration placeholder
    console.log('Zoom integration not yet implemented');
  }

  private async connectToSlack() {
    // Slack integration placeholder
    console.log('Slack integration not yet implemented');
  }
}