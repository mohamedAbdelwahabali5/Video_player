interface VideoPlayerConfig {
    container: string;
    src: string;
    theme?: {
        color: string;
        background: string;
        accent: string;
    };
    skipTime?: number;
}

interface VideoPlayerElements {
    video: HTMLVideoElement;
    playPauseBtn: HTMLElement;
    backwardBtn: HTMLElement;
    forwardBtn: HTMLElement;
    volumeBtn: HTMLElement;
    fullscreenBtn: HTMLElement;
    gearBtn: HTMLElement;
    seekBar: HTMLInputElement;
    seekBarVolume: HTMLDivElement;
    timer: HTMLDivElement;
    controls: HTMLDivElement;
    seekBarVolumeId: HTMLInputElement;
    dropup: HTMLUListElement;
    playbackDroplist: HTMLUListElement;
    playbackSpeedId: HTMLElement;
    controlsIcons: HTMLElement[];
}

class VideoPlayer {
    private config: VideoPlayerConfig;
    private elements: Partial<VideoPlayerElements> = {};
    private timerInterval?: number;

    constructor(config: VideoPlayerConfig) {
        this.config = {
            ...config,
            skipTime: config.skipTime || 5,
            theme: {
                color: '#ffffff',
                background: '#000000',
                accent: '#47fc00',
                ...config.theme
            }
        };
        this.init();
    }

    public init(): void {
        this.createPlayerElements();
        this.initializeElements();
        this.setupEventListeners();
        this.bindPlaybackSpeedOptions();
    }

    private createPlayerElements(): void {
        const container = document.getElementById(this.config.container);
        if (!container) throw new Error('Container element not found');

        container.innerHTML = this.getPlayerHTML();
        this.bindElements();
    }

    private bindElements(): void {
        const uniqueId = this.config.container;
        this.elements = {
            video: document.querySelector(`#myVideo-${uniqueId}`) as HTMLVideoElement,
            playPauseBtn: document.querySelector(`#playPauseBtn-${uniqueId}`) as HTMLElement,
            backwardBtn: document.querySelector(`#backwardBtn-${uniqueId}`) as HTMLElement,
            forwardBtn: document.querySelector(`#forwardBtn-${uniqueId}`) as HTMLElement,
            volumeBtn: document.querySelector(`#volumeBtn-${uniqueId}`) as HTMLElement,
            fullscreenBtn: document.querySelector(`#fullscreenBtn-${uniqueId}`) as HTMLElement,
            gearBtn: document.querySelector(`#gearBtn-${uniqueId}`) as HTMLElement,
            seekBar: document.querySelector(`#seekBar-${uniqueId}`) as HTMLInputElement,
            seekBarVolume: document.querySelector(`.seekBarVolume-${uniqueId}`) as HTMLDivElement,
            timer: document.querySelector(`#timer-${uniqueId}`) as HTMLDivElement,
            controls: document.querySelector(`#controls-${uniqueId}`) as HTMLDivElement,
            seekBarVolumeId: document.querySelector(`#seekBarVolumeId-${uniqueId}`) as HTMLInputElement,
            dropup: document.querySelector(`#dropup-${uniqueId}`) as HTMLUListElement,
            playbackDroplist: document.querySelector(`#Playbackdroplist-${uniqueId}`) as HTMLUListElement,
            playbackSpeedId: document.querySelector(`#PlaybackSpeedID-${uniqueId}`) as HTMLElement,
            controlsIcons: Array.from(document.querySelectorAll(`.fa-${uniqueId}`)) as HTMLElement[]

        };
    }

    private initializeElements(): void {
        if (!this.elements.video || !this.elements.seekBar || !this.elements.seekBarVolumeId || !this.elements.controls
            || !this.elements.timer) return;

        this.elements.video.src = this.config.src;
        this.elements.video.addEventListener('loadedmetadata', () => {
            if (this.elements.seekBar) {
                this.elements.seekBar.max = this.elements.video!.duration.toString();
            }
        });
        this.elements.video.volume = Number(this.elements.seekBarVolumeId.value);

        this.elements.seekBar.style.setProperty("--color", this.config.theme?.color || "#47fc00");
        this.elements.seekBarVolumeId?.style.setProperty("--color", this.config.theme?.color || "#47fc00");
        const backgroundColor = this.config.theme?.background || '#fff000';
        this.elements.controls.style.setProperty('--backColor', backgroundColor);
        this.elements.timer.style.color = this.config.theme?.accent || '#47fc00';
        this.elements.controlsIcons?.forEach(icon => {
            icon.style.color = this.config.theme?.accent || '#47fc00';
        });

    }

    private setupEventListeners(): void {
        this.setupVideoEvents();
        this.setupControlEvents();
        this.setupVolumeEvents();
        this.setupFullscreenEvents();
        this.setupPlaybackSpeedEvents();
        this.setupControlsVisibility();
    }

    private setupVideoEvents(): void {
        if (!this.elements.video || !this.elements.seekBar || !this.elements.timer) return;

        this.elements.video.addEventListener('timeupdate', () => {
            this.handleTimeUpdate();
            this.updateTimer();
        });
        this.elements.video.addEventListener('volumechange', () => {
            this.handleVolumeChange();
        });
        this.elements.video.addEventListener('play', () => this.handlePlay());
        this.elements.video.addEventListener('pause', () => this.handlePause());
        this.elements.video.addEventListener('ended', () => this.handleEnded());
    }

    private handleTimeUpdate(): void {
        if (!this.elements.video || !this.elements.seekBar || !this.elements.controls) return;

        const { currentTime, duration, volume } = this.elements.video;
        this.elements.seekBar.value = currentTime.toString();
        const progress = (currentTime * 100) / duration || 0;
        this.elements.seekBar.style.setProperty('--progress', `${progress}%`);

        const volumeProgress = (volume * 100);
        this.elements.seekBarVolumeId?.style.setProperty('--progress', `${volumeProgress}%`);
        this.updateTimer();
    }

    private setupControlsVisibility(): void {
        if (!this.elements.video || !this.elements.controls) return;

        const videoContainer = this.elements.video.parentElement;
        if (!videoContainer) return;

        videoContainer.addEventListener('mouseenter', () => this.showControls());
        videoContainer.addEventListener('mouseleave', () => this.hideControls());
    }

    private showControls(): void {
        if (!this.elements.controls) return;
        this.elements.controls.style.opacity = '1';
    }

    private hideControls(): void {
        if (!this.elements.controls) return;
        this.elements.controls.style.opacity = '0';
    }
    private setupControlEvents(): void {
        if (!this.elements.playPauseBtn || !this.elements.backwardBtn || !this.elements.forwardBtn || !this.elements.seekBar) return;

        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.elements.backwardBtn.addEventListener('click', () => this.skipBackward());
        this.elements.forwardBtn.addEventListener('click', () => this.skipForward());
        this.elements.seekBar.addEventListener('input', () => this.handleSeekBarChange());
    }

    private setupVolumeEvents(): void {
        if (!this.elements.volumeBtn || !this.elements.seekBarVolume || !this.elements.seekBarVolumeId) return;

        this.elements.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.elements.seekBarVolumeId.addEventListener('input', () => this.handleVolumeChange());
        this.elements.seekBarVolume.addEventListener('mouseenter', () => this.showVolumeSlider());
        this.elements.seekBarVolume.addEventListener('mouseleave', () => this.hideVolumeSlider());
    }

    private setupFullscreenEvents(): void {
        if (!this.elements.fullscreenBtn) return;

        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
    }

    private setupPlaybackSpeedEvents(): void {
        if (!this.elements.gearBtn || !this.elements.playbackSpeedId) return;

        this.elements.gearBtn.addEventListener('click', () => this.toggleDropup());
        this.elements.playbackSpeedId.addEventListener('click', () => this.togglePlaybackSpeedList());
    }

    private togglePlayPause(): void {
        if (!this.elements.video || !this.elements.playPauseBtn) return;

        if (this.elements.video.paused) {
            this.elements.video.play();
            this.elements.playPauseBtn.classList.replace('fa-play', 'fa-pause');
        } else {
            this.elements.video.pause();
            this.elements.playPauseBtn.classList.replace('fa-pause', 'fa-play');
        }
    }

    private skipBackward(): void {
        if (!this.elements.video || !this.elements.seekBar) return;

        this.elements.video.currentTime -= this.config.skipTime!;
        this.elements.seekBar.value = this.elements.video.currentTime.toString();
    }

    private skipForward(): void {
        if (!this.elements.video || !this.elements.seekBar) return;

        this.elements.video.currentTime += this.config.skipTime!;
        this.elements.seekBar.value = this.elements.video.currentTime.toString();
    }

    private handleSeekBarChange(): void {
        if (!this.elements.video || !this.elements.seekBar || !this.elements.timer) return;

        this.elements.video.currentTime = Number(this.elements.seekBar.value);
        this.updateTimer();
    }

    private previousVolume: number = 1.0;

    private toggleMute(): void {
        if (!this.elements.video || !this.elements.volumeBtn || !this.elements.seekBarVolumeId) return;

        if (!this.elements.video.muted) {
            // Currently unmuted, so mute it
            this.previousVolume = this.elements.video.volume;
            this.elements.video.muted = true;
            this.elements.volumeBtn.classList.replace('fa-volume-up', 'fa-volume-xmark');
            this.elements.seekBarVolumeId.value = '0';
        } else {
            // Currently muted, so unmute it
            this.elements.video.muted = false;
            this.elements.video.volume = this.previousVolume;
            this.elements.volumeBtn.classList.replace('fa-volume-xmark', 'fa-volume-up');
            this.elements.seekBarVolumeId.value = this.previousVolume.toString();
        }
    }
    private handleVolumeChange(): void {
        if (!this.elements.video || !this.elements.volumeBtn || !this.elements.seekBarVolumeId) return;

        this.elements.video.volume = Number(this.elements.seekBarVolumeId.value);
        if (this.elements.video.volume === 0) {
            this.elements.volumeBtn.classList.replace('fa-volume-up', 'fa-volume-xmark');
        } else {
            this.elements.volumeBtn.classList.replace('fa-volume-xmark', 'fa-volume-up');
        }
        const volumeProgress = (this.elements.video.volume * 100);
        this.elements.seekBarVolumeId?.style.setProperty('--progress', `${volumeProgress}%`);
    }

    private showVolumeSlider(): void {
        if (!this.elements.seekBarVolumeId) return;
        this.elements.seekBarVolumeId.classList.remove('display_none');
    }

    private hideVolumeSlider(): void {
        if (!this.elements.seekBarVolumeId) return;
        this.elements.seekBarVolumeId.classList.add('display_none');
    }

    private toggleFullscreen(): void {
        if (!this.elements.video) return;

        if (!document.fullscreenElement) {
            this.elements.video.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    private handleFullscreenChange(): void {
        if (!this.elements.fullscreenBtn) return;

        if (document.fullscreenElement) {
            this.elements.fullscreenBtn.classList.replace('fa-expand', 'fa-compress');
        } else {
            this.elements.fullscreenBtn.classList.replace('fa-compress', 'fa-expand');
        }
    }

    private toggleDropup(): void {
        if (!this.elements.dropup || !this.elements.playbackDroplist) return;

        this.elements.dropup.classList.toggle('active');
        this.elements.playbackDroplist.classList.remove('active');
    }

    private togglePlaybackSpeedList(): void {
        if (!this.elements.dropup || !this.elements.playbackDroplist) return;

        this.elements.dropup.classList.remove('active');
        this.elements.playbackDroplist.classList.toggle('active');
    }

    private handlePlay(): void {
        if (!this.elements.video || !this.elements.timer) return;

        this.timerInterval = window.setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    private handlePause(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    private handleEnded(): void {
        if (!this.elements.playPauseBtn) return;

        this.elements.playPauseBtn.classList.replace('fa-pause', 'fa-play');
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    private updateTimer(): void {
        if (!this.elements.video || !this.elements.timer) return;

        const currentTime = Math.round(this.elements.video.currentTime);
        const minutes = Math.floor(currentTime / 60);
        const seconds = currentTime % 60;
        this.elements.timer.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    private getPlayerHTML(): string {
        const uniqueId = this.config.container; // Use the container ID as the unique identifier
        return `
        <div class="video-player">
          <video id="myVideo-${uniqueId}" class="border opacity-100" style="width: 100%;">
            <source src="${this.config.src}" type="video/mp4">
          </video>
          <div id="controls-${uniqueId}" class="controls w-100" style="transition: opacity 0.3s ease-in-out;">
            <div class="seekBar w-100 mb-2">
              <input class="w-100 d-block" id="seekBar-${uniqueId}" type="range" min="0" max="100" value="0">
            </div>
            <div class="icons d-flex justify-content-between w-100">
              <div class="leftIcons icons d-flex justify-content-start gap-3 w-50 ms-2">
                <i class="fa-solid fa-${uniqueId} fa-play" id="playPauseBtn-${uniqueId}"></i>
                <i class="fa-solid fa-${uniqueId} fa-backward" id="backwardBtn-${uniqueId}"></i>
                <i class="fa-solid fa-${uniqueId} fa-forward" id="forwardBtn-${uniqueId}"></i>
                <div class="seekBarVolume-${uniqueId} volume-slider d-flex justify-content-between align-items-center gap-3" style="transition: opacity 0.3s ease-in-out;">
                  <i class="fa-solid fa-${uniqueId} fas fa-volume-up" id="volumeBtn-${uniqueId}"></i>
                  <input class="w-100 display_none" id="seekBarVolumeId-${uniqueId}" type="range" min="0" max="1" value="0.5" step="0.1">
                </div>
                <div id="timer-${uniqueId}" style="color: white;">00:00</div>
              </div>
              <div class="rightIcons icons d-flex justify-content-end gap-3 w-50" style="position: relative;">
                <i class="fa-solid fa-${uniqueId} fa-gear" id="gearBtn-${uniqueId}"></i>
                <ul id="dropup-${uniqueId}" class="myDropup mb-4">
                  <li class="p-2"><i class="fa-solid fa-${uniqueId} fa-star me-2"></i>Quality</li>
                  <li class="p-2"><i class="fa-solid fa-${uniqueId} fa-clock me-2"></i>Sleep Timer</li>
                  <li id="PlaybackSpeedID-${uniqueId}" class="p-2"><i class="fa-solid fa-${uniqueId} fa-gauge me-2"></i>Playback Speed</li>
                </ul>
                <ul id="Playbackdroplist-${uniqueId}" class="Playbackdroplist mb-4">
                  <li class="p-2 mx-2 fs-3" data-speed="0.5">0.5</li>
                  <li class="p-2 mx-2 fs-3" data-speed="1">Normal</li>
                  <li class="p-2 mx-2 fs-3" data-speed="1.5">1.5</li>
                </ul>
                <i class="fa-solid fa-${uniqueId} fa-expand" id="fullscreenBtn-${uniqueId}"></i>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    private bindPlaybackSpeedOptions(): void {
        const playbackOptions = document.querySelectorAll(`#Playbackdroplist-${this.config.container} li`);
        playbackOptions.forEach(option => {
            option.addEventListener('click', () => {
                const speed = parseFloat(option.getAttribute('data-speed') || '1');
                this.setPlaybackSpeed(speed);
            });
        });
    }

    private setPlaybackSpeed(speed: number): void {
        if (!this.elements.video || !this.elements.playbackDroplist) return;

        this.elements.video.playbackRate = speed;
        this.elements.playbackDroplist.classList.toggle('active');
    }

}

const player1 = new VideoPlayer({
    container: 'videoContainer',
    src: './videos/EnglishMan.mp4',
    theme: {
        color: '#ffffff',
        background: '#1e272e',
        accent: '#ff4757',
    },
    skipTime: 15,
});

const player2 = new VideoPlayer({
    container: 'videoContainer2',
    src: './videos/Naruto.mp4',
    theme: {
        color: '#f1c40f',
        background: '#2c3e50',
        accent: '#16a085',
    },
    skipTime: 5,
});

const player3 = new VideoPlayer({
    container: 'videoContainer3',
    src: './videos/Animation.mp4',
    theme: {
        color: '#ff9f43',
        background: '#1e3799',
        accent: 'black',
    },
    skipTime: 7,
});