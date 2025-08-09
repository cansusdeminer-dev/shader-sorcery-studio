import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, Shuffle, Filter } from "lucide-react";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { EFFECTS_LIBRARY, EFFECT_CATEGORIES, type EffectSetting } from "@/data/effectsLibrary";

// Sidebar-friendly control panel extracted from EffectsHub
// Keeps all functionality; layout optimized for sidebar usage.
export type EffectsControlPanelProps = {
  currentEffect: string;
  setCurrentEffect: (key: string) => void;
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  settings: Record<string, any>;
  setSettings: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
};

export default function EffectsControlPanel({
  currentEffect,
  setCurrentEffect,
  isPlaying,
  setIsPlaying,
  settings,
  setSettings,
  selectedCategory,
  setSelectedCategory,
}: EffectsControlPanelProps) {
  const currentEffectData = EFFECTS_LIBRARY[currentEffect];

  const quickSection = selectedCategory === 'backgrounds' ? 'backgrounds' : 'effects';

  const filteredEffects = Object.entries(EFFECTS_LIBRARY).filter(([, effect]) =>
    selectedCategory === "all" || effect.category === selectedCategory
  );

  const handleSettingChange = (settingKey: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [settingKey]: value,
    }));
  };

  const renderSettingControl = (setting: EffectSetting) => {
    const currentValue = settings[setting.key] ?? setting.default;

    switch (setting.type) {
      case "slider":
        return (
          <div key={setting.key} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">{setting.name}</label>
              <span className="text-xs text-muted-foreground">
                {typeof currentValue === "number" ? currentValue.toFixed(2) : String(currentValue)}
              </span>
            </div>
            <Slider
              value={[Number(currentValue)]}
              onValueChange={(value) => handleSettingChange(setting.key, value[0])}
              max={setting.max}
              min={setting.min}
              step={setting.step}
              className="w-full"
            />
          </div>
        );
      case "toggle":
        return (
          <div key={setting.key} className="flex items-center justify-between">
            <label className="text-sm font-medium">{setting.name}</label>
            <Switch
              checked={Boolean(currentValue)}
              onCheckedChange={(checked) => handleSettingChange(setting.key, checked)}
            />
          </div>
        );
      case "select":
        return (
          <div key={setting.key} className="space-y-2">
            <label className="text-sm font-medium">{setting.name}</label>
            <Select
              value={String(currentValue)}
              onValueChange={(value) => handleSettingChange(setting.key, value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}</SelectContent>
            </Select>
          </div>
        );
      case "color": {
        const toHex = (rgb: number[] | string) => {
          if (Array.isArray(rgb)) {
            const [r, g, b] = rgb.map((v) => Math.round(Math.max(0, Math.min(1, Number(v))) * 255));
            return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
          }
          return String(rgb ?? "#ffffff");
        };
        const fromHex = (hex: string): number[] => {
          const h = hex.replace("#", "");
          const bigint = parseInt(h, 16);
          return [(bigint >> 16 & 255) / 255, (bigint >> 8 & 255) / 255, (bigint & 255) / 255];
        };
        const hex = toHex(currentValue);
        return (
          <div key={setting.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">{setting.name}</label>
              <input
                type="color"
                value={hex}
                onChange={(e) => handleSettingChange(setting.key, fromHex(e.target.value))}
                className="h-6 w-10 p-0 bg-transparent border-0 cursor-pointer"
                aria-label={`${setting.name} color`}
              />
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="p-3">
      <Card className="effect-card">
        <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-card/90 backdrop-blur-sm p-2 -m-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cosmic Effects Hub
            </h1>
            <div className="flex gap-2">
              <Button onClick={() => setIsPlaying(!isPlaying)} variant="outline" size="icon" className="btn-cosmic">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                onClick={() => {
                  const effectKeys = filteredEffects.map(([key]) => key);
                  const randomEffect = effectKeys[Math.floor(Math.random() * effectKeys.length)];
                  if (randomEffect) setCurrentEffect(randomEffect);
                }}
                variant="outline"
                size="icon"
                className="btn-aurora"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Tabs: Effects vs Backgrounds */}
          <Tabs
            value={quickSection}
            onValueChange={(v) => setSelectedCategory(v === 'backgrounds' ? 'backgrounds' : 'all')}
          >
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="effects">Effects</TabsTrigger>
              <TabsTrigger value="backgrounds">Backgrounds</TabsTrigger>
            </TabsList>
          </Tabs>

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
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={currentEffect} onValueChange={setCurrentEffect}>
            <TabsList
              className={`grid w-full gap-1 mb-4 h-auto p-1 ${
                filteredEffects.length <= 4
                  ? "grid-cols-4"
                  : filteredEffects.length <= 6
                  ? "grid-cols-6"
                  : filteredEffects.length <= 8
                  ? "grid-cols-8"
                  : "grid-cols-10"
              }`}
            >
              {filteredEffects.map(([key, effect]) => (
                <TabsTrigger key={key} value={key} className="flex flex-col gap-1 p-2">
                  <AnimatedIcon type={effect.icon} className="w-5 h-5" />
                  <span className="text-xs truncate max-w-[72px]">{effect.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredEffects.map(([key, effect]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="flex items-center gap-3">
                  <AnimatedIcon type={effect.icon} className="w-8 h-8" />
                  <div>
                    <h3 className="text-base font-semibold">{effect.name}</h3>
                    <p className="text-xs text-muted-foreground">{effect.description}</p>
                    <span className="text-[10px] bg-accent text-accent-foreground px-2 py-1 rounded">
                      {EFFECT_CATEGORIES[effect.category]}
                    </span>
                  </div>
                </div>

                {/* Dynamic settings grid */}
                <div
                  className={`grid gap-4 ${
                    effect.settings.length <= 4
                      ? "grid-cols-2"
                      : effect.settings.length <= 6
                      ? "grid-cols-3"
                      : "grid-cols-4"
                  }`}
                >
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
