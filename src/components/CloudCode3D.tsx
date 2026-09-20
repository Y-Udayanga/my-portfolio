import { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';

/* ── AWS-style cloud: smooth extruded silhouette with glowing edge ── */
const buildCloudShape = () => {
    const s = new THREE.Shape();
    // flat bottom + rounded caps and puffs (classic cloud logo silhouette)
    s.moveTo(-1.55, -0.5);
    s.lineTo(1.55, -0.5);
    s.absarc(1.55, -0.1, 0.4, -Math.PI / 2, Math.PI / 2, false); // right cap
    s.absarc(0.85, 0.35, 0.6, -Math.PI / 18, Math.PI * 0.83, false); // right puff
    s.absarc(-0.25, 0.5, 0.7, Math.PI * 0.11, Math.PI * 0.89, false); // big top puff
    s.absarc(-1.1, 0.25, 0.55, Math.PI * 0.17, Math.PI * 0.55, false); // left puff
    s.absarc(-1.55, -0.1, 0.4, Math.PI / 2, Math.PI * 1.5, false); // left cap
    s.closePath();
    return s;
};

const Cloud = () => {
    const group = useRef<THREE.Group>(null);
    const { geometry, edges } = useMemo(() => {
        const shape = buildCloudShape();
        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 0.45,
            bevelEnabled: true,
            bevelThickness: 0.12,
            bevelSize: 0.12,
            bevelSegments: 8,
            curveSegments: 48,
        });
        geometry.center();
        const edges = new THREE.EdgesGeometry(geometry, 60);
        return { geometry, edges };
    }, []);

    useFrame(({ clock }) => {
        if (!group.current) return;
        const t = clock.getElapsedTime();
        group.current.rotation.y = Math.sin(t * 0.3) * 0.35;
        group.current.position.y = 0.3 + Math.sin(t * 0.8) * 0.1;
    });

    return (
        <group ref={group}>
            <mesh geometry={geometry}>
                <meshPhysicalMaterial
                    color="#0e2238"
                    emissive="#00b4cc"
                    emissiveIntensity={0.35}
                    roughness={0.15}
                    metalness={0.7}
                    clearcoat={1}
                    clearcoatRoughness={0.2}
                />
            </mesh>
            {/* glowing edge outline */}
            <lineSegments geometry={edges}>
                <lineBasicMaterial color="#00f0ff" transparent opacity={0.6} />
            </lineSegments>
            <pointLight position={[0, 0.2, 1]} color="#00f0ff" intensity={3} distance={6} />
            {/* rain of falling code bits under the cloud */}
            <CodeRain />
        </group>
    );
};

/* ── Binary / code characters raining down from the cloud ── */
const RAIN_CHARS = ['0', '1', '{', '}', '<', '>', ';', '='];
const CodeRain = () => {
    const drops = useMemo(
        () =>
            Array.from({ length: 14 }, (_, i) => ({
                x: -1.6 + (i % 7) * 0.55 + (Math.random() - 0.5) * 0.2,
                z: (Math.random() - 0.5) * 0.8,
                speed: 0.4 + Math.random() * 0.5,
                offset: Math.random() * 10,
                char: RAIN_CHARS[i % RAIN_CHARS.length],
            })),
        []
    );
    const refs = useRef<(THREE.Group | null)[]>([]);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        drops.forEach((d, i) => {
            const g = refs.current[i];
            if (!g) return;
            const y = -0.8 - (((t * d.speed + d.offset) % 2.2));
            g.position.set(d.x, y, d.z);
            const mat = (g.children[0] as THREE.Mesh)?.material as THREE.Material | undefined;
            if (mat) mat.opacity = Math.max(0, 1 - (Math.abs(y) - 0.8) / 2.2) * 0.85;
        });
    });

    return (
        <group>
            {drops.map((d, i) => (
                <group key={i} ref={(el) => { refs.current[i] = el; }}>
                    <Text fontSize={0.22} color={i % 2 ? '#a855f7' : '#00f0ff'} anchorX="center" anchorY="middle">
                        {d.char}
                        <meshBasicMaterial transparent color={i % 2 ? '#a855f7' : '#00f0ff'} />
                    </Text>
                </group>
            ))}
        </group>
    );
};

/* ── Code symbols orbiting the cloud ── */
const ORBIT_SYMBOLS = [
    { text: '</>', color: '#00f0ff' },
    { text: '{ }', color: '#a855f7' },
    { text: 'git', color: '#f637ec' },
    { text: 'npm', color: '#00f0ff' },
    { text: '( )', color: '#a855f7' },
];

const OrbitingCode = () => {
    const group = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (group.current) group.current.rotation.y = clock.getElapsedTime() * 0.35;
    });

    return (
        <group ref={group}>
            {ORBIT_SYMBOLS.map((s, i) => {
                const angle = (i / ORBIT_SYMBOLS.length) * Math.PI * 2;
                const r = 2.6;
                return (
                    <group key={s.text} position={[Math.cos(angle) * r, Math.sin(angle * 2) * 0.4, Math.sin(angle) * r]}>
                        <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
                            <Text fontSize={0.34} color={s.color} anchorX="center" anchorY="middle" font={undefined}>
                                {s.text}
                            </Text>
                        </Float>
                    </group>
                );
            })}
            {/* orbit ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.6, 0.005, 8, 100]} />
                <meshBasicMaterial color="#00f0ff" transparent opacity={0.25} />
            </mesh>
            <mesh rotation={[Math.PI / 2.4, 0.4, 0]}>
                <torusGeometry args={[3.0, 0.004, 8, 100]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.18} />
            </mesh>
        </group>
    );
};

/* ── Ambient particle starfield ── */
const Particles = () => {
    const ref = useRef<THREE.Points>(null);
    const positions = useMemo(() => {
        const arr = new Float32Array(400 * 3);
        for (let i = 0; i < 400; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 10;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        return arr;
    }, []);

    useFrame(({ clock }) => {
        if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.02;
    });

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.02} color="#00f0ff" transparent opacity={0.5} sizeAttenuation />
        </points>
    );
};

const CloudCode3D = () => (
    <Canvas
        camera={{ position: [0, 0.4, 6.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
    >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 5]} intensity={0.8} color="#a855f7" />
        <Suspense fallback={null}>
            <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
                <Cloud />
            </Float>
            <OrbitingCode />
            <Particles />
        </Suspense>
    </Canvas>
);

export default CloudCode3D;
