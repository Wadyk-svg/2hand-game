import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";

export class VisionService {
  private static instance: VisionService;
  private handLandmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private lastVideoTime = -1;
  private isInitializing = false;

  private constructor() {}

  public static getInstance(): VisionService {
    if (!VisionService.instance) {
      VisionService.instance = new VisionService();
    }
    return VisionService.instance;
  }

  public async initialize() {
    if (this.handLandmarker || this.isInitializing) return;
    this.isInitializing = true;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });
      console.log("VisionService: HandLandmarker initialized");
    } catch (error) {
      console.error("VisionService Error:", error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  public async startCamera(videoElement: HTMLVideoElement) {
    this.video = videoElement;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Browser does not support camera access");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 1280,
        height: 720,
        facingMode: "user"
      }
    });
    this.video.srcObject = stream;
    await new Promise<void>((resolve) => {
      if (this.video) {
        this.video.onloadedmetadata = () => {
          this.video?.play();
          resolve();
        };
      }
    });
  }

  public detectHands() {
    if (!this.handLandmarker || !this.video) return null;

    if (this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      return this.handLandmarker.detectForVideo(this.video, performance.now());
    }
    return null;
  }

  public stop() {
    if (this.video && this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }
  }
}