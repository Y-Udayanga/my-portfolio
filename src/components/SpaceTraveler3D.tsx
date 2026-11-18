import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ── Helpers for Procedural Textures ──
function createStarSpriteTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Radial soft glow
        const grad = ctx.createRadialGradient(64, 64, 2, 64, 64, 60);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.25, 'rgba(0, 240, 255, 0.85)');
        grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.3)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);

        // 4-point star flare
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.moveTo(64, 6);
        ctx.quadraticCurveTo(64, 64, 122, 64);
        ctx.quadraticCurveTo(64, 64, 64, 122);
        ctx.quadraticCurveTo(64, 64, 6, 64);
        ctx.quadraticCurveTo(64, 64, 64, 6);
        ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

function createBookCoverTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Futuristic cosmic blue gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
        bgGrad.addColorStop(0, '#0c1a36');
        bgGrad.addColorStop(0.5, '#12254e');
        bgGrad.addColorStop(1, '#091326');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 512, 512);

        // Gold corner flourishes
        ctx.fillStyle = '#ffc83b';
        const cornerSize = 44;
        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(cornerSize, 0); ctx.lineTo(0, cornerSize); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 512); ctx.lineTo(cornerSize, 512); ctx.lineTo(0, 512 - cornerSize); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(512, 0); ctx.lineTo(512 - cornerSize, 0); ctx.lineTo(512, cornerSize); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(512, 512); ctx.lineTo(512 - cornerSize, 512); ctx.lineTo(512, 512 - cornerSize); ctx.fill();

        // Saturn Emblem
        ctx.save();
        ctx.translate(256, 260);
        ctx.rotate(-0.32);

        // Planet sphere
        const planetGrad = ctx.createLinearGradient(-45, -45, 45, 45);
        planetGrad.addColorStop(0, '#00f0ff');
        planetGrad.addColorStop(0.7, '#3b82f6');
        planetGrad.addColorStop(1, '#a855f7');
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 54, 0, Math.PI * 2);
        ctx.fill();

        // Saturn Rings
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.ellipse(0, 0, 105, 26, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, 120, 31, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        // Starbursts
        const drawSparkle = (x: number, y: number, r: number) => {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(x, y - r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.quadraticCurveTo(x, y, x, y + r);
            ctx.quadraticCurveTo(x, y, x - r, y);
            ctx.quadraticCurveTo(x, y, x, y - r);
            ctx.fill();
        };
        drawSparkle(135, 155, 14);
        drawSparkle(370, 365, 12);
        drawSparkle(160, 375, 10);
        drawSparkle(365, 140, 9);
    }
    return new THREE.CanvasTexture(canvas);
}

interface MagicParticle {
    mesh: THREE.Mesh;
    vel: THREE.Vector3;
    life: number;
    decay: number;
}

const SpaceTraveler3D: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // ── Scene, Camera & Renderer ──
        const width = container.clientWidth || 480;
        const height = container.clientHeight || 480;

        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        camera.position.set(0, 0.15, 6.9);

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.appendChild(renderer.domElement);

        // ── Lighting ──
        // Ambient fill
        const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
        scene.add(ambientLight);

        // Key directional light (soft warm white)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
        dirLight.position.set(4, 7, 6);
        scene.add(dirLight);

        // Cyan rim light from bottom left
        const rimCyan = new THREE.DirectionalLight(0x00f0ff, 1.1);
        rimCyan.position.set(-6, -2, -3);
        scene.add(rimCyan);

        // Violet rim light from top right
        const rimViolet = new THREE.DirectionalLight(0xa855f7, 1.0);
        rimViolet.position.set(5, -3, -4);
        scene.add(rimViolet);

        // Warm book glow light illuminating face
        const bookGlow = new THREE.PointLight(0xffbe3b, 1.6, 4.5);
        bookGlow.position.set(0, 0.05, 1.25);
        scene.add(bookGlow);

        // ── Materials ──
        const suitWhiteMat = new THREE.MeshStandardMaterial({
            color: 0xf5f8ff,
            roughness: 0.32,
            metalness: 0.06,
        });

        const suitBlueMat = new THREE.MeshStandardMaterial({
            color: 0x0284c7, // vibrant cyan-blue accent
            roughness: 0.3,
            metalness: 0.15,
        });

        const suitDarkTrimMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.45,
        });

        const cyanGlowMat = new THREE.MeshBasicMaterial({
            color: 0x00f0ff,
        });

        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xffd1ba, // cute peach skin
            roughness: 0.58,
            metalness: 0.02,
        });

        const blushMat = new THREE.MeshBasicMaterial({
            color: 0xff6b8b,
            transparent: true,
            opacity: 0.38,
        });

        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x422316, // rich chocolate brown
            roughness: 0.65,
            metalness: 0.04,
        });

        const antBulbMat = new THREE.MeshStandardMaterial({
            color: 0xffd166,
            emissive: 0xff9f1c,
            emissiveIntensity: 1.1,
            roughness: 0.15,
        });

        const glassVisorMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.22,
            roughness: 0.04,
            metalness: 0.05,
            reflectivity: 0.9,
            depthWrite: false,
        });

        const bookCoverTex = createBookCoverTexture();
        const bookCoverMat = new THREE.MeshStandardMaterial({
            map: bookCoverTex,
            roughness: 0.42,
            metalness: 0.12,
        });

        const spineGoldMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            roughness: 0.28,
            metalness: 0.5,
        });

        const glowingPageMat = new THREE.MeshStandardMaterial({
            color: 0xfffbeb,
            emissive: 0xfbbf24,
            emissiveIntensity: 0.4,
            roughness: 0.38,
        });

        // ── Build Astronaut ──
        const astronautGroup = new THREE.Group();
        scene.add(astronautGroup);

        // 1. Head Group
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.95, 0);
        astronautGroup.add(headGroup);

        // Outer White Helmet Shell
        const helmetShell = new THREE.Mesh(new THREE.SphereGeometry(1.18, 48, 48), suitWhiteMat);
        helmetShell.scale.set(1.06, 0.98, 1.0);
        headGroup.add(helmetShell);

        // Cyan Top Helmet Patch Accent
        const topPatch = new THREE.Mesh(
            new THREE.SphereGeometry(1.19, 32, 32, -Math.PI * 0.35, Math.PI * 0.25, 0.25, 0.55),
            suitBlueMat
        );
        topPatch.scale.set(1.06, 0.98, 1.0);
        headGroup.add(topPatch);

        // Helmet Neck Collar
        const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.12, 20, 48), suitWhiteMat);
        neckRing.rotation.x = Math.PI / 2;
        neckRing.position.y = -0.82;
        headGroup.add(neckRing);

        // Visor Rim
        const visorRim = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 20, 48), suitWhiteMat);
        visorRim.scale.set(1.05, 0.9, 1);
        visorRim.position.set(0, 0.02, 0.58);
        headGroup.add(visorRim);

        // Ear Muff Pods (-1, 1) with Cyan Glow Rings
        [-1, 1].forEach((side) => {
            const earGroup = new THREE.Group();
            earGroup.position.set(side * 1.2, -0.02, 0.05);

            const bluePod = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.22, 32), suitBlueMat);
            bluePod.rotation.z = Math.PI / 2;
            earGroup.add(bluePod);

            const whiteCap = new THREE.Mesh(new THREE.SphereGeometry(0.36, 24, 24), suitWhiteMat);
            whiteCap.scale.set(0.35, 1, 1);
            whiteCap.position.x = side * 0.08;
            earGroup.add(whiteCap);

            const cyanGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.06, 24), cyanGlowMat);
            cyanGlow.rotation.z = Math.PI / 2;
            cyanGlow.position.x = side * 0.16;
            earGroup.add(cyanGlow);

            headGroup.add(earGroup);
        });

        // Golden Glowing Antenna
        const antennaGroup = new THREE.Group();
        antennaGroup.position.set(-1.12, 0.32, 0.05);
        antennaGroup.rotation.z = 0.08;
        headGroup.add(antennaGroup);

        const antBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.18, 20), suitBlueMat);
        antennaGroup.add(antBase);

        const antStalk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.045, 0.85, 16),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.2 })
        );
        antStalk.position.y = 0.45;
        antennaGroup.add(antStalk);

        const antBulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 24), antBulbMat);
        antBulb.position.y = 0.92;
        antennaGroup.add(antBulb);

        const antPointLight = new THREE.PointLight(0xffbe3d, 1.2, 3.5);
        antPointLight.position.y = 0.92;
        antennaGroup.add(antPointLight);

        // 2. Face Group
        const faceGroup = new THREE.Group();
        faceGroup.position.set(0, -0.05, 0.24);
        headGroup.add(faceGroup);

        // Head Base Sphere
        const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.78, 36, 36), skinMat);
        headMesh.scale.set(1.06, 0.96, 0.92);
        faceGroup.add(headMesh);

        // Cute Ears
        [-1, 1].forEach((side) => {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMat);
            ear.scale.set(0.5, 1, 0.8);
            ear.position.set(side * 0.78, -0.08, 0.05);
            faceGroup.add(ear);
        });

        // Rosy Cheeks
        [-1, 1].forEach((side) => {
            const cheek = new THREE.Mesh(new THREE.CircleGeometry(0.16, 24), blushMat);
            cheek.position.set(side * 0.44, -0.14, 0.68);
            cheek.rotation.y = side * 0.45;
            faceGroup.add(cheek);
        });

        // Expressive Eyes with Pupils and Catchlights
        const eyeGroups: THREE.Group[] = [];
        [-1, 1].forEach((side) => {
            const eyeGrp = new THREE.Group();
            eyeGrp.position.set(side * 0.31, 0.04, 0.66);
            eyeGrp.rotation.y = side * 0.22;

            // Sclera (White)
            const sclera = new THREE.Mesh(
                new THREE.SphereGeometry(0.19, 24, 24),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            sclera.scale.set(1.0, 1.12, 0.35);
            eyeGrp.add(sclera);

            // Iris
            const iris = new THREE.Mesh(
                new THREE.SphereGeometry(0.135, 24, 24),
                new THREE.MeshBasicMaterial({ color: 0x1e293b }) // deep stylish iris
            );
            iris.scale.set(1.0, 1.1, 0.38);
            iris.position.set(-side * 0.02, -0.02, 0.025);
            eyeGrp.add(iris);

            // Pupil
            const pupil = new THREE.Mesh(
                new THREE.SphereGeometry(0.085, 20, 20),
                new THREE.MeshBasicMaterial({ color: 0x020617 })
            );
            pupil.scale.set(1.0, 1.1, 0.4);
            pupil.position.set(-side * 0.02, -0.02, 0.04);
            eyeGrp.add(pupil);

            // Highlights
            const highlightBig = new THREE.Mesh(
                new THREE.SphereGeometry(0.042, 12, 12),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            highlightBig.position.set(-0.045, 0.055, 0.08);
            eyeGrp.add(highlightBig);

            const highlightSmall = new THREE.Mesh(
                new THREE.SphereGeometry(0.02, 10, 10),
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            highlightSmall.position.set(0.04, -0.05, 0.08);
            eyeGrp.add(highlightSmall);

            // Eyebrow
            const brow = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.24, 12), hairMat);
            brow.rotation.z = Math.PI / 2 - side * 0.22;
            brow.position.set(0, 0.27, 0.02);
            eyeGrp.add(brow);

            faceGroup.add(eyeGrp);
            eyeGroups.push(eyeGrp);
        });

        // Cute Button Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), skinMat);
        nose.scale.set(1.2, 0.85, 1.0);
        nose.position.set(0, -0.07, 0.74);
        faceGroup.add(nose);

        // Cheerful Smile
        const smileGroup = new THREE.Group();
        smileGroup.position.set(0, -0.25, 0.69);
        smileGroup.rotation.x = 0.12;
        faceGroup.add(smileGroup);

        const mouthCavity = new THREE.Mesh(
            new THREE.CircleGeometry(0.18, 24, Math.PI, Math.PI),
            new THREE.MeshBasicMaterial({ color: 0x7f1d1d })
        );
        smileGroup.add(mouthCavity);

        const teethBar = new THREE.Mesh(
            new THREE.PlaneGeometry(0.24, 0.045),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        teethBar.position.set(0, -0.02, 0.005);
        smileGroup.add(teethBar);

        const tongue = new THREE.Mesh(
            new THREE.CircleGeometry(0.1, 20, Math.PI, Math.PI),
            new THREE.MeshBasicMaterial({ color: 0xfb7185 })
        );
        tongue.position.set(0, -0.075, 0.008);
        smileGroup.add(tongue);

        // Sculpted Hair
        const hairGroup = new THREE.Group();
        faceGroup.add(hairGroup);

        const hairBackCap = new THREE.Mesh(
            new THREE.SphereGeometry(0.82, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.58),
            hairMat
        );
        hairBackCap.scale.set(1.06, 0.98, 0.95);
        hairBackCap.rotation.x = -0.25;
        hairGroup.add(hairBackCap);

        const hairPuffs = [
            { pos: [-0.28, 0.56, 0.48], scale: [0.36, 0.24, 0.3], rot: [0.2, 0.3, -0.4] },
            { pos: [0.05, 0.62, 0.52], scale: [0.42, 0.26, 0.32], rot: [0.1, -0.2, -0.25] },
            { pos: [0.38, 0.50, 0.44], scale: [0.32, 0.22, 0.28], rot: [0.2, -0.4, 0.35] },
            { pos: [-0.55, 0.36, 0.35], scale: [0.26, 0.30, 0.25], rot: [0, 0, 0.5] },
            { pos: [0.58, 0.32, 0.32], scale: [0.24, 0.28, 0.25], rot: [0, 0, -0.5] },
            { pos: [-0.12, 0.72, 0.35], scale: [0.38, 0.25, 0.35], rot: [0, 0, 0.15] }
        ];
        hairPuffs.forEach((p) => {
            const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 20), hairMat);
            puff.position.set(p.pos[0], p.pos[1], p.pos[2]);
            puff.scale.set(p.scale[0], p.scale[1], p.scale[2]);
            puff.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
            hairGroup.add(puff);
        });

        // Bubble Visor Glass
        const glassVisor = new THREE.Mesh(
            new THREE.SphereGeometry(1.02, 36, 36, 0, Math.PI * 2, 0, Math.PI * 0.55),
            glassVisorMat
        );
        glassVisor.rotation.x = Math.PI * 0.48;
        glassVisor.position.set(0, 0.02, 0.16);
        headGroup.add(glassVisor);

        // 3. Torso & Backpack
        const torsoGroup = new THREE.Group();
        torsoGroup.position.set(0, -0.32, 0);
        astronautGroup.add(torsoGroup);

        const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 1.05, 32), suitWhiteMat);
        torsoMesh.scale.set(1.08, 1, 0.85);
        torsoGroup.add(torsoMesh);

        // Belt
        const beltMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.67, 0.14, 32), suitBlueMat);
        beltMesh.scale.set(1.09, 1, 0.86);
        beltMesh.position.y = -0.32;
        torsoGroup.add(beltMesh);

        // Pelvis
        const pelvisMesh = new THREE.Mesh(new THREE.SphereGeometry(0.66, 28, 28), suitWhiteMat);
        pelvisMesh.scale.set(1.08, 0.65, 0.85);
        pelvisMesh.position.y = -0.5;
        torsoGroup.add(pelvisMesh);

        // Chest Patch
        const patchGroup = new THREE.Group();
        patchGroup.position.set(0.32, 0.18, 0.54);
        patchGroup.rotation.y = 0.25;
        torsoGroup.add(patchGroup);

        const patchBg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.06), suitBlueMat);
        patchGroup.add(patchBg);
        const patchDot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), cyanGlowMat);
        patchDot.position.z = 0.035;
        patchGroup.add(patchDot);
        const patchRing = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 8, 20), spineGoldMat);
        patchRing.rotation.set(0.8, 0.4, 0);
        patchRing.position.z = 0.035;
        patchGroup.add(patchRing);

        // Jetpack Backpack
        const backpackGroup = new THREE.Group();
        backpackGroup.position.set(0, 0.08, -0.62);
        torsoGroup.add(backpackGroup);

        const packMain = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.12, 0.55), suitWhiteMat);
        backpackGroup.add(packMain);

        const packTopTrim = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.57), suitBlueMat);
        packTopTrim.position.y = 0.45;
        backpackGroup.add(packTopTrim);

        // Glowing Cyan Vertical Indicator Strips & Thrusters
        [-1, 1].forEach((side) => {
            const glowBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.14), cyanGlowMat);
            glowBar.position.set(side * 0.58, -0.05, 0);
            backpackGroup.add(glowBar);

            // Thruster nozzle
            const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.24, 20), suitDarkTrimMat);
            thruster.position.set(side * 0.35, -0.65, 0.05);
            backpackGroup.add(thruster);

            // Thruster glow
            const thrustGlow = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), cyanGlowMat);
            thrustGlow.position.set(side * 0.35, -0.74, 0.05);
            backpackGroup.add(thrustGlow);
        });

        // 4. Arms & Gloves Holding Book
        [-1, 1].forEach((side) => {
            const armGroup = new THREE.Group();
            armGroup.position.set(side * 0.68, 0.18, 0.05);
            torsoGroup.add(armGroup);

            const shoulderPad = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), suitBlueMat);
            shoulderPad.scale.set(1.1, 0.85, 1.0);
            armGroup.add(shoulderPad);

            const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.19, 0.55, 24), suitWhiteMat);
            upperArm.position.set(side * 0.08, -0.22, 0.22);
            upperArm.rotation.x = -0.75;
            upperArm.rotation.z = -side * 0.28;
            armGroup.add(upperArm);

            const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 20), suitWhiteMat);
            elbow.position.set(side * 0.14, -0.42, 0.42);
            armGroup.add(elbow);

            const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.52, 24), suitWhiteMat);
            forearm.position.set(side * 0.02, -0.44, 0.68);
            forearm.rotation.x = Math.PI / 2 - 0.1;
            forearm.rotation.z = side * 0.52;
            armGroup.add(forearm);

            const wristRing = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.035, 16, 24), suitBlueMat);
            wristRing.position.set(-side * 0.08, -0.44, 0.86);
            wristRing.rotation.y = side * 0.45;
            armGroup.add(wristRing);

            const glovePalm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), suitWhiteMat);
            glovePalm.scale.set(0.9, 0.85, 1.1);
            glovePalm.position.set(-side * 0.14, -0.44, 1.02);
            armGroup.add(glovePalm);

            for (let f = -1; f <= 1; f++) {
                const finger = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), suitWhiteMat);
                finger.scale.set(1.3, 0.85, 0.9);
                finger.position.set(-side * 0.22, -0.44 + f * 0.09, 1.14);
                armGroup.add(finger);
            }
        });

        // 5. Zero-G Floating Legs & Boots
        const leftLegGroup = new THREE.Group();
        const rightLegGroup = new THREE.Group();

        const buildSpaceLeg = (group: THREE.Group, side: number) => {
            group.position.set(side * 0.38, -0.68, 0.12);
            torsoGroup.add(group);

            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.24, 0.58, 24), suitWhiteMat);
            thigh.position.set(0, -0.18, 0.25);
            thigh.rotation.x = -0.85;
            group.add(thigh);

            const kneePad = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), suitBlueMat);
            kneePad.scale.set(1.1, 0.9, 0.7);
            kneePad.position.set(0, -0.18, 0.48);
            kneePad.rotation.x = -0.4;
            group.add(kneePad);

            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.55, 24), suitWhiteMat);
            shin.position.set(0, -0.56, 0.36);
            shin.rotation.x = -0.25;
            group.add(shin);

            const bootBand = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 16, 28), suitBlueMat);
            bootBand.rotation.x = Math.PI / 2 - 0.25;
            bootBand.position.set(0, -0.68, 0.39);
            group.add(bootBand);

            const bootGroup = new THREE.Group();
            bootGroup.position.set(0, -0.92, 0.52);
            bootGroup.rotation.x = 0.35;
            group.add(bootGroup);

            const bootUpper = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), suitWhiteMat);
            bootUpper.scale.set(0.92, 0.85, 1.35);
            bootGroup.add(bootUpper);

            const bootSole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.28, 0.28, 0.12, 24),
                new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 })
            );
            bootSole.scale.set(0.95, 1, 1.35);
            bootSole.position.y = -0.18;
            bootGroup.add(bootSole);
        };

        buildSpaceLeg(leftLegGroup, -1);
        buildSpaceLeg(rightLegGroup, 1);
        leftLegGroup.rotation.set(-0.22, 0.18, -0.15);
        rightLegGroup.rotation.set(0.08, -0.12, 0.08);

        // 6. Glowing Storybook
        const bookGroup = new THREE.Group();
        bookGroup.position.set(-0.04, -0.26, 1.18);
        bookGroup.rotation.set(0.38, 0.18, -0.08);
        astronautGroup.add(bookGroup);

        const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.92, 20), suitDarkTrimMat);
        bookGroup.add(spine);

        [-0.45, 0.45].forEach((yPos) => {
            const goldCap = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 20), spineGoldMat);
            goldCap.position.y = yPos;
            bookGroup.add(goldCap);
        });

        [-1, 1].forEach((side) => {
            const halfWing = new THREE.Group();
            halfWing.rotation.y = side * 0.48;
            bookGroup.add(halfWing);

            const coverMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.9, 0.045), bookCoverMat);
            coverMesh.position.set(side * 0.35, 0, -0.02);
            halfWing.add(coverMesh);

            const pageBlock = new THREE.Mesh(new THREE.BoxGeometry(0.63, 0.85, 0.09), glowingPageMat);
            pageBlock.position.set(side * 0.34, 0, 0.04);
            halfWing.add(pageBlock);

            for (let p = 0; p < 2; p++) {
                const fanPage = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.84), glowingPageMat);
                fanPage.position.set(side * 0.32, 0, 0.09 + p * 0.015);
                fanPage.rotation.y = -side * (0.08 + p * 0.06);
                halfWing.add(fanPage);
            }
        });

        // ── Background Floating Celestial Elements ──
        const celestialGroup = new THREE.Group();
        scene.add(celestialGroup);

        // Mini Ringed Planet (Pastel Lilac & Cyan)
        const saturnMini = new THREE.Group();
        saturnMini.position.set(-3.2, 2.1, -2.5);
        saturnMini.rotation.set(0.4, 0.2, -0.5);
        celestialGroup.add(saturnMini);

        const planetMiniMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.45, 28, 28),
            new THREE.MeshStandardMaterial({ color: 0x818cf8, roughness: 0.45 })
        );
        saturnMini.add(planetMiniMesh);

        const ringMini = new THREE.Mesh(
            new THREE.RingGeometry(0.62, 0.95, 36),
            new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
        );
        ringMini.rotation.x = Math.PI / 2;
        saturnMini.add(ringMini);

        // Crescent/Cratered Moon (Pastel Cyan / Violet)
        const moonMini = new THREE.Group();
        moonMini.position.set(3.1, -1.8, -2.0);
        celestialGroup.add(moonMini);

        const moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.38, 24, 24),
            new THREE.MeshStandardMaterial({ color: 0xc4b5fd, roughness: 0.7 })
        );
        moonMini.add(moonMesh);

        // ── Sparkling Starfield Particles ──
        const starCount = 220;
        const starGeo = new THREE.BufferGeometry();
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPos[i * 3] = (Math.random() - 0.5) * 16;
            starPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
            starPos[i * 3 + 2] = -Math.random() * 10 + 2;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));

        const starTex = createStarSpriteTexture();
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

        // ── Book Magic Emission Sparkles ──
        const magicParticles: MagicParticle[] = [];
        const magicGeometries = [
            new THREE.OctahedronGeometry(0.08, 0),
            new THREE.TorusGeometry(0.06, 0.02, 6, 12),
            new THREE.SphereGeometry(0.05, 10, 10),
        ];

        const spawnMagicParticles = (count = 10) => {
            const worldBookPos = new THREE.Vector3();
            bookGroup.getWorldPosition(worldBookPos);

            for (let i = 0; i < count; i++) {
                const geo = magicGeometries[i % magicGeometries.length];
                const mat = new THREE.MeshBasicMaterial({
                    color: i % 2 === 0 ? 0xffbe3b : 0x00f0ff,
                    transparent: true,
                    opacity: 1,
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.copy(worldBookPos);
                mesh.position.x += (Math.random() - 0.5) * 0.4;
                mesh.position.y += (Math.random() - 0.5) * 0.2;
                mesh.position.z += (Math.random() - 0.5) * 0.2;
                scene.add(mesh);

                magicParticles.push({
                    mesh,
                    vel: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.035,
                        0.02 + Math.random() * 0.035,
                        (Math.random() - 0.3) * 0.035
                    ),
                    life: 1.0,
                    decay: 0.016 + Math.random() * 0.012,
                });
            }
        };

        // ── Interaction: Cursor Reaction & "Cursor is Gone" logic ──
        let mouseX = 0;
        let mouseY = 0;
        let isCursorActive = false;
        let cursorGoneTimer = 0;
        let flipTimer = 0;

        const onPointerMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            // Calculate relative to the container for precision, or fallback to window
            const cx = e.clientX - (rect.left + rect.width / 2);
            const cy = e.clientY - (rect.top + rect.height / 2);
            
            // Normalized from -1 to 1 based on viewport/container proximity
            mouseX = THREE.MathUtils.clamp(cx / (window.innerWidth * 0.4), -1.2, 1.2);
            mouseY = THREE.MathUtils.clamp(-cy / (window.innerHeight * 0.4), -1.2, 1.2);
            
            isCursorActive = true;
            cursorGoneTimer = 0;
        };

        const onPointerLeave = () => {
            isCursorActive = false;
        };

        // Click / Tap to do a joyful Zero-G backflip & star burst
        const onClick = () => {
            if (flipTimer <= 0) {
                flipTimer = 1.0;
                spawnMagicParticles(18);
            }
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        document.addEventListener('mouseleave', onPointerLeave);
        container.addEventListener('click', onClick);

        // Resize handler
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

        // ── Animation Loop ──
        const clock = new THREE.Clock();
        let animId: number;

        // Current smoothed values
        let curRotX = 0;
        let curRotY = 0;
        let curRotZ = 0;
        let curPosX = 0;
        let curPosY = 0;

        const animate = () => {
            animId = requestAnimationFrame(animate);

            const delta = Math.min(clock.getDelta(), 0.1);
            const elapsed = clock.getElapsedTime();

            // Check if cursor has been stationary or gone for too long
            cursorGoneTimer += delta;
            if (cursorGoneTimer > 3.0) {
                isCursorActive = false;
            }

            // Target positions and rotations based on whether cursor is present or gone
            let targetRotX = 0;
            let targetRotY = 0;
            let targetRotZ = 0;
            let targetPosX = 0;
            let targetPosY = 0;

            if (isCursorActive) {
                // CURSOR ACTIVE: Directly and smoothly tracks the computer cursor
                targetRotY = mouseX * 0.52;
                targetRotX = -mouseY * 0.32;
                targetRotZ = -mouseX * 0.12;
                targetPosX = mouseX * 0.28;
                targetPosY = mouseY * 0.22;
            } else {
                // CURSOR IS GONE: Move 3D art to the side & enter charming idle floating pose
                // Gently face towards the left/side (where the user's title & bio are)
                targetPosX = -0.32 + Math.cos(elapsed * 1.1) * 0.08;
                targetPosY = 0.02 + Math.sin(elapsed * 1.4) * 0.12;
                targetRotY = -0.35 + Math.sin(elapsed * 1.2) * 0.1;
                targetRotX = 0.06 + Math.cos(elapsed * 0.9) * 0.05;
                targetRotZ = 0.08 + Math.sin(elapsed * 0.7) * 0.04;
            }

            // Handle joyful 360° Zero-G Flip if clicked
            if (flipTimer > 0) {
                flipTimer -= delta * 1.25;
                if (flipTimer < 0) flipTimer = 0;
                const progress = 1 - flipTimer;
                const easeFlip = Math.sin(progress * Math.PI * 2);
                targetRotX += progress * Math.PI * 2;
                targetRotY += easeFlip * 0.4;
            }

            // Smooth interpolation (lerp) for fluid, weighted physics
            const lerpFactor = isCursorActive ? 0.07 : 0.04;
            curRotX = THREE.MathUtils.lerp(curRotX, targetRotX, lerpFactor);
            curRotY = THREE.MathUtils.lerp(curRotY, targetRotY, lerpFactor);
            curRotZ = THREE.MathUtils.lerp(curRotZ, targetRotZ, lerpFactor);
            curPosX = THREE.MathUtils.lerp(curPosX, targetPosX, lerpFactor);
            curPosY = THREE.MathUtils.lerp(curPosY, targetPosY, lerpFactor);

            // Zero-G floating bobbing
            const floatBobY = Math.sin(elapsed * 1.6) * 0.14;
            const floatBobX = Math.cos(elapsed * 1.0) * 0.06;

            astronautGroup.position.set(curPosX + floatBobX, curPosY + floatBobY, 0);
            astronautGroup.rotation.set(curRotX, curRotY, curRotZ);

            // Legs gentle kicking in zero-G
            leftLegGroup.rotation.x = -0.22 + Math.sin(elapsed * 1.8) * 0.08;
            rightLegGroup.rotation.x = 0.08 - Math.sin(elapsed * 1.8) * 0.08;

            // Cute periodic eye blinking + tracking
            const blinkCycle = elapsed % 3.8;
            const eyeScaleY = (blinkCycle > 3.62 && blinkCycle < 3.76) ? 0.1 : 1.12;
            const eyeLookX = isCursorActive ? mouseX * 0.08 : Math.sin(elapsed * 1.3) * 0.05;
            const eyeLookY = isCursorActive ? mouseY * 0.06 : 0;

            eyeGroups.forEach((eye, idx) => {
                eye.children[0].scale.y = eyeScaleY; // Sclera blinks
                eye.rotation.y = (idx === 0 ? -1 : 1) * 0.22 + eyeLookX;
                eye.rotation.x = -eyeLookY;
            });

            // Glowing antenna pulse
            antBulbMat.emissiveIntensity = 0.9 + Math.sin(elapsed * 3.5) * 0.35;
            antPointLight.intensity = 1.0 + Math.sin(elapsed * 3.5) * 0.3;

            // Celestial rotation
            saturnMini.rotation.y = elapsed * 0.25;
            saturnMini.position.y = 2.1 + Math.sin(elapsed * 0.8) * 0.1;
            moonMini.rotation.y = elapsed * 0.15;
            moonMini.position.y = -1.8 + Math.cos(elapsed * 0.9) * 0.1;

            // Starfield slow drift
            starField.rotation.y = elapsed * 0.015;
            starField.rotation.x = Math.sin(elapsed * 0.01) * 0.05;

            // Book magic emission particles update
            if (Math.random() < 0.12) {
                spawnMagicParticles(1);
            }
            for (let i = magicParticles.length - 1; i >= 0; i--) {
                const p = magicParticles[i];
                p.mesh.position.add(p.vel);
                p.mesh.rotation.x += 0.03;
                p.mesh.rotation.y += 0.04;
                p.life -= p.decay;
                (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.life);
                p.mesh.scale.setScalar(0.4 + p.life * 0.7);
                if (p.life <= 0) {
                    scene.remove(p.mesh);
                    p.mesh.geometry.dispose();
                    (p.mesh.material as THREE.Material).dispose();
                    magicParticles.splice(i, 1);
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
            container.removeEventListener('click', onClick);
            resizeObserver.disconnect();

            // Dispose renderer and geometries
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
                cursor: 'grab',
                userSelect: 'none',
                WebkitUserSelect: 'none',
            }}
            title="Click me for a Zero-G Twirl!"
        />
    );
};

export default SpaceTraveler3D;
