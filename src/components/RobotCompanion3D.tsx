import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type RobotReactionType = 'love' | 'wink' | 'happy' | 'shy' | 'celebrate' | 'spin' | 'scan' | 'curious';

interface ReactionConfig {
  type: RobotReactionType;
  duration: number; // in ms
  dialogues: string[];
  sound: 'love' | 'wink' | 'happy' | 'shy' | 'celebrate' | 'spin' | 'scan' | 'curious';
}

const REACTION_CONFIGS: ReactionConfig[] = [
  {
    type: 'love',
    duration: 3000,
    sound: 'love',
    dialogues: [
      "Aww, sending you cyber love! 💖✨",
      "You make my circuits flutter! 💓🥰",
      "Yasindu built me with clean code and lots of love! 💝",
      "Yay! Thank you for visiting our portfolio! 💕",
    ]
  },
  {
    type: 'wink',
    duration: 2600,
    sound: 'wink',
    dialogues: [
      "Wink! Yasindu is ready to craft your next great project! 😉✨",
      "Psst... check out the live projects and github links below! 😉",
      "100% bug-free vibes coming your way! 😉🚀",
      "Did you know? Great UI brings smiles to everyone!",
    ]
  },
  {
    type: 'happy',
    duration: 2800,
    sound: 'happy',
    dialogues: [
      "Yay! Best tech explorer of the day spotted! 🌟",
      "Woohoo! Energy levels at 200%! Let's build! 🚀",
      "FinOps + React + Three.js = Pure delight! ⚡",
    ]
  },
  {
    type: 'shy',
    duration: 2800,
    sound: 'shy',
    dialogues: [
      "Hehe... you're making my CPU blush! ⁄(⁄ ⁄•⁄-⁄•⁄ ⁄)⁄ 🌸",
      "Shy mode activated! Thank you for the kind tap! ✨",
      "System temperature rising... from pure happiness! 💓",
    ]
  },
  {
    type: 'celebrate',
    duration: 3000,
    sound: 'celebrate',
    dialogues: [
      "High five! Double victory celebration! 🎉",
      "Cloud FinOps + Modern UI = Pure Magic! ☁️",
      "Super Combo! You're an awesome explorer!",
    ]
  },
  {
    type: 'spin',
    duration: 2400,
    sound: 'spin',
    dialogues: [
      "Whoosh! 360° diagnostics complete! ✨",
      "Full orbit achieved! Systems running at 100%! 🛸",
      "Turbo boost engaged! Ready for takeoff!",
    ]
  },
  {
    type: 'scan',
    duration: 2600,
    sound: 'scan',
    dialogues: [
      "Scanning visitor... Status: Brilliant developer spotted! 🔍",
      "Neural link synchronized! Telemetry optimal.",
      "Analyzing cloud architecture... Cost efficiency 100%!",
    ]
  },
  {
    type: 'curious',
    duration: 2800,
    sound: 'curious',
    dialogues: [
      "Hmm... Looking for cloud engineering or UI design? 🤔",
      "Did you know Yasindu continuously optimizes cloud value?",
      "Curious explorer spotted! Ask me anything about my creator!",
    ]
  }
];

export default function RobotCompanion3D({ animated = true }: { animated?: boolean }) {
  // Dedicated canvas host ref (React NEVER modifies this DOM node's children)
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const motionEnabled = useRef(animated);
  const [dialogue, setDialogue] = useState<string>('');
  const [comboCount, setComboCount] = useState<number>(0);
  const dialogueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentReactionRef = useRef<RobotReactionType>('love');
  const reactionStartRef = useRef<number>(0);
  const reactionDurationRef = useRef<number>(0);
  const spinStartAngleRef = useRef<number>(0);
  const reactionIndexRef = useRef<number>(0);
  const robotRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    motionEnabled.current = animated;
  }, [animated]);

  // ── Multi-Sound Futuristic & Cute Web Audio Synthesizer ──
  const playSound = useCallback((soundType: string) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (soundType === 'love') {
        // Sweet magical harp / glockenspiel ascending chime (E5 -> G#5 -> B5 -> E6)
        const notes = [659.25, 830.61, 987.77, 1318.51];
        notes.forEach((freq, idx) => {
          const delay = idx * 0.085;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.12, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.38);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.39);
        });
      } else if (soundType === 'wink') {
        // Playful cute double-tone chirp with upward bend
        [0, 0.09].forEach((delay, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          const startF = i === 0 ? 1200 : 1760;
          osc.frequency.setValueAtTime(startF, now + delay);
          osc.frequency.exponentialRampToValueAtTime(startF * 1.25, now + delay + 0.1);
          gain.gain.setValueAtTime(0.1, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.15);
        });
      } else if (soundType === 'happy') {
        // Cheerful major chord bounce
        [587.33, 739.99, 880.0, 1174.66].forEach((freq, i) => {
          const delay = i * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.11, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.29);
        });
      } else if (soundType === 'shy') {
        // Cute soft blushing whistle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1046, now + 0.28);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (soundType === 'celebrate') {
        // Upbeat victory arpeggio (C5 -> E5 -> G5 -> C6)
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const delay = i * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.12, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.26);
        });
      } else if (soundType === 'spin') {
        // Sci-Fi jetpack whoosh frequency sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1280, now + 0.22);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.45);
        gain.gain.setValueAtTime(0.13, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (soundType === 'scan') {
        // High-tech scanner sonar beep sequence
        [0, 0.1, 0.2].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1480, now + delay);
          gain.gain.setValueAtTime(0.08, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.08);
        });
      } else {
        // Inquisitive two-tone whistle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659, now);
        osc.frequency.exponentialRampToValueAtTime(987, now + 0.22);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.31);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // ── Trigger Next Interactive Reaction ──
  const triggerNextReaction = useCallback(() => {
    // Increment combo
    setComboCount(prev => {
      const next = prev + 1;
      if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
      comboTimerRef.current = setTimeout(() => setComboCount(0), 2400);
      return next;
    });

    if (robotRef.current) {
      spinStartAngleRef.current = robotRef.current.rotation.y;
    }

    // Cycle reaction
    const idx = reactionIndexRef.current % REACTION_CONFIGS.length;
    reactionIndexRef.current += 1;
    const cfg = REACTION_CONFIGS[idx];

    currentReactionRef.current = cfg.type;
    reactionStartRef.current = performance.now();
    reactionDurationRef.current = cfg.duration;

    // Play cute sound
    playSound(cfg.sound);

    // Set speech dialogue
    const randomMsg = cfg.dialogues[Math.floor(Math.random() * cfg.dialogues.length)];
    setDialogue(randomMsg);
    if (dialogueTimerRef.current) clearTimeout(dialogueTimerRef.current);
    dialogueTimerRef.current = setTimeout(() => setDialogue(''), 3800);
  }, [playSound]);

  // Stable ref for triggerNextReaction so useEffect never needs it in deps
  const triggerReactionRef = useRef(triggerNextReaction);
  triggerReactionRef.current = triggerNextReaction;

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    container.appendChild(renderer.domElement);

    // WebGL Context Loss Prevention & Restoration
    const canvas = renderer.domElement;
    const handleContextLost = (e: Event) => {
      e.preventDefault(); // Prevents browser from abandoning WebGL context!
    };
    canvas.addEventListener('webglcontextlost', handleContextLost, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
    camera.position.set(0, 1.9, 9.5);
    camera.lookAt(0, 1.9, 0);

    // Realistic Room Environment for clearcoat and glass reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const environmentMap = pmrem.fromScene(environment, 0.04);
    scene.environment = environmentMap.texture;
    environment.dispose();
    pmrem.dispose();

    // ── High-Fidelity Robot Materials (100% Faithful to Reference Model) ──
    const shell = new THREE.MeshPhysicalMaterial({
      color: 0x079b9c,
      metalness: 0.04,
      roughness: 0.48,
      clearcoat: 0.18,
      clearcoatRoughness: 0.4,
      specularIntensity: 0.25,
      envMapIntensity: 0.35,
    });

    const body = new THREE.MeshPhysicalMaterial({
      color: 0x086886,
      metalness: 0.04,
      roughness: 0.46,
      clearcoat: 0.18,
      clearcoatRoughness: 0.4,
      specularIntensity: 0.25,
      envMapIntensity: 0.35,
    });

    const joint = new THREE.MeshStandardMaterial({
      color: 0x164d61,
      metalness: 0.15,
      roughness: 0.48,
    });

    const trim = new THREE.MeshStandardMaterial({
      color: 0x0a1622,
      metalness: 0.9,
      roughness: 0.2,
    });

    const visor = new THREE.MeshPhysicalMaterial({
      color: 0x020810,
      metalness: 0.15,
      roughness: 0.08,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });

    const cyan = new THREE.MeshStandardMaterial({
      color: 0x21d9e0,
      emissive: 0x08aabb,
      emissiveIntensity: 0.65,
      toneMapped: false,
    });

    const seam = new THREE.MeshStandardMaterial({
      color: 0x0caab0,
      metalness: 0.18,
      roughness: 0.4,
    });

    const robot = new THREE.Group();
    robotRef.current = robot;
    scene.add(robot);

    function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
      const object = new THREE.Mesh(geometry, material);
      object.position.set(x, y, z);
      parent.add(object);
      return object;
    }

    function ellipsoid(parent: THREE.Object3D, material: THREE.Material, position: number[], scale: number[]) {
      const object = mesh(
        new THREE.SphereGeometry(1, window.innerWidth < 700 ? 32 : 48, window.innerWidth < 700 ? 24 : 32),
        material,
        parent,
        position[0],
        position[1],
        position[2]
      );
      object.scale.set(scale[0], scale[1], scale[2]);
      return object;
    }

    // Watertight Beveled Panel Generator with absarc (Zero Mesh Tears, Perfectly Closed)
    function roundedPanel(width: number, height: number, radius: number, depth: number, bevelSize = 0.06) {
      const shape = new THREE.Shape();
      const x = -width / 2;
      const y = -height / 2;
      shape.moveTo(x + radius, y);
      shape.lineTo(x + width - radius, y);
      shape.absarc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
      shape.lineTo(x + width, y + height - radius);
      shape.absarc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
      shape.lineTo(x + radius, y + height);
      shape.absarc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
      shape.lineTo(x, y + radius);
      shape.absarc(x + radius, y + radius, radius, Math.PI, (3 * Math.PI) / 2, false);
      shape.closePath();

      return new THREE.ExtrudeGeometry(shape, {
        depth,
        steps: 1,
        bevelEnabled: true,
        bevelSegments: 8,
        bevelSize,
        bevelThickness: bevelSize * 0.9,
        curveSegments: 32
      });
    }

    // ── Torso, Belly & Chest Reactor ──
    ellipsoid(robot, joint, [0, 0.15, 0], [0.98, 1.1, 0.73]);
    ellipsoid(robot, body, [0, 0.05, 0.15], [0.95, 1.12, 0.73]);
    ellipsoid(robot, shell, [0, -0.08, 0.76], [0.57, 0.76, 0.14]);
    const chestRing = mesh(new THREE.TorusGeometry(0.145, 0.022, 12, 48), seam, robot, 0, 0.3, 0.98);
    mesh(new THREE.CircleGeometry(0.115, 32), body, chestRing, 0, 0, -0.004);
    ellipsoid(chestRing, cyan, [0, 0, 0.015], [0.047, 0.047, 0.02]);

    // ── Arms ──
    const arms: THREE.Group[] = [];
    for (const side of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.88, 0.65, 0);
      arm.rotation.z = side * 0.26;
      robot.add(arm);
      ellipsoid(arm, joint, [0, -0.03, 0], [0.31, 0.37, 0.37]);
      ellipsoid(arm, shell, [side * 0.13, -0.6, 0.08], [0.36, 0.7, 0.4]);
      ellipsoid(arm, body, [side * 0.13, -1.03, 0.13], [0.3, 0.27, 0.34]);
      const cuff = mesh(new THREE.TorusGeometry(0.285, 0.018, 12, 48), seam, arm, side * 0.13, -1.04, 0.08);
      cuff.rotation.x = Math.PI / 2;
      arms.push(arm);
    }

    mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.37, 48), joint, robot, 0, 1.02);

    // ── Head & Face Stack (Exact Match to Reference Robot Image) ──
    const head = new THREE.Group();
    head.position.set(0, 2.21, 0);
    head.rotation.y = -0.07;
    robot.add(head);

    // 1. Turquoise Outer Shell
    mesh(new RoundedBoxGeometry(3.55, 2.57, 1.85, 8, 0.8), shell, head);

    // 2. Cyan Inner Bezel Ring (Neatly scaled so zero corners poke through the shell)
    mesh(roundedPanel(2.96, 1.88, 0.70, 0.025, 0.05), cyan, head, 0, -0.03, 0.83);

    // 3. Black Accent Trim Frame
    mesh(roundedPanel(2.89, 1.81, 0.67, 0.035, 0.05), trim, head, 0, -0.03, 0.86);

    // 4. Mirror-Smooth Glossy OLED Visor Screen (Exact Curved Glass Highlight)
    mesh(roundedPanel(2.80, 1.72, 0.64, 0.04, 0.05), visor, head, 0, -0.03, 0.96);

    // Side Ear Pods
    for (const side of [-1, 1]) {
      const pod = mesh(new THREE.CylinderGeometry(0.49, 0.49, 0.2, 64), trim, head, side * 1.78, -0.05, -0.02);
      pod.rotation.z = Math.PI / 2;
      const cap = mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.13, 64), body, head, side * 1.9, -0.05, -0.02);
      cap.rotation.z = Math.PI / 2;
      const rim = mesh(new THREE.TorusGeometry(0.435, 0.018, 12, 64), cyan, head, side * 1.98, -0.05, -0.02);
      rim.rotation.y = Math.PI / 2;
    }

    // ── Facial Expression Components ──
    const eyes = new THREE.Group();
    eyes.position.set(0, 0, 1.1);
    head.add(eyes);

    const eyeMeshes: THREE.Mesh[] = [];
    const happyEyes: THREE.Mesh[] = [];
    for (const side of [-1, 1]) {
      // Upright cyan oval eyes matching photo
      const eye = ellipsoid(eyes, cyan, [side * 0.62, 0.08, 0], [0.21, 0.35, 0.075]);
      eye.rotation.z = side * -0.06;
      eyeMeshes.push(eye);

      // Cute happy curved eyes (^ ^) for joy/love reactions
      const happyEye = mesh(new THREE.TorusGeometry(0.21, 0.045, 8, 32, Math.PI), cyan, eyes, side * 0.62, 0.08, 0.02);
      happyEye.visible = false;
      happyEyes.push(happyEye);
    }

    // Glowing Cute Smile
    const smileCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, -0.38, 1.13),
      new THREE.Vector3(0, -0.46, 1.13),
      new THREE.Vector3(0.18, -0.38, 1.13),
    ]);
    const smile = mesh(new THREE.TubeGeometry(smileCurve, 20, 0.024, 8, false), cyan, head);

    // Soft Teal Blushing Cheeks (Exact color and oval placement from reference photo)
    const cheekMaterial = new THREE.MeshBasicMaterial({
      color: 0x65c9c2,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const cheeks: THREE.Mesh[] = [];
    for (const side of [-1, 1]) {
      const ch = ellipsoid(head, cheekMaterial, [side * 1.02, -0.29, 1.1], [0.14, 0.065, 0.018]);
      cheeks.push(ch);
    }

    // Golden Antenna
    const gold = new THREE.MeshStandardMaterial({ color: 0xcfae5e, metalness: 0.78, roughness: 0.3 });
    const antenna = new THREE.Group();
    antenna.position.set(0, 1.22, -0.03);
    head.add(antenna);
    mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.51, 20), gold, antenna, 0, 0.25, 0);
    ellipsoid(antenna, gold, [0, 0.62, 0], [0.17, 0.17, 0.17]);

    // Soft Radial Halo Glows around Eyes
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = glowCanvas.height = 64;
    const ctx = glowCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.38)');
      gradient.addColorStop(0.25, 'rgba(0, 229, 255, 0.18)');
      gradient.addColorStop(0.6, 'rgba(0, 200, 255, 0.06)');
      gradient.addColorStop(1, 'rgba(0, 180, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    for (const side of [-1, 1]) {
      const glow = new THREE.Sprite(glowMaterial);
      glow.position.set(side * 0.62, 0.08, 0.12);
      glow.scale.set(1.0, 1.25, 1.0);
      eyes.add(glow);
    }

    // ── Balanced Crisp Lighting from Reference ──
    scene.add(new THREE.HemisphereLight(0xc0ecf0, 0x285965, 1.3));
    const key = new THREE.DirectionalLight(0xd6f3ed, 2.0);
    key.position.set(-3, 6, 5);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x9cdae5, 1.0);
    fill.position.set(2, 0.5, 6);
    scene.add(fill);

    const rimLight = new THREE.DirectionalLight(0x61e7ee, 1.2);
    rimLight.position.set(4, 2, -3);
    scene.add(rimLight);

    const leftRim = new THREE.DirectionalLight(0x61e7ee, 0.8);
    leftRim.position.set(-4, 0, -1);
    scene.add(leftRim);

    const warm = new THREE.PointLight(0xffe5bd, 0.8, 14);
    warm.position.set(-3, 4, 3);
    scene.add(warm);

    const underGlow = new THREE.PointLight(0x61e7ee, 0.65, 12);
    underGlow.position.set(0, -1.8, 2);
    scene.add(underGlow);

    // ── Pointer & Action Tracking ──
    const target = new THREE.Vector2();
    let isHovered = false;

    const pointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      target.set(Math.max(-1.2, Math.min(1.2, x)), Math.max(-1.2, Math.min(1.2, y)));
    };

    const resetPointer = () => target.set(0, 0);

    window.addEventListener('pointermove', pointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetPointer);

    const onPointerEnter = () => { isHovered = true; };
    const onPointerLeave = () => { isHovered = false; target.set(0, 0); };

    container.addEventListener('pointerenter', onPointerEnter);
    container.addEventListener('pointerleave', onPointerLeave);

    // ── Throttled Resize (Prevents WebGL Context Crashes During Transitions) ──
    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height || width <= 0 || height <= 0) return;
      if (Math.abs(width - lastW) < 2 && Math.abs(height - lastH) < 2) return;
      lastW = width;
      lastH = height;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      if (isFinite(camera.aspect) && camera.aspect > 0) {
        camera.position.z = Math.max(9.5, 6.5 / camera.aspect);
        camera.updateProjectionMatrix();
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    // Context restored recovery
    const handleContextRestored = () => {
      lastW = 0;
      lastH = 0;
      resize();
    };
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

    // Immediate first frame render
    renderer.render(scene, camera);

    // ── Animation Loop ──
    let frame = 0;
    let lastTime = performance.now();

    function render(now: number) {
      frame = requestAnimationFrame(render);
      if (document.hidden || !container!.getClientRects().length) {
        lastTime = now;
        return;
      }
      if (now - lastTime < 1000 / 60) return;

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const enabled = motionEnabled.current;
      const t = now / 1000;
      const ease = 1 - Math.exp(-delta * 6);

      // Reaction state
      const reactionElapsed = now - reactionStartRef.current;
      const isReacting = reactionElapsed >= 0 && reactionElapsed < reactionDurationRef.current;
      const reactionProgress = isReacting ? Math.min(1, Math.max(0, reactionElapsed / (reactionDurationRef.current || 1))) : 0;
      const reaction = isReacting ? currentReactionRef.current : 'idle';

      // Keep scale rock-solid at (1, 1, 1) to eliminate any disappearing glitch
      robot.scale.set(1, 1, 1);

      // ── Head Rotation & Cursor Tracking ──
      let targetHeadY = enabled ? target.x * 0.32 - 0.07 : -0.07;
      let targetHeadX = enabled ? target.y * 0.14 : 0;
      let targetHeadZ = enabled ? (isHovered ? 0.09 : Math.sin(t * 0.65) * 0.018) : 0;

      // Specialized reaction posing
      let targetRobotY = enabled ? Math.sin(t * 1.5) * 0.045 : 0;
      let targetRobotRotY = 0;

      if (isReacting) {
        if (reaction === 'love') {
          // Sweet gentle floating bounce with loving head tilts
          targetRobotY += Math.sin(reactionProgress * Math.PI * 2) * 0.14;
          targetHeadZ = Math.sin(t * 3.5) * 0.12;
          targetHeadX = -0.05;
        } else if (reaction === 'wink') {
          // Playful wink head tilt
          targetHeadZ = -0.22;
          targetHeadY += 0.14;
        } else if (reaction === 'happy') {
          // Cheerful jump & wave
          targetRobotY += Math.sin(reactionProgress * Math.PI * 3) * 0.18;
          targetHeadZ = Math.sin(t * 8) * 0.06;
        } else if (reaction === 'shy') {
          // Shy head tilt downwards
          targetHeadZ = 0.18;
          targetHeadX = 0.12;
          targetRobotY += Math.sin(t * 4) * 0.03;
        } else if (reaction === 'spin') {
          // 360-degree pirouette spin
          targetRobotRotY = spinStartAngleRef.current + Math.sin(reactionProgress * Math.PI * 0.5) * (Math.PI * 2);
          targetRobotY += Math.sin(reactionProgress * Math.PI) * 0.2;
        } else if (reaction === 'celebrate') {
          // Double victory jump
          targetRobotY += Math.abs(Math.sin(reactionProgress * Math.PI * 4)) * 0.22;
          targetHeadZ = Math.sin(t * 10) * 0.06;
        } else if (reaction === 'scan') {
          // Horizontal scanner sweep
          targetHeadY = Math.sin(t * 6) * 0.28;
          targetHeadX = 0;
        } else if (reaction === 'curious') {
          // Big inquisitive tilt
          targetHeadZ = 0.28;
          targetHeadX = -0.08;
        }
      }

      if (reaction === 'spin') {
        robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, targetRobotRotY, ease * 1.5);
      } else {
        robot.rotation.y = THREE.MathUtils.lerp(robot.rotation.y, 0, ease);
      }

      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetHeadY, ease);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetHeadX, ease);
      head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, targetHeadZ, ease);

      antenna.rotation.z = enabled ? Math.sin(t * (isReacting ? 5 : 2.2)) * (isReacting ? 0.14 : 0.04) : 0;
      robot.position.y = THREE.MathUtils.lerp(robot.position.y, targetRobotY, ease);

      // Eyes follow pointer
      eyes.position.x = THREE.MathUtils.lerp(eyes.position.x, enabled ? target.x * 0.08 : 0, ease);
      eyes.position.y = THREE.MathUtils.lerp(eyes.position.y, enabled ? -target.y * 0.06 : 0, ease);

      // Natural blink cycle (suppressed during reactions)
      const blinkPhase = t % 5.3;
      const isBlinking = !isReacting && enabled && blinkPhase < 0.16;
      const blinkScale = isBlinking ? Math.max(0.08, Math.abs(blinkPhase - 0.08) / 0.08) : 1;

      // ── Facial Expressions on Visor Screen ──
      if (reaction === 'love') {
        // Cute happy curved eyes (^ ^)
        eyeMeshes.forEach(eye => { eye.visible = false; });
        happyEyes.forEach(eye => { eye.visible = true; });
        smile.visible = true;
        smile.scale.set(1.24, 1.2, 1);
        cheekMaterial.color.setHex(0xff5599);
        cheekMaterial.opacity = 0.8;
      } else if (reaction === 'wink') {
        // Left eye normal open, Right eye cute winking slit
        eyeMeshes[0].visible = true;
        eyeMeshes[0].scale.set(0.21, 0.35, 0.075);
        eyeMeshes[1].visible = true;
        eyeMeshes[1].scale.set(0.21, 0.04, 0.075);
        happyEyes.forEach(eye => { eye.visible = false; });
        cheekMaterial.color.setHex(0x65c9c2);
        cheekMaterial.opacity = 0.7;
        smile.visible = true;
        smile.scale.set(1.15, 1.15, 1);
      } else if (reaction === 'happy' || reaction === 'celebrate') {
        // Happy curved eyes
        eyeMeshes.forEach(eye => { eye.visible = false; });
        happyEyes.forEach(eye => { eye.visible = true; });
        smile.visible = true;
        smile.scale.set(1.22, 1.18, 1);
        cheekMaterial.color.setHex(0x65c9c2);
        cheekMaterial.opacity = 0.7;
      } else if (reaction === 'shy') {
        // Soft lowered eyes, warm blush
        eyeMeshes.forEach(eye => {
          eye.visible = true;
          eye.scale.set(0.18, 0.22, 0.075);
        });
        happyEyes.forEach(eye => { eye.visible = false; });
        cheekMaterial.color.setHex(0xff66a3);
        cheekMaterial.opacity = 0.85;
        smile.visible = true;
        smile.scale.set(0.9, 0.9, 1);
      } else if (reaction === 'scan') {
        // Narrow cyber scan beam eyes
        eyeMeshes.forEach(eye => {
          eye.visible = true;
          eye.scale.set(0.35, 0.08, 0.075);
        });
        happyEyes.forEach(eye => { eye.visible = false; });
        cheekMaterial.color.setHex(0x65c9c2);
        cheekMaterial.opacity = 0.45;
        (cyan as THREE.MeshStandardMaterial).emissiveIntensity = 0.9 + Math.sin(t * 16) * 0.4;
      } else {
        // Default idle (exact match to photo)
        eyeMeshes.forEach(eye => {
          eye.visible = true;
          eye.scale.set(0.21, 0.35 * blinkScale, 0.075);
        });
        happyEyes.forEach(eye => { eye.visible = false; });
        smile.visible = true;
        smile.scale.set(1, 1, 1);
        cheekMaterial.color.setHex(0x65c9c2);
        cheekMaterial.opacity = 0.45;
        (cyan as THREE.MeshStandardMaterial).emissiveIntensity = 0.65;
      }

      // ── Arm Gestures ──
      arms.forEach((arm, i) => {
        const side = i === 0 ? -1 : 1;
        let baseArmZ = side * (0.26 + (enabled ? Math.sin(t * 1.5) * 0.025 : 0));

        if (isReacting) {
          if (reaction === 'love') {
            baseArmZ = side * (0.65 + Math.sin(t * 5) * 0.12);
          } else if (reaction === 'wink') {
            if (i === 1) baseArmZ = 1.2;
          } else if (reaction === 'happy') {
            if (i === 1) baseArmZ = 1.8 + Math.sin(t * 9) * 0.3;
          } else if (reaction === 'celebrate') {
            baseArmZ = side * (1.85 + Math.sin(t * 12) * 0.2);
          } else if (reaction === 'shy') {
            baseArmZ = side * 0.75;
          } else if (reaction === 'spin') {
            baseArmZ = side * 1.4;
          } else if (reaction === 'curious') {
            if (i === 0) baseArmZ = -1.5;
          }
        }

        arm.rotation.z = THREE.MathUtils.lerp(arm.rotation.z, baseArmZ, ease * 1.2);
      });

      renderer.render(scene, camera);
    }

    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', pointerMove);
      document.documentElement.removeEventListener('pointerleave', resetPointer);
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materials.add(m));
        }
      });
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      glowTexture.dispose();
      glowMaterial.dispose();
      environmentMap.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      robotRef.current = null;
    };
  }, []); // Empty dependency array: Mounts once and NEVER tears down on click

  return (
    <div
      className="robot-companion-container"
      role="button"
      tabIndex={0}
      aria-label="Interactive 3D Robot Companion"
      title="Click or tap to trigger reactions, waves, spins, and sounds!"
      onClick={() => triggerReactionRef.current()}
    >
      {/* Dedicated Canvas Mount Point (Zero React Children inside -> Canvas never unmounts) */}
      <div ref={canvasMountRef} className="robot-canvas-mount" />

      {/* Dynamic Dialogue Speech Bubble as a separate sibling */}
      {dialogue && (
        <div className="robot-dialogue-bubble">
          {comboCount > 1 && <span className="combo-pill">x{comboCount}</span>}
          <span>{dialogue}</span>
        </div>
      )}
    </div>
  );
}
