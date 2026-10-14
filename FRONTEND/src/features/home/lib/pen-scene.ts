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
  Vector3,
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
/** Vueltas que da sobre su propio eje al cruzar de lado a lado. */
const TURNS = 2.25;
/** Qué tan rápido alcanza la posición que marca el scroll (por cuadro, a 60 fps). */
const FOLLOW = 0.12;
/** Balanceo al pasar el mouse: amplitud (grados) y duración (ms). */
const WOBBLE_DEG = 14;
const WOBBLE_MS = 1300;
/** Vueltas rápidas al hacer clic o tocarlo, y su duración (ms). */
const TWIRL_TURNS = 2;
const TWIRL_MS = 900;

export interface PenSceneOptions {
  /** Distancia en px desde el borde inferior del lienzo hasta la línea donde escribe. */
  baseline: number;
  /** Alto del bolígrafo en pantalla (px). */
  penHeight: number;
  /** Cada cuadro: dónde va la punta, de 0 (borde izquierdo) a 1 (borde derecho). */
  onProgress: (progress: number) => void;
}

export interface PenScene {
  /** Hasta dónde debe llegar (0 = fuera por la izquierda, 1 = fuera por la derecha). */
  setTarget: (progress: number) => void;
  /** ¿El puntero (coordenadas de pantalla) está sobre el bolígrafo? */
  hitTest: (clientX: number, clientY: number) => boolean;
  /** Reacción al pasar el mouse (balanceo) o al hacer clic / tocarlo (vueltas + balanceo). */
  poke: (kind: 'hover' | 'tap') => void;
  dispose: () => void;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Escena con cámara ortográfica en píxeles (origen abajo a la izquierda) y fondo transparente.
 * Jerarquía: punta (posición) → balanceo → inclinación → giro sobre su eje → modelo. Todo gira
 * alrededor de la punta, así nunca se despega de la línea. Solo dibuja cuadros mientras algo se
 * mueve (scroll, balanceo o vueltas).
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

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(MODEL_URL);

  const spin = new Group();
  spin.add(gltf.scene);
  spin.scale.setScalar(penHeight / MODEL_HEIGHT);
  const tilt = new Group();
  tilt.add(spin);
  // Hacia adelante (derecha) y un poco hacia la cámara, para verlo en tres cuartos.
  tilt.rotation.set(MathUtils.degToRad(-12), 0, MathUtils.degToRad(-TILT_DEG));
  const rock = new Group();
  rock.add(tilt);
  const tip = new Group();
  tip.add(rock);
  tip.position.y = baseline;
  scene.add(tip);

  // Entra y sale completo: arranca antes del borde izquierdo y termina pasado el derecho.
  const margin = penHeight * 0.5;
  let current = 0;
  let target = 0;
  let wobbleStart = -Infinity;
  let twirlStart = -Infinity;
  let frame = 0;

  const draw = (now: number) => {
    frame = 0;
    current += (target - current) * FOLLOW;
    if (Math.abs(target - current) < 0.0005) current = target;

    const width = canvas.clientWidth;
    const x = -margin + current * (width + 2 * margin);
    tip.position.x = x;

    const twirlT = Math.min((now - twirlStart) / TWIRL_MS, 1);
    const twirl = twirlT < 1 ? easeOut(twirlT) * TWIRL_TURNS * Math.PI * 2 : 0;
    spin.rotation.y = current * TURNS * Math.PI * 2 + twirl;

    const wobbleT = (now - wobbleStart) / WOBBLE_MS;
    rock.rotation.z =
      wobbleT < 1
        ? MathUtils.degToRad(WOBBLE_DEG) * Math.exp(-4 * wobbleT) * Math.sin(wobbleT * Math.PI * 6)
        : 0;

    renderer.render(scene, camera);
    onProgress(MathUtils.clamp(x / width, 0, 1));

    if (current !== target || wobbleT < 1 || twirlT < 1) frame = requestAnimationFrame(draw);
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    renderer.setSize(w, h, false);
    camera.right = w;
    camera.top = h;
    camera.updateProjectionMatrix();
    wake();
  };
  resize();
  window.addEventListener('resize', resize);

  // Eje del bolígrafo en pantalla, de la punta a la tapa, para saber si el puntero está encima.
  const from = new Vector3();
  const to = new Vector3();
  const hitTest = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = rect.bottom - clientY;
    scene.updateMatrixWorld();
    spin.localToWorld(from.set(0, 0, 0));
    spin.localToWorld(to.set(0, MODEL_HEIGHT, 0));
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const t = MathUtils.clamp(
      ((px - from.x) * dx + (py - from.y) * dy) / (dx * dx + dy * dy),
      0,
      1,
    );
    const distance = Math.hypot(px - (from.x + t * dx), py - (from.y + t * dy));
    return distance < penHeight * 0.09 + 12;
  };

  return {
    setTarget: (progress) => {
      target = MathUtils.clamp(progress, 0, 1);
      wake();
    },
    hitTest,
    poke: (kind) => {
      const now = performance.now();
      wobbleStart = now;
      if (kind === 'tap') twirlStart = now;
      wake();
    },
    dispose: () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      gltf.scene.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
