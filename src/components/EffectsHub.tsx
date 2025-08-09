import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Card } from '@/components/ui/card';
import { MousePointer } from 'lucide-react';
import EffectsGrid from '@/components/effects/EffectsGrid';
import SettingsDrawer from '@/components/effects/SettingsDrawer';
import LayersDrawer, { type Layer } from '@/components/effects/LayersDrawer';
import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarRail } from '@/components/ui/sidebar';
import { EFFECTS_LIBRARY } from '../data/effectsLibrary';

// Shader background component with dynamic effect loading and optional blending
function ShaderBackground({
  effectKey,
  isPlaying,
  settings,
  blending = 'normal',
}: {
  effectKey: string;
  isPlaying: boolean;
  settings: Record<string, any>;
  blending?: 'additive' | 'normal';
}) {
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
      Object.keys(settings).forEach((key) => {
        if (material.uniforms[key]) {
          const target = material.uniforms[key];
          const val = settings[key];
          // Coerce types safely for GLSL uniforms
          if (Array.isArray(val)) {
            // vec2/vec3/vec4 as arrays [0..1]
            target.value = val;
          } else if (typeof val === 'boolean') {
            // Booleans -> floats (1/0) for shaders that expect float toggles
            if (typeof target.value === 'number') {
              target.value = val ? 1 : 0;
            } else {
              target.value = val;
            }
          } else {
            target.value = val as any;
          }
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

  const clonedUniforms: any = {};
  Object.keys(effect.uniforms).forEach((k) => {
    const u = effect.uniforms[k];
    const v = (u && 'value' in u) ? u.value : u;
    clonedUniforms[k] = { value: Array.isArray(v) ? [...v] : (typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v) };
  });

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: effect.vertexShader,
    fragmentShader: effect.fragmentShader,
    uniforms: clonedUniforms,
    transparent: blending === 'additive',
    blending: blending === 'additive' ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: blending !== 'additive',
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
  // Layers state (starts with one layer, preserving previous single-effect behavior)
  const initialLayer: Layer = React.useMemo(() => {
    const effectKey = 'cosmicAurora'
    const eff = EFFECTS_LIBRARY[effectKey]
    const defaults: Record<string, any> = {}
    eff?.settings.forEach((s) => (defaults[s.key] = s.default))
    return {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      effectKey,
      settings: defaults,
      isPlaying: true,
      blending: 'normal',
      visible: true,
    }
  }, [])

  const [layers, setLayers] = useState<Layer[]>([initialLayer])
  const [activeLayerId, setActiveLayerId] = useState<string>(initialLayer.id)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const activeLayer = layers.find((l) => l.id === activeLayerId) ?? layers[0]

  const defaultsForEffect = (key: string) => {
    const eff = EFFECTS_LIBRARY[key]
    const obj: Record<string, any> = {}
    eff?.settings.forEach((s) => (obj[s.key] = s.default))
    return obj
  }

  const onSelectEffect = (key: string) => {
    if (!activeLayer) return
    setLayers((ls) =>
      ls.map((l) =>
        l.id === activeLayer.id
          ? {
              ...l,
              effectKey: key,
              settings: defaultsForEffect(key),
            }
          : l
      )
    )
  }

  const onSettingChange = (settingKey: string, value: any) => {
    if (!activeLayer) return
    setLayers((ls) =>
      ls.map((l) =>
        l.id === activeLayer.id ? { ...l, settings: { ...l.settings, [settingKey]: value } } : l
      )
    )
  }

  const onAddLayer = (effectKey?: string) => {
    const key = effectKey ?? activeLayer?.effectKey ?? 'cosmicAurora'
    const newLayer: Layer = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      effectKey: key,
      settings: defaultsForEffect(key),
      isPlaying: true,
      blending: 'additive',
      visible: true,
    }
    setLayers((ls) => [...ls, newLayer])
    setActiveLayerId(newLayer.id)
  }

  const onRemoveLayer = (id: string) => {
    setLayers((ls) => {
      const filtered = ls.filter((l) => l.id !== id)
      if (activeLayerId === id && filtered.length) {
        setActiveLayerId(filtered[filtered.length - 1].id)
      }
      return filtered
    })
  }

  const onUpdateLayer = (id: string, changes: Partial<Layer>) => {
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, ...changes } : l)))
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Full Screen Background Canvas */}
      <Canvas
        className="absolute inset-0 w-full h-full"
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: true, alpha: false }}
      >
        {layers
          .filter((l) => l.visible)
          .map((l) => (
            <ShaderBackground
              key={l.id}
              effectKey={l.effectKey}
              isPlaying={l.isPlaying}
              settings={l.settings}
              blending={l.blending}
            />
          ))}
      </Canvas>

      {/* Sidebar with Effect Icons Grid */}
      <SidebarProvider>
        <Sidebar className="absolute left-0 top-0 h-full" collapsible="icon">
          <SidebarContent>
            <EffectsGrid
              activeEffectKey={activeLayer?.effectKey ?? 'cosmicAurora'}
              onSelectEffect={onSelectEffect}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </SidebarContent>
          <SidebarRail />
        </Sidebar>
        {/* Global trigger that remains visible */}
        <SidebarTrigger className="absolute top-4 left-4 z-20" />
      </SidebarProvider>

      {/* Bottom Settings Drawer (glass) */}
      {activeLayer && (
        <SettingsDrawer
          effectKey={activeLayer.effectKey}
          settings={activeLayer.settings}
          onSettingChange={onSettingChange}
        />
      )}

      {/* Right Layers Drawer */}
      <LayersDrawer
        layers={layers}
        activeLayerId={activeLayerId}
        onSetActiveLayer={setActiveLayerId}
        onAddLayer={onAddLayer}
        onRemoveLayer={onRemoveLayer}
        onUpdateLayer={onUpdateLayer}
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
  )
}
