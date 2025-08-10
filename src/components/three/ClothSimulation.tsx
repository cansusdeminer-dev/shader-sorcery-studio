import React, { useEffect, useImperativeHandle, useRef, forwardRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Types
export type SceneObject =
  | { type: "sphere"; position: [number, number, number]; radius?: number; visible?: boolean }
  | { type: "box"; position: [number, number, number]; size?: [number, number, number]; visible?: boolean }
  | { type: "cylinder"; position: [number, number, number]; radius?: number; height?: number; visible?: boolean };

export type Orientation = "vertical" | "horizontal";
export type PinMode = "topEdge" | "corners" | "none" | "custom";

export type ClothProperties = {
  gridSize: number;
  clothWidth: number;
  clothHeight: number;
  structuralStiffness: number;
  shearStiffness: number;
  bendStiffness: number;
  dampness: number;
  gravity: number;
  windForce: number;
  windDirection: { x: number; y: number; z: number };
  airResistance: number;
  layers: number;
  tearThreshold: number;
  selfCollision: boolean;
  thickness: number;
  solverIterations?: number;
  orientation?: Orientation;
  pinMode?: PinMode;
  customPins?: number[];
  materialColor?: string; // hex string like #8844aa
  roughness?: number;
  metalness?: number;
  wireframe?: boolean;
};

export type Collider =
  | { kind: "sphere"; center: THREE.Vector3; radius: number }
  | { kind: "box"; min: THREE.Vector3; max: THREE.Vector3 };

type DragMode = "move" | "pin" | "tear" | "unpin";

type ClothSimulationProps = {
  isPlaying: boolean;
  clothProperties: ClothProperties;
  sceneObjects?: SceneObject[];
  selectedNodes?: number[];
  nodeProperties: Map<number, Partial<Particle>>;
  dragMode: DragMode;
  mouseForce: number;
  onNodeSelection?: (indices: number[]) => void;
  scale?: number;
};

type Particle = {
  index: number;
  position: THREE.Vector3;
  oldPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  mass: number;
  pinned: boolean;
  layer: number;
  gridX: number;
  gridY: number;
  customStiffness: number;
  customDampening: number;
  torn: boolean;
  invMass?: number;
};

type Constraint = {
  particleA: number;
  particleB: number;
  restLength: number;
  type: keyof ClothPhysicsEngine["springs"];
  torn: boolean;
  stiffness: number;
  dampening: number;
};

// Advanced Cloth Physics Engine (enhanced)
class ClothPhysicsEngine {
  gridSize: number;
  clothWidth: number;
  clothHeight: number;
  meshType: string;
  layers: number;
  mass: number;
  gravity: number;
  windForce: number;
  windDirection: { x: number; y: number; z: number };
  airResistance: number;
  springs: {
    structural: { stiffness: number; dampening: number };
    shear: { stiffness: number; dampening: number };
    bend: { stiffness: number; dampening: number };
  };
  tearThreshold: number;
  selfCollision: boolean;
  thickness: number;
  solverIterations: number;
  orientation: Orientation;
  pinMode: PinMode;
  customPins?: number[];

  particles: Particle[] = [];
  constraints: Constraint[] = [];
  torn = new Set<Constraint>();
  pinnedParticles = new Set<number>();
  time = 0;

  // temp vectors to reduce allocations
  private tmpDelta = new THREE.Vector3();
  private tmpWind = new THREE.Vector3();
  private tmpResist = new THREE.Vector3();

  constructor(options: Partial<ClothProperties & { meshType: string }> = {}) {
    this.gridSize = options.gridSize ?? 32;
    this.clothWidth = options.clothWidth ?? 2.0;
    this.clothHeight = options.clothHeight ?? 2.0;
    this.meshType = options.meshType ?? "square";
    this.layers = options.layers ?? 1;

    this.mass = 1.0;
    this.gravity = options.gravity ?? -9.8;
    this.windForce = options.windForce ?? 0.0;
    this.windDirection = options.windDirection ?? { x: 1, y: 0, z: 0 };
    this.airResistance = options.airResistance ?? 0.02;

    this.springs = {
      structural: { stiffness: options.structuralStiffness ?? 0.9, dampening: options.dampness ?? 0.05 },
      shear: { stiffness: options.shearStiffness ?? 0.7, dampening: options.dampness ?? 0.05 },
      bend: { stiffness: options.bendStiffness ?? 0.3, dampening: options.dampness ?? 0.05 },
    };

    this.tearThreshold = options.tearThreshold ?? 5.0;
    this.selfCollision = options.selfCollision ?? false;
    this.thickness = options.thickness ?? 0.05;
    this.solverIterations = options.solverIterations ?? 4;

    this.orientation = options.orientation ?? "vertical";
    this.pinMode = options.pinMode ?? "topEdge";
    this.customPins = options.customPins;

    this.initializeCloth();
  }

  private getParticleIndex(layer: number, x: number, y: number) {
    return layer * this.gridSize * this.gridSize + y * this.gridSize + x;
  }

  initializeCloth() {
    this.particles = [];
    const particleCount = this.gridSize * this.gridSize;

    for (let layer = 0; layer < this.layers; layer++) {
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const u = x / (this.gridSize - 1);
          const v = y / (this.gridSize - 1);
          let worldX: number, worldY: number, worldZ: number;

          if (this.orientation === "horizontal") {
            // XZ plane at some Y
            worldX = u * this.clothWidth - this.clothWidth / 2;
            worldZ = v * this.clothHeight - this.clothHeight / 2;
            worldY = 0.6 + layer * (this.thickness / (this.layers - 1 || 1));
          } else {
            // Vertical XY plane
            worldX = u * this.clothWidth - this.clothWidth / 2;
            worldY = v * this.clothHeight - this.clothHeight / 2 + 1;
            worldZ = layer * (this.thickness / (this.layers - 1 || 1));
          }

          const position = new THREE.Vector3(worldX, worldY, worldZ);
          const particle: Particle = {
            index: layer * particleCount + y * this.gridSize + x,
            position,
            oldPosition: position.clone(),
            velocity: new THREE.Vector3(),
            acceleration: new THREE.Vector3(),
            mass: this.mass,
            pinned: false,
            layer,
            gridX: x,
            gridY: y,
            customStiffness: 1.0,
            customDampening: 1.0,
            torn: false,
            invMass: 1 / this.mass,
          };

          this.particles.push(particle);
        }
      }
    }

    this.createConstraints();
    this.applyPinMode(this.pinMode, this.customPins);
  }

  createConstraints() {
    this.constraints = [];

    for (let layer = 0; layer < this.layers; layer++) {
      const layerOffset = layer * this.gridSize * this.gridSize;

      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          const index = layerOffset + y * this.gridSize + x;

          // Structural
          if (x < this.gridSize - 1) this.addConstraint(index, layerOffset + y * this.gridSize + (x + 1), "structural");
          if (y < this.gridSize - 1) this.addConstraint(index, layerOffset + (y + 1) * this.gridSize + x, "structural");

          // Shear
          if (x < this.gridSize - 1 && y < this.gridSize - 1)
            this.addConstraint(index, layerOffset + (y + 1) * this.gridSize + (x + 1), "shear");
          if (x > 0 && y < this.gridSize - 1)
            this.addConstraint(index, layerOffset + (y + 1) * this.gridSize + (x - 1), "shear");

          // Bend
          if (x < this.gridSize - 2) this.addConstraint(index, layerOffset + y * this.gridSize + (x + 2), "bend");
          if (y < this.gridSize - 2) this.addConstraint(index, layerOffset + (y + 2) * this.gridSize + x, "bend");

          // Inter-layer
          if (layer < this.layers - 1) {
            const nextLayerIndex = (layer + 1) * this.gridSize * this.gridSize + y * this.gridSize + x;
            this.addConstraint(index, nextLayerIndex, "structural");
          }
        }
      }
    }
  }

  addConstraint(indexA: number, indexB: number, type: keyof ClothPhysicsEngine["springs"]) {
    const particleA = this.particles[indexA];
    const particleB = this.particles[indexB];
    const restLength = particleA.position.distanceTo(particleB.position);

    this.constraints.push({
      particleA: indexA,
      particleB: indexB,
      restLength,
      type,
      torn: false,
      stiffness: this.springs[type].stiffness,
      dampening: this.springs[type].dampening,
    });
  }

  applyPinMode(mode: PinMode, customPins?: number[]) {
    this.pinnedParticles.clear();
    // unpin all
    for (let i = 0; i < this.particles.length; i++) this.particles[i].pinned = false;

    if (mode === "none") return;

    if (mode === "topEdge") {
      // top row of first layer (y=0)
      for (let x = 0; x < this.gridSize; x++) {
        const idx = this.getParticleIndex(0, x, 0);
        this.pinnedParticles.add(idx);
        this.particles[idx].pinned = true;
      }
    } else if (mode === "corners") {
      const tl = this.getParticleIndex(0, 0, 0);
      const tr = this.getParticleIndex(0, this.gridSize - 1, 0);
      this.pinnedParticles.add(tl);
      this.pinnedParticles.add(tr);
      this.particles[tl].pinned = true;
      this.particles[tr].pinned = true;
    } else if (mode === "custom" && customPins?.length) {
      for (const idx of customPins) {
        if (idx >= 0 && idx < this.particles.length) {
          this.pinnedParticles.add(idx);
          this.particles[idx].pinned = true;
        }
      }
    }

    this.pinMode = mode;
    this.customPins = customPins;
  }

  update(deltaTime: number, mousePosition: THREE.Vector3 | undefined, mouseForce: number, dragMode: DragMode, colliders: Collider[] | undefined) {
    this.time += deltaTime;

    // Clear forces and apply gravity
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.acceleration.set(0, this.gravity, 0);
    }

    // Time-varying wind
    if (this.windForce > 0) {
      const t = this.time;
      const gust = 0.5 + 0.5 * Math.sin(t * 0.7) + 0.3 * Math.sin(t * 1.3 + 1.7);
      this.tmpWind.set(this.windDirection.x, this.windDirection.y, this.windDirection.z).multiplyScalar(this.windForce * gust);
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        p.acceleration.add(this.tmpWind);
      }
    }

    // Air resistance
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.tmpResist.copy(p.velocity).multiplyScalar(-this.airResistance);
      p.acceleration.addScaledVector(this.tmpResist, p.invMass || 1);
    }

    // Mouse interaction
    if (mousePosition && mouseForce > 0) this.applyMouseForce(mousePosition, mouseForce, dragMode);

    // Solver iterations: satisfy constraints and resolve collisions each substep
    const iters = Math.max(1, this.solverIterations | 0);
    for (let iteration = 0; iteration < iters; iteration++) {
      this.satisfyConstraints();
      if (colliders && colliders.length) this.resolveCollisions(colliders);
    }

    // Verlet integration
    for (let i = 0; i < this.particles.length; i++) {
      if (this.pinnedParticles.has(i)) continue;
      const p = this.particles[i];
      this.tmpDelta.copy(p.position).sub(p.oldPosition); // velocity
      p.oldPosition.copy(p.position);
      const ax = p.acceleration.x * deltaTime * deltaTime;
      const ay = p.acceleration.y * deltaTime * deltaTime;
      const az = p.acceleration.z * deltaTime * deltaTime;
      p.position.add(this.tmpDelta.set(
        this.tmpDelta.x + ax,
        this.tmpDelta.y + ay,
        this.tmpDelta.z + az
      ));

      // Ground collision
      if (p.position.y < -2) {
        p.position.y = -2;
        p.oldPosition.y = p.position.y + this.tmpDelta.y * 0.8;
      }

      // update velocity cache (for air resistance next step)
      p.velocity.copy(p.position).sub(p.oldPosition);
    }

    // Self-collision (still gated)
    if (this.selfCollision) this.handleSelfCollision();
  }

  satisfyConstraints() {
    for (let i = 0; i < this.constraints.length; i++) {
      const c = this.constraints[i];
      if (c.torn) continue;

      const a = this.particles[c.particleA];
      const b = this.particles[c.particleB];

      this.tmpDelta.copy(b.position).sub(a.position);
      const distance = this.tmpDelta.length();
      if (distance === 0) continue;

      const difference = (distance - c.restLength) / distance;
      const stiffness = c.stiffness * a.customStiffness * b.customStiffness;

      // Tearing
      if (distance > c.restLength * this.tearThreshold) {
        c.torn = true;
        this.torn.add(c);
        continue;
      }

      const corrX = this.tmpDelta.x * difference * stiffness * 0.5;
      const corrY = this.tmpDelta.y * difference * stiffness * 0.5;
      const corrZ = this.tmpDelta.z * difference * stiffness * 0.5;

      if (!this.pinnedParticles.has(c.particleA)) {
        a.position.x += corrX;
        a.position.y += corrY;
        a.position.z += corrZ;
      }
      if (!this.pinnedParticles.has(c.particleB)) {
        b.position.x -= corrX;
        b.position.y -= corrY;
        b.position.z -= corrZ;
      }
    }
  }

  private resolveCollisions(colliders: Collider[]) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      for (let j = 0; j < colliders.length; j++) {
        const col = colliders[j];
        if (col.kind === "sphere") {
          const d = this.tmpDelta.copy(p.position).sub(col.center);
          const dist = d.length();
          const r = col.radius;
          if (dist < r) {
            // push out
            const amt = (r - dist) / (dist || 1);
            p.position.add(d.multiplyScalar(amt));
          }
        } else if (col.kind === "box") {
          const min = col.min, max = col.max;
          const x = Math.max(min.x, Math.min(max.x, p.position.x));
          const y = Math.max(min.y, Math.min(max.y, p.position.y));
          const z = Math.max(min.z, Math.min(max.z, p.position.z));
          // If inside, closest point equals position
          if (x === p.position.x && y === p.position.y && z === p.position.z) {
            // push out towards nearest face
            const dx = Math.min(p.position.x - min.x, max.x - p.position.x);
            const dy = Math.min(p.position.y - min.y, max.y - p.position.y);
            const dz = Math.min(p.position.z - min.z, max.z - p.position.z);
            const m = Math.min(dx, dy, dz);
            if (m === dx) p.position.x += p.position.x - (p.position.x - min.x < max.x - p.position.x ? min.x : max.x) > 0 ? m : -m;
            else if (m === dy) p.position.y += p.position.y - (p.position.y - min.y < max.y - p.position.y ? min.y : max.y) > 0 ? m : -m;
            else p.position.z += p.position.z - (p.position.z - min.z < max.z - p.position.z ? min.z : max.z) > 0 ? m : -m;
          }
        }
      }
    }
  }

  applyMouseForce(mousePosition: THREE.Vector3, force: number, dragMode: DragMode) {
    let closestParticle: number | null = null;
    let closestDistance = Infinity;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const distance = p.position.distanceTo(mousePosition);
      if (distance < closestDistance && distance < 0.5) {
        closestDistance = distance;
        closestParticle = i;
      }
    }

    if (closestParticle !== null) {
      const particle = this.particles[closestParticle];
      switch (dragMode) {
        case "move":
          this.tmpDelta.copy(mousePosition).sub(particle.position).multiplyScalar(force);
          particle.acceleration.add(this.tmpDelta);
          break;
        case "pin":
          this.pinnedParticles.add(closestParticle);
          particle.pinned = true;
          break;
        case "unpin":
          this.pinnedParticles.delete(closestParticle);
          particle.pinned = false;
          break;
        case "tear":
          for (let i = 0; i < this.constraints.length; i++) {
            const c = this.constraints[i];
            if (c.particleA === closestParticle || c.particleB === closestParticle) {
              c.torn = true;
              this.torn.add(c);
            }
          }
          break;
      }
    }
  }

  handleSelfCollision() {
    if (this.gridSize > 16) return;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const distance = a.position.distanceTo(b.position);
        const minDistance = this.thickness;
        if (distance < minDistance) {
          this.tmpDelta.copy(b.position).sub(a.position).normalize().multiplyScalar((minDistance - distance) * 0.5);
          if (!this.pinnedParticles.has(i)) a.position.sub(this.tmpDelta);
          if (!this.pinnedParticles.has(j)) b.position.add(this.tmpDelta);
        }
      }
    }
  }

  updateProperties(newProperties: Partial<ClothProperties>) {
    // Update scalar props
    this.gravity = newProperties.gravity ?? this.gravity;
    this.windForce = newProperties.windForce ?? this.windForce;
    this.windDirection = newProperties.windDirection ?? this.windDirection;
    this.airResistance = newProperties.airResistance ?? this.airResistance;
    this.tearThreshold = newProperties.tearThreshold ?? this.tearThreshold;
    this.selfCollision = newProperties.selfCollision ?? this.selfCollision;
    this.thickness = newProperties.thickness ?? this.thickness;
    this.solverIterations = newProperties.solverIterations ?? this.solverIterations;

    if (newProperties.pinMode && newProperties.pinMode !== this.pinMode) {
      this.applyPinMode(newProperties.pinMode, newProperties.customPins);
    }

    // Springs
    this.springs = {
      structural: { stiffness: newProperties.structuralStiffness ?? this.springs.structural.stiffness, dampening: newProperties.dampness ?? this.springs.structural.dampening },
      shear: { stiffness: newProperties.shearStiffness ?? this.springs.shear.stiffness, dampening: newProperties.dampness ?? this.springs.shear.dampening },
      bend: { stiffness: newProperties.bendStiffness ?? this.springs.bend.stiffness, dampening: newProperties.dampness ?? this.springs.bend.dampening },
    };
  }

  setParticleProperties(particleIndex: number, properties: Partial<Particle>) {
    if (particleIndex >= 0 && particleIndex < this.particles.length) {
      Object.assign(this.particles[particleIndex], properties);
    }
  }
}

const ClothSimulation = forwardRef(function ClothSimulation(
  props: ClothSimulationProps,
  ref: React.Ref<{ resetSimulation: () => void }>
) {
  const { isPlaying, clothProperties, sceneObjects = [], nodeProperties, dragMode, mouseForce, scale = 1 } = props;

  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const clothEngineRef = useRef<ClothPhysicsEngine | null>(null);
  const clothMeshRef = useRef<THREE.Mesh | null>(null);
  const mouseRef = useRef(new THREE.Vector3());
  const raycasterRef = useRef(new THREE.Raycaster());
  const frameIdRef = useRef<number | undefined>(undefined);
  const collidersRef = useRef<Collider[]>([]);

  useImperativeHandle(ref, () => ({
    resetSimulation: () => {
      // Recreate engine with same properties
      clothEngineRef.current = new ClothPhysicsEngine(clothProperties);
      rebuildGeometry();
    },
  }));

  const updateClothMesh = () => {
    if (!clothMeshRef.current || !clothEngineRef.current) return;
    const positions = (clothMeshRef.current.geometry as THREE.BufferGeometry).getAttribute("position") as THREE.BufferAttribute;
    const particles = clothEngineRef.current.particles;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      positions.setXYZ(i, p.position.x, p.position.y, p.position.z);
    }
    positions.needsUpdate = true;
    (clothMeshRef.current.geometry as THREE.BufferGeometry).computeVertexNormals();
  };

  const createSceneObjects = () => {
    if (!sceneRef.current) return;

    // Remove previous scene objects
    const toRemove: THREE.Object3D[] = [];
    sceneRef.current.traverse((child) => {
      if ((child as any).userData?.isSceneObject) toRemove.push(child);
    });
    toRemove.forEach((o) => sceneRef.current!.remove(o));

    // Add new ones
    sceneObjects.forEach((obj) => {
      if (obj.visible === false) return;
      let geometry: THREE.BufferGeometry | undefined;
      if (obj.type === "sphere") geometry = new THREE.SphereGeometry(obj.radius ?? 0.5, 32, 32);
      if (obj.type === "box") {
        const s = obj.size ?? [1, 1, 1];
        geometry = new THREE.BoxGeometry(s[0], s[1], s[2]);
      }
      if (obj.type === "cylinder") geometry = new THREE.CylinderGeometry(obj.radius ?? 0.5, obj.radius ?? 0.5, obj.height ?? 1, 32);
      if (!geometry) return;

      const material = new THREE.MeshLambertMaterial({ color: 0x666666, transparent: true, opacity: 0.8 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
      (mesh as any).userData.isSceneObject = true;
      (mesh as any).userData.objectData = obj;
      sceneRef.current!.add(mesh);
    });

    // Colliders for physics
    const cols: Collider[] = [];
    for (const obj of sceneObjects) {
      if (obj.visible === false) continue;
      if (obj.type === "sphere") {
        cols.push({ kind: "sphere", center: new THREE.Vector3(...obj.position), radius: obj.radius ?? 0.5 });
      } else if (obj.type === "box") {
        const size = obj.size ?? [1, 1, 1];
        const half = new THREE.Vector3(size[0] / 2, size[1] / 2, size[2] / 2);
        const center = new THREE.Vector3(...obj.position);
        cols.push({ kind: "box", min: center.clone().sub(half), max: center.clone().add(half) });
      }
    }
    collidersRef.current = cols;
  };

  const rebuildGeometry = () => {
    if (!sceneRef.current) return;
    const engine = new ClothPhysicsEngine(clothProperties);
    clothEngineRef.current = engine;

    // Build geometry to match particle count
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(engine.particles.length * 3);

    for (let i = 0; i < engine.particles.length; i++) {
      const p = engine.particles[i];
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;
    }

    // indices
    const indices: number[] = [];
    const gs = clothProperties.gridSize;
    for (let y = 0; y < gs - 1; y++) {
      for (let x = 0; x < gs - 1; x++) {
        const a = y * gs + x;
        const b = y * gs + (x + 1);
        const c = (y + 1) * gs + x;
        const d = (y + 1) * gs + (x + 1);
        indices.push(a, b, c, b, d, c);
      }
    }

    geom.setIndex(indices);
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.computeVertexNormals();

    // Create or update mesh
    const color = new THREE.Color(clothProperties.materialColor || "#8844aa");
    if (!clothMeshRef.current) {
      const mat = new THREE.MeshStandardMaterial({
        color,
        side: THREE.DoubleSide,
        roughness: clothProperties.roughness ?? 0.9,
        metalness: clothProperties.metalness ?? 0.05,
        wireframe: clothProperties.wireframe ?? false,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.scale.set(scale, scale, scale);
      sceneRef.current.add(mesh);
      clothMeshRef.current = mesh;
    } else {
      clothMeshRef.current.geometry.dispose();
      clothMeshRef.current.geometry = geom;
      const mat = clothMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color = color;
      mat.roughness = clothProperties.roughness ?? 0.9;
      mat.metalness = clothProperties.metalness ?? 0.05;
      mat.wireframe = clothProperties.wireframe ?? false;
      clothMeshRef.current.scale.set(scale, scale, scale);
    }
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene init
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 1.2;
    controls.maxDistance = 12;
    controlsRef.current = controls;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(5, 10, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.25);
    fill.position.set(-5, -2, -3);
    scene.add(fill);

    // Engine + geometry
    rebuildGeometry();

    // Scene primitives
    createSceneObjects();

    // RAF
    let lastTime = 0;
    const animate = (t: number) => {
      const dt = Math.min((t - lastTime) / 1000, 0.016);
      lastTime = t;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        if (isPlaying && clothEngineRef.current) {
          clothEngineRef.current.update(dt, mouseRef.current, mouseForce, dragMode, collidersRef.current);
          updateClothMesh();
        }
        controlsRef.current?.update();
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate(0);

    // Mouse
    const handleMouseMove = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current || !clothMeshRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycasterRef.current.setFromCamera(mouse, cameraRef.current);
      const hit = raycasterRef.current.intersectObject(clothMeshRef.current);
      if (hit.length > 0) mouseRef.current.copy(hit[0].point);
    };

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      renderer.domElement.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      if (mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update engine properties (cheap)
  useEffect(() => {
    clothEngineRef.current?.updateProperties(clothProperties);
    // Update material live
    if (clothMeshRef.current) {
      const mat = clothMeshRef.current.material as THREE.MeshStandardMaterial;
      if (clothProperties.materialColor) mat.color.set(clothProperties.materialColor);
      if (clothProperties.roughness !== undefined) mat.roughness = clothProperties.roughness;
      if (clothProperties.metalness !== undefined) mat.metalness = clothProperties.metalness;
      if (clothProperties.wireframe !== undefined) mat.wireframe = clothProperties.wireframe;
    }
  }, [
    clothProperties.gravity,
    clothProperties.windForce,
    clothProperties.windDirection,
    clothProperties.airResistance,
    clothProperties.structuralStiffness,
    clothProperties.shearStiffness,
    clothProperties.bendStiffness,
    clothProperties.dampness,
    clothProperties.tearThreshold,
    clothProperties.selfCollision,
    clothProperties.thickness,
    clothProperties.solverIterations,
    clothProperties.materialColor,
    clothProperties.roughness,
    clothProperties.metalness,
    clothProperties.wireframe,
    clothProperties.pinMode,
  ]);

  // Rebuild geometry and engine when resolution/layers/orientation changes
  useEffect(() => {
    rebuildGeometry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clothProperties.gridSize, clothProperties.layers, clothProperties.orientation]);

  // Update scene objects + colliders
  useEffect(() => {
    createSceneObjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sceneObjects)]);

  // Apply per-node overrides
  useEffect(() => {
    if (clothEngineRef.current && nodeProperties.size > 0) {
      nodeProperties.forEach((props, idx) => {
        clothEngineRef.current!.setParticleProperties(idx, props);
      });
    }
  }, [nodeProperties]);

  // External scale control
  useEffect(() => {
    if (clothMeshRef.current) clothMeshRef.current.scale.set(scale, scale, scale);
  }, [scale]);

  return <div ref={mountRef} className="w-full h-full" />;
});

ClothSimulation.displayName = "ClothSimulation";
export default ClothSimulation;
