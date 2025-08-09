import React from "react";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { EFFECTS_LIBRARY, EFFECT_CATEGORIES } from "@/data/effectsLibrary";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type EffectsGridProps = {
  activeEffectKey: string;
  onSelectEffect: (key: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
};

export default function EffectsGrid({
  activeEffectKey,
  onSelectEffect,
  selectedCategory,
  setSelectedCategory,
}: EffectsGridProps) {
  const effects = Object.entries(EFFECTS_LIBRARY).filter(([, e]) =>
    selectedCategory === "all" || e.category === selectedCategory
  );

  return (
    <div className="p-3">
      <Card className="effect-card">
        <div className="p-3 space-y-3">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Effects</SelectItem>
                {Object.entries(EFFECT_CATEGORIES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Icon Grid */}
          <TooltipProvider delayDuration={0}>
            <div
              className={cn(
                "grid gap-2",
                effects.length <= 6
                  ? "grid-cols-3"
                  : effects.length <= 12
                  ? "grid-cols-4"
                  : "grid-cols-6"
              )}
            >
              {effects.map(([key, effect]) => {
                const selected = key === activeEffectKey;
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onSelectEffect(key)}
                        className={cn(
                          "group relative flex aspect-square items-center justify-center rounded-md border transition-all hover:shadow-sm",
                          selected ? "ring-2 ring-primary border-transparent" : "border-border",
                          "bg-card/60 backdrop-blur-sm"
                        )}
                        aria-label={effect.name}
                      >
                        <AnimatedIcon type={effect.icon} className="h-6 w-6" />
                        <span className="pointer-events-none absolute inset-x-1 bottom-1 rounded px-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-100 bg-background/60 backdrop-blur-sm">
                          {effect.name}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{effect.name}</TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        </div>
      </Card>
    </div>
  );
}
