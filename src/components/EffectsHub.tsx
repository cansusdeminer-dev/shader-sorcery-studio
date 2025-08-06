import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, Settings, Shuffle, MousePointer, Filter } from 'lucide-react';
import { AnimatedIcon } from './AnimatedIcon';
import { EFFECTS_LIBRARY, EFFECT_CATEGORIES, type Effect, type EffectSetting } from '../data/effectsLibrary';

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
function ControlPanel({ 
  currentEffect, 
  setCurrentEffect, 
  isPlaying, 
  setIsPlaying, 
  settings, 
  setSettings,
  selectedCategory,
  setSelectedCategory 
}) {
  const currentEffectData = EFFECTS_LIBRARY[currentEffect];
  
  const filteredEffects = Object.entries(EFFECTS_LIBRARY).filter(([key, effect]) => 
    selectedCategory === 'all' || effect.category === selectedCategory
  );

  const handleSettingChange = (settingKey: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
  };

  const renderSettingControl = (setting: EffectSetting) => {
    const currentValue = settings[setting.key] || setting.default;

    switch (setting.type) {
      case 'slider':
        return (
          <div key={setting.key} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">{setting.name}</label>
              <span className="text-xs text-muted-foreground">{currentValue.toFixed(2)}</span>
            </div>
            <Slider
              value={[currentValue]}
              onValueChange={(value) => handleSettingChange(setting.key, value[0])}
              max={setting.max}
              min={setting.min}
              step={setting.step}
              className="w-full"
            />
          </div>
        );
      case 'toggle':
        return (
          <div key={setting.key} className="flex items-center justify-between">
            <label className="text-sm font-medium">{setting.name}</label>
            <Switch
              checked={currentValue}
              onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
            />
          </div>
        );
      case 'select':
        return (
          <div key={setting.key} className="space-y-2">
            <label className="text-sm font-medium">{setting.name}</label>
            <Select value={currentValue} onValueChange={(value) => handleSettingChange(setting.key, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="absolute top-6 left-6 right-6 z-10 max-h-[90vh] overflow-hidden">
      <Card className="effect-card">
        <div className="max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-card/90 backdrop-blur-sm p-2 -m-2">
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
                  const effects = Object.keys(filteredEffects);
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

          {/* Category Filter */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-4 w-4" />
              <label className="text-sm font-medium">Category</label>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Effects</SelectItem>
                {Object.entries(EFFECT_CATEGORIES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={currentEffect} onValueChange={setCurrentEffect}>
            {/* Dynamic grid based on number of effects */}
            <TabsList className={`grid w-full gap-1 mb-4 h-auto p-1 ${
              filteredEffects.length <= 4 ? 'grid-cols-4' : 
              filteredEffects.length <= 6 ? 'grid-cols-6' : 
              filteredEffects.length <= 8 ? 'grid-cols-8' : 'grid-cols-10'
            }`}>
              {filteredEffects.map(([key, effect]) => (
                <TabsTrigger key={key} value={key} className="flex flex-col gap-1 p-2">
                  <AnimatedIcon type={effect.icon} className="w-5 h-5" />
                  <span className="text-xs truncate max-w-[60px]">{effect.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredEffects.map(([key, effect]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center gap-3">
                  <AnimatedIcon type={effect.icon} className="w-8 h-8" />
                  <div>
                    <h3 className="text-lg font-semibold">{effect.name}</h3>
                    <p className="text-sm text-muted-foreground">{effect.description}</p>
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                      {EFFECT_CATEGORIES[effect.category]}
                    </span>
                  </div>
                </div>
                
                {/* Dynamic settings grid */}
                <div className={`grid gap-4 ${
                  effect.settings.length <= 4 ? 'grid-cols-2' : 
                  effect.settings.length <= 6 ? 'grid-cols-3' : 'grid-cols-4'
                }`}>
                  {effect.settings.map(renderSettingControl)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Card>
    </div>
  );
}

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