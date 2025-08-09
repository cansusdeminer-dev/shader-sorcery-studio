import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EFFECTS_LIBRARY } from "@/data/effectsLibrary";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { Plus, Layers as LayersIcon } from "lucide-react";

export type Layer = {
  id: string;
  effectKey: string;
  settings: Record<string, any>;
  isPlaying: boolean;
  blending: "additive" | "normal";
  visible: boolean;
};

export type LayersDrawerProps = {
  layers: Layer[];
  activeLayerId: string;
  onSetActiveLayer: (id: string) => void;
  onAddLayer: (effectKey?: string) => void;
  onRemoveLayer: (id: string) => void;
  onUpdateLayer: (id: string, changes: Partial<Layer>) => void;
};

export default function LayersDrawer({
  layers,
  activeLayerId,
  onSetActiveLayer,
  onAddLayer,
  onRemoveLayer,
  onUpdateLayer,
}: LayersDrawerProps) {
  const [open, setOpen] = React.useState(false);

  const effectEntries = Object.entries(EFFECTS_LIBRARY);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 shadow-md"
          aria-label="Layers"
        >
          <LayersIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-card/60 backdrop-blur-xl border shadow-xl w-80">
        <SheetHeader>
          <SheetTitle>Layers</SheetTitle>
        </SheetHeader>
        <div className="p-2 space-y-3">
          <Button size="sm" variant="outline" className="w-full" onClick={() => onAddLayer()}>
            <Plus className="h-4 w-4 mr-2" /> Add Layer
          </Button>

          <div className="space-y-3">
            {layers.map((layer) => {
              const effect = EFFECTS_LIBRARY[layer.effectKey];
              const isActive = layer.id === activeLayerId;
              return (
                <Card key={layer.id} className={`p-3 ${isActive ? "ring-2 ring-primary" : ""}`}>
                  <div className="flex items-center gap-3">
                    <button
                      className="shrink-0 rounded-md border bg-card/60 backdrop-blur-sm p-2"
                      onClick={() => onSetActiveLayer(layer.id)}
                      aria-label={`Activate ${effect?.name ?? layer.effectKey}`}
                    >
                      <AnimatedIcon type={effect?.icon ?? "cosmic-aurora" as any} className="h-5 w-5" />
                    </button>
                    <div className="flex-1 space-y-2">
                      <Select
                        value={layer.effectKey}
                        onValueChange={(key) => onUpdateLayer(layer.id, { effectKey: key })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-64 overflow-auto">
                          {effectEntries.map(([key, e]) => (
                            <SelectItem key={key} value={key}>
                              {e.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center justify-between">
                        <label className="text-xs text-muted-foreground">Visible</label>
                        <Switch
                          checked={layer.visible}
                          onCheckedChange={(v) => onUpdateLayer(layer.id, { visible: v })}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Blending</label>
                        <Select
                          value={layer.blending}
                          onValueChange={(mode) => onUpdateLayer(layer.id, { blending: mode as Layer["blending"] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="additive">Additive</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="destructive" onClick={() => onRemoveLayer(layer.id)}>
                          Remove
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onSetActiveLayer(layer.id)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
