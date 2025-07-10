import { InactiveTrackerStorage } from './storageService';

type ProgressCallback = (progress: number) => void;

export class InactiveTrackerService {
    private static progressCallback: ProgressCallback | null = null;
    private static inactiveTime: number = 60;
    private static intervalId: NodeJS.Timeout | null = null;
    private static eventListeners: Array<() => void> = [];
    private static progress: number = 100;

    private static resetProgress() {
        if (this.progressCallback) {
            this.progressCallback(100);
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.progress = 100;
        if (this.inactiveTime <= 0) {
            console.error('InactiveTrackerService: inactiveTime must be greater than zero');
            clearInterval(this.intervalId!);
            return;
        }
        this.intervalId = setInterval(() => {
            this.progress -= (100 / this.inactiveTime);
            if (this.progress <= 0) {
                this.progress = 0;
                clearInterval(this.intervalId!);
            }
            // console.debug(`InactiveTrackerService.resetProgress: ${this.progress}`);
            if (this.progressCallback) {
                this.progressCallback(this.progress);
            }
        }, 1000);
    }

    private static setupEventListeners() {
        const events = ['mousemove', 'keydown', 'click'];
        this.eventListeners = events.map(event => {
            const listener = () => this.resetProgress();
            window.addEventListener(event, listener);
            return () => window.removeEventListener(event, listener);
        });
    }

    public static start() {
        this.inactiveTime = InactiveTrackerStorage.read();
        console.info(`InactiveTrackerService.start: ${this.inactiveTime} minutes`)
        this.resetProgress();
    }

    public static register(progressCallbackParam: ProgressCallback) {
        this.progressCallback = progressCallbackParam;
        this.setupEventListeners();
    }

    public static stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.eventListeners.forEach(removeListener => removeListener());
        this.eventListeners = [];
    }
}
