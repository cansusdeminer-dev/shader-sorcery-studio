import React, { useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LavaLampSimulation from '@/components/three/LavaLampSimulation';

const LavaLamp3D = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const simulationRef = useRef();
  
  // Lava physics properties
  const [lavaProperties, setLavaProperties] = useState({
    blobCount: 6,
    minRadius: 0.03,
    maxRadius: 0.08,
    viscosity: 0.98,
    buoyancy: 0.02,
    mergingEnabled: true,
    splitEnabled: true,
    solverIterations: 3,
    thermalDiffusion: 0.1
  });
  
  // Material properties
  const [materialProperties, setMaterialProperties] = useState({
    lavaColor: '#ff6b35',
    lavaEmissive: '#ff4500',
    lavaTranslucency: 0.1,
    lavaRoughness: 0.3,
    lavaMetalness: 0.0,
    glassColor: '#ffffff',
    glassTransparency: 0.9,
    glassRoughness: 0.0,
    glassThickness: 0.1,
    glassIOR: 1.5,
    bloomStrength: 1.5,
    bloomRadius: 0.4,
    bloomThreshold: 0.85,
    emissiveIntensity: 0.8,
    subsurfaceScattering: 0.5
  });
  
  // Lighting properties
  const [lightingProperties, setLightingProperties] = useState({
    ambientIntensity: 0.2,
    pointLightIntensity: 1.0,
    pointLightColor: '#ffffff',
    environmentIntensity: 0.5,
    bottomHeatGlow: 2.0,
    topCoolGlow: 0.5
  });
  
  const presets = {
    Classic: {
      lava: { blobCount: 6, minRadius: 0.03, maxRadius: 0.08, viscosity: 0.98, buoyancy: 0.02, solverIterations: 3, thermalDiffusion: 0.1 },
      material: { lavaColor: '#ff6b35', lavaEmissive: '#ff4500', lavaTranslucency: 0.1, emissiveIntensity: 0.8 },
      lighting: { bottomHeatGlow: 2.0, topCoolGlow: 0.5, ambientIntensity: 0.2 }
    },
    Ethereal: {
      lava: { blobCount: 8, minRadius: 0.02, maxRadius: 0.05, viscosity: 0.99, buoyancy: 0.01, solverIterations: 4, thermalDiffusion: 0.15 },
      material: { lavaColor: '#9d4edd', lavaEmissive: '#c77dff', lavaTranslucency: 0.3, emissiveIntensity: 1.2 },
      lighting: { bottomHeatGlow: 1.5, topCoolGlow: 1.0, ambientIntensity: 0.1 }
    },
    Volcanic: {
      lava: { blobCount: 4, minRadius: 0.05, maxRadius: 0.12, viscosity: 0.95, buoyancy: 0.04, solverIterations: 2, thermalDiffusion: 0.05 },
      material: { lavaColor: '#d62828', lavaEmissive: '#f77f00', lavaTranslucency: 0.05, emissiveIntensity: 1.5 },
      lighting: { bottomHeatGlow: 3.0, topCoolGlow: 0.2, ambientIntensity: 0.05 }
    },
    Ocean: {
      lava: { blobCount: 10, minRadius: 0.015, maxRadius: 0.04, viscosity: 0.99, buoyancy: 0.008, solverIterations: 5, thermalDiffusion: 0.2 },
      material: { lavaColor: '#0077be', lavaEmissive: '#00b4d8', lavaTranslucency: 0.4, emissiveIntensity: 0.6 },
      lighting: { bottomHeatGlow: 1.0, topCoolGlow: 2.0, ambientIntensity: 0.3 }
    },
    Neon: {
      lava: { blobCount: 7, minRadius: 0.025, maxRadius: 0.07, viscosity: 0.97, buoyancy: 0.03, solverIterations: 3, thermalDiffusion: 0.12 },
      material: { lavaColor: '#39ff14', lavaEmissive: '#ccff33', lavaTranslucency: 0.2, emissiveIntensity: 2.0 },
      lighting: { bottomHeatGlow: 2.5, topCoolGlow: 1.5, ambientIntensity: 0.1 }
    }
  };
  
  const applyPreset = (presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      setLavaProperties(prev => ({ ...prev, ...preset.lava }));
      setMaterialProperties(prev => ({ ...prev, ...preset.material }));
      setLightingProperties(prev => ({ ...prev, ...preset.lighting }));
    }
  };
  
  const updateLavaProperty = (key: string, value: any) => {
    setLavaProperties(prev => ({ ...prev, [key]: value }));
  };
  
  const updateMaterialProperty = (key: string, value: any) => {
    setMaterialProperties(prev => ({ ...prev, [key]: value }));
  };
  
  const updateLightingProperty = (key: string, value: any) => {
    setLightingProperties(prev => ({ ...prev, [key]: value }));
  };
  
  const resetSimulation = () => {
    if (simulationRef.current && 'resetSimulation' in simulationRef.current) {
      (simulationRef.current as any).resetSimulation();
    }
  };
  
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-background to-secondary/20">
      {/* SEO */}
      <title>3D Lava Lamp Simulator - Advanced Material Controls</title>
      <meta name="description" content="Interactive 3D lava lamp with advanced translucent materials, glow effects, and realistic physics simulation." />
      
      {/* 3D Canvas */}
      <LavaLampSimulation
        ref={simulationRef}
        isPlaying={isPlaying}
        lavaProperties={lavaProperties}
        materialProperties={materialProperties}
        lightingProperties={lightingProperties}
      />
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md border border-border rounded-lg p-4 max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lava Lamp Studio</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Presets */}
          <div className="space-y-2">
            <Label>Presets</Label>
            <Select onValueChange={applyPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Choose preset..." />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(presets).map(preset => (
                  <SelectItem key={preset} value={preset}>{preset}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tabbed Controls */}
          <Tabs defaultValue="physics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="physics">Physics</TabsTrigger>
              <TabsTrigger value="material">Material</TabsTrigger>
              <TabsTrigger value="lighting">Lighting</TabsTrigger>
            </TabsList>
            
            <TabsContent value="physics" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Blob Count: {lavaProperties.blobCount}</Label>
                  <Slider
                    value={[lavaProperties.blobCount]}
                    onValueChange={([value]) => updateLavaProperty('blobCount', value)}
                    min={3}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Min Radius: {lavaProperties.minRadius.toFixed(3)}</Label>
                  <Slider
                    value={[lavaProperties.minRadius]}
                    onValueChange={([value]) => updateLavaProperty('minRadius', value)}
                    min={0.01}
                    max={0.1}
                    step={0.005}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Max Radius: {lavaProperties.maxRadius.toFixed(3)}</Label>
                  <Slider
                    value={[lavaProperties.maxRadius]}
                    onValueChange={([value]) => updateLavaProperty('maxRadius', value)}
                    min={0.05}
                    max={0.3}
                    step={0.005}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Viscosity: {lavaProperties.viscosity.toFixed(3)}</Label>
                  <Slider
                    value={[lavaProperties.viscosity]}
                    onValueChange={([value]) => updateLavaProperty('viscosity', value)}
                    min={0.9}
                    max={0.999}
                    step={0.001}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Buoyancy: {lavaProperties.buoyancy.toFixed(3)}</Label>
                  <Slider
                    value={[lavaProperties.buoyancy]}
                    onValueChange={([value]) => updateLavaProperty('buoyancy', value)}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={lavaProperties.mergingEnabled}
                    onCheckedChange={(checked) => updateLavaProperty('mergingEnabled', checked)}
                  />
                  <Label>Enable Merging</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={lavaProperties.splitEnabled}
                    onCheckedChange={(checked) => updateLavaProperty('splitEnabled', checked)}
                  />
                  <Label>Enable Splitting</Label>
                </div>
                
                <div>
                  <Label>Solver Iterations: {lavaProperties.solverIterations}</Label>
                  <Slider
                    value={[lavaProperties.solverIterations]}
                    onValueChange={([value]) => updateLavaProperty('solverIterations', value)}
                    min={1}
                    max={6}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Thermal Diffusion: {lavaProperties.thermalDiffusion.toFixed(3)}</Label>
                  <Slider
                    value={[lavaProperties.thermalDiffusion]}
                    onValueChange={([value]) => updateLavaProperty('thermalDiffusion', value)}
                    min={0.01}
                    max={0.3}
                    step={0.01}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="material" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Lava Color</Label>
                  <input
                    type="color"
                    value={materialProperties.lavaColor}
                    onChange={(e) => updateMaterialProperty('lavaColor', e.target.value)}
                    className="w-full h-8 rounded border border-border"
                  />
                </div>
                
                <div>
                  <Label>Emissive Color</Label>
                  <input
                    type="color"
                    value={materialProperties.lavaEmissive}
                    onChange={(e) => updateMaterialProperty('lavaEmissive', e.target.value)}
                    className="w-full h-8 rounded border border-border"
                  />
                </div>
                
                <div>
                  <Label>Emissive Intensity: {materialProperties.emissiveIntensity.toFixed(2)}</Label>
                  <Slider
                    value={[materialProperties.emissiveIntensity]}
                    onValueChange={([value]) => updateMaterialProperty('emissiveIntensity', value)}
                    min={0}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Translucency: {materialProperties.lavaTranslucency.toFixed(2)}</Label>
                  <Slider
                    value={[materialProperties.lavaTranslucency]}
                    onValueChange={([value]) => updateMaterialProperty('lavaTranslucency', value)}
                    min={0}
                    max={0.8}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Roughness: {materialProperties.lavaRoughness.toFixed(2)}</Label>
                  <Slider
                    value={[materialProperties.lavaRoughness]}
                    onValueChange={([value]) => updateMaterialProperty('lavaRoughness', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Metalness: {materialProperties.lavaMetalness.toFixed(2)}</Label>
                  <Slider
                    value={[materialProperties.lavaMetalness]}
                    onValueChange={([value]) => updateMaterialProperty('lavaMetalness', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Glass Color</Label>
                  <input
                    type="color"
                    value={materialProperties.glassColor}
                    onChange={(e) => updateMaterialProperty('glassColor', e.target.value)}
                    className="w-full h-8 rounded border border-border"
                  />
                </div>
                
                <div>
                  <Label>Glass Transparency: {materialProperties.glassTransparency.toFixed(2)}</Label>
                  <Slider
                    value={[materialProperties.glassTransparency]}
                    onValueChange={([value]) => updateMaterialProperty('glassTransparency', value)}
                    min={0.1}
                    max={0.98}
                    step={0.02}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Glass Roughness: {materialProperties.glassRoughness.toFixed(2)}</Label>
                  <Slider
                    value={[materialProperties.glassRoughness]}
                    onValueChange={([value]) => updateMaterialProperty('glassRoughness', value)}
                    min={0}
                    max={0.5}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Glass Thickness: {materialProperties.glassThickness.toFixed(2)}</Label>
                  <Slider
                    value={[materialProperties.glassThickness]}
                    onValueChange={([value]) => updateMaterialProperty('glassThickness', value)}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Glass IOR: {materialProperties.glassIOR.toFixed(2)}</Label>
                  <Slider
                    value={[materialProperties.glassIOR]}
                    onValueChange={([value]) => updateMaterialProperty('glassIOR', value)}
                    min={1.0}
                    max={2.5}
                    step={0.05}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="lighting" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Ambient Intensity: {lightingProperties.ambientIntensity.toFixed(2)}</Label>
                  <Slider
                    value={[lightingProperties.ambientIntensity]}
                    onValueChange={([value]) => updateLightingProperty('ambientIntensity', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Point Light Intensity: {lightingProperties.pointLightIntensity.toFixed(2)}</Label>
                  <Slider
                    value={[lightingProperties.pointLightIntensity]}
                    onValueChange={([value]) => updateLightingProperty('pointLightIntensity', value)}
                    min={0}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Point Light Color</Label>
                  <input
                    type="color"
                    value={lightingProperties.pointLightColor}
                    onChange={(e) => updateLightingProperty('pointLightColor', e.target.value)}
                    className="w-full h-8 rounded border border-border"
                  />
                </div>
                
                <div>
                  <Label>Bottom Heat Glow: {lightingProperties.bottomHeatGlow.toFixed(2)}</Label>
                  <Slider
                    value={[lightingProperties.bottomHeatGlow]}
                    onValueChange={([value]) => updateLightingProperty('bottomHeatGlow', value)}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Label>Top Cool Glow: {lightingProperties.topCoolGlow.toFixed(2)}</Label>
                  <Slider
                    value={[lightingProperties.topCoolGlow]}
                    onValueChange={([value]) => updateLightingProperty('topCoolGlow', value)}
                    min={0}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LavaLamp3D;