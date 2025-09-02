import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';

// Enhanced Lava Blob Physics with Advanced Collision
class LavaBlob {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
  baseRadius: number;
  temperature: number;
  targetTemperature: number;
  mass: number;
  viscosity: number;
  buoyancy: number;
  merger: any;
  mergeTime: number;
  pulsation: number;
  deformation: THREE.Vector3;
  oldPosition: THREE.Vector3;
  acceleration: THREE.Vector3;
  surfaceTension: number;
  internalPressure: number;

  constructor(position: THREE.Vector3, radius: number, temperature = 1.0) {
    this.position = position.clone();
    this.oldPosition = position.clone();
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.radius = radius;
    this.baseRadius = radius;
    this.temperature = temperature;
    this.targetTemperature = temperature;
    this.mass = Math.PI * 4/3 * radius * radius * radius;
    this.viscosity = 0.95;
    this.buoyancy = 0.02;
    this.merger = null;
    this.mergeTime = 0;
    this.pulsation = Math.random() * Math.PI * 2;
    this.deformation = new THREE.Vector3(1, 1, 1);
    this.surfaceTension = 0.02;
    this.internalPressure = 1.0;
  }

  update(deltaTime: number, heatSource: THREE.Vector3, coolZone: THREE.Vector3, globalViscosity: number, buoyancyForce: number, containerRadius: number, containerHeight: number) {
    // Clear forces
    this.acceleration.set(0, -9.8, 0); // Gravity
    
    // Temperature dynamics with more sophisticated heat transfer
    const distToHeat = this.position.distanceTo(heatSource);
    const distToCool = this.position.distanceTo(coolZone);
    
    // Heat transfer based on distance and thermal conductivity
    const heatInfluence = Math.exp(-distToHeat * 0.8) * 2.0;
    const coolInfluence = Math.exp(-distToCool * 0.8) * 1.5;
    
    this.targetTemperature = 0.7 + heatInfluence - coolInfluence;
    this.targetTemperature = Math.max(0.1, Math.min(2.5, this.targetTemperature));
    
    // Smooth temperature transition
    this.temperature += (this.targetTemperature - this.temperature) * deltaTime * 3;
    
    // Dynamic radius based on temperature with surface tension
    const tempExpansion = 0.7 + 0.6 * this.temperature;
    const surfaceTensionEffect = 1.0 - this.surfaceTension * (2.0 - this.temperature);
    this.radius = this.baseRadius * tempExpansion * surfaceTensionEffect;
    
    // Thermal buoyancy with convection effects
    const thermalBuoyancy = (this.temperature - 0.8) * buoyancyForce * 1.5;
    this.acceleration.y += thermalBuoyancy;
    
    // Internal pressure effects on deformation
    this.pulsation += deltaTime * (1 + this.temperature * 0.5);
    const pulse = Math.sin(this.pulsation) * 0.15 + 1;
    const pressureDeform = 1.0 + (this.internalPressure - 1.0) * 0.1;
    this.deformation.set(pulse * pressureDeform, (1/pulse) * pressureDeform, pulse * pressureDeform);
    
    // Advanced viscosity with temperature dependency
    const tempViscosity = globalViscosity * (2.0 - this.temperature * 0.5);
    this.velocity.multiplyScalar(Math.pow(tempViscosity, deltaTime * 60));
    
    // Enhanced collision detection with glass container
    this.handleGlassCollision(containerRadius, containerHeight, deltaTime);
    
    // Verlet integration for better stability
    const newPosition = this.position.clone()
      .add(this.position.clone().sub(this.oldPosition).add(this.acceleration.clone().multiplyScalar(deltaTime * deltaTime)));
    
    this.oldPosition.copy(this.position);
    this.position.copy(newPosition);
    
    // Update velocity for next frame
    this.velocity.copy(this.position.clone().sub(this.oldPosition).divideScalar(deltaTime));
  }

  handleGlassCollision(containerRadius: number, containerHeight: number, deltaTime: number) {
    const glassThickness = 0.05;
    const innerRadius = containerRadius - glassThickness;
    
    // Cylindrical container collision with glass thickness
    const xzDist = Math.sqrt(this.position.x * this.position.x + this.position.z * this.position.z);
    if (xzDist + this.radius > innerRadius) {
      const penetration = (xzDist + this.radius) - innerRadius;
      const normal = new THREE.Vector3(this.position.x, 0, this.position.z).normalize();
      
      // Collision response with glass material properties
      this.position.sub(normal.clone().multiplyScalar(penetration));
      
      // Glass collision dampening
      const velocityNormal = this.velocity.clone().projectOnVector(normal);
      const velocityTangent = this.velocity.clone().sub(velocityNormal);
      
      this.velocity.copy(velocityTangent.multiplyScalar(0.4).add(velocityNormal.multiplyScalar(-0.2)));
      
      // Heat transfer to glass (cooling effect)
      this.temperature *= 0.98;
    }
    
    // Bottom collision with heat plate
    if (this.position.y - this.radius < -containerHeight/2) {
      const penetration = (-containerHeight/2) - (this.position.y - this.radius);
      this.position.y += penetration;
      
      if (this.velocity.y < 0) {
        this.velocity.y = Math.abs(this.velocity.y) * 0.4;
        // Heat absorption from bottom plate
        this.temperature = Math.min(2.5, this.temperature + 0.1);
      }
    }
    
    // Top collision with cooling plate
    if (this.position.y + this.radius > containerHeight/2) {
      const penetration = (this.position.y + this.radius) - containerHeight/2;
      this.position.y -= penetration;
      
      if (this.velocity.y > 0) {
        this.velocity.y = -Math.abs(this.velocity.y) * 0.4;
        // Heat loss to top cooling
        this.temperature = Math.max(0.1, this.temperature - 0.05);
      }
    }
  }
  
  canMerge(other: LavaBlob) {
    const distance = this.position.distanceTo(other.position);
    const mergeThreshold = (this.radius + other.radius) * 1.05;
    return distance < mergeThreshold;
  }
  
  merge(other: LavaBlob) {
    const totalMass = this.mass + other.mass;
    const newRadius = Math.pow(totalMass * 3 / (4 * Math.PI), 1/3);
    
    // Weighted average position and velocity
    this.position.multiplyScalar(this.mass).add(other.position.clone().multiplyScalar(other.mass)).divideScalar(totalMass);
    this.velocity.multiplyScalar(this.mass).add(other.velocity.clone().multiplyScalar(other.mass)).divideScalar(totalMass);
    
    this.radius = newRadius;
    this.baseRadius = newRadius;
    this.mass = totalMass;
    this.temperature = (this.temperature * this.mass + other.temperature * other.mass) / totalMass;
  }
}

class LavaLampEngine {
  blobs: LavaBlob[];
  options: any;
  heatSource: THREE.Vector3;
  coolZone: THREE.Vector3;
  containerRadius: number;
  containerHeight: number;

  constructor(options: any = {}) {
    this.blobs = [];
    this.options = {
      blobCount: options.blobCount || 6,
      minRadius: options.minRadius || 0.03,
      maxRadius: options.maxRadius || 0.08,
      viscosity: options.viscosity || 0.98,
      buoyancy: options.buoyancy || 0.02,
      mergingEnabled: options.mergingEnabled || true,
      splitEnabled: options.splitEnabled || true,
      solverIterations: options.solverIterations || 3,
      thermalDiffusion: options.thermalDiffusion || 0.1,
      ...options
    };
    
    this.containerRadius = 0.8;
    this.containerHeight = 3;
    this.heatSource = new THREE.Vector3(0, -this.containerHeight/2 + 0.1, 0);
    this.coolZone = new THREE.Vector3(0, this.containerHeight/2 - 0.1, 0);
    
    this.initializeBlobs();
  }
  
  initializeBlobs() {
    this.blobs = [];
    for (let i = 0; i < this.options.blobCount; i++) {
      const angle = (i / this.options.blobCount) * Math.PI * 2;
      const radius = Math.random() * 0.3;
      const position = new THREE.Vector3(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 1.5,
        Math.sin(angle) * radius
      );
      
      const blobRadius = this.options.minRadius + Math.random() * (this.options.maxRadius - this.options.minRadius);
      const temperature = 0.5 + Math.random() * 0.5;
      
      this.blobs.push(new LavaBlob(position, blobRadius, temperature));
    }
  }
  
  update(deltaTime: number) {
    // Multiple solver iterations for stability
    for (let iter = 0; iter < this.options.solverIterations; iter++) {
      // Update each blob
      this.blobs.forEach(blob => {
        blob.update(deltaTime / this.options.solverIterations, this.heatSource, this.coolZone, 
                   this.options.viscosity, this.options.buoyancy, this.containerRadius, this.containerHeight);
      });
      
      // Inter-blob interactions
      this.handleBlobInteractions();
    }
    
    // Handle merging
    if (this.options.mergingEnabled) {
      this.handleMerging();
    }
    
    // Handle splitting (when blob gets too large)
    if (this.options.splitEnabled) {
      this.handleSplitting();
    }
  }
  
  handleBlobInteractions() {
    // Blob-to-blob thermal exchange with minimal repulsion (promote merging)
    for (let i = 0; i < this.blobs.length; i++) {
      for (let j = i + 1; j < this.blobs.length; j++) {
        const blobA = this.blobs[i];
        const blobB = this.blobs[j];
        
        const distance = blobA.position.distanceTo(blobB.position);
        const minDistance = blobA.radius + blobB.radius;
        
        // Only apply tiny repulsion on deep overlap to avoid jitter
        if (distance < minDistance * 0.1) {
          const repulsionForce = (minDistance * 0.1 - distance) * 0.05;
          const direction = blobA.position.clone().sub(blobB.position).normalize();
          if (repulsionForce > 0 && isFinite(repulsionForce)) {
            blobA.position.add(direction.clone().multiplyScalar(repulsionForce * 0.5));
            blobB.position.add(direction.clone().multiplyScalar(-repulsionForce * 0.5));
          }
        }
        
        // Thermal exchange encourages convection and merging
        if (distance < minDistance * 1.5) {
          const tempDiff = blobA.temperature - blobB.temperature;
          const exchange = tempDiff * this.options.thermalDiffusion * 0.02;
          blobA.temperature -= exchange;
          blobB.temperature += exchange;
        }
      }
    }
  }
  
  handleMerging() {
    for (let i = this.blobs.length - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        if (this.blobs[i].canMerge(this.blobs[j])) {
          this.blobs[i].merge(this.blobs[j]);
          this.blobs.splice(j, 1);
          i--; // Adjust index since we removed an element
          break;
        }
      }
    }
  }
  
  handleSplitting() {
    const toSplit = [];
    this.blobs.forEach((blob, index) => {
      if (blob.radius > this.options.maxRadius * 1.8 && Math.random() < 0.008) {
        toSplit.push(index);
      }
    });
    
    toSplit.reverse().forEach(index => {
      const blob = this.blobs[index];
      const newRadius = blob.radius * 0.75;
      
      // Create two new smaller blobs with proper physics
      const offset = new THREE.Vector3(newRadius * 0.8, 0, 0);
      const blob1 = new LavaBlob(blob.position.clone().add(offset), newRadius, blob.temperature);
      const blob2 = new LavaBlob(blob.position.clone().sub(offset), newRadius, blob.temperature);
      
      // Give them opposing velocities
      blob1.velocity.set(0.05, 0.02, 0);
      blob2.velocity.set(-0.05, -0.02, 0);
      
      this.blobs.splice(index, 1, blob1, blob2);
    });
  }
  
  updateOptions(newOptions: any) {
    Object.assign(this.options, newOptions);
  }
}

interface LavaLampProps {
  isPlaying?: boolean;
  lavaProperties: {
    blobCount: number;
    minRadius: number;
    maxRadius: number;
    viscosity: number;
    buoyancy: number;
    mergingEnabled: boolean;
    splitEnabled: boolean;
    solverIterations: number;
    thermalDiffusion: number;
  };
  materialProperties: {
    lavaColor: string;
    lavaEmissive: string;
    lavaTranslucency: number;
    lavaRoughness: number;
    lavaMetalness: number;
    glassColor: string;
    glassTransparency: number;
    glassRoughness: number;
    glassThickness: number;
    glassIOR: number;
    bloomStrength: number;
    bloomRadius: number;
    bloomThreshold: number;
    emissiveIntensity: number;
    subsurfaceScattering: number;
  };
  lightingProperties: {
    ambientIntensity: number;
    pointLightIntensity: number;
    pointLightColor: string;
    environmentIntensity: number;
    bottomHeatGlow: number;
    topCoolGlow: number;
  };
}

const LavaLampSimulation = forwardRef<any, LavaLampProps>((props, ref) => {
  const {
    isPlaying = true,
    lavaProperties,
    materialProperties,
    lightingProperties
  } = props;
  
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  
  const engineRef = useRef<LavaLampEngine>();
  const frameIdRef = useRef<number>();
  const lavaGroupRef = useRef<THREE.Group>();
  const glassMeshRef = useRef<THREE.Mesh>();
  
  // Material refs
  const lavaMaterialRef = useRef<THREE.MeshStandardMaterial>();
  const glassMaterialRef = useRef<THREE.MeshPhysicalMaterial>();
  
  useImperativeHandle(ref, () => ({
    resetSimulation: () => {
      if (engineRef.current) {
        engineRef.current.initializeBlobs();
      }
    }
  }));
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(3, 0, 3);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Controls - Using manual controls since OrbitControls from drei needs Canvas context
    let isDragging = false;
    let previousMouse = { x: 0, y: 0 };
    
    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouse = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - previousMouse.x;
      const deltaY = e.clientY - previousMouse.y;
      
      // Rotate camera around target
      const spherical = new THREE.Spherical();
      spherical.setFromVector3(camera.position);
      spherical.theta -= deltaX * 0.01;
      spherical.phi += deltaY * 0.01;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
      
      camera.position.setFromSpherical(spherical);
      camera.lookAt(0, 0, 0);
      
      previousMouse = { x: e.clientX, y: e.clientY };
    };
    
    const handleMouseUp = () => {
      isDragging = false;
    };
    
    const handleWheel = (e: WheelEvent) => {
      const distance = camera.position.length();
      const newDistance = Math.max(1, Math.min(10, distance + e.deltaY * 0.01));
      camera.position.normalize().multiplyScalar(newDistance);
    };
    
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('wheel', handleWheel);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, lightingProperties.ambientIntensity);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(new THREE.Color(lightingProperties.pointLightColor), lightingProperties.pointLightIntensity);
    pointLight.position.set(2, 2, 2);
    pointLight.castShadow = true;
    scene.add(pointLight);
    
    // Heat source glow
    const heatGlow = new THREE.PointLight(0xff4400, lightingProperties.bottomHeatGlow);
    heatGlow.position.set(0, -1.2, 0);
    scene.add(heatGlow);
    
    // Cool zone glow
    const coolGlow = new THREE.PointLight(0x0044ff, lightingProperties.topCoolGlow);
    coolGlow.position.set(0, 1.2, 0);
    scene.add(coolGlow);
    
    // Glass container with proper transparency
    const glassGeometry = new THREE.CylinderGeometry(0.85, 0.85, 3, 32, 1, true);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(materialProperties.glassColor),
      transparent: true,
      opacity: 1.0, // use transmission for see-through
      roughness: materialProperties.glassRoughness,
      thickness: materialProperties.glassThickness,
      ior: materialProperties.glassIOR,
      transmission: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      side: THREE.DoubleSide,
      envMapIntensity: 0.2
    });
    
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    scene.add(glassMesh);
    glassMeshRef.current = glassMesh;
    glassMaterialRef.current = glassMaterial;
    
    // Lava material
    const lavaMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(materialProperties.lavaColor),
      emissive: new THREE.Color(materialProperties.lavaEmissive),
      emissiveIntensity: materialProperties.emissiveIntensity,
      roughness: materialProperties.lavaRoughness,
      metalness: materialProperties.lavaMetalness,
      transparent: true,
      opacity: 1 - materialProperties.lavaTranslucency
    });
    lavaMaterialRef.current = lavaMaterial;
    
    // Lava blobs group
    const lavaGroup = new THREE.Group();
    scene.add(lavaGroup);
    lavaGroupRef.current = lavaGroup;
    
    // Initialize physics engine
    const engine = new LavaLampEngine(lavaProperties);
    engineRef.current = engine;
    
    // Animation loop
    let lastTime = 0;
    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.016);
      lastTime = currentTime;
      
      if (isPlaying && engineRef.current) {
        engineRef.current.update(deltaTime);
        updateLavaBlobs();
      }
      
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    const updateLavaBlobs = () => {
      if (!lavaGroupRef.current || !engineRef.current) return;
      
      // Clear existing blobs
      lavaGroupRef.current.clear();
      
      // Create new blob meshes
      engineRef.current.blobs.forEach(blob => {
        const geometry = new THREE.SphereGeometry(blob.radius, 16, 16);
        const mesh = new THREE.Mesh(geometry, lavaMaterialRef.current);
        
        mesh.position.copy(blob.position);
        mesh.scale.copy(blob.deformation);
        
        // Temperature-based emissive intensity
        const tempEmissive = blob.temperature * materialProperties.emissiveIntensity;
        mesh.material = lavaMaterialRef.current.clone();
        mesh.material.emissiveIntensity = tempEmissive;
        
        // Color shift based on temperature
        const tempHue = 0.1 - blob.temperature * 0.1; // Hot = red, cold = yellow
        mesh.material.emissive.setHSL(tempHue, 1, 0.3 * blob.temperature);
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        lavaGroupRef.current?.add(mesh);
      });
    };
    
    animate(0);
    
    // Window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);
  
  // Update lava properties
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateOptions(lavaProperties);
    }
  }, [lavaProperties]);
  
  // Update material properties
  useEffect(() => {
    if (lavaMaterialRef.current) {
      lavaMaterialRef.current.color.set(materialProperties.lavaColor);
      lavaMaterialRef.current.emissive.set(materialProperties.lavaEmissive);
      lavaMaterialRef.current.emissiveIntensity = materialProperties.emissiveIntensity;
      lavaMaterialRef.current.roughness = materialProperties.lavaRoughness;
      lavaMaterialRef.current.metalness = materialProperties.lavaMetalness;
      lavaMaterialRef.current.opacity = 1 - materialProperties.lavaTranslucency;
    }
    
    if (glassMaterialRef.current) {
      glassMaterialRef.current.color.set(materialProperties.glassColor);
      glassMaterialRef.current.opacity = 1.0; // keep fully opaque, rely on transmission
      glassMaterialRef.current.roughness = materialProperties.glassRoughness;
      glassMaterialRef.current.thickness = materialProperties.glassThickness;
      glassMaterialRef.current.ior = materialProperties.glassIOR;
      glassMaterialRef.current.transmission = Math.min(1, Math.max(0, materialProperties.glassTransparency));
    }
  }, [materialProperties]);
  
  // Update lighting
  useEffect(() => {
    if (sceneRef.current) {
      const lights = sceneRef.current.children.filter(child => child instanceof THREE.Light);
      
      if (lights[0]) (lights[0] as THREE.AmbientLight).intensity = lightingProperties.ambientIntensity;
      if (lights[1]) {
        (lights[1] as THREE.PointLight).intensity = lightingProperties.pointLightIntensity;
        (lights[1] as THREE.PointLight).color.set(lightingProperties.pointLightColor);
      }
      if (lights[2]) (lights[2] as THREE.PointLight).intensity = lightingProperties.bottomHeatGlow;
      if (lights[3]) (lights[3] as THREE.PointLight).intensity = lightingProperties.topCoolGlow;
    }
  }, [lightingProperties]);
  
  return <div ref={mountRef} className="w-full h-full" />;
});

LavaLampSimulation.displayName = 'LavaLampSimulation';
export default LavaLampSimulation;