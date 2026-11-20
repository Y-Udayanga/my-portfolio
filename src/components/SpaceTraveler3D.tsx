import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ── 1. PROCEDURAL SOUND SYNTHESIZER (Sparkle & Boing Chimes via Web Audio) ──
class CuteSoundSynth {
    ctx: AudioContext | null = null;

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playSparkleChime() {
        try {
            this.init();
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            // Pentatonic sparkle arpeggio: C5, E5, G5, B5, C6, E6
            const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
            notes.forEach((freq, idx) => {
                const osc = this.ctx!.createOscillator();
                const gain = this.ctx!.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, t + idx * 0.05);
                gain.gain.setValueAtTime(0.07, t + idx * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.38);
                osc.connect(gain);
                gain.connect(this.ctx!.destination);
                osc.start(t + idx * 0.05);
                osc.stop(t + idx * 0.05 + 0.38);
            });
        } catch {
            // Audio context policy fallback
        }
    }

    playBoing() {
        try {
            this.init();
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, t);
            osc.frequency.exponentialRampToValueAtTime(620, t + 0.12);
            osc.frequency.exponentialRampToValueAtTime(380, t + 0.28);
            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
        } catch {
            // Audio context policy fallback
        }
    }
}

// ── 2. VISOR BASE TEXTURE (Deep Obsidian-Violet with High Top Specular Highlight) ──
function createVisorDomeTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // Aurora candy visor: indigo core, violet mid, cyan rim
        const bgGrad = ctx.createRadialGradient(480, 420, 40, 512, 540, 560);
        bgGrad.addColorStop(0, '#6d4dff');
        bgGrad.addColorStop(0.28, '#3b1d8a');
        bgGrad.addColorStop(0.55, '#1a0b4a');
        bgGrad.addColorStop(0.82, '#12082e');
        bgGrad.addColorStop(1, '#070414');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1024, 1024);

        // Soft pink wash on the lower cheeks of the glass
        const blushWash = ctx.createRadialGradient(512, 720, 20, 512, 700, 340);
        blushWash.addColorStop(0, 'rgba(255, 110, 170, 0.28)');
        blushWash.addColorStop(1, 'rgba(255, 110, 170, 0)');
        ctx.fillStyle = blushWash;
        ctx.fillRect(0, 0, 1024, 1024);

        // Cyan rim glow along the bottom curve
        const rimWash = ctx.createRadialGradient(512, 980, 40, 512, 860, 420);
        rimWash.addColorStop(0, 'rgba(34, 211, 238, 0.35)');
        rimWash.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = rimWash;
        ctx.fillRect(0, 0, 1024, 1024);

        // Fine glass scanlines
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.045)';
        ctx.lineWidth = 1.2;
        for (let y = 0; y < 1024; y += 16) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1024, y);
            ctx.stroke();
        }

        // Big glossy specular blob, kept high so it stays off the face
        ctx.save();
        ctx.translate(430, 190);
        ctx.rotate(-0.32);
        const spec = ctx.createLinearGradient(-200, 0, 200, 0);
        spec.addColorStop(0, 'rgba(255, 255, 255, 0)');
        spec.addColorStop(0.35, 'rgba(255, 255, 255, 0.92)');
        spec.addColorStop(0.7, 'rgba(186, 230, 253, 0.55)');
        spec.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = spec;
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 28;
        ctx.beginPath();
        ctx.roundRect(-210, -42, 420, 84, 42);
        ctx.fill();
        ctx.restore();

        // Smaller side sparkle
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.shadowColor = '#f0abfc';
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.ellipse(790, 360, 22, 38, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Tiny star flecks on the glass
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        [[180, 260], [860, 240], [220, 640], [800, 700], [640, 160]].forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 3.2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// ── 3. PROCEDURAL STAR PARTICLES ──
function createStarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 60);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(0, 240, 255, 0.85)');
        grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.moveTo(64, 8);
        ctx.quadraticCurveTo(64, 64, 120, 64);
        ctx.quadraticCurveTo(64, 64, 64, 120);
        ctx.quadraticCurveTo(64, 64, 8, 64);
        ctx.quadraticCurveTo(64, 64, 64, 8);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

interface ReactionParticle {
    mesh: THREE.Mesh;
    vel: THREE.Vector3;
    rotVel: THREE.Vector3;
    life: number;
    decay: number;
}

const SpaceTraveler3D: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const soundFX = new CuteSoundSynth();

        // ── Scene & Camera ──
        const width = container.clientWidth || 480;
        const height = container.clientHeight || 480;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(0, -0.05, 7.5);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.28;
        container.appendChild(renderer.domElement);

        // ── Lighting ──
        const ambientLight = new THREE.AmbientLight(0xfff4fb, 0.72);
        scene.add(ambientLight);

        const hemi = new THREE.HemisphereLight(0xc4b5fd, 0xfb7185, 0.55);
        scene.add(hemi);

        const mainLight = new THREE.DirectionalLight(0xfff7ed, 1.55);
        mainLight.position.set(3.2, 8, 6);
        scene.add(mainLight);

        const rimCyan = new THREE.DirectionalLight(0x22d3ee, 1.45);
        rimCyan.position.set(-6, 2, 4);
        scene.add(rimCyan);

        const rimPink = new THREE.DirectionalLight(0xfb7185, 1.05);
        rimPink.position.set(5, 1, 3);
        scene.add(rimPink);

        const rimViolet = new THREE.DirectionalLight(0xc084fc, 0.9);
        rimViolet.position.set(2, -3, -4);
        scene.add(rimViolet);

        const visorFrontLight = new THREE.PointLight(0xa5f3fc, 2.4, 5.5);
        visorFrontLight.position.set(0, 1.05, 2.6);
        scene.add(visorFrontLight);

        const cheekLight = new THREE.PointLight(0xff8fab, 1.1, 3.2);
        cheekLight.position.set(0, 0.35, 2.4);
        scene.add(cheekLight);

        // ═══════════════════════════════════════════
        // VIBRANT COLOR MATERIALS
        // ═══════════════════════════════════════════
        const suitNavyMat = new THREE.MeshPhysicalMaterial({
            color: 0x2a3f78,
            roughness: 0.28,
            metalness: 0.08,
            clearcoat: 0.65,
            clearcoatRoughness: 0.18,
        });

        const suitCyanMat = new THREE.MeshPhysicalMaterial({
            color: 0x22d3ee,
            emissive: 0x0891b2,
            emissiveIntensity: 0.28,
            roughness: 0.22,
            metalness: 0.12,
            clearcoat: 0.85,
            clearcoatRoughness: 0.12,
        });

        const suitMintMat = new THREE.MeshPhysicalMaterial({
            color: 0x5eead4,
            emissive: 0x14b8a6,
            emissiveIntensity: 0.18,
            roughness: 0.2,
            metalness: 0.06,
            clearcoat: 0.9,
            clearcoatRoughness: 0.1,
        });

        const suitPinkMat = new THREE.MeshPhysicalMaterial({
            color: 0xfb7185,
            emissive: 0xbe185d,
            emissiveIntensity: 0.22,
            roughness: 0.24,
            metalness: 0.05,
            clearcoat: 0.8,
            clearcoatRoughness: 0.12,
        });

        const suitGoldMat = new THREE.MeshPhysicalMaterial({
            color: 0xfbbf24,
            emissive: 0xf59e0b,
            emissiveIntensity: 0.18,
            roughness: 0.22,
            metalness: 0.35,
            clearcoat: 0.7,
            clearcoatRoughness: 0.15,
        });

        const suitLavenderMat = new THREE.MeshPhysicalMaterial({
            color: 0xc4b5fd,
            emissive: 0x8b5cf6,
            emissiveIntensity: 0.16,
            roughness: 0.24,
            metalness: 0.08,
            clearcoat: 0.75,
            clearcoatRoughness: 0.14,
        });

        const suitWhiteMat = new THREE.MeshPhysicalMaterial({
            color: 0xfff7fb,
            roughness: 0.16,
            metalness: 0.04,
            clearcoat: 0.95,
            clearcoatRoughness: 0.08,
        });

        const suitDarkMat = new THREE.MeshPhysicalMaterial({
            color: 0x111827,
            roughness: 0.35,
            metalness: 0.25,
            clearcoat: 0.4,
            clearcoatRoughness: 0.2,
        });

        const redCapsuleMat = new THREE.MeshPhysicalMaterial({
            color: 0xfb4d6a,
            emissive: 0xe11d48,
            emissiveIntensity: 0.25,
            roughness: 0.18,
            metalness: 0.08,
            clearcoat: 1,
            clearcoatRoughness: 0.06,
        });

        const neonCyanMat = new THREE.MeshStandardMaterial({
            color: 0x67e8f9,
            emissive: 0x22d3ee,
            emissiveIntensity: 0.95,
            roughness: 0.18,
            metalness: 0.05,
        });

        const whiteCoreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
        });

        const irisDarkMat = new THREE.MeshStandardMaterial({
            color: 0x1e1b4b,
            roughness: 0.35,
            metalness: 0.05,
        });

        const pinkTongueMat = new THREE.MeshStandardMaterial({
            color: 0xff8fab,
            emissive: 0xfb7185,
            emissiveIntensity: 0.35,
            roughness: 0.4,
        });

        const pinkBlushMat = new THREE.MeshStandardMaterial({
            color: 0xff6b93,
            emissive: 0xfb7185,
            emissiveIntensity: 0.45,
            transparent: true,
            opacity: 0.82,
            roughness: 0.55,
        });

        // Visor Dome Materials
        const visorDomeTex = createVisorDomeTexture();
        const visorDomeMat = new THREE.MeshStandardMaterial({
            map: visorDomeTex,
            roughness: 0.1,
            metalness: 0.2,
        });

        const visorGlassOverlayMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.12,
            roughness: 0.04,
            metalness: 0.1,
            reflectivity: 0.95,
            clearcoat: 1.0,
            clearcoatRoughness: 0.04,
            depthWrite: false,
        });

        // ── Astronaut Master Group ──
        const astronautMasterGroup = new THREE.Group();
        scene.add(astronautMasterGroup);

        const astronautGroup = new THREE.Group();
        astronautMasterGroup.add(astronautGroup);

        // ═══════════════════════════════════════════
        // 1. HEAD & REDESIGNED HELMET SCREEN + CUTE 3D FACE
        // ═══════════════════════════════════════════
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.9, 0);
        headGroup.scale.set(1.08, 1.08, 1.08);
        astronautGroup.add(headGroup);

        // ── A. FRONT VISOR DOME (The Helmet Screen) ──
        const screenDomeGeo = new THREE.SphereGeometry(1.14, 64, 64);
        const helmetScreenMesh = new THREE.Mesh(screenDomeGeo, visorDomeMat);
        helmetScreenMesh.scale.set(1.04, 1.02, 0.95);
        helmetScreenMesh.position.set(0, 0.04, 0.22);
        headGroup.add(helmetScreenMesh);

        const visorGlassMesh = new THREE.Mesh(screenDomeGeo, visorGlassOverlayMat);
        visorGlassMesh.scale.set(1.045, 1.025, 0.955);
        visorGlassMesh.position.set(0, 0.04, 0.225);
        headGroup.add(visorGlassMesh);

        // ── B. ACCURATELY POSITIONED CUTE FACE ELEMENTS (3D ON VISOR) ──
        // Centered directly on the visor dome!
        const digitalFaceGroup = new THREE.Group();
        digitalFaceGroup.position.set(0, 0.04, 0.22);
        headGroup.add(digitalFaceGroup);

        // 1. EYES (Perfect Horizontal Symmetry: Left at -0.30, Right at +0.30)
        const eyeMeshes: { group: THREE.Group; side: number; leftEye: boolean }[] = [];

        [-1, 1].forEach((side) => {
            const eyeGroup = new THREE.Group();
            // Exactly on the front curvature of the visor sphere!
            eyeGroup.position.set(side * 0.30, 0.10, 1.07);
            eyeGroup.rotation.y = side * 0.18; // Angled naturally along the sphere curvature
            digitalFaceGroup.add(eyeGroup);

            // Outer Neon Cyan Glow Capsule
            const outerGlowPill = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.145, 0.2, 16, 24),
                neonCyanMat
            );
            eyeGroup.add(outerGlowPill);

            // Inner Deep Dark Navy/Cosmic Iris Capsule
            const innerIrisPill = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.108, 0.15, 16, 20),
                irisDarkMat
            );
            innerIrisPill.position.z = 0.04;
            eyeGroup.add(innerIrisPill);

            // 1st Big Top-Left Sparkle Catchlight
            const catchlightBig = new THREE.Mesh(
                new THREE.SphereGeometry(0.052, 16, 16),
                whiteCoreMat
            );
            catchlightBig.position.set(-side * 0.028, 0.09, 0.045);
            eyeGroup.add(catchlightBig);

            // 2nd Small Bottom-Right Sparkle Catchlight
            const catchlightSmall = new THREE.Mesh(
                new THREE.SphereGeometry(0.028, 12, 12),
                whiteCoreMat
            );
            catchlightSmall.position.set(side * 0.034, -0.075, 0.04);
            eyeGroup.add(catchlightSmall);

            // Cute Arched Cyan Eyebrow
            const brow = new THREE.Mesh(
                new THREE.TorusGeometry(0.11, 0.018, 8, 20, Math.PI * 0.55),
                neonCyanMat
            );
            brow.rotation.z = Math.PI * 0.22 - side * 0.05;
            brow.position.set(0, 0.19, 0.01);
            eyeGroup.add(brow);

            eyeMeshes.push({ group: eyeGroup, side, leftEye: side === -1 });
        });

        // 2. MOUTH (DEAD CENTER AT X = 0, DIRECTLY UNDER THE EYES!)
        const mouthGroup = new THREE.Group();
        mouthGroup.position.set(0, -0.16, 1.09); // Exactly on the front curvature of the visor
        digitalFaceGroup.add(mouthGroup);

        // Cheerful Glowing Smile Arc (‿)
        const smileArcAngle = Math.PI * 0.72;
        const smileOuter = new THREE.Mesh(
            new THREE.TorusGeometry(0.17, 0.028, 16, 32, smileArcAngle),
            neonCyanMat
        );
        smileOuter.rotation.z = -Math.PI / 2 - smileArcAngle / 2;
        mouthGroup.add(smileOuter);

        const smileInner = new THREE.Mesh(
            new THREE.TorusGeometry(0.17, 0.012, 16, 32, smileArcAngle * 0.94),
            whiteCoreMat
        );
        smileInner.rotation.z = -Math.PI / 2 - (smileArcAngle * 0.94) / 2;
        smileInner.position.z = 0.012;
        mouthGroup.add(smileInner);

        // Cute Pink Tongue nestled inside the smile
        const pinkTongue = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 16, 16),
            pinkTongueMat
        );
        pinkTongue.scale.set(1.0, 0.65, 0.45);
        pinkTongue.position.set(0, -0.065, 0.01);
        mouthGroup.add(pinkTongue);

        // Smiling Dimple Dots at the ends of the smile
        [-1, 1].forEach((side) => {
            const dimple = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 12), neonCyanMat);
            dimple.position.set(
                side * Math.cos(smileArcAngle / 2 - 0.1) * 0.17,
                -Math.sin(smileArcAngle / 2 - 0.1) * 0.17,
                0.015
            );
            mouthGroup.add(dimple);
        });

        // 3. BLUSH MARKS (Symmetrical below each eye: Left at -0.42, Right at +0.42)
        [-1, 1].forEach((side) => {
            const blushGroup = new THREE.Group();
            blushGroup.position.set(side * 0.46, -0.02, 1.0);
            blushGroup.rotation.y = side * 0.35;
            digitalFaceGroup.add(blushGroup);

            const blushPuff = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), pinkBlushMat);
            blushPuff.scale.set(1.15, 0.72, 0.35);
            blushGroup.add(blushPuff);

            // 3 Cute Anime Hash Lines
            for (let i = -1; i <= 1; i++) {
                const line = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.07), whiteCoreMat);
                line.rotation.z = 0.45;
                line.position.set(i * 0.035, 0, 0.005);
                blushGroup.add(line);
            }
        });

        // ── C. HELMET SCREEN BEZEL RIM ──
        const bezelDark = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.05, 20, 64), suitDarkMat);
        bezelDark.position.set(0, 0.04, 0.22);
        bezelDark.scale.set(1.03, 1.02, 1);
        headGroup.add(bezelDark);

        const bezelCyan = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.07, 20, 64), suitWhiteMat);
        bezelCyan.position.set(0, 0.04, 0.16);
        bezelCyan.scale.set(1.04, 1.03, 1);
        headGroup.add(bezelCyan);

        // ── D. BACK HELMET SHELL ──
        const backHelmetMesh = new THREE.Mesh(new THREE.SphereGeometry(1.2, 48, 48), suitWhiteMat);
        backHelmetMesh.position.set(0, 0.04, -0.22);
        backHelmetMesh.scale.set(1.04, 1.0, 1.0);
        headGroup.add(backHelmetMesh);

        const topCrown = new THREE.Mesh(
            new THREE.SphereGeometry(1.22, 32, 32, -Math.PI * 0.35, Math.PI * 0.25, 0.22, 0.58),
            suitCyanMat
        );
        topCrown.position.set(0, 0.04, -0.22);
        topCrown.scale.set(1.04, 1.0, 1.0);
        headGroup.add(topCrown);

        const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.09, 20, 48), suitDarkMat);
        neckRing.rotation.x = Math.PI / 2;
        neckRing.position.y = -0.88;
        headGroup.add(neckRing);

        // Circular Side Ear Muffs
        [-1, 1].forEach((side) => {
            const earGroup = new THREE.Group();
            earGroup.position.set(side * 1.25, 0.05, 0.02);

            const darkRing = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 32), suitDarkMat);
            darkRing.rotation.z = Math.PI / 2;
            earGroup.add(darkRing);

            const cyanRing = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.12, 32), suitCyanMat);
            cyanRing.rotation.z = Math.PI / 2;
            cyanRing.position.x = side * 0.04;
            earGroup.add(cyanRing);

            const whiteEarPod = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.16, 32), suitWhiteMat);
            whiteEarPod.rotation.z = Math.PI / 2;
            whiteEarPod.position.x = side * 0.09;
            earGroup.add(whiteEarPod);

            const earCap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24), suitWhiteMat);
            earCap.scale.set(0.35, 1, 1);
            earCap.position.x = side * 0.16;
            earGroup.add(earCap);

            const earCenterGlow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), neonCyanMat);
            earCenterGlow.position.x = side * 0.22;
            earGroup.add(earCenterGlow);

            headGroup.add(earGroup);
        });

        // ═══════════════════════════════════════════
        // 2. TORSO & WAIST PACK
        // ═══════════════════════════════════════════
        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, -0.42, 0);
        astronautGroup.add(torsoGroup);

        const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.74, 1.1, 32), suitNavyMat);
        torsoMesh.scale.set(1.08, 1.0, 0.88);
        torsoGroup.add(torsoMesh);

        const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.48, 0.12), suitMintMat);
        chestPlate.position.set(0, 0.18, 0.46);
        torsoGroup.add(chestPlate);

        const chestInsignia = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.04), suitWhiteMat);
        chestInsignia.position.set(0, 0.18, 0.53);
        torsoGroup.add(chestInsignia);

        const chestGlowDot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), suitGoldMat);
        chestGlowDot.position.set(0, 0.18, 0.56);
        torsoGroup.add(chestGlowDot);

        [-1, 1].forEach((side) => {
            const pip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), side < 0 ? suitPinkMat : neonCyanMat);
            pip.position.set(side * 0.24, 0.32, 0.5);
            torsoGroup.add(pip);
        });

        const pelvisMesh = new THREE.Mesh(new THREE.SphereGeometry(0.72, 32, 32), suitNavyMat);
        pelvisMesh.scale.set(1.08, 0.65, 0.88);
        pelvisMesh.position.y = -0.52;
        torsoGroup.add(pelvisMesh);

        const beltStrap = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.74, 0.1, 32), suitDarkMat);
        beltStrap.scale.set(1.09, 1.0, 0.89);
        beltStrap.position.y = -0.28;
        torsoGroup.add(beltStrap);

        const beltGold = new THREE.Mesh(new THREE.CylinderGeometry(0.73, 0.75, 0.035, 32), suitGoldMat);
        beltGold.scale.set(1.1, 1.0, 0.9);
        beltGold.position.y = -0.22;
        torsoGroup.add(beltGold);

        const controlBoxGroup = new THREE.Group();
        controlBoxGroup.position.set(0.18, -0.28, 0.58);
        controlBoxGroup.rotation.y = 0.15;
        torsoGroup.add(controlBoxGroup);

        const controlBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.16), suitWhiteMat);
        controlBoxGroup.add(controlBoxMesh);

        const controlBoxRim = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.3, 0.14), suitCyanMat);
        controlBoxRim.position.z = -0.01;
        controlBoxGroup.add(controlBoxRim);

        const cyanBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 20), neonCyanMat);
        cyanBtn.rotation.x = Math.PI / 2;
        cyanBtn.position.set(0.08, 0.02, 0.09);
        controlBoxGroup.add(cyanBtn);

        const panelLine = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.02), suitDarkMat);
        panelLine.position.set(-0.09, 0.02, 0.09);
        controlBoxGroup.add(panelLine);

        // ═══════════════════════════════════════════
        // 3. BACKPACK & RED BEACON CAPSULE
        // ═══════════════════════════════════════════
        const backpackGroup = new THREE.Group();
        backpackGroup.position.set(0, 0.12, -0.62);
        torsoGroup.add(backpackGroup);

        const packShell = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.25, 0.48), suitWhiteMat);
        backpackGroup.add(packShell);

        const packCore = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.05, 0.5), suitNavyMat);
        backpackGroup.add(packCore);

        [-1, 1].forEach((side) => {
            const glowBar = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.48, 0.12),
                side < 0 ? suitPinkMat : suitLavenderMat
            );
            glowBar.position.set(side * 0.38, 0.05, 0.22);
            backpackGroup.add(glowBar);

            const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.22, 20), suitDarkMat);
            thruster.position.set(side * 0.32, -0.68, 0.05);
            backpackGroup.add(thruster);

            const thrusterGlow = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), neonCyanMat);
            thrusterGlow.position.set(side * 0.32, -0.76, 0.05);
            backpackGroup.add(thrusterGlow);
        });

        const redCapsuleGroup = new THREE.Group();
        redCapsuleGroup.position.set(0.38, 0.85, -0.15);
        redCapsuleGroup.rotation.z = -0.18;
        redCapsuleGroup.rotation.x = -0.1;
        backpackGroup.add(redCapsuleGroup);

        const redCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.65, 28), redCapsuleMat);
        redCapsuleGroup.add(redCylinder);

        const redCap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), redCapsuleMat);
        redCap.position.y = 0.32;
        redCapsuleGroup.add(redCap);

        const redBaseCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.08, 28), suitDarkMat);
        redBaseCollar.position.y = -0.34;
        redCapsuleGroup.add(redBaseCollar);

        // ═══════════════════════════════════════════
        // 4. CUTE PLUMP CARTOON MARSHMALLOW HANDS
        // ═══════════════════════════════════════════
        const createCuteMarshmallowHand = (thumbSign: number) => {
            const handGroup = new THREE.Group();

            // 1. Soft Rounded Cyber Cyan Wristband with Glowing LED Ring
            const wristCuff = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.045, 16, 32), suitCyanMat);
            wristCuff.rotation.x = Math.PI / 2;
            handGroup.add(wristCuff);

            const wristGlow = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.015, 12, 28), neonCyanMat);
            wristGlow.rotation.x = Math.PI / 2;
            wristGlow.position.y = 0.02;
            handGroup.add(wristGlow);

            // 2. Main Plump Mitten Palm
            const palmMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), suitWhiteMat);
            palmMesh.scale.set(1.0, 1.1, 0.85);
            palmMesh.position.y = 0.18;
            handGroup.add(palmMesh);

            // 3. Rounded Mitten Finger Tip Dome
            const mittTip = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 24), suitWhiteMat);
            mittTip.scale.set(0.95, 0.95, 0.82);
            mittTip.position.y = 0.32;
            handGroup.add(mittTip);

            // 4. Cute Stubby Button Thumb
            const thumbGroup = new THREE.Group();
            thumbGroup.position.set(thumbSign * 0.16, 0.16, 0.08);
            thumbGroup.rotation.z = thumbSign * 0.65;
            thumbGroup.rotation.x = 0.3;
            handGroup.add(thumbGroup);

            const thumbBase = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 20), suitWhiteMat);
            thumbBase.scale.set(1.0, 1.25, 0.95);
            thumbBase.position.y = 0.08;
            thumbGroup.add(thumbBase);

            const thumbTip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), suitWhiteMat);
            thumbTip.position.y = 0.18;
            thumbGroup.add(thumbTip);

            // 5. Pastel Cyan Inner Paw/Grip Patch
            const palmGrip = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), suitCyanMat);
            palmGrip.scale.set(0.9, 0.9, 0.22);
            palmGrip.position.set(0, 0.18, 0.18);
            handGroup.add(palmGrip);

            return handGroup;
        };

        // ── LEFT ARM (Waving Hello `👋`) ──
        const leftArmGroup = new THREE.Group();
        leftArmGroup.position.set(-0.68, 0.22, 0.05);
        torsoGroup.add(leftArmGroup);

        const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), suitCyanMat);
        leftArmGroup.add(leftShoulder);

        const leftUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.21, 0.48, 24), suitNavyMat);
        leftUpper.position.set(-0.12, 0.18, 0.1);
        leftUpper.rotation.z = -0.65;
        leftUpper.rotation.x = 0.25;
        leftArmGroup.add(leftUpper);

        const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), suitCyanMat);
        leftElbow.position.set(-0.25, 0.38, 0.18);
        leftArmGroup.add(leftElbow);

        const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.44, 24), suitNavyMat);
        leftForearm.position.set(-0.32, 0.62, 0.24);
        leftForearm.rotation.z = -0.25;
        leftForearm.rotation.x = 0.1;
        leftArmGroup.add(leftForearm);

        const leftHand = createCuteMarshmallowHand(1);
        leftHand.position.set(-0.36, 0.88, 0.26);
        leftHand.rotation.z = -0.2;
        leftHand.rotation.x = 0.25;
        leftArmGroup.add(leftHand);

        // ── RIGHT ARM (Relaxed Spacewalk Float) ──
        const rightArmGroup = new THREE.Group();
        rightArmGroup.position.set(0.68, 0.22, 0.05);
        torsoGroup.add(rightArmGroup);

        const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), suitCyanMat);
        rightArmGroup.add(rightShoulder);

        const rightUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.21, 0.48, 24), suitNavyMat);
        rightUpper.position.set(0.12, -0.2, 0.12);
        rightUpper.rotation.z = -0.32;
        rightUpper.rotation.x = -0.45;
        rightArmGroup.add(rightUpper);

        const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), suitCyanMat);
        rightElbow.position.set(0.22, -0.4, 0.28);
        rightArmGroup.add(rightElbow);

        const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.44, 24), suitNavyMat);
        rightForearm.position.set(0.1, -0.46, 0.52);
        rightForearm.rotation.x = Math.PI / 2 - 0.25;
        rightForearm.rotation.y = -0.3;
        rightArmGroup.add(rightForearm);

        const rightHand = createCuteMarshmallowHand(-1);
        rightHand.position.set(0.04, -0.44, 0.78);
        rightHand.rotation.x = Math.PI / 2 + 0.25;
        rightHand.rotation.y = -0.4;
        rightHand.rotation.z = -0.25;
        rightArmGroup.add(rightHand);

        // ═══════════════════════════════════════════
        // 5. LEGS & SPACE BOOTS
        // ═══════════════════════════════════════════
        const leftLegGroup = new THREE.Group();
        const rightLegGroup = new THREE.Group();

        const buildSpaceLeg = (group: THREE.Group, side: number) => {
            group.position.set(side * 0.42, -0.68, 0.08);
            torsoGroup.add(group);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.26, 0.55, 24), suitNavyMat);
            thigh.position.set(0, -0.16, 0.12);
            thigh.rotation.x = -0.35;
            thigh.rotation.z = side * 0.12;
            group.add(thigh);

            const kneePad = new THREE.Mesh(
                new THREE.SphereGeometry(0.22, 20, 20),
                side < 0 ? suitLavenderMat : suitPinkMat
            );
            kneePad.scale.set(1.1, 0.9, 0.7);
            kneePad.position.set(0, -0.38, 0.24);
            group.add(kneePad);

            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.5, 24), suitNavyMat);
            shin.position.set(0, -0.62, 0.22);
            shin.rotation.x = -0.15;
            group.add(shin);

            const ankleBand = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.035, 12, 28), suitCyanMat);
            ankleBand.rotation.x = Math.PI / 2;
            ankleBand.position.set(0, -0.84, 0.24);
            group.add(ankleBand);

            const bootGroup = new THREE.Group();
            bootGroup.position.set(0, -1.02, 0.34);
            group.add(bootGroup);

            const bootUpper = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), suitWhiteMat);
            bootUpper.scale.set(0.94, 0.82, 1.4);
            bootGroup.add(bootUpper);

            const bootSole = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.1, 28), suitDarkMat);
            bootSole.scale.set(0.95, 1.0, 1.4);
            bootSole.position.y = -0.18;
            bootGroup.add(bootSole);

            const soleGlow = new THREE.Mesh(
                new THREE.CylinderGeometry(0.31, 0.31, 0.04, 28),
                side < 0 ? suitMintMat : suitGoldMat
            );
            soleGlow.scale.set(0.95, 1.0, 1.4);
            soleGlow.position.y = -0.23;
            bootGroup.add(soleGlow);
        };

        buildSpaceLeg(leftLegGroup, -1);
        buildSpaceLeg(rightLegGroup, 1);

        leftLegGroup.rotation.set(-0.12, 0.15, -0.1);
        rightLegGroup.rotation.set(0.08, -0.12, 0.08);

        // ═══════════════════════════════════════════
        // 6. AMBIENT BACKGROUND STARFIELD
        // ═══════════════════════════════════════════
        const starCount = 180;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPos[i * 3] = (Math.random() - 0.5) * 15;
            starPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
            starPos[i * 3 + 2] = -Math.random() * 8 + 2;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

        const starTex = createStarTexture();
        const starMat = new THREE.PointsMaterial({
            size: 0.28,
            map: starTex,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const starField = new THREE.Points(starGeo, starMat);
        scene.add(starField);

        // Soft candy glow puddle under the boots
        const aura = new THREE.Mesh(
            new THREE.CircleGeometry(1.85, 48),
            new THREE.MeshBasicMaterial({
                color: 0xc084fc,
                transparent: true,
                opacity: 0.28,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            })
        );
        aura.rotation.x = -Math.PI / 2;
        aura.position.y = -2.25;
        astronautMasterGroup.add(aura);

        const auraRing = new THREE.Mesh(
            new THREE.RingGeometry(1.15, 1.55, 48),
            new THREE.MeshBasicMaterial({
                color: 0x22d3ee,
                transparent: true,
                opacity: 0.45,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            })
        );
        auraRing.rotation.x = -Math.PI / 2;
        auraRing.position.y = -2.22;
        astronautMasterGroup.add(auraRing);

        // Orbiting pastel gems
        const gemSpecs = [
            { color: 0xfb7185, emissive: 0xbe185d, radius: 2.55, y: 1.35, size: 0.08, speed: 0.45, phase: 0.4 },
            { color: 0xfbbf24, emissive: 0xf59e0b, radius: 2.7, y: -0.85, size: 0.07, speed: -0.36, phase: 2.1 },
            { color: 0x22d3ee, emissive: 0x0891b2, radius: 2.4, y: 0.15, size: 0.075, speed: 0.5, phase: 3.6 },
            { color: 0xc084fc, emissive: 0x7c3aed, radius: 2.85, y: 0.7, size: 0.06, speed: -0.42, phase: 1.2 },
        ];
        const gems = gemSpecs.map((spec) => {
            const mesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(spec.size, 1),
                new THREE.MeshStandardMaterial({
                    color: spec.color,
                    emissive: spec.emissive,
                    emissiveIntensity: 0.7,
                    roughness: 0.2,
                    metalness: 0.15,
                })
            );
            scene.add(mesh);
            return { mesh, ...spec };
        });

        // ═══════════════════════════════════════════
        // 7. MULTI-REACTION SYSTEM & PARTICLES
        // ═══════════════════════════════════════════
        const reactionParticles: ReactionParticle[] = [];
        const particleGeos = [
            new THREE.OctahedronGeometry(0.09, 0),
            new THREE.TorusGeometry(0.08, 0.025, 8, 16),
            new THREE.SphereGeometry(0.065, 12, 12),
        ];

        const particleColors = [0x00f0ff, 0xff5f87, 0xfbbf24, 0xa855f7, 0xffffff];

        const spawnBurstParticles = (count = 20) => {
            const origin = new THREE.Vector3();
            headGroup.getWorldPosition(origin);

            for (let i = 0; i < count; i++) {
                const geo = particleGeos[i % particleGeos.length];
                const col = particleColors[i % particleColors.length];
                const mat = new THREE.MeshBasicMaterial({
                    color: col,
                    transparent: true,
                    opacity: 1,
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.copy(origin);
                mesh.position.x += (Math.random() - 0.5) * 0.9;
                mesh.position.y += (Math.random() - 0.5) * 0.7;
                mesh.position.z += (Math.random() - 0.5) * 0.7;
                scene.add(mesh);

                reactionParticles.push({
                    mesh,
                    vel: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.055,
                        0.03 + Math.random() * 0.05,
                        (Math.random() - 0.3) * 0.05
                    ),
                    rotVel: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.08,
                        (Math.random() - 0.5) * 0.08,
                        (Math.random() - 0.5) * 0.08
                    ),
                    life: 1.0,
                    decay: 0.016 + Math.random() * 0.014,
                });
            }
        };

        // ── Interactive State ──
        let mouseX = 0;
        let mouseY = 0;
        let isCursorActive = false;
        let cursorGoneTimer = 0;

        let reactionMode: 'none' | 'flip' | 'wiggle' | 'peekaboo' | 'wink' = 'none';
        let reactionTimer = 0;
        let reactionCycle = 0;

        let isPointerDown = false;
        let pointerDownTime = 0;
        let currentSquashY = 1.0;

        const onPointerMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const cx = e.clientX - (rect.left + rect.width / 2);
            const cy = e.clientY - (rect.top + rect.height / 2);

            mouseX = THREE.MathUtils.clamp(cx / (window.innerWidth * 0.38), -1.2, 1.2);
            mouseY = THREE.MathUtils.clamp(-cy / (window.innerHeight * 0.38), -1.2, 1.2);

            isCursorActive = true;
            cursorGoneTimer = 0;
        };

        const onPointerLeave = () => {
            isCursorActive = false;
            isPointerDown = false;
        };

        const onPointerDown = () => {
            isPointerDown = true;
            pointerDownTime = performance.now();
            soundFX.playBoing();
            spawnBurstParticles(6);
        };

        const onPointerUp = () => {
            const pressDuration = performance.now() - pointerDownTime;
            isPointerDown = false;

            if (pressDuration < 450) {
                reactionCycle = (reactionCycle + 1) % 4;
                const modes: ('flip' | 'wiggle' | 'peekaboo' | 'wink')[] = [
                    'flip',
                    'wiggle',
                    'peekaboo',
                    'wink',
                ];
                reactionMode = modes[reactionCycle];
                reactionTimer = 1.0;

                soundFX.playSparkleChime();
                spawnBurstParticles(22);
            }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('mouseleave', onPointerLeave);
        container.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);

        const onTouchStart = () => { onPointerDown(); };
        const onTouchEnd = () => { onPointerUp(); };
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchend', onTouchEnd, { passive: true });

        const handleResize = () => {
            if (!container) return;
            const w = container.clientWidth || 480;
            const h = container.clientHeight || 480;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        const resizeObserver = new ResizeObserver(() => handleResize());
        resizeObserver.observe(container);

        // ═══════════════════════════════════════════
        // 8. ANIMATION LOOP
        // ═══════════════════════════════════════════
        const clock = new THREE.Clock();
        let animId: number;

        let curRotX = 0;
        let curRotY = 0;
        let curRotZ = 0;
        let curPosX = 0;
        let curPosY = 0;

        const animate = () => {
            animId = requestAnimationFrame(animate);

            const delta = Math.min(clock.getDelta(), 0.1);
            const elapsed = clock.getElapsedTime();

            cursorGoneTimer += delta;
            if (cursorGoneTimer > 3.0) {
                isCursorActive = false;
            }

            let targetRotX = 0;
            let targetRotY = 0;
            let targetRotZ = 0;
            let targetPosX = 0;
            let targetPosY = 0;

            if (isCursorActive) {
                targetRotY = mouseX * 0.54;
                targetRotX = -mouseY * 0.34;
                targetRotZ = -mouseX * 0.14;
                targetPosX = mouseX * 0.28;
                targetPosY = mouseY * 0.22;
            } else {
                targetPosX = -0.18 + Math.cos(elapsed * 1.1) * 0.08;
                targetPosY = 0.04 + Math.sin(elapsed * 1.4) * 0.12;
                targetRotY = -0.18 + Math.sin(elapsed * 1.2) * 0.08;
                targetRotX = 0.06 + Math.cos(elapsed * 0.9) * 0.05;
                targetRotZ = 0.08 + Math.sin(elapsed * 0.7) * 0.04;
            }

            // SQUASH & STRETCH
            const targetSquash = isPointerDown ? 0.88 : 1.0;
            currentSquashY = THREE.MathUtils.lerp(currentSquashY, targetSquash, 0.18);
            const squashXZ = 1.0 + (1.0 - currentSquashY) * 0.6;
            astronautGroup.scale.set(squashXZ, currentSquashY, squashXZ);

            // MULTI-REACTION PROCESSING
            if (reactionTimer > 0) {
                reactionTimer -= delta * 1.25;
                if (reactionTimer < 0) {
                    reactionTimer = 0;
                    reactionMode = 'none';
                }
                const progress = 1 - reactionTimer;

                if (reactionMode === 'flip') {
                    const easeFlip = Math.sin(progress * Math.PI * 2);
                    targetRotX += progress * Math.PI * 2;
                    targetRotY += easeFlip * 0.45;
                    targetPosY += Math.sin(progress * Math.PI) * 0.6;
                } else if (reactionMode === 'wiggle') {
                    targetRotZ += Math.sin(progress * Math.PI * 6) * 0.25;
                    targetRotY += Math.cos(progress * Math.PI * 5) * 0.22;
                    leftArmGroup.rotation.z += Math.sin(progress * Math.PI * 6) * 0.35;
                    rightArmGroup.rotation.z -= Math.cos(progress * Math.PI * 6) * 0.35;
                } else if (reactionMode === 'peekaboo') {
                    const jumpZ = Math.sin(progress * Math.PI) * 1.2;
                    const jumpY = Math.sin(progress * Math.PI) * 0.45;
                    astronautGroup.position.z = jumpZ;
                    targetPosY += jumpY;
                } else if (reactionMode === 'wink') {
                    targetRotZ += Math.sin(progress * Math.PI * 0.22);
                    targetRotY += Math.sin(progress * Math.PI * 0.18);
                }
            } else {
                astronautGroup.position.z = 0;
            }

            const lerpFactor = isCursorActive ? 0.08 : 0.04;
            curRotX = THREE.MathUtils.lerp(curRotX, targetRotX, lerpFactor);
            curRotY = THREE.MathUtils.lerp(curRotY, targetRotY, lerpFactor);
            curRotZ = THREE.MathUtils.lerp(curRotZ, targetRotZ, lerpFactor);
            curPosX = THREE.MathUtils.lerp(curPosX, targetPosX, lerpFactor);
            curPosY = THREE.MathUtils.lerp(curPosY, targetPosY, lerpFactor);

            // Zero-G breathing and floating bob
            const floatBobY = Math.sin(elapsed * 1.6) * 0.14;
            const floatBobX = Math.cos(elapsed * 1.0) * 0.06;

            astronautGroup.position.x = curPosX + floatBobX;
            astronautGroup.position.y = curPosY + floatBobY;
            astronautGroup.rotation.set(curRotX, curRotY, curRotZ);

            // ── DYNAMIC BLINKING & 3D FACE GLANCE ──
            const blinkCycle = elapsed % 3.6;
            let currentEyeScale = 1.0;
            if (blinkCycle > 3.42 && blinkCycle < 3.56 && reactionMode === 'none') {
                currentEyeScale = 0.08; // Natural smooth blink
            }

            // Eyes glance toward cursor smoothly across the visor
            const targetFaceLookX = isCursorActive ? mouseX * 0.08 : Math.sin(elapsed * 1.2) * 0.04;
            const targetFaceLookY = isCursorActive ? mouseY * 0.06 : 0;

            digitalFaceGroup.position.x = targetFaceLookX;
            digitalFaceGroup.position.y = 0.04 + targetFaceLookY;

            // Apply blink to both eyes (or wink on wink reaction)
            eyeMeshes.forEach((eye) => {
                const isWinking = reactionMode === 'wink' && !eye.leftEye;
                eye.group.scale.y = isWinking ? 0.08 : currentEyeScale;
            });

            // Mouth gently pulses with breathing
            mouthGroup.scale.set(
                1.0 + Math.sin(elapsed * 2.2) * 0.04,
                1.0 + Math.cos(elapsed * 2.2) * 0.05,
                1.0
            );

            // Zero-gravity leg kicks
            leftLegGroup.rotation.x = -0.12 + Math.sin(elapsed * 1.8) * 0.08;
            rightLegGroup.rotation.x = 0.08 - Math.sin(elapsed * 1.8) * 0.08;

            // Cute Hand Animations
            leftArmGroup.rotation.z = Math.sin(elapsed * 3.4) * 0.12;
            leftHand.rotation.z = -0.2 + Math.sin(elapsed * 4.2) * 0.18;
            leftHand.rotation.x = 0.25 + Math.cos(elapsed * 3.2) * 0.08;

            rightHand.rotation.x = Math.PI / 2 + 0.25 + Math.cos(elapsed * 1.8) * 0.08;
            rightHand.position.y = -0.44 + Math.sin(elapsed * 2.0) * 0.04;

            // Starfield rotation
            starField.rotation.y = elapsed * 0.02;

            neonCyanMat.emissiveIntensity = 0.75 + Math.sin(elapsed * 3.2) * 0.28;
            aura.scale.setScalar(1 + Math.sin(elapsed * 1.6) * 0.06);
            auraRing.rotation.z = elapsed * 0.35;

            gems.forEach((gem) => {
                const a = elapsed * gem.speed + gem.phase;
                gem.mesh.position.set(
                    Math.cos(a) * gem.radius,
                    gem.y + Math.sin(elapsed * 1.5 + gem.phase) * 0.12,
                    -1.8 + Math.sin(a) * 0.35
                );
                gem.mesh.rotation.y += 0.03;
                gem.mesh.rotation.x += 0.015;
            });

            // Reaction particles update
            for (let i = reactionParticles.length - 1; i >= 0; i--) {
                const p = reactionParticles[i];
                p.mesh.position.add(p.vel);
                p.mesh.rotation.x += p.rotVel.x;
                p.mesh.rotation.y += p.rotVel.y;
                p.mesh.rotation.z += p.rotVel.z;
                p.life -= p.decay;
                (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.life);
                p.mesh.scale.setScalar(0.4 + p.life * 0.85);
                if (p.life <= 0) {
                    scene.remove(p.mesh);
                    p.mesh.geometry.dispose();
                    (p.mesh.material as THREE.Material).dispose();
                    reactionParticles.splice(i, 1);
                }
            }

            renderer.render(scene, camera);
        };

        animate();

        // ── Cleanup ──
        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('mouseleave', onPointerLeave);
            container.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('touchstart', onTouchStart);
            container.removeEventListener('touchend', onTouchEnd);
            resizeObserver.disconnect();

            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                touchAction: 'none',
            }}
            title="Click or Tap me for playful reactions!"
        />
    );
};

export default SpaceTraveler3D;
