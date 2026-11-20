import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

function createDarkVisorTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const bg = ctx.createRadialGradient(430, 420, 40, 512, 520, 560);
        bg.addColorStop(0, '#3a2a62');
        bg.addColorStop(0.35, '#1a1233');
        bg.addColorStop(0.72, '#0c0818');
        bg.addColorStop(1, '#07060d');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 1024, 1024);

        ctx.save();
        ctx.translate(340, 280);
        ctx.rotate(-0.55);
        const shine = ctx.createLinearGradient(-180, 0, 220, 40);
        shine.addColorStop(0, 'rgba(255,255,255,0)');
        shine.addColorStop(0.4, 'rgba(255,255,255,0.9)');
        shine.addColorStop(0.7, 'rgba(255,255,255,0.25)');
        shine.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.ellipse(0, 0, 210, 70, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.ellipse(760, 640, 28, 46, 0.4, 0, Math.PI * 2);
        ctx.fill();
    }
    return new THREE.CanvasTexture(canvas);
}

function createStarTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 60);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.4, 'rgba(255,255,255,0.45)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
}

function createHeartGeometry(): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.2);
    shape.bezierCurveTo(0, 0.55, -0.55, 0.55, -0.55, 0.15);
    shape.bezierCurveTo(-0.55, -0.15, 0, -0.25, 0, -0.55);
    shape.bezierCurveTo(0, -0.25, 0.55, -0.15, 0.55, 0.15);
    shape.bezierCurveTo(0.55, 0.55, 0, 0.55, 0, 0.2);
    return new THREE.ExtrudeGeometry(shape, {
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 2,
    });
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
        const width = container.clientWidth || 480;
        const height = container.clientHeight || 480;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        camera.position.set(0.2, 0.05, 9.8);
        camera.lookAt(0, -0.15, 0);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        container.appendChild(renderer.domElement);

        scene.add(new THREE.AmbientLight(0xfff5ee, 0.85));
        scene.add(new THREE.HemisphereLight(0xfff7fb, 0xf7c8b0, 0.45));

        const key = new THREE.DirectionalLight(0xfffaf5, 1.65);
        key.position.set(2.5, 6, 5);
        scene.add(key);

        const fill = new THREE.DirectionalLight(0xffd0e0, 0.55);
        fill.position.set(-4, 1, 3);
        scene.add(fill);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.7);
        rimLight.position.set(-2, 3, -4);
        scene.add(rimLight);

        const whiteMat = new THREE.MeshPhysicalMaterial({
            color: 0xfffdfb,
            roughness: 0.38,
            metalness: 0.02,
            clearcoat: 0.35,
            clearcoatRoughness: 0.25,
        });
        const visorMat = new THREE.MeshPhysicalMaterial({
            map: createDarkVisorTexture(),
            color: 0xffffff,
            roughness: 0.08,
            metalness: 0.25,
            clearcoat: 1,
            clearcoatRoughness: 0.05,
        });
        const inkMat = new THREE.MeshPhysicalMaterial({
            color: 0x2c2444,
            roughness: 0.4,
            metalness: 0.08,
        });
        const pinkMat = new THREE.MeshPhysicalMaterial({
            color: 0xff4f93,
            roughness: 0.32,
            metalness: 0.04,
            clearcoat: 0.55,
            clearcoatRoughness: 0.18,
        });
        const heartMat = new THREE.MeshPhysicalMaterial({
            color: 0xff3b78,
            emissive: 0xe11d48,
            emissiveIntensity: 0.18,
            roughness: 0.35,
            clearcoat: 0.4,
        });
        const blueMat = new THREE.MeshPhysicalMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 0.25,
            roughness: 0.25,
            clearcoat: 0.8,
        });
        const goldMat = new THREE.MeshPhysicalMaterial({
            color: 0xf6c445,
            roughness: 0.3,
            metalness: 0.35,
            clearcoat: 0.6,
        });
        const soleMat = new THREE.MeshPhysicalMaterial({
            color: 0xd5dbe6,
            roughness: 0.55,
        });
        const outlineMat = new THREE.MeshBasicMaterial({
            color: 0x241833,
            side: THREE.BackSide,
        });

        const withOutline = (mesh: THREE.Mesh, parent: THREE.Object3D, amount = 1.06) => {
            const shell = new THREE.Mesh(mesh.geometry, outlineMat);
            shell.position.copy(mesh.position);
            shell.quaternion.copy(mesh.quaternion);
            shell.scale.copy(mesh.scale).multiplyScalar(amount);
            parent.add(shell);
            parent.add(mesh);
            return mesh;
        };

        const placeBone = (
            parent: THREE.Object3D,
            from: THREE.Vector3,
            to: THREE.Vector3,
            radius: number,
            material: THREE.Material,
        ) => {
            const direction = new THREE.Vector3().subVectors(to, from);
            const length = Math.max(direction.length(), 0.001);
            const bone = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.92, radius, length, 18), material);
            bone.position.copy(from).add(to).multiplyScalar(0.5);
            bone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
            withOutline(bone, parent, 1.08);
            const joint = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.15, 16, 16), material);
            joint.position.copy(from);
            withOutline(joint, parent, 1.08);
            return bone;
        };

        const createGlove = (thumbSide: number) => {
            const hand = new THREE.Group();
            const palm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), whiteMat);
            palm.scale.set(1.05, 1.15, 0.72);
            palm.position.y = 0.08;
            withOutline(palm, hand, 1.08);

            const fingers = [
                { x: -0.075, h: 0.13, r: 0.038, lean: 0.18 },
                { x: -0.025, h: 0.16, r: 0.04, lean: 0.05 },
                { x: 0.03, h: 0.15, r: 0.038, lean: -0.08 },
                { x: 0.08, h: 0.12, r: 0.034, lean: -0.2 },
            ];
            fingers.forEach((finger) => {
                const group = new THREE.Group();
                group.position.set(finger.x, 0.2, 0.01);
                group.rotation.z = finger.lean;
                group.rotation.x = -0.15;
                hand.add(group);
                const seg = new THREE.Mesh(new THREE.CapsuleGeometry(finger.r, finger.h, 6, 10), whiteMat);
                seg.position.y = finger.h * 0.45;
                group.add(seg);
                const tip = new THREE.Mesh(new THREE.SphereGeometry(finger.r * 0.95, 12, 12), whiteMat);
                tip.position.y = finger.h * 0.95;
                group.add(tip);
            });

            const thumb = new THREE.Group();
            thumb.position.set(thumbSide * 0.14, 0.05, 0.04);
            thumb.rotation.z = thumbSide * -1.05;
            hand.add(thumb);
            const thumbSeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.042, 0.06, 6, 10), whiteMat);
            thumbSeg.position.y = 0.07;
            thumb.add(thumbSeg);
            const thumbTip = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), whiteMat);
            thumbTip.position.y = 0.14;
            thumb.add(thumbTip);
            return hand;
        };

        const astronaut = new THREE.Group();
        scene.add(astronaut);

        const head = new THREE.Group();
        head.position.y = 0.98;
        astronaut.add(head);

        const helmet = new THREE.Mesh(new THREE.SphereGeometry(1.02, 48, 48), whiteMat);
        helmet.scale.z = 0.78;
        helmet.position.z = -0.16;
        withOutline(helmet, head, 1.05);

        const visor = new THREE.Mesh(new THREE.SphereGeometry(0.9, 56, 56), visorMat);
        visor.position.set(0, 0.02, 0.34);
        visor.scale.set(1.06, 1.04, 0.7);
        head.add(visor);

        const visorRim = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.075, 18, 56), whiteMat);
        visorRim.position.set(0, 0.02, 0.28);
        withOutline(visorRim, head, 1.08);

        const ear = new THREE.Group();
        ear.position.set(0.98, -0.02, 0.02);
        head.add(ear);
        const earPad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 24), whiteMat);
        earPad.rotation.z = Math.PI / 2;
        withOutline(earPad, ear, 1.08);
        const earCap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), whiteMat);
        earCap.scale.x = 0.35;
        earCap.position.x = 0.08;
        ear.add(earCap);

        const neck = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 12, 24), inkMat);
        neck.rotation.x = Math.PI / 2;
        neck.position.y = -0.92;
        head.add(neck);

        const body = new THREE.Mesh(new THREE.SphereGeometry(0.72, 36, 36), whiteMat);
        body.scale.set(0.9, 0.78, 0.72);
        body.position.y = -0.48;
        withOutline(body, astronaut, 1.045);

        const belt = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.045, 10, 28), inkMat);
        belt.rotation.x = Math.PI / 2;
        belt.position.y = -0.62;
        belt.scale.set(1.05, 1, 0.82);
        astronaut.add(belt);

        const pack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.18), whiteMat);
        pack.position.set(-0.18, -0.58, 0.42);
        withOutline(pack, astronaut, 1.08);
        const packBtn = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), blueMat);
        packBtn.position.set(-0.18, -0.58, 0.54);
        astronaut.add(packBtn);

        const leftShoulder = new THREE.Vector3(-0.58, -0.28, 0.12);
        const leftElbow = new THREE.Vector3(-1.05, 0.02, 0.28);
        const leftWrist = new THREE.Vector3(-1.38, 0.38, 0.42);
        placeBone(astronaut, leftShoulder, leftElbow, 0.13, whiteMat);
        placeBone(astronaut, leftElbow, leftWrist, 0.11, whiteMat);
        const leftElbowBall = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), whiteMat);
        leftElbowBall.position.copy(leftElbow);
        astronaut.add(leftElbowBall);

        const waveHand = createGlove(1);
        waveHand.position.copy(leftWrist);
        waveHand.rotation.set(-0.25, 0.7, 0.35);
        waveHand.scale.setScalar(1.15);
        astronaut.add(waveHand);

        const rightShoulder = new THREE.Vector3(0.55, -0.32, 0.16);
        const rightElbow = new THREE.Vector3(0.78, -0.62, 0.36);
        const rightWrist = new THREE.Vector3(0.98, -0.78, 0.52);
        placeBone(astronaut, rightShoulder, rightElbow, 0.13, whiteMat);
        placeBone(astronaut, rightElbow, rightWrist, 0.11, whiteMat);

        const holdHand = createGlove(-1);
        holdHand.position.copy(rightWrist);
        holdHand.rotation.set(0.9, -0.4, -0.2);
        holdHand.scale.setScalar(1.05);
        astronaut.add(holdHand);

        const buildLeg = (side: number, footZ: number) => {
            const hip = new THREE.Vector3(side * 0.3, -0.92, 0.04);
            const knee = new THREE.Vector3(side * 0.24, -1.38, footZ * 0.55);
            const ankle = new THREE.Vector3(side * 0.16, -1.78, footZ);
            placeBone(astronaut, hip, knee, 0.15, whiteMat);
            placeBone(astronaut, knee, ankle, 0.14, whiteMat);
            const boot = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 20), whiteMat);
            boot.scale.set(0.85, 0.7, 1.35);
            boot.position.copy(ankle);
            boot.position.y -= 0.05;
            boot.position.z += footZ > 0 ? 0.08 : -0.02;
            withOutline(boot, astronaut, 1.07);
            const sole = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), soleMat);
            sole.scale.set(0.9, 0.28, 1.4);
            sole.position.copy(boot.position);
            sole.position.y -= 0.12;
            astronaut.add(sole);
            return { hip, ankle };
        };

        buildLeg(-1, 0.55);
        buildLeg(1, -0.42);

        const suitcase = new THREE.Group();
        suitcase.position.set(1.22, -1.12, 0.42);
        suitcase.rotation.y = 0.45;
        suitcase.rotation.z = -0.18;
        astronaut.add(suitcase);

        const caseBody = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.58, 0.34), pinkMat);
        withOutline(caseBody, suitcase, 1.04);
        const caseTop = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 0.34), pinkMat);
        caseTop.position.y = 0.3;
        suitcase.add(caseTop);

        const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.55, 10), inkMat);
        handle.position.set(-0.22, 0.48, 0.04);
        handle.rotation.z = 0.7;
        suitcase.add(handle);
        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.24, 12), inkMat);
        grip.rotation.z = Math.PI / 2;
        grip.position.set(-0.38, 0.68, 0.04);
        suitcase.add(grip);

        const wheels: THREE.Mesh[] = [];
        [-0.28, 0.28].forEach((x) => {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 16), inkMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(x, -0.34, 0.02);
            suitcase.add(wheel);
            wheels.push(wheel);
            const hub = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), soleMat);
            hub.position.set(x, -0.34, 0.05);
            suitcase.add(hub);
        });

        const saturn = new THREE.Group();
        saturn.position.set(0.22, 0.12, 0.2);
        saturn.rotation.z = -0.4;
        suitcase.add(saturn);
        saturn.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), goldMat));
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 8, 20), goldMat);
        ring.rotation.x = Math.PI / 2.4;
        saturn.add(ring);

        const rocket = new THREE.Group();
        rocket.position.set(-0.12, -0.02, 0.2);
        rocket.rotation.z = 0.6;
        suitcase.add(rocket);
        const rocketBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.1, 4, 8), whiteMat);
        rocket.add(rocketBody);
        const rocketNose = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 10), pinkMat);
        rocketNose.position.y = 0.12;
        rocket.add(rocketNose);
        const rocketWindow = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), blueMat);
        rocketWindow.position.set(0, 0.02, 0.04);
        rocket.add(rocketWindow);

        const bubble = new THREE.Group();
        bubble.position.set(0.95, 1.82, 0.45);
        astronaut.add(bubble);
        const bubbleShell = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), whiteMat);
        bubbleShell.scale.set(1.05, 0.92, 0.62);
        withOutline(bubbleShell, bubble, 1.06);
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 12), whiteMat);
        tail.position.set(-0.16, -0.26, 0);
        tail.rotation.z = 0.7;
        bubble.add(tail);

        const heart = new THREE.Mesh(createHeartGeometry(), heartMat);
        heart.scale.setScalar(0.42);
        heart.position.set(0, -0.02, 0.16);
        heart.geometry.center();
        bubble.add(heart);

        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(1.7, 40),
            new THREE.MeshBasicMaterial({ color: 0x120c1c, transparent: true, opacity: 0.28, depthWrite: false }),
        );
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = -2.15;
        shadow.scale.set(1.35, 1, 0.55);
        astronaut.add(shadow);

        const starCount = 90;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPos[i * 3] = (Math.random() - 0.5) * 16;
            starPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
            starPos[i * 3 + 2] = -Math.random() * 6 - 1;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starField = new THREE.Points(
            starGeo,
            new THREE.PointsMaterial({
                size: 0.16,
                map: createStarTexture(),
                transparent: true,
                opacity: 0.8,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            }),
        );
        scene.add(starField);

        const reactionParticles: ReactionParticle[] = [];
        const particleGeos = [
            new THREE.SphereGeometry(0.06, 10, 10),
            new THREE.OctahedronGeometry(0.07, 0),
            createHeartGeometry(),
        ];
        const particleColors = [0xff4f93, 0xfffdfb, 0xf6c445, 0x38bdf8];

        const spawnBurst = (count = 16) => {
            const origin = new THREE.Vector3();
            head.getWorldPosition(origin);
            for (let i = 0; i < count; i++) {
                const mesh = new THREE.Mesh(
                    particleGeos[i % particleGeos.length],
                    new THREE.MeshBasicMaterial({ color: particleColors[i % particleColors.length], transparent: true }),
                );
                mesh.scale.setScalar(i % 3 === 2 ? 0.18 : 1);
                mesh.position.copy(origin);
                mesh.position.x += (Math.random() - 0.5) * 1.2;
                mesh.position.y += (Math.random() - 0.5) * 0.8;
                scene.add(mesh);
                reactionParticles.push({
                    mesh,
                    vel: new THREE.Vector3((Math.random() - 0.5) * 0.05, 0.03 + Math.random() * 0.04, (Math.random() - 0.5) * 0.04),
                    rotVel: new THREE.Vector3(Math.random() * 0.08, Math.random() * 0.08, 0),
                    life: 1,
                    decay: 0.016 + Math.random() * 0.012,
                });
            }
        };

        let mouseX = 0;
        let mouseY = 0;
        let isCursorActive = false;
        let cursorGoneTimer = 0;
        let reactionMode: 'none' | 'flip' | 'wiggle' | 'peekaboo' | 'wink' = 'none';
        let reactionTimer = 0;
        let reactionCycle = 0;
        let isPointerDown = false;
        let pointerDownTime = 0;
        let currentSquashY = 1;

        const onPointerMove = (event: PointerEvent) => {
            const rect = container.getBoundingClientRect();
            mouseX = THREE.MathUtils.clamp((event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth * 0.38), -1, 1);
            mouseY = THREE.MathUtils.clamp(-(event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight * 0.38), -1, 1);
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
            spawnBurst(6);
        };
        const onPointerUp = () => {
            const pressDuration = performance.now() - pointerDownTime;
            isPointerDown = false;
            if (pressDuration < 450) {
                reactionCycle = (reactionCycle + 1) % 4;
                reactionMode = (['flip', 'wiggle', 'peekaboo', 'wink'] as const)[reactionCycle];
                reactionTimer = 1;
                soundFX.playSparkleChime();
                spawnBurst(18);
            }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('mouseleave', onPointerLeave);
        container.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);
        const onTouchStart = () => onPointerDown();
        const onTouchEnd = () => onPointerUp();
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchend', onTouchEnd, { passive: true });

        const resizeObserver = new ResizeObserver(() => {
            const w = container.clientWidth || 480;
            const h = container.clientHeight || 480;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
        resizeObserver.observe(container);

        const clock = new THREE.Clock();
        let animId = 0;
        let curRotX = 0;
            let curRotY = -0.18;
        let curRotZ = 0;

        const animate = () => {
            animId = requestAnimationFrame(animate);
            const delta = Math.min(clock.getDelta(), 0.1);
            const elapsed = clock.getElapsedTime();
            cursorGoneTimer += delta;
            if (cursorGoneTimer > 3) isCursorActive = false;

            let targetRotX = 0.02;
            let targetRotY = -0.18;
            let targetRotZ = 0;
            if (isCursorActive) {
                targetRotY = -0.18 + mouseX * 0.28;
                targetRotX = 0.04 - mouseY * 0.18;
                targetRotZ = -mouseX * 0.06;
            }

            const targetSquash = isPointerDown ? 0.9 : 1;
            currentSquashY = THREE.MathUtils.lerp(currentSquashY, targetSquash, 0.18);
            const squashXZ = 1 + (1 - currentSquashY) * 0.45;
            astronaut.scale.set(squashXZ * 0.9, currentSquashY * 0.9, squashXZ * 0.9);

            if (reactionTimer > 0) {
                reactionTimer -= delta * 1.2;
                if (reactionTimer < 0) {
                    reactionTimer = 0;
                    reactionMode = 'none';
                }
                const progress = 1 - reactionTimer;
                if (reactionMode === 'flip') {
                    targetRotX += progress * Math.PI * 2;
                    targetRotY += Math.sin(progress * Math.PI * 2) * 0.3;
                } else if (reactionMode === 'wiggle') {
                    targetRotZ += Math.sin(progress * Math.PI * 6) * 0.16;
                } else if (reactionMode === 'peekaboo') {
                    astronaut.position.z = Math.sin(progress * Math.PI) * 0.8;
                } else if (reactionMode === 'wink') {
                    heart.scale.setScalar(0.42 + Math.sin(progress * Math.PI) * 0.22);
                }
            } else {
                astronaut.position.z = 0;
                heart.scale.setScalar(0.42 + Math.sin(elapsed * 3) * 0.03);
            }

            curRotX = THREE.MathUtils.lerp(curRotX, targetRotX, isCursorActive ? 0.08 : 0.04);
            curRotY = THREE.MathUtils.lerp(curRotY, targetRotY, isCursorActive ? 0.08 : 0.04);
            curRotZ = THREE.MathUtils.lerp(curRotZ, targetRotZ, isCursorActive ? 0.08 : 0.04);

            const bob = Math.sin(elapsed * 2.2) * 0.05;
            astronaut.position.y = -0.12 + bob;
            astronaut.rotation.set(curRotX, curRotY, curRotZ + Math.sin(elapsed * 2.2) * 0.03);

            const wave = Math.sin(elapsed * 5) * 0.28;
            waveHand.rotation.z = 0.35 + wave;
            waveHand.rotation.x = -0.25 + Math.sin(elapsed * 5) * 0.08;

            suitcase.position.y = -1.12 + Math.sin(elapsed * 2.2 + 0.6) * 0.03;
            wheels.forEach((wheel) => {
                wheel.rotation.x = elapsed * 2.4;
            });

            bubble.position.y = 1.82 + Math.sin(elapsed * 2.4) * 0.06;
            shadow.scale.set(1.35 + bob * 0.4, 1, 0.55);
            starField.rotation.y = elapsed * 0.015;

            for (let i = reactionParticles.length - 1; i >= 0; i--) {
                const particle = reactionParticles[i];
                particle.mesh.position.add(particle.vel);
                particle.mesh.rotation.x += particle.rotVel.x;
                particle.mesh.rotation.y += particle.rotVel.y;
                particle.life -= particle.decay;
                (particle.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, particle.life);
                if (particle.life <= 0) {
                    scene.remove(particle.mesh);
                    particle.mesh.geometry.dispose();
                    (particle.mesh.material as THREE.Material).dispose();
                    reactionParticles.splice(i, 1);
                }
            }

            renderer.render(scene, camera);
        };
        animate();

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
            title="Click or tap me"
        />
    );
};

export default SpaceTraveler3D;
