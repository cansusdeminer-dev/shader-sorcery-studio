import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Palette } from "lucide-react";
import { EFFECTS_LIBRARY, type EffectSetting } from "@/data/effectsLibrary";

export type SettingsDrawerProps = {
  effectKey: string;
  settings: Record<string, any>;
  onSettingChange: (key: string, value: any) => void;
};

export default function SettingsDrawer({ effectKey, settings, onSettingChange }: SettingsDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const effect = EFFECTS_LIBRARY[effectKey];
  const colorSettings = (effect?.settings ?? []).filter((s) => s.type === "color");
  const otherSettings = (effect?.settings ?? []).filter((s) => s.type !== "color");

  const handleSettingChange = (key: string, value: any) => onSettingChange(key, value);

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
            <Select value={String(currentValue)} onValueChange={(value) => handleSettingChange(setting.key, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
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
          return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
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

  if (!effect) return null;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 shadow-md"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" /> Settings
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-card/60 backdrop-blur-xl border shadow-xl">
        <DrawerHeader className="pb-2">
          <DrawerTitle>Effect Settings</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-6">
          <Card className="p-3 bg-background/40 backdrop-blur-sm">
            <Accordion type="multiple" className="w-full">
              {colorSettings.length > 0 && (
                <AccordionItem value="colors">
                  <AccordionTrigger>
                    <span className="inline-flex items-center gap-2"><Palette className="h-4 w-4" /> Colors</span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-3">
                      {colorSettings.map(renderSettingControl)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {otherSettings.length > 0 && (
                <AccordionItem value="advanced">
                  <AccordionTrigger>Advanced</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                      {otherSettings.map(renderSettingControl)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
