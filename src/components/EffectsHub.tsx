import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { MousePointer } from 'lucide-react';
import EffectsControlPanel from '@/components/effects/EffectsControlPanel';
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarRail } from '@/components/ui/sidebar';
import { EFFECTS_LIBRARY } from '../data/effectsLibrary';

// Shader background component with dynamic effect loading
function ShaderBackground({ effectKey, isPlaying, settings }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));

  const effect = EFFECTS_LIBRARY[effectKey];

  // Update shader uniforms
  useFrame((state) => {
    if (!meshRef.current || !effect) return;
    
    const material = meshRef.current.material as THREE.ShaderMaterial;
    if (material.uniforms) {
      if (isPlaying) {
        material.uniforms.uTime.value = state.clock.elapsedTime;
      }
      if (material.uniforms.uMouse) {
        if (Array.isArray(material.uniforms.uMouse.value)) {
          material.uniforms.uMouse.value[0] = mouseRef.current.x;
          material.uniforms.uMouse.value[1] = mouseRef.current.y;
        } else {
          material.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
        }
      }
      
      // Apply dynamic settings
      Object.keys(settings).forEach(key => {
        if (material.uniforms[key]) {
          material.uniforms[key].value = settings[key];
        }
      });
    }
  });

  // Mouse interaction
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const rect = document.body.getBoundingClientRect();
      mouseRef.current.set(
        (event.clientX - rect.left) / window.innerWidth,
        1 - (event.clientY - rect.top) / window.innerHeight
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!effect) return null;

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: effect.vertexShader,
    fragmentShader: effect.fragmentShader,
    uniforms: { ...effect.uniforms }
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

// Enhanced control panel with category filtering and advanced settings
// Control panel moved to a dedicated sidebar component at
// src/components/effects/EffectsControlPanel.tsx

// Main Effects Hub component
export default function EffectsHub() {
  const [currentEffect, setCurrentEffect] = useState('cosmicAurora');
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [settings, setSettings] = useState(() => {
    // Initialize settings with defaults from the first effect
    const initialEffect = EFFECTS_LIBRARY[currentEffect];
    const initialSettings = {};
    initialEffect?.settings.forEach(setting => {
      initialSettings[setting.key] = setting.default;
    });
    return initialSettings;
  });

  // Update settings when effect changes
  useEffect(() => {
    const effect = EFFECTS_LIBRARY[currentEffect];
    if (effect) {
      const newSettings = {};
      effect.settings.forEach(setting => {
        newSettings[setting.key] = setting.default;
      });
      setSettings(newSettings);
    }
  }, [currentEffect]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Full Screen Background Canvas */}
      <Canvas 
        className="absolute inset-0 w-full h-full" 
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: true, alpha: false }}
      >
        <ShaderBackground 
          effectKey={currentEffect}
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
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Interactive Hint */}
      <div className="absolute bottom-6 right-6 z-10">
        <Card className="effect-card p-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MousePointer className="h-4 w-4" />
            <span>Move mouse to interact • {Object.keys(EFFECTS_LIBRARY).length} effects loaded</span>
          </div>
        </Card>
      </div>
    </div>
  );
}