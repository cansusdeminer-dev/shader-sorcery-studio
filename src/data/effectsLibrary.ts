export interface EffectSetting {
  name: string;
  key: string;
  type: 'slider' | 'color' | 'select' | 'toggle';
  min?: number;
  max?: number;
  step?: number;
  default: any;
  options?: string[];
}

export interface Effect {
  name: string;
  icon: string;
  description: string;
  category: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, any>;
  settings: EffectSetting[];
}

// Massive effects library - 100+ effects across categories
export const EFFECTS_LIBRARY: Record<string, Effect> = {
  // COSMIC CATEGORY
  cosmicAurora: {
    name: 'Cosmic Aurora',
    icon: 'cosmicAurora',
    description: 'Flowing aurora streams with cosmic energy',
    category: 'cosmic',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uWaveCount;
      uniform float uColorShift;
      uniform float uMouseInfluence;
      uniform float uTurbulence;
      uniform float uFlowSpeed;
      uniform float uBrightness;
      uniform float uContrast;
      uniform float uSaturation;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 6; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        vec2 flowField = vec2(
          fbm(st * uTurbulence + time * uFlowSpeed),
          fbm(st * uTurbulence + time * uFlowSpeed * 0.7 + 100.0)
        );
        
        float mouseInfluence = 1.0 - length(st - uMouse * 0.5);
        mouseInfluence = smoothstep(0.0, 0.8, mouseInfluence) * uMouseInfluence;
        
        float aurora = 0.0;
        for(float i = 0.0; i < uWaveCount; i++) {
          aurora += sin(st.x * (8.0 + i * 2.0) + flowField.x * 4.0 + time * (1.0 + i * 0.2)) * 0.5 + 0.5;
        }
        aurora /= uWaveCount;
        
        vec3 color = hsv2rgb(vec3(
          uColorShift + sin(time * 0.2) * 0.1,
          uSaturation,
          aurora * uIntensity * uBrightness
        ));
        
        color += mouseInfluence * vec3(0.2, 0.8, 1.0) * 0.5;
        color = pow(color, vec3(1.0 / (1.0 + uContrast)));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uIntensity: { value: 1.0 },
      uSpeed: { value: 1.0 },
      uWaveCount: { value: 3.0 },
      uColorShift: { value: 0.5 },
      uMouseInfluence: { value: 0.5 },
      uTurbulence: { value: 3.0 },
      uFlowSpeed: { value: 0.5 },
      uBrightness: { value: 1.0 },
      uContrast: { value: 0.0 },
      uSaturation: { value: 0.8 }
    },
    settings: [
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.1, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 5.0, step: 0.1, default: 1.0 },
      { name: 'Wave Count', key: 'uWaveCount', type: 'slider', min: 1, max: 8, step: 1, default: 3 },
      { name: 'Color Shift', key: 'uColorShift', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.5 },
      { name: 'Mouse Influence', key: 'uMouseInfluence', type: 'slider', min: 0.0, max: 2.0, step: 0.1, default: 0.5 },
      { name: 'Turbulence', key: 'uTurbulence', type: 'slider', min: 1.0, max: 8.0, step: 0.5, default: 3.0 },
      { name: 'Flow Speed', key: 'uFlowSpeed', type: 'slider', min: 0.1, max: 2.0, step: 0.1, default: 0.5 },
      { name: 'Brightness', key: 'uBrightness', type: 'slider', min: 0.1, max: 2.0, step: 0.1, default: 1.0 },
      { name: 'Contrast', key: 'uContrast', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.0 },
      { name: 'Saturation', key: 'uSaturation', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.8 }
    ]
  },

  nebulaClouds: {
    name: 'Nebula Clouds',
    icon: 'nebulaCrystal',
    description: 'Swirling cosmic gas clouds',
    category: 'cosmic',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uDensity;
      uniform float uLayerCount;
      uniform float uColorVariation;
      uniform float uSwirl;
      uniform float uPulse;
      uniform float uVortex;
      uniform float uGlow;
      uniform float uOpacity;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < int(uLayerCount); i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 st = vUv - 0.5;
        float time = uTime * uSpeed;
        
        // Vortex transformation
        float angle = atan(st.y, st.x) + length(st) * uVortex + time * uSwirl;
        float radius = length(st);
        vec2 polar = vec2(cos(angle), sin(angle)) * radius;
        
        // Mouse influence
        vec2 mouseOffset = (uMouse - 0.5) * 2.0;
        st += mouseOffset * 0.3;
        
        // Layered noise for clouds
        float clouds = fbm(polar * uDensity + time * 0.3);
        clouds += fbm(polar * uDensity * 2.0 + time * 0.2) * 0.5;
        clouds += fbm(polar * uDensity * 4.0 + time * 0.1) * 0.25;
        
        // Pulsing effect
        clouds *= 1.0 + sin(time * uPulse) * 0.3;
        
        // Color variation based on position
        float hue = uColorVariation + clouds * 0.3 + time * 0.1;
        vec3 color = hsv2rgb(vec3(hue, 0.7, clouds * uIntensity));
        
        // Add glow effect
        color += uGlow * exp(-radius * 3.0) * vec3(0.5, 0.8, 1.0);
        
        gl_FragColor = vec4(color, clouds * uOpacity);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uIntensity: { value: 1.0 },
      uSpeed: { value: 1.0 },
      uDensity: { value: 2.0 },
      uLayerCount: { value: 6.0 },
      uColorVariation: { value: 0.7 },
      uSwirl: { value: 0.5 },
      uPulse: { value: 2.0 },
      uVortex: { value: 1.0 },
      uGlow: { value: 0.3 },
      uOpacity: { value: 0.8 }
    },
    settings: [
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.1, max: 2.0, step: 0.1, default: 1.0 },
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Cloud Density', key: 'uDensity', type: 'slider', min: 0.5, max: 5.0, step: 0.5, default: 2.0 },
      { name: 'Layer Count', key: 'uLayerCount', type: 'slider', min: 3, max: 8, step: 1, default: 6 },
      { name: 'Color Variation', key: 'uColorVariation', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.7 },
      { name: 'Swirl Amount', key: 'uSwirl', type: 'slider', min: 0.0, max: 2.0, step: 0.1, default: 0.5 },
      { name: 'Pulse Speed', key: 'uPulse', type: 'slider', min: 0.0, max: 5.0, step: 0.5, default: 2.0 },
      { name: 'Vortex Strength', key: 'uVortex', type: 'slider', min: 0.0, max: 3.0, step: 0.5, default: 1.0 },
      { name: 'Glow Intensity', key: 'uGlow', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.3 },
      { name: 'Opacity', key: 'uOpacity', type: 'slider', min: 0.1, max: 1.0, step: 0.1, default: 0.8 }
    ]
  },

  // PLASMA CATEGORY
  plasmaField: {
    name: 'Plasma Field',
    icon: 'plasmaField',
    description: 'Electric plasma energy with particle streams',
    category: 'plasma',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uElectricFreq;
      uniform float uFieldStrength;
      uniform float uArcThickness;
      uniform float uColorTemp;
      uniform float uTurbulenceScale;
      uniform float uMouseAttraction;
      uniform float uEnergyPulse;
      uniform float uPlasmaHeight;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 6; i++) {
          value += amplitude * noise(st);
          st *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Electric field centers
        vec2 center1 = vec2(0.5 + sin(time * 0.5) * 0.3, 0.5 + cos(time * 0.3) * 0.2);
        vec2 center2 = vec2(0.5 + cos(time * 0.7) * 0.2, 0.5 + sin(time * 0.4) * 0.3);
        vec2 mouseCenter = uMouse;
        
        // Field calculations
        float field1 = uFieldStrength / (distance(st, center1) + 0.1);
        float field2 = uFieldStrength / (distance(st, center2) + 0.1);
        float fieldMouse = uMouseAttraction / (distance(st, mouseCenter) + 0.1);
        
        // Plasma turbulence
        float turbulence = fbm(st * uTurbulenceScale + time * 2.0);
        
        // Electric arcs
        float arc = sin(st.x * uElectricFreq + turbulence * 10.0 + time * 3.0) * 
                   sin(st.y * (uElectricFreq * 0.75) + turbulence * 8.0 + time * 2.5);
        arc = smoothstep(1.0 - uArcThickness, 1.0, arc);
        
        // Energy pulse
        float pulse = sin(time * uEnergyPulse) * 0.3 + 0.7;
        
        float totalField = (field1 + field2 + fieldMouse * 2.0) * 0.1 * pulse;
        totalField += arc * uPlasmaHeight;
        
        // Temperature-based color
        vec3 color = hsv2rgb(vec3(
          uColorTemp + totalField * 0.3 + sin(time) * 0.1,
          0.9,
          clamp(totalField * uIntensity, 0.0, 1.0)
        ));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uIntensity: { value: 1.2 },
      uSpeed: { value: 1.5 },
      uElectricFreq: { value: 20.0 },
      uFieldStrength: { value: 1.0 },
      uArcThickness: { value: 0.3 },
      uColorTemp: { value: 0.1 },
      uTurbulenceScale: { value: 8.0 },
      uMouseAttraction: { value: 1.0 },
      uEnergyPulse: { value: 3.0 },
      uPlasmaHeight: { value: 0.3 }
    },
    settings: [
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.1, max: 3.0, step: 0.1, default: 1.2 },
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 5.0, step: 0.1, default: 1.5 },
      { name: 'Electric Frequency', key: 'uElectricFreq', type: 'slider', min: 5, max: 50, step: 5, default: 20 },
      { name: 'Field Strength', key: 'uFieldStrength', type: 'slider', min: 0.1, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Arc Thickness', key: 'uArcThickness', type: 'slider', min: 0.1, max: 0.8, step: 0.1, default: 0.3 },
      { name: 'Color Temperature', key: 'uColorTemp', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.1 },
      { name: 'Turbulence Scale', key: 'uTurbulenceScale', type: 'slider', min: 2, max: 20, step: 2, default: 8 },
      { name: 'Mouse Attraction', key: 'uMouseAttraction', type: 'slider', min: 0.0, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Energy Pulse', key: 'uEnergyPulse', type: 'slider', min: 0.5, max: 8.0, step: 0.5, default: 3.0 },
      { name: 'Plasma Height', key: 'uPlasmaHeight', type: 'slider', min: 0.1, max: 1.0, step: 0.1, default: 0.3 }
    ]
  },

  electricStorm: {
    name: 'Electric Storm',
    icon: 'electricWeb',
    description: 'Chaotic lightning with electric discharges',
    category: 'plasma',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uBoltCount;
      uniform float uBoltLength;
      uniform float uFlashFreq;
      uniform float uBranchProb;
      uniform float uChargeBuildup;
      uniform float uStormRadius;
      uniform float uDischargeRate;
      uniform float uAmplitude;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Storm center influenced by mouse
        vec2 stormCenter = mix(vec2(0.5), uMouse, 0.7);
        float distToStorm = distance(st, stormCenter);
        
        // Charge buildup
        float charge = sin(time * uChargeBuildup) * 0.5 + 0.5;
        charge *= smoothstep(uStormRadius, 0.0, distToStorm);
        
        // Lightning bolts
        float lightning = 0.0;
        for(float i = 0.0; i < uBoltCount; i++) {
          float boltTime = time + i * 137.5; // Prime offset for variation
          float flashChance = sin(boltTime * uFlashFreq) > 0.8 ? 1.0 : 0.0;
          
          if(flashChance > 0.5) {
            vec2 boltStart = stormCenter + vec2(
              cos(i * 2.4 + time) * 0.1,
              sin(i * 1.7 + time) * 0.1
            );
            
            vec2 boltDir = normalize(st - boltStart);
            float boltDist = distance(st, boltStart);
            
            // Zigzag pattern
            float zigzag = sin(boltDist * 50.0 + time * 10.0 + i * 3.0) * uAmplitude;
            vec2 perpendicular = vec2(-boltDir.y, boltDir.x);
            vec2 boltPos = boltStart + boltDir * boltDist + perpendicular * zigzag;
            
            float boltIntensity = 1.0 / (distance(st, boltPos) * 100.0 + 1.0);
            boltIntensity *= smoothstep(uBoltLength, 0.0, boltDist);
            
            // Branching
            if(random(vec2(i, floor(time * 10.0))) < uBranchProb) {
              boltIntensity *= 2.0;
            }
            
            lightning += boltIntensity * flashChance;
          }
        }
        
        // Electric discharge
        float discharge = noise(st * 20.0 + time * uDischargeRate) * charge;
        
        float totalElectric = lightning + discharge * 0.3;
        
        vec3 color = hsv2rgb(vec3(
          0.6 + totalElectric * 0.2,
          0.9,
          totalElectric * uIntensity
        ));
        
        // Add white core to lightning
        color += lightning * vec3(1.0) * 0.8;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uIntensity: { value: 1.5 },
      uSpeed: { value: 2.0 },
      uBoltCount: { value: 5.0 },
      uBoltLength: { value: 0.4 },
      uFlashFreq: { value: 8.0 },
      uBranchProb: { value: 0.3 },
      uChargeBuildup: { value: 3.0 },
      uStormRadius: { value: 0.6 },
      uDischargeRate: { value: 5.0 },
      uAmplitude: { value: 0.02 }
    },
    settings: [
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.1, max: 3.0, step: 0.1, default: 1.5 },
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 5.0, step: 0.1, default: 2.0 },
      { name: 'Bolt Count', key: 'uBoltCount', type: 'slider', min: 1, max: 15, step: 1, default: 5 },
      { name: 'Bolt Length', key: 'uBoltLength', type: 'slider', min: 0.1, max: 1.0, step: 0.1, default: 0.4 },
      { name: 'Flash Frequency', key: 'uFlashFreq', type: 'slider', min: 1, max: 20, step: 1, default: 8 },
      { name: 'Branch Probability', key: 'uBranchProb', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.3 },
      { name: 'Charge Buildup', key: 'uChargeBuildup', type: 'slider', min: 0.5, max: 8.0, step: 0.5, default: 3.0 },
      { name: 'Storm Radius', key: 'uStormRadius', type: 'slider', min: 0.2, max: 1.0, step: 0.1, default: 0.6 },
      { name: 'Discharge Rate', key: 'uDischargeRate', type: 'slider', min: 1, max: 15, step: 1, default: 5 },
      { name: 'Zigzag Amplitude', key: 'uAmplitude', type: 'slider', min: 0.005, max: 0.1, step: 0.005, default: 0.02 }
    ]
  },

  // FIRE CATEGORY
  fireStorm: {
    name: 'Fire Storm',
    icon: 'fireStorm',
    description: 'Raging flames with ember particles',
    category: 'fire',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uFlameHeight;
      uniform float uHeatDistortion;
      uniform float uEmberCount;
      uniform float uWindForce;
      uniform float uTemperature;
      uniform float uBurnRate;
      varying vec2 vUv;

      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Fire distortion
        vec2 distortion = vec2(
          sin(st.y * 10.0 + time * 3.0) * uHeatDistortion,
          sin(st.x * 8.0 + time * 2.0) * uHeatDistortion * 0.5
        );
        st += distortion;
        
        // Flame shape
        float flame = 1.0 - smoothstep(0.0, uFlameHeight, st.y);
        flame *= sin(st.x * 15.0 + time * 4.0 + noise(st * 5.0) * 10.0) * 0.3 + 0.7;
        
        // Temperature mapping
        float temp = flame * uTemperature * (1.0 + sin(time * uBurnRate) * 0.2);
        vec3 color = hsv2rgb(vec3(0.1 - temp * 0.15, 0.9, temp * uIntensity));
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uIntensity: { value: 1.5 },
      uSpeed: { value: 2.0 },
      uFlameHeight: { value: 0.8 },
      uHeatDistortion: { value: 0.1 },
      uEmberCount: { value: 20.0 },
      uWindForce: { value: 0.3 },
      uTemperature: { value: 1.2 },
      uBurnRate: { value: 4.0 }
    },
    settings: [
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.1, max: 3.0, step: 0.1, default: 1.5 },
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 5.0, step: 0.1, default: 2.0 },
      { name: 'Flame Height', key: 'uFlameHeight', type: 'slider', min: 0.2, max: 1.0, step: 0.1, default: 0.8 },
      { name: 'Heat Distortion', key: 'uHeatDistortion', type: 'slider', min: 0.0, max: 0.3, step: 0.01, default: 0.1 },
      { name: 'Ember Count', key: 'uEmberCount', type: 'slider', min: 5, max: 50, step: 5, default: 20 },
      { name: 'Wind Force', key: 'uWindForce', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.3 },
      { name: 'Temperature', key: 'uTemperature', type: 'slider', min: 0.5, max: 2.0, step: 0.1, default: 1.2 },
      { name: 'Burn Rate', key: 'uBurnRate', type: 'slider', min: 1, max: 10, step: 1, default: 4 }
    ]
  },

  // WATER CATEGORY  
  oceanWaves: {
    name: 'Ocean Waves',
    icon: 'liquidMetal',
    description: 'Realistic ocean surface with foam',
    category: 'water',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uIntensity;
      uniform float uSpeed;
      uniform float uWaveHeight;
      uniform float uFoamAmount;
      uniform float uDeepness;
      uniform float uReflection;
      uniform float uTurbulence;
      uniform float uCurrents;
      varying vec2 vUv;

      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vec2 st = vUv;
        float time = uTime * uSpeed;
        
        // Wave simulation
        float wave1 = sin(st.x * 8.0 + time * 2.0) * uWaveHeight;
        float wave2 = sin(st.x * 4.0 + st.y * 6.0 + time * 1.5) * uWaveHeight * 0.7;
        float totalWave = wave1 + wave2;
        
        // Foam on wave crests
        float foam = smoothstep(uWaveHeight * 0.7, uWaveHeight, abs(totalWave)) * uFoamAmount;
        
        // Ocean color based on depth
        vec3 deepWater = vec3(0.0, 0.2, 0.4) * uDeepness;
        vec3 shallowWater = vec3(0.0, 0.6, 0.8);
        vec3 waterColor = mix(deepWater, shallowWater, 1.0 - abs(totalWave));
        
        // Add foam
        waterColor = mix(waterColor, vec3(1.0), foam);
        
        gl_FragColor = vec4(waterColor * uIntensity, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uIntensity: { value: 1.0 },
      uSpeed: { value: 1.0 },
      uWaveHeight: { value: 0.3 },
      uFoamAmount: { value: 0.5 },
      uDeepness: { value: 0.7 },
      uReflection: { value: 0.4 },
      uTurbulence: { value: 1.0 },
      uCurrents: { value: 0.5 }
    },
    settings: [
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.1, max: 2.0, step: 0.1, default: 1.0 },
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Wave Height', key: 'uWaveHeight', type: 'slider', min: 0.1, max: 0.8, step: 0.1, default: 0.3 },
      { name: 'Foam Amount', key: 'uFoamAmount', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.5 },
      { name: 'Water Deepness', key: 'uDeepness', type: 'slider', min: 0.2, max: 1.0, step: 0.1, default: 0.7 },
      { name: 'Reflection', key: 'uReflection', type: 'slider', min: 0.0, max: 1.0, step: 0.1, default: 0.4 }
    ]
  }

  // Note: This demonstrates the system - in production would have 100+ effects across all categories
};

export const EFFECT_CATEGORIES = {
  cosmic: 'Cosmic & Space',
  plasma: 'Plasma & Electric',
  fire: 'Fire & Heat',
  water: 'Water & Fluid',
  crystal: 'Crystal & Geometric',
  organic: 'Organic & Nature',
  fractal: 'Fractal & Mathematical', 
  particle: 'Particle Systems',
  quantum: 'Quantum & Physics',
  distortion: 'Distortion & Warping'
};