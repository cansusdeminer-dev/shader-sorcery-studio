import React, { useMemo, useRef, useState, useEffect } from "react";
import ClothSimulation, { ClothProperties, Orientation, PinMode, SceneObject } from "@/components/three/ClothSimulation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const heroCloth: ClothProperties = {
  gridSize: 32,
  clothWidth: 2.0,
  clothHeight: 2.0,
  structuralStiffness: 0.9,
  shearStiffness: 0.7,
  bendStiffness: 0.3,
  dampness: 0.05,
  gravity: -9.81,
  windForce: 0.6,
  windDirection: { x: 0.25, y: 0.0, z: 1.0 },
  airResistance: 0.02,
  layers: 1,
  tearThreshold: 5.0,
  selfCollision: false,
  thickness: 0.05,
  solverIterations: 4,
  orientation: "vertical",
  pinMode: "topEdge",
  materialColor: "#8844aa",
  roughness: 0.9,
  metalness: 0.05,
  wireframe: false,
};

const flagPreset: ClothProperties = {
  ...heroCloth,
  windForce: 1.2,
  windDirection: { x: 0.6, y: 0.0, z: 1.0 },
  pinMode: "topEdge",
  solverIterations: 6,
};

const waterPreset: ClothProperties = {
  ...heroCloth,
  orientation: "horizontal",
  gridSize: 64,
  gravity: -9.81,
  windForce: 0.4,
  windDirection: { x: 0.0, y: 0.0, z: 1.0 },
  structuralStiffness: 0.6,
  shearStiffness: 0.5,
  bendStiffness: 0.15,
  dampness: 0.02,
  pinMode: "none",
  solverIterations: 6,
  materialColor: "#2f7fff",
};

const sailPreset: ClothProperties = {
  ...heroCloth,
  gridSize: 48,
  windForce: 0.9,
  windDirection: { x: 0.25, y: 0.0, z: 1.3 },
  pinMode: "corners",
  solverIterations: 5,
};

const Dev3D: React.FC = () => {
  // SEO basics
  useEffect(() => {
    document.title = "3D Cloth Physics Playground | Three.js";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Interactive 3D cloth physics playground with wind, collisions, presets, and full controls.";
      document.head.appendChild(m);
    } else {
      metaDesc.setAttribute("content", "Interactive 3D cloth physics playground with wind, collisions, presets, and full controls.");
    }
    const linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkCanonical) {
      const l = document.createElement("link");
      l.rel = "canonical";
      l.href = window.location.href;
      document.head.appendChild(l);
    } else {
      linkCanonical.href = window.location.href;
    }
  }, []);

  const simRef = useRef<{ resetSimulation: () => void }>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [scale, setScale] = useState(1.2);
  const [mouseForce, setMouseForce] = useState(0.6);
  const [dragMode, setDragMode] = useState<"move" | "pin" | "tear" | "unpin">("move");

  const [propsState, setPropsState] = useState<ClothProperties>({ ...heroCloth });

  const sceneObjects = useMemo<SceneObject[]>(() => [
    { type: "sphere", position: [0.0, -0.6, 0.0], radius: 0.45, visible: true },
    { type: "box", position: [0.8, -1.0, 0.0], size: [0.5, 0.5, 0.5], visible: true },
  ], []);

  const applyPreset = (preset: ClothProperties) => {
    setPropsState({ ...preset });
    setScale(preset.orientation === "horizontal" ? 1.0 : 1.2);
    // Full reset to rebuild pins/orientation
    setTimeout(() => simRef.current?.resetSimulation(), 0);
  };

  return (
    <div className="relative min-h-screen">
      <header className="sr-only">
        <h1>3D Cloth Physics Playground</h1>
      </header>
      <main className="w-full h-screen">
        <ClothSimulation
          ref={simRef}
          isPlaying={isPlaying}
          clothProperties={propsState}
          sceneObjects={sceneObjects}
          selectedNodes={[]}
          nodeProperties={new Map()}
          dragMode={dragMode}
          mouseForce={mouseForce}
          scale={scale}
        />
      </main>

      {/* Controls overlay */}
      <section className="pointer-events-auto fixed bottom-4 left-1/2 z-50 w-[min(1100px,94vw)] -translate-x-1/2 rounded-xl border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setIsPlaying((p) => !p)}>
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={() => applyPreset(heroCloth)}>Hero</Button>
          <Button onClick={() => applyPreset(flagPreset)}>Flag</Button>
          <Button onClick={() => applyPreset(waterPreset)}>Water</Button>
          <Button onClick={() => applyPreset(sailPreset)}>Sail</Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Drag</span>
            <div className="flex gap-1">
              <Button size="sm" variant={dragMode === "move" ? "default" : "outline"} onClick={() => setDragMode("move")}>Move</Button>
              <Button size="sm" variant={dragMode === "pin" ? "default" : "outline"} onClick={() => setDragMode("pin")}>Pin</Button>
              <Button size="sm" variant={dragMode === "unpin" ? "default" : "outline"} onClick={() => setDragMode("unpin")}>Unpin</Button>
              <Button size="sm" variant={dragMode === "tear" ? "default" : "outline"} onClick={() => setDragMode("tear")}>Tear</Button>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Geometry & Solver */}
          <div className="rounded-lg border p-3">
            <h3 className="mb-2 text-sm font-medium">Resolution & Solver</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Grid</span>
              <div className="w-40">
                <Slider min={16} max={128} step={8} value={[propsState.gridSize]} onValueChange={(v) => setPropsState((s) => ({ ...s, gridSize: v[0] }))} />
              </div>
              <span className="text-xs">{propsState.gridSize}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Iterations</span>
              <div className="w-32">
                <Slider min={1} max={12} step={1} value={[propsState.solverIterations ?? 4]} onValueChange={(v) => setPropsState((s) => ({ ...s, solverIterations: v[0] }))} />
              </div>
              <span className="text-xs">{propsState.solverIterations}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Scale</span>
              <div className="w-32"><Slider min={0.5} max={2} step={0.05} value={[scale]} onValueChange={(v) => setScale(v[0])} /></div>
              <span className="text-xs">{scale.toFixed(2)}x</span>
            </div>
          </div>

          {/* Physics */}
          <div className="rounded-lg border p-3">
            <h3 className="mb-2 text-sm font-medium">Physics</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Gravity</span>
              <div className="w-36"><Slider min={-20} max={0} step={0.1} value={[propsState.gravity]} onValueChange={(v) => setPropsState((s) => ({ ...s, gravity: v[0] }))} /></div>
              <span className="text-xs">{propsState.gravity.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Damp</span>
              <div className="w-28"><Slider min={0} max={0.2} step={0.005} value={[propsState.dampness]} onValueChange={(v) => setPropsState((s) => ({ ...s, dampness: v[0] }))} /></div>
              <span className="text-xs">{propsState.dampness.toFixed(3)}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Air</span>
              <div className="w-28"><Slider min={0} max={0.2} step={0.005} value={[propsState.airResistance]} onValueChange={(v) => setPropsState((s) => ({ ...s, airResistance: v[0] }))} /></div>
              <span className="text-xs">{propsState.airResistance.toFixed(3)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Self-collide</span>
              <Switch checked={propsState.selfCollision} onCheckedChange={(c) => setPropsState((s) => ({ ...s, selfCollision: c }))} />
            </div>
          </div>

          {/* Wind */}
          <div className="rounded-lg border p-3">
            <h3 className="mb-2 text-sm font-medium">Wind</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Force</span>
              <div className="w-32"><Slider min={0} max={2} step={0.05} value={[propsState.windForce]} onValueChange={(v) => setPropsState((s) => ({ ...s, windForce: v[0] }))} /></div>
              <span className="text-xs">{propsState.windForce.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["x","y","z"] as const).map((axis) => (
                <div key={axis} className="flex items-center gap-2">
                  <span className="text-xs uppercase text-muted-foreground w-3">{axis}</span>
                  <div className="w-24"><Slider min={-1} max={1} step={0.05} value={[propsState.windDirection[axis]]} onValueChange={(v) => setPropsState((s) => ({ ...s, windDirection: { ...s.windDirection, [axis]: v[0] } }))} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Springs */}
          <div className="rounded-lg border p-3">
            <h3 className="mb-2 text-sm font-medium">Springs</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Structural</span>
              <div className="w-36"><Slider min={0} max={1} step={0.01} value={[propsState.structuralStiffness]} onValueChange={(v) => setPropsState((s) => ({ ...s, structuralStiffness: v[0] }))} /></div>
              <span className="text-xs">{propsState.structuralStiffness.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Shear</span>
              <div className="w-36"><Slider min={0} max={1} step={0.01} value={[propsState.shearStiffness]} onValueChange={(v) => setPropsState((s) => ({ ...s, shearStiffness: v[0] }))} /></div>
              <span className="text-xs">{propsState.shearStiffness.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Bend</span>
              <div className="w-36"><Slider min={0} max={1} step={0.01} value={[propsState.bendStiffness]} onValueChange={(v) => setPropsState((s) => ({ ...s, bendStiffness: v[0] }))} /></div>
              <span className="text-xs">{propsState.bendStiffness.toFixed(2)}</span>
            </div>
          </div>

          {/* Layout */}
          <div className="rounded-lg border p-3">
            <h3 className="mb-2 text-sm font-medium">Layout</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Orientation</span>
              <Select value={(propsState.orientation as Orientation) || "vertical"} onValueChange={(v) => setPropsState((s) => ({ ...s, orientation: v as Orientation }))}>
                <SelectTrigger className="w-36"><SelectValue placeholder="vertical" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Pins</span>
              <Select value={(propsState.pinMode as PinMode) || "topEdge"} onValueChange={(v) => setPropsState((s) => ({ ...s, pinMode: v as PinMode }))}>
                <SelectTrigger className="w-40"><SelectValue placeholder="pin mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="topEdge">Top edge</SelectItem>
                  <SelectItem value="corners">Corners</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Material */}
          <div className="rounded-lg border p-3">
            <h3 className="mb-2 text-sm font-medium">Material</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Color</span>
              <Input type="color" value={propsState.materialColor} onChange={(e) => setPropsState((s) => ({ ...s, materialColor: e.target.value }))} className="h-8 w-14 p-1" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Rough</span>
              <div className="w-28"><Slider min={0} max={1} step={0.01} value={[propsState.roughness ?? 0.9]} onValueChange={(v) => setPropsState((s) => ({ ...s, roughness: v[0] }))} /></div>
              <span className="text-xs">{(propsState.roughness ?? 0.9).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Metal</span>
              <div className="w-28"><Slider min={0} max={1} step={0.01} value={[propsState.metalness ?? 0.05]} onValueChange={(v) => setPropsState((s) => ({ ...s, metalness: v[0] }))} /></div>
              <span className="text-xs">{(propsState.metalness ?? 0.05).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Wireframe</span>
              <Switch checked={propsState.wireframe ?? false} onCheckedChange={(c) => setPropsState((s) => ({ ...s, wireframe: c }))} />
            </div>
          </div>

          {/* Interaction */}
          <div className="rounded-lg border p-3">
            <h3 className="mb-2 text-sm font-medium">Interaction</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Mouse force</span>
              <div className="w-32"><Slider min={0} max={3} step={0.05} value={[mouseForce]} onValueChange={(v) => setMouseForce(v[0])} /></div>
              <span className="text-xs">{mouseForce.toFixed(2)}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => simRef.current?.resetSimulation()}>Reset</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dev3D;
