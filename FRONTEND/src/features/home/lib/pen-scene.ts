import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  OrthographicCamera,
  PMREMGenerator,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/** Bolígrafo 3D de Orión Lex (optimizado: ~0,5 MB). La punta está en el origen y el eje es +Y. */
const MODEL_URL = '/models/boligrafo.glb';
/** Alto del modelo en sus unidades (de la punta a la tapa). */
const MODEL_HEIGHT = 1.2;
/** Inclinación del bolígrafo hacia donde avanza, como en el video (grados). */
const TILT_DEG = 18;
/** Vueltas que da sobre su propio eje mientras cruza. */
const TURNS = 2.25;

export interface PenSceneOptions {
  /** Distancia en px desde el borde inferior del lienzo hasta la línea donde escribe. */
  baseline: number;
  /** Alto del bolígrafo en pantalla (px). */
  penHeight: number;
  /** Cada cuadro: dónde va la punta, de 0 (borde izquierdo) a 1 (borde derecho). */
  onProgress: (progress: number) => void;
}

export interface PenScene {
  /** Cruza de izquierda a derecha en `duration` ms; se resuelve al salir por la derecha. */
  play: (duration: number) => Promise<void>;
  dispose: () => void;
}

/** Suave al arrancar y al terminar, como una mano que escribe. */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Escena con cámara ortográfica en píxeles (origen abajo a la izquierda) y fondo transparente.
 * Jerarquía: punta (posición) → inclinación → giro sobre su eje → modelo. Así gira sin que la
 * punta se despegue de la línea.
 */
export async function createPenScene(
  canvas: HTMLCanvasElement,
  { baseline, penHeight, onProgress }: PenSceneOptions,
): Promise<PenScene> {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;

  const scene = new Scene();
  // Reflejos de estudio para el metal (clip y punta) y el lacado negro.
  const pmrem = new PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  // Reflejos suaves: con más, el lacado negro se ve gris.
  scene.environmentIntensity = 0.45;
  const key = new DirectionalLight(0xffffff, 1.2);
  key.position.set(-1, 2, 3);
  scene.add(key);

  const camera = new OrthographicCamera(0, 1, 1, 0, -1000, 1000);
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.right = w;
    camera.top = h;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);

  const spin = new Group();
  spin.add(gltf.scene);
  spin.scale.setScalar(penHeight / MODEL_HEIGHT);
  const tilt = new Group();
  tilt.add(spin);
  // Hacia adelante (derecha) y un poco hacia la cámara, para verlo en tres cuartos.
  tilt.rotation.set(MathUtils.degToRad(-12), 0, MathUtils.degToRad(-TILT_DEG));
  const tip = new Group();
  tip.add(tilt);
  tip.position.y = baseline;
  scene.add(tip);

  let frame = 0;

  const play = (duration: number) =>
    new Promise<void>((resolve) => {
      const start = performance.now();
      // Entra y sale completo: arranca antes del borde izquierdo y termina pasado el derecho.
      const margin = penHeight * 0.5;
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = easeInOut(t);
        const width = canvas.clientWidth;
        const x = -margin + eased * (width + 2 * margin);
        tip.position.x = x;
        spin.rotation.y = eased * TURNS * Math.PI * 2;
        renderer.render(scene, camera);
        onProgress(MathUtils.clamp(x / width, 0, 1));
        if (t < 1) frame = requestAnimationFrame(step);
        else resolve();
      };
      frame = requestAnimationFrame(step);
    });

  const dispose = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    gltf.scene.traverse((object) => {
      if (object instanceof Mesh) object.geometry.dispose();
    });
    environment.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  return { play, dispose };
}
