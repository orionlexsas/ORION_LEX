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
/** Qué tan rápido alcanza su destino (por cuadro): con el scroll y cuando se arrastra. */
const FOLLOW = 0.12;
const DRAG_FOLLOW = 0.4;
/** Al moverse se inclina hacia donde va (grados por px de avance en un cuadro), con un tope. */
const LEAN_PER_PX = 0.5;
const MAX_LEAN_DEG = 16;
/** Balanceo al pasar el mouse: amplitud (grados) y duración (ms). */
const WOBBLE_DEG = 14;
const WOBBLE_MS = 1300;
/** Vueltas rápidas al hacer clic o tocarlo, y su duración (ms). */
const TWIRL_TURNS = 2;
const TWIRL_MS = 900;

/** Rectángulo que ocupa el bolígrafo en el lienzo (px, origen abajo a la izquierda). */
export interface PenBox {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export interface PenSceneOptions {
  /** Distancia en px desde el borde inferior del lienzo hasta la línea donde escribe. */
  baseline: number;
  /** Alto del bolígrafo en pantalla (px). */
  penHeight: number;
  /** Cada cuadro: dónde va la punta (0 = borde izquierdo, 1 = derecho) y dónde está el bolígrafo. */
  onFrame: (progress: number, box: PenBox) => void;
}

export interface PenScene {
  /** Destino según el scroll (0 = fuera por la izquierda, 1 = fuera por la derecha). */
  setTarget: (progress: number) => void;
  /** Mientras se arrastra: lleva la punta a esta x del lienzo (px), sin despegarla de la línea. */
  dragTipTo: (x: number) => void;
  /** Reacción al pasar el mouse (balanceo) o al tocarlo sin arrastrar (vueltas + balanceo). */
  poke: (kind: 'hover' | 'tap') => void;
  dispose: () => void;
}

const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * Escena con cámara ortográfica en píxeles (origen abajo a la izquierda) y fondo transparente.
 * Jerarquía: punta (posición) → balanceo/inclinación al moverse → inclinación fija → giro sobre su
 * eje → modelo. Todo gira alrededor de la punta, así nunca se despega de la línea. Solo dibuja
 * cuadros mientras algo se mueve (scroll, arrastre, balanceo o vueltas).
 */
export async function createPenScene(
  canvas: HTMLCanvasElement,
  { baseline, penHeight, onFrame }: PenSceneOptions,
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
  const toProgress = (x: number) => (x + margin) / (canvas.clientWidth + 2 * margin);
  let current = 0;
  let target = 0;
  let follow = FOLLOW;
  let lastX = Number.NaN;
  let lean = 0;
  let wobbleStart = -Infinity;
  let twirlStart = -Infinity;
  let frame = 0;

  // Eje del bolígrafo en pantalla (de la punta a la tapa) para ubicar la zona que se puede tocar.
  const from = new Vector3();
  const to = new Vector3();
  const box = (): PenBox => {
    scene.updateMatrixWorld();
    spin.localToWorld(from.set(0, 0, 0));
    spin.localToWorld(to.set(0, MODEL_HEIGHT, 0));
    const pad = penHeight * 0.08;
    return {
      left: Math.min(from.x, to.x) - pad,
      right: Math.max(from.x, to.x) + pad,
      bottom: Math.min(from.y, to.y),
      top: Math.max(from.y, to.y) + pad,
    };
  };

  const draw = (now: number) => {
    frame = 0;
    current += (target - current) * follow;
    if (Math.abs(target - current) < 0.0005) current = target;

    const width = canvas.clientWidth;
    const x = -margin + current * (width + 2 * margin);
    tip.position.x = x;

    // Se inclina hacia donde avanza (la tapa adelante) y se endereza al quedarse quieto.
    const step = Number.isNaN(lastX) ? 0 : x - lastX;
    lastX = x;
    const wantedLean = -MathUtils.degToRad(
      MathUtils.clamp(step * LEAN_PER_PX, -MAX_LEAN_DEG, MAX_LEAN_DEG),
    );
    lean += (wantedLean - lean) * 0.2;
    if (Math.abs(lean) < 0.0005) lean = 0;

    const twirlT = Math.min((now - twirlStart) / TWIRL_MS, 1);
    const twirl = twirlT < 1 ? easeOut(twirlT) * TWIRL_TURNS * Math.PI * 2 : 0;
    spin.rotation.y = current * TURNS * Math.PI * 2 + twirl;

    const wobbleT = (now - wobbleStart) / WOBBLE_MS;
    const wobble =
      wobbleT < 1
        ? MathUtils.degToRad(WOBBLE_DEG) * Math.exp(-4 * wobbleT) * Math.sin(wobbleT * Math.PI * 6)
        : 0;
    rock.rotation.z = lean + wobble;

    renderer.render(scene, camera);
    onFrame(MathUtils.clamp(x / width, 0, 1), box());

    if (current !== target || lean !== 0 || wobbleT < 1 || twirlT < 1) {
      frame = requestAnimationFrame(draw);
    }
  };
  const wake = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };

  // Cambiar el tamaño borra el lienzo: solo si de verdad cambió (en el celular llegan eventos
  // resize con cada aparición de la barra de direcciones) y redibujando en el acto, sin parpadeo.
  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w === camera.right && h === camera.top) return;
    renderer.setSize(w, h, false);
    camera.right = w;
    camera.top = h;
    camera.updateProjectionMatrix();
    cancelAnimationFrame(frame);
    draw(performance.now());
  };
  resize();
  window.addEventListener('resize', resize);

  return {
    setTarget: (progress) => {
      follow = FOLLOW;
      target = MathUtils.clamp(progress, 0, 1);
      wake();
    },
    dragTipTo: (x) => {
      follow = DRAG_FOLLOW;
      // Se puede llevar de un borde al otro, pero no sacarlo de la pantalla.
      target = MathUtils.clamp(toProgress(x), toProgress(0), toProgress(canvas.clientWidth));
      wake();
    },
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
