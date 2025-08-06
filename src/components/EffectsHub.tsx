import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Settings, Shuffle, MousePointer } from 'lucide-react';

// Import effect icons
import cosmicAuroraIcon from '@/assets/cosmic-aurora-icon.png';
import plasmaIcon from '@/assets/plasma-icon.png';
import nebulaCrystalIcon from '@/assets/nebula-crystal-icon.png';
import quantumFieldIcon from '@/assets/quantum-field-icon.png';
import liquidMetalIcon from '@/assets/liquid-metal-icon.png';
import fractalSpiralIcon from '@/assets/fractal-spiral-icon.png';
import particleStormIcon from '@/assets/particle-storm-icon.png';
import wormholeIcon from '@/assets/wormhole-icon.png';

// Shader library for all effects
const shaderLib = {
  noise: `
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 0.0;
      for (int i = 0; i < 6; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
  `,

  hsv: `
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
  `,

  metaballs: `
    float metaball(vec2 pos, vec2 center, float radius) {
      float dist = distance(pos, center);
      return radius / (dist * dist + 0.01);
    }
  `
};

// Effect definitions with procedural shaders
const EFFECTS = {
  cosmicAurora: {
    name: 'Cosmic Aurora',
    icon: cosmicAuroraIcon,
    description: 'Flowing aurora streams with cosmic energy',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      ${shaderLib.noise}
      ${shaderLib.hsv}

      void main() {
        vec2 st = vUv;
        vec2 mouse = uMouse * 2.0 - 1.0;
        
        // Create flowing aurora streams
        float time = uTime * uSpeed;
        vec2 flowField = vec2(
          fbm(st * 3.0 + time * 0.5),
          fbm(st * 3.0 + time * 0.3 + 100.0)
        );
        
        // Mouse influence
        float mouseInfluence = 1.0 - length(st - uMouse * 0.5);
        mouseInfluence = smoothstep(0.0, 0.8, mouseInfluence);
        
        // Aurora waves
        float aurora1 = sin(st.x * 8.0 + flowField.x * 4.0 + time) * 0.5 + 0.5;
        float aurora2 = sin(st.x * 6.0 + flowField.y * 3.0 + time * 0.7) * 0.5 + 0.5;
        float aurora3 = sin(st.x * 10.0 + flowField.x * 2.0 + time * 1.3) * 0.5 + 0.5;
        
        // Combine auroras with different colors
        vec3 color1 = hsv2rgb(vec3(0.5 + sin(time * 0.2) * 0.1, 0.8, aurora1));
        vec3 color2 = hsv2rgb(vec3(0.7 + cos(time * 0.3) * 0.1, 0.9, aurora2));
        vec3 color3 = hsv2rgb(vec3(0.3 + sin(time * 0.1) * 0.1, 0.7, aurora3));
        
        vec3 finalColor = mix(mix(color1, color2, 0.5), color3, 0.3);
        finalColor *= uIntensity;
        finalColor += mouseInfluence * vec3(0.2, 0.8, 1.0) * 0.5;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 1.0 },
      uSpeed: { value: 1.0 }
    }
  },

  plasmaField: {
    name: 'Plasma Field',
    icon: plasmaIcon,
    description: 'Electric plasma energy with particle streams',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      ${shaderLib.noise}
      ${shaderLib.hsv}

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Electric field simulation
        vec2 center1 = vec2(0.5 + sin(time * 0.5) * 0.3, 0.5 + cos(time * 0.3) * 0.2);
        vec2 center2 = vec2(0.5 + cos(time * 0.7) * 0.2, 0.5 + sin(time * 0.4) * 0.3);
        vec2 mouseCenter = uMouse;
        
        // Field lines
        float field1 = 1.0 / (distance(st, center1) + 0.1);
        float field2 = 1.0 / (distance(st, center2) + 0.1);
        float fieldMouse = 1.0 / (distance(st, mouseCenter) + 0.1);
        
        // Plasma turbulence
        float turbulence = fbm(st * 8.0 + time * 2.0);
        
        // Electric arcs
        float arc = sin(st.x * 20.0 + turbulence * 10.0 + time * 3.0) * 
                   sin(st.y * 15.0 + turbulence * 8.0 + time * 2.5);
        arc = smoothstep(0.7, 1.0, arc);
        
        float totalField = (field1 + field2 + fieldMouse * 2.0) * 0.1;
        totalField += arc * 0.3;
        
        // Color mapping
        vec3 color = hsv2rgb(vec3(
          0.1 + totalField * 0.3 + sin(time) * 0.1,
          0.9,
          clamp(totalField * uIntensity, 0.0, 1.0)
        ));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 1.2 },
      uSpeed: { value: 1.5 }
    }
  },

  nebulaCrystal: {
    name: 'Nebula Crystal',
    icon: nebulaCrystalIcon,
    description: 'Growing crystal structures in cosmic nebula',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      ${shaderLib.noise}
      ${shaderLib.hsv}

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Crystal growth pattern
        vec2 grid = floor(st * 8.0);
        vec2 cellPos = fract(st * 8.0);
        
        float crystal = 0.0;
        for(int x = -1; x <= 1; x++) {
          for(int y = -1; y <= 1; y++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 cellCenter = grid + neighbor;
            vec2 offset = vec2(
              sin(cellCenter.x * 7.0 + time),
              cos(cellCenter.y * 5.0 + time)
            ) * 0.2;
            
            float dist = distance(cellPos, neighbor + 0.5 + offset);
            crystal += 1.0 / (dist * 20.0 + 1.0);
          }
        }
        
        // Nebula background
        vec3 nebula = vec3(
          fbm(st * 3.0 + time * 0.1),
          fbm(st * 4.0 + time * 0.15),
          fbm(st * 5.0 + time * 0.2)
        );
        
        // Mouse interaction
        float mouseGlow = 1.0 - distance(st, uMouse);
        mouseGlow = smoothstep(0.0, 0.7, mouseGlow);
        
        vec3 crystalColor = hsv2rgb(vec3(0.7, 0.8, crystal * uIntensity));
        vec3 nebulaColor = hsv2rgb(vec3(0.8 + nebula.x * 0.2, 0.6, nebula.y * 0.5));
        
        vec3 finalColor = mix(nebulaColor, crystalColor, 0.7);
        finalColor += mouseGlow * vec3(1.0, 0.8, 0.9) * 0.3;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 0.8 },
      uSpeed: { value: 0.8 }
    }
  },

  quantumField: {
    name: 'Quantum Field',
    icon: quantumFieldIcon,
    description: 'Quantum particle interactions with energy waves',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      ${shaderLib.noise}
      ${shaderLib.hsv}
      ${shaderLib.metaballs}

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Quantum particles (metaballs)
        float particles = 0.0;
        for(int i = 0; i < 8; i++) {
          float fi = float(i);
          vec2 particlePos = vec2(
            0.5 + sin(time * (0.5 + fi * 0.1) + fi) * 0.3,
            0.5 + cos(time * (0.7 + fi * 0.15) + fi * 2.0) * 0.3
          );
          particles += metaball(st, particlePos, 0.02 + sin(time + fi) * 0.01);
        }
        
        // Mouse particle
        particles += metaball(st, uMouse, 0.05);
        
        // Quantum field waves
        float fieldWave = sin(st.x * 15.0 + time * 2.0) * sin(st.y * 12.0 + time * 1.5);
        fieldWave *= fbm(st * 6.0 + time * 0.5);
        
        // Energy connections
        float connections = 0.0;
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          float wave = sin(length(st - 0.5) * 20.0 + time * 3.0 + fi * 1.5);
          connections += wave * 0.1;
        }
        
        float totalField = clamp(particles * 5.0 + fieldWave * 0.3 + connections, 0.0, 1.0);
        
        vec3 color = hsv2rgb(vec3(
          0.6 + totalField * 0.3 + sin(time * 0.5) * 0.1,
          0.8,
          totalField * uIntensity
        ));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 1.0 },
      uSpeed: { value: 1.2 }
    }
  },

  liquidMetal: {
    name: 'Liquid Metal',
    icon: liquidMetalIcon,
    description: 'Flowing metallic surface with reflections',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      ${shaderLib.noise}
      ${shaderLib.hsv}

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Liquid surface simulation
        vec2 waves = vec2(
          sin(st.x * 8.0 + time * 2.0) + sin(st.x * 4.0 + time * 1.5),
          cos(st.y * 6.0 + time * 1.8) + cos(st.y * 3.0 + time * 1.2)
        ) * 0.1;
        
        // Mouse ripples
        float mouseDist = distance(st, uMouse);
        float ripple = sin(mouseDist * 20.0 - time * 5.0) * exp(-mouseDist * 3.0) * 0.2;
        waves += ripple;
        
        // Surface normals for reflection
        vec2 normal = normalize(vec2(
          waves.x - sin((st.x + 0.01) * 8.0 + time * 2.0) * 0.1,
          waves.y - cos((st.y + 0.01) * 6.0 + time * 1.8) * 0.1
        ));
        
        // Metallic reflection
        float reflection = dot(normal, vec2(0.7, 0.3));
        reflection = pow(abs(reflection), 2.0);
        
        // Liquid flow
        vec2 flow = st + waves + normal * 0.1;
        float metallic = fbm(flow * 5.0 + time * 0.5);
        
        vec3 baseColor = vec3(0.7, 0.8, 0.9);
        vec3 reflectColor = vec3(1.0, 1.0, 1.0);
        
        vec3 color = mix(baseColor, reflectColor, reflection * uIntensity);
        color *= (0.8 + metallic * 0.4);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 1.0 },
      uSpeed: { value: 1.0 }
    }
  },

  fractalSpiral: {
    name: 'Fractal Spiral',
    icon: fractalSpiralIcon,
    description: 'Infinite recursive spiral patterns',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      ${shaderLib.noise}
      ${shaderLib.hsv}

      void main() {
        vec2 st = vUv - 0.5;
        float time = uTime * uSpeed;
        
        // Convert to polar coordinates
        float angle = atan(st.y, st.x);
        float radius = length(st);
        
        // Mouse influence on spiral
        vec2 mouseOffset = uMouse - 0.5;
        float mouseInfluence = 1.0 - length(mouseOffset);
        angle += mouseInfluence * sin(time) * 2.0;
        
        // Logarithmic spiral
        float spiral = sin(log(radius + 0.01) * 5.0 + angle * 3.0 + time * 2.0);
        
        // Fractal layers
        float fractal = 0.0;
        float amplitude = 1.0;
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          fractal += sin(log(radius + 0.01) * (5.0 + fi * 2.0) + angle * (3.0 + fi) + time * (2.0 + fi * 0.5)) * amplitude;
          amplitude *= 0.5;
        }
        
        // Golden ratio spiral
        float goldenSpiral = sin(angle * 1.618 + log(radius + 0.01) * 4.0 + time);
        
        float totalPattern = (spiral + fractal * 0.5 + goldenSpiral * 0.3) * uIntensity;
        totalPattern = clamp(totalPattern, 0.0, 1.0);
        
        vec3 color = hsv2rgb(vec3(
          angle / 6.28 + time * 0.1,
          0.8,
          totalPattern
        ));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 1.0 },
      uSpeed: { value: 0.8 }
    }
  },

  particleStorm: {
    name: 'Particle Storm',
    icon: particleStormIcon,
    description: 'Swirling particle system with energy trails',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      ${shaderLib.noise}
      ${shaderLib.hsv}

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Particle simulation
        float particles = 0.0;
        vec3 totalColor = vec3(0.0);
        
        for(int i = 0; i < 12; i++) {
          float fi = float(i);
          
          // Particle position with vortex motion
          float angle = fi * 0.52 + time * (1.0 + fi * 0.1);
          float radius = 0.3 + sin(time * 0.5 + fi) * 0.2;
          vec2 particlePos = vec2(
            0.5 + cos(angle) * radius,
            0.5 + sin(angle) * radius
          );
          
          // Mouse attraction
          vec2 toMouse = uMouse - particlePos;
          particlePos += toMouse * 0.1 * (1.0 - length(toMouse));
          
          // Particle intensity
          float dist = distance(st, particlePos);
          float particle = 1.0 / (dist * 50.0 + 1.0);
          particles += particle;
          
          // Individual particle color
          vec3 particleColor = hsv2rgb(vec3(fi * 0.1 + time * 0.2, 0.9, particle * 2.0));
          totalColor += particleColor;
        }
        
        // Energy trails
        float trail = 0.0;
        for(int i = 0; i < 8; i++) {
          float fi = float(i);
          vec2 trailPos = vec2(
            fbm(st * 3.0 + time * 0.5 + fi),
            fbm(st * 3.0 + time * 0.7 + fi + 10.0)
          );
          trail += sin(length(st - trailPos * 0.5) * 10.0 + time * 3.0) * 0.1;
        }
        
        totalColor += trail * vec3(0.5, 0.8, 1.0);
        totalColor *= uIntensity;
        
        gl_FragColor = vec4(clamp(totalColor, 0.0, 1.0), 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 0.8 },
      uSpeed: { value: 1.3 }
    }
  },

  wormhole: {
    name: 'Wormhole',
    icon: wormholeIcon,
    description: 'Space-time distortion with gravitational lensing',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform float uIntensity;
      uniform float uSpeed;
      varying vec2 vUv;

      ${shaderLib.noise}
      ${shaderLib.hsv}

      void main() {
        vec2 st = vUv - 0.5;
        float time = uTime * uSpeed;
        
        // Convert to polar coordinates
        float angle = atan(st.y, st.x);
        float radius = length(st);
        
        // Mouse-controlled wormhole center
        vec2 wormholeCenter = (uMouse - 0.5) * 0.3;
        vec2 toCenter = st - wormholeCenter;
        float distToCenter = length(toCenter);
        
        // Gravitational lensing effect
        float lensing = 1.0 / (distToCenter * 3.0 + 0.1);
        vec2 lensedPos = st + normalize(toCenter) * lensing * 0.1;
        
        // Tunnel effect
        float tunnel = sin(distToCenter * 15.0 - time * 5.0) * exp(-distToCenter * 2.0);
        
        // Swirling space-time
        float swirl = angle + log(distToCenter + 0.01) * 2.0 + time * 2.0;
        float spacetime = sin(swirl * 3.0) * sin(distToCenter * 10.0 + time * 3.0);
        
        // Event horizon
        float eventHorizon = smoothstep(0.05, 0.15, distToCenter);
        
        // Hawking radiation
        float radiation = fbm(lensedPos * 8.0 + time * 2.0) * (1.0 - eventHorizon);
        
        float totalField = (tunnel + spacetime * 0.5 + radiation * 0.3) * eventHorizon * uIntensity;
        
        vec3 color = hsv2rgb(vec3(
          0.8 - distToCenter * 2.0 + time * 0.1,
          0.9,
          clamp(abs(totalField), 0.0, 1.0)
        ));
        
        // Add accretion disk glow
        color += vec3(1.0, 0.7, 0.3) * tunnel * 0.5;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 1.0 },
      uSpeed: { value: 1.0 }
    }
  }
};

// Shader background component
function ShaderBackground({ effect, isPlaying, settings }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));

  // Update shader uniforms
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as THREE.ShaderMaterial;
    if (material.uniforms) {
      if (isPlaying) {
        material.uniforms.uTime.value = state.clock.elapsedTime;
      }
      material.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
      material.uniforms.uResolution.value.set(size.width, size.height);
      
      // Apply settings
      if (material.uniforms.uIntensity) {
        material.uniforms.uIntensity.value = settings.intensity;
      }
      if (material.uniforms.uSpeed) {
        material.uniforms.uSpeed.value = settings.speed;
      }
    }
  });

  // Mouse interaction
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      mouseRef.current.set(
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: EFFECTS[effect].vertexShader,
    fragmentShader: EFFECTS[effect].fragmentShader,
    uniforms: { ...EFFECTS[effect].uniforms }
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

// Control panel component
function ControlPanel({ currentEffect, setCurrentEffect, isPlaying, setIsPlaying, settings, setSettings }) {
  return (
    <div className="absolute top-6 left-6 right-6 z-10">
      <Card className="effect-card">
        <Tabs value={currentEffect} onValueChange={setCurrentEffect}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cosmic Effects Hub
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="outline"
                size="icon"
                className="btn-cosmic"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => {
                  const effects = Object.keys(EFFECTS);
                  const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                  setCurrentEffect(randomEffect);
                }}
                variant="outline"
                size="icon"
                className="btn-aurora"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-8 gap-1 mb-4 h-auto p-1">
            {Object.entries(EFFECTS).map(([key, effect]) => (
              <TabsTrigger key={key} value={key} className="flex flex-col gap-1 p-3">
                <img src={effect.icon} alt={effect.name} className="w-6 h-6" />
                <span className="text-xs">{effect.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(EFFECTS).map(([key, effect]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={effect.icon} alt={effect.name} className="w-8 h-8" />
                <div>
                  <h3 className="text-lg font-semibold">{effect.name}</h3>
                  <p className="text-sm text-muted-foreground">{effect.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Intensity</label>
                  <Slider
                    value={[settings.intensity]}
                    onValueChange={(value) => setSettings({ ...settings, intensity: value[0] })}
                    max={2}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Speed</label>
                  <Slider
                    value={[settings.speed]}
                    onValueChange={(value) => setSettings({ ...settings, speed: value[0] })}
                    max={3}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>
    </div>
  );
}

// Main Effects Hub component
export default function EffectsHub() {
  const [currentEffect, setCurrentEffect] = useState('cosmicAurora');
  const [isPlaying, setIsPlaying] = useState(true);
  const [settings, setSettings] = useState({
    intensity: 1.0,
    speed: 1.0
  });

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Canvas */}
      <Canvas className="absolute inset-0">
        <ShaderBackground 
          effect={currentEffect}
          isPlaying={isPlaying}
          settings={settings}
        />
      </Canvas>

      {/* Control Panel */}
      <ControlPanel
        currentEffect={currentEffect}
        setCurrentEffect={setCurrentEffect}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        settings={settings}
        setSettings={setSettings}
      />

      {/* Interactive Hint */}
      <div className="absolute bottom-6 right-6 z-10">
        <Card className="effect-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MousePointer className="h-4 w-4" />
            <span>Move mouse to interact</span>
          </div>
        </Card>
      </div>
    </div>
  );
}