class InteractionFeedback {
  audioCtx: AudioContext | null = null;

  init() {
    if (typeof window !== 'undefined' && !this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  playPop() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    
    // Very gentle pop sound
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  }

  playSoftClick() {
    if (!this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
    
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.015, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.05);
  }

  vibrate(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore vibration errors
      }
    }
  }

  light() {
    this.init();
    this.playSoftClick();
    this.vibrate(10);
  }

  medium() {
    this.init();
    this.playPop();
    this.vibrate(15);
  }

  heavy() {
    this.init();
    this.playPop();
    this.vibrate([20, 30, 20]);
  }
}

export const feedback = new InteractionFeedback();
