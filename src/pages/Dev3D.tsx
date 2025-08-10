import React, { useMemo, useRef, useState, useEffect } from "react";
import ClothSimulation, { ClothProperties, SceneObject } from "@/components/three/ClothSimulation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

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
};

const Dev3D: React.FC = () => {
  // SEO basics
  useEffect(() => {
    document.title = "3D Cloth Physics Playground | Three.js";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      const m = document.createElement("meta");
      m.name = "description";
      m.content = "Interactive 3D cloth physics playground with wind, collisions, and presets.";
      document.head.appendChild(m);
    } else {
      metaDesc.setAttribute("content", "Interactive 3D cloth physics playground with wind, collisions, and presets.");
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
  const [scale, setScale] = useState(1);
  const [mouseForce, setMouseForce] = useState(0.5);
  const [dragMode, setDragMode] = useState<"move" | "pin" | "tear">("move");

  const [propsState, setPropsState] = useState<ClothProperties>({ ...heroCloth });

  const sceneObjects = useMemo<SceneObject[]>(() => [
    { type: "sphere", position: [0.0, -0.6, 0.0], radius: 0.45, visible: true },
    { type: "box", position: [0.8, -1.0, 0.0], size: [0.5, 0.5, 0.5], visible: true },
  ], []);

  const applyHero = () => {
    setPropsState({ ...heroCloth });
    setScale(1.2);
    simRef.current?.resetSimulation();
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
      <section className="pointer-events-auto fixed bottom-4 left-1/2 z-50 w-[min(980px,92vw)] -translate-x-1/2 rounded-xl border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setIsPlaying((p) => !p)}>
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={applyHero}>Hero preset</Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Scale</span>
            <div className="w-32">
              <Slider min={0.5} max={2} step={0.05} value={[scale]} onValueChange={(v) => setScale(v[0])} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Grid</span>
            <div className="w-36">
              <Slider
                min={16}
                max={96}
                step={8}
                value={[propsState.gridSize]}
                onValueChange={(v) => setPropsState((s) => ({ ...s, gridSize: v[0] }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Iterations</span>
            <div className="w-32">
              <Slider
                min={1}
                max={8}
                step={1}
                value={[propsState.solverIterations ?? 4]}
                onValueChange={(v) => setPropsState((s) => ({ ...s, solverIterations: v[0] }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Wind</span>
            <div className="w-32">
              <Slider
                min={0}
                max={2}
                step={0.05}
                value={[propsState.windForce]}
                onValueChange={(v) => setPropsState((s) => ({ ...s, windForce: v[0] }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Self-collide</span>
            <Switch checked={propsState.selfCollision} onCheckedChange={(c) => setPropsState((s) => ({ ...s, selfCollision: c }))} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mouse force</span>
            <div className="w-32">
              <Slider min={0} max={3} step={0.05} value={[mouseForce]} onValueChange={(v) => setMouseForce(v[0])} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={dragMode === "move" ? "default" : "outline"} onClick={() => setDragMode("move")}>Move</Button>
            <Button variant={dragMode === "pin" ? "default" : "outline"} onClick={() => setDragMode("pin")}>Pin</Button>
            <Button variant={dragMode === "tear" ? "default" : "outline"} onClick={() => setDragMode("tear")}>Tear</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dev3D;
