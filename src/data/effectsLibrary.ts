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

,
  // ORGANIC / DISTORTION / PARTICLE ADDITIONS
  lavaLamp: {
    name: 'Lava Lamp',
    icon: 'lavaLamp',
    description: 'Metaballs drifting in viscous fluid (advanced)',
    category: 'organic',
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uSpeed;
      uniform float uBlobCount;
      uniform float uBlobSizeBase;
      uniform float uBlobSizeVar;
      uniform float uBlobJitter;
      uniform float uDriftAmp;
      uniform float uDriftFreq;
      uniform float uGravity;
      uniform float uIsoLevel;
      uniform float uEdgeSoftness;
      uniform float uAspect;
      uniform float uNoiseScale;
      uniform float uDistort;
      uniform float uHueA;
      uniform float uHueB;
      uniform float uBrightness;
      uniform float uIntensity;
      varying vec2 vUv;

      float hash(float n) { return fract(sin(n) * 43758.5453123); }
      float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash2(i);
        float b = hash2(i + vec2(1.0, 0.0));
        float c = hash2(i + vec2(0.0, 1.0));
        float d = hash2(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
      }
      float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5;} return v; }

      vec3 hsv2rgb(vec3 c){
        vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec2 uv = vUv;
        float t = uTime * uSpeed;

        // Aspect correction
        vec2 st = uv * vec2(uAspect, 1.0);

        // Subtle fluid distortion
        if(uDistort > 0.0) {
          float n = fbm(st * uNoiseScale + t*0.2);
          st += (n - 0.5) * 0.06 * uDistort;
        }

        // Gravity warp
        st.y += sin(st.x * 6.2831 + t*0.2) * (0.02 * uGravity);

        // Metaball field accumulation
        float field = 0.0;
        for(int i = 0; i < 64; i++){
          float fi = float(i);
          if(fi >= uBlobCount) break;
          float seed = fi * 12.9898;
          float r = uBlobSizeBase + uBlobSizeVar * hash(seed*3.7);
          // Base orbit
          vec2 dir = normalize(vec2(hash(seed) - 0.5, hash(seed*1.3) - 0.5) + 1e-6);
          vec2 c = vec2(0.5) + dir * (0.25 + 0.05 * sin(seed));
          // Drift and jitter
          c += vec2(
            sin(uDriftFreq * t + seed) ,
            cos(uDriftFreq * t * 0.9 + seed*1.7)
          ) * (0.18 * uDriftAmp);
          c += vec2(
            sin(t*1.7 + seed*2.1),
            cos(t*1.3 + seed*2.7)
          ) * (0.02 * uBlobJitter);

          vec2 p = st;
          float d = length(p - c);
          field += r / (d + 1e-3);
        }

        // Thresholding
        float iso = smoothstep(uIsoLevel - uEdgeSoftness, uIsoLevel + uEdgeSoftness, field);

        // Color ramp between two hues
        float hue = mix(uHueA, uHueB, iso);
        vec3 col = hsv2rgb(vec3(fract(hue), 0.85, (0.6 + 0.4*iso) * uBrightness));
        col *= uIntensity;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 0.8 },
      uBlobCount: { value: 16.0 },
      uBlobSizeBase: { value: 0.08 },
      uBlobSizeVar: { value: 0.04 },
      uBlobJitter: { value: 1.0 },
      uDriftAmp: { value: 0.8 },
      uDriftFreq: { value: 1.0 },
      uGravity: { value: 0.8 },
      uIsoLevel: { value: 1.2 },
      uEdgeSoftness: { value: 0.12 },
      uAspect: { value: 1.0 },
      uNoiseScale: { value: 3.0 },
      uDistort: { value: 0.2 },
      uHueA: { value: 0.92 },
      uHueB: { value: 0.08 },
      uBrightness: { value: 1.0 },
      uIntensity: { value: 1.0 },
    },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.05, max: 3.0, step: 0.05, default: 0.8 },
      { name: 'Blob Count', key: 'uBlobCount', type: 'slider', min: 1, max: 64, step: 1, default: 16 },
      { name: 'Blob Size Base', key: 'uBlobSizeBase', type: 'slider', min: 0.02, max: 0.25, step: 0.005, default: 0.08 },
      { name: 'Blob Size Variation', key: 'uBlobSizeVar', type: 'slider', min: 0.0, max: 0.2, step: 0.005, default: 0.04 },
      { name: 'Blob Jitter', key: 'uBlobJitter', type: 'slider', min: 0.0, max: 3.0, step: 0.05, default: 1.0 },
      { name: 'Drift Amplitude', key: 'uDriftAmp', type: 'slider', min: 0.0, max: 1.5, step: 0.05, default: 0.8 },
      { name: 'Drift Frequency', key: 'uDriftFreq', type: 'slider', min: 0.1, max: 3.0, step: 0.05, default: 1.0 },
      { name: 'Gravity Warp', key: 'uGravity', type: 'slider', min: 0.0, max: 2.0, step: 0.05, default: 0.8 },
      { name: 'Iso Level', key: 'uIsoLevel', type: 'slider', min: 0.6, max: 2.0, step: 0.02, default: 1.2 },
      { name: 'Edge Softness', key: 'uEdgeSoftness', type: 'slider', min: 0.01, max: 0.5, step: 0.01, default: 0.12 },
      { name: 'Distortion', key: 'uDistort', type: 'slider', min: 0.0, max: 1.0, step: 0.05, default: 0.2 },
      { name: 'Noise Scale', key: 'uNoiseScale', type: 'slider', min: 1.0, max: 10.0, step: 0.5, default: 3.0 },
      { name: 'Hue A', key: 'uHueA', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.92 },
      { name: 'Hue B', key: 'uHueB', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.08 },
      { name: 'Brightness', key: 'uBrightness', type: 'slider', min: 0.2, max: 2.0, step: 0.05, default: 1.0 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.2, max: 2.0, step: 0.05, default: 1.0 },
    ]
  },

  lavaLampNeon: {
    name: 'Lava Lamp Neon',
    icon: 'lavaLamp',
    description: 'High‑contrast neon metaballs with glow',
    category: 'organic',
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} 
    `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uBlobCount; uniform float uBlobSizeBase; uniform float uBlobSizeVar; uniform float uBlobJitter; uniform float uDriftAmp; uniform float uDriftFreq; uniform float uIsoLevel; uniform float uEdgeSoftness; uniform float uNoiseScale; uniform float uDistort; uniform float uHueA; uniform float uHueB; uniform float uGlow; uniform float uIntensity; varying vec2 vUv;
      float hash(float n){ return fract(sin(n)*43758.5453);} float hash2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453);} 
      float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash2(i), b=hash2(i+vec2(1,0)), c=hash2(i+vec2(0,1)), d=hash2(i+vec2(1,1)); vec2 u=f*f*(3.0-2.0*f); return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;}
      float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5;} return v; }
      vec3 hsv2rgb(vec3 c){ vec4 K=vec4(1.,2./3.,1./3.,3.); vec3 p=abs(fract(c.xxx+K.xyz)*6. - K.www); return c.z*mix(K.xxx, clamp(p-K.xxx,0.,1.), c.y);} 
      void main(){ vec2 st=vUv; float t=uTime*uSpeed; if(uDistort>0.0){ float n=fbm(st*uNoiseScale + t*0.2); st += (n-0.5)*0.08*uDistort; } float field=0.0; for(int i=0;i<64;i++){ float fi=float(i); if(fi>=uBlobCount) break; float seed=fi*12.9; float r=uBlobSizeBase + uBlobSizeVar*hash(seed*3.7); vec2 dir=normalize(vec2(hash(seed)-0.5, hash(seed*1.3)-0.5)+1e-6); vec2 c=vec2(0.5)+dir*(0.3); c += vec2(sin(uDriftFreq*t+seed), cos(uDriftFreq*t*0.9+seed*1.7))*(0.2*uDriftAmp); c += vec2(sin(t*1.7+seed*2.1), cos(t*1.3+seed*2.7))*(0.02*uBlobJitter);
        field += r/(length(st-c)+1e-3);
      }
      float iso=smoothstep(uIsoLevel - uEdgeSoftness, uIsoLevel + uEdgeSoftness, field);
      float hue=mix(uHueA,uHueB,iso);
      vec3 col=hsv2rgb(vec3(fract(hue), 1.0, iso))*uIntensity; // neon sat
      // halo glow
      float glow = smoothstep(0.0, 1.0, field/uIsoLevel);
      col += vec3(0.6,0.1,1.0)*pow(glow,2.0)*uGlow;
      gl_FragColor=vec4(col,1.0);
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.2}, uBlobCount:{value:20.0}, uBlobSizeBase:{value:0.07}, uBlobSizeVar:{value:0.06}, uBlobJitter:{value:1.2}, uDriftAmp:{value:1.0}, uDriftFreq:{value:1.4}, uIsoLevel:{value:1.1}, uEdgeSoftness:{value:0.08}, uNoiseScale:{value:4.0}, uDistort:{value:0.35}, uHueA:{value:0.85}, uHueB:{value:0.15}, uGlow:{value:0.5}, uIntensity:{value:1.2} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 3.0, step: 0.05, default: 1.2 },
      { name: 'Blob Count', key: 'uBlobCount', type: 'slider', min: 1, max: 64, step: 1, default: 20 },
      { name: 'Blob Size Base', key: 'uBlobSizeBase', type: 'slider', min: 0.02, max: 0.25, step: 0.005, default: 0.07 },
      { name: 'Blob Size Variation', key: 'uBlobSizeVar', type: 'slider', min: 0.0, max: 0.2, step: 0.005, default: 0.06 },
      { name: 'Jitter', key: 'uBlobJitter', type: 'slider', min: 0.0, max: 3.0, step: 0.05, default: 1.2 },
      { name: 'Drift Amp', key: 'uDriftAmp', type: 'slider', min: 0.0, max: 1.5, step: 0.05, default: 1.0 },
      { name: 'Drift Freq', key: 'uDriftFreq', type: 'slider', min: 0.1, max: 3.0, step: 0.05, default: 1.4 },
      { name: 'Iso Level', key: 'uIsoLevel', type: 'slider', min: 0.6, max: 2.0, step: 0.02, default: 1.1 },
      { name: 'Edge Softness', key: 'uEdgeSoftness', type: 'slider', min: 0.01, max: 0.5, step: 0.01, default: 0.08 },
      { name: 'Distortion', key: 'uDistort', type: 'slider', min: 0.0, max: 1.0, step: 0.05, default: 0.35 },
      { name: 'Noise Scale', key: 'uNoiseScale', type: 'slider', min: 1.0, max: 10.0, step: 0.5, default: 4.0 },
      { name: 'Hue A', key: 'uHueA', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.85 },
      { name: 'Hue B', key: 'uHueB', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.15 },
      { name: 'Glow', key: 'uGlow', type: 'slider', min: 0.0, max: 1.0, step: 0.05, default: 0.5 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.2, max: 2.0, step: 0.05, default: 1.2 },
    ]
  },

  lavaLamp3DGlass: {
    name: 'Lava Lamp 3D Glass',
    icon: 'lavaLamp',
    description: 'Ray‑marched 3D metaballs with glassy shading',
    category: 'organic',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime; uniform float uSpeed; uniform float uBlobCount; uniform float uRadius; uniform float uDriftAmp; uniform float uDriftFreq; uniform float uShininess; uniform float uFresnel; uniform float uLightIntensity; uniform vec3 uLightDir;

      float hash(float n){ return fract(sin(n)*43758.5453);} 
      vec3 getCenter(float i, float t){
        float seed = i*12.9;
        vec3 dir = normalize(vec3(hash(seed)-0.5, hash(seed*1.3)-0.5, hash(seed*2.1)-0.5)+1e-6);
        vec3 c = dir * 0.6;
        c += vec3(
          sin(uDriftFreq*t + seed),
          cos(uDriftFreq*t*0.8 + seed*1.7),
          sin(uDriftFreq*t*1.2 + seed*2.3)
        ) * (0.5*uDriftAmp);
        return c;
      }

      float sdf(vec3 p, float t){
        float field = 0.0;
        for(int i=0;i<24;i++){
          float fi=float(i); if(fi>=uBlobCount) break;
          vec3 c = getCenter(fi, t);
          float d = length(p - c);
          field += uRadius / (d + 1e-3);
        }
        // Isosurface value (metaball threshold)
        return 1.2 - field; // negative inside
      }

      vec3 calcNormal(vec3 p, float t){
        float e = 0.002;
        vec2 h = vec2(1.0,-1.0)*0.5773;
        return normalize( h.xyy*sdf(p + h.xyy*e, t) +
                          h.yyx*sdf(p + h.yyx*e, t) +
                          h.yxy*sdf(p + h.yxy*e, t) +
                          h.xxx*sdf(p + h.xxx*e, t) );
      }

      void main(){
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= (1280.0/720.0); // mild aspect guess
        float t = uTime * uSpeed;

        // Camera
        vec3 ro = vec3(0.0, 0.0, 2.2);
        vec3 rd = normalize(vec3(uv, -1.8));

        // Raymarch
        float d=0.0; float total=0.0; vec3 p=ro; bool hit=false;
        for(int i=0;i<96;i++){
          p = ro + rd * total;
          float sd = sdf(p, t);
          if(sd < 0.001){ hit=true; break; }
          float stepSize = clamp(abs(sd)*0.7, 0.01, 0.2);
          total += stepSize;
          if(total>6.0) break;
        }

        vec3 col = vec3(0.0);
        if(hit){
          vec3 n = calcNormal(p, t);
          float ndl = max(dot(n, normalize(uLightDir)), 0.0);
          float spec = pow(max(dot(reflect(-normalize(uLightDir), n), -rd), 0.0), uShininess);
          float fr = pow(1.0 - max(dot(n, -rd), 0.0), uFresnel);
          vec3 base = mix(vec3(0.1,0.0,0.2), vec3(1.0,0.4,0.8), ndl);
          col = base * (0.2 + 0.8*ndl) * uLightIntensity + spec*0.5 + fr*0.6;
        } else {
          col = vec3(0.02,0.02,0.04);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:0.8}, uBlobCount:{value:10.0}, uRadius:{value:0.35}, uDriftAmp:{value:0.8}, uDriftFreq:{value:1.0}, uShininess:{value:32.0}, uFresnel:{value:3.0}, uLightIntensity:{value:1.0}, uLightDir:{ value: [ -0.3, 0.8, 0.5 ] } },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 2.5, step: 0.05, default: 0.8 },
      { name: 'Blob Count', key: 'uBlobCount', type: 'slider', min: 1, max: 24, step: 1, default: 10 },
      { name: 'Radius', key: 'uRadius', type: 'slider', min: 0.1, max: 0.7, step: 0.02, default: 0.35 },
      { name: 'Drift Amp', key: 'uDriftAmp', type: 'slider', min: 0.0, max: 1.5, step: 0.05, default: 0.8 },
      { name: 'Drift Freq', key: 'uDriftFreq', type: 'slider', min: 0.1, max: 3.0, step: 0.05, default: 1.0 },
      { name: 'Shininess', key: 'uShininess', type: 'slider', min: 4, max: 128, step: 1, default: 32 },
      { name: 'Fresnel', key: 'uFresnel', type: 'slider', min: 0.5, max: 6.0, step: 0.1, default: 3.0 },
      { name: 'Light Intensity', key: 'uLightIntensity', type: 'slider', min: 0.2, max: 2.5, step: 0.05, default: 1.0 },
    ]
  },

  lavaLampBubbles: {
    name: 'Lava Lamp Bubbles',
    icon: 'lavaLamp',
    description: 'Bubble‑style blobby fluid with outlines',
    category: 'organic',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uBlobCount; uniform float uBlobSizeBase; uniform float uBlobSizeVar; uniform float uRise; uniform float uOutline; uniform float uHue; uniform float uIntensity; varying vec2 vUv;
      float hash(float n){ return fract(sin(n)*43758.5453);} 
      void main(){ vec2 st=vUv; float t=uTime*uSpeed; float field=0.0; for(int i=0;i<64;i++){ float fi=float(i); if(fi>=uBlobCount) break; float seed=fi*17.3; float r=uBlobSizeBase + uBlobSizeVar*hash(seed*3.1); vec2 c=vec2(fract(hash(seed*1.7)), fract(hash(seed*2.1))); c.y = fract(c.y + t*0.05*uRise); c = 0.2 + 0.6*c; field += r/(distance(st,c)+1e-3);} 
        float iso = smoothstep(1.0, 1.1, field);
        float edge = smoothstep(1.1, 1.1+uOutline, field) - smoothstep(1.1+uOutline, 1.2+uOutline, field);
        vec3 base = vec3(0.02,0.06,0.1);
        float hue = uHue + 0.1*iso;
        vec3 bubble = vec3(0.2+0.8*iso, 0.8, 1.0);
        vec3 col = mix(base, bubble, iso) + edge*vec3(0.9,1.0,1.0);
        col *= uIntensity; gl_FragColor=vec4(col,1.0);
      }
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uBlobCount:{value:24.0}, uBlobSizeBase:{value:0.05}, uBlobSizeVar:{value:0.03}, uRise:{value:1.0}, uOutline:{value:0.06}, uHue:{value:0.55}, uIntensity:{value:1.0} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 3.0, step: 0.05, default: 1.0 },
      { name: 'Bubble Count', key: 'uBlobCount', type: 'slider', min: 1, max: 64, step: 1, default: 24 },
      { name: 'Bubble Size', key: 'uBlobSizeBase', type: 'slider', min: 0.02, max: 0.2, step: 0.005, default: 0.05 },
      { name: 'Size Variation', key: 'uBlobSizeVar', type: 'slider', min: 0.0, max: 0.15, step: 0.005, default: 0.03 },
      { name: 'Rise Speed', key: 'uRise', type: 'slider', min: 0.2, max: 3.0, step: 0.05, default: 1.0 },
      { name: 'Outline', key: 'uOutline', type: 'slider', min: 0.0, max: 0.2, step: 0.005, default: 0.06 },
      { name: 'Hue', key: 'uHue', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.55 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.2, max: 2.0, step: 0.05, default: 1.0 },
    ]
  },

  marbleVeins: {
    name: 'Marble Veins',
    icon: 'marbleVeins',
    description: 'Procedural marble with vein turbulence',
    category: 'distortion',
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uScale; uniform float uVeinThickness; uniform float uTurbulence; uniform float uIntensity; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1,0)); float c=hash(i+vec2(0,1)); float d=hash(i+vec2(1,1)); vec2 u=f*f*(3.0-2.0*f); return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y; }
      float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.0; a*=0.5;} return v; }
      void main(){ vec2 st=vUv*uScale; float t=uTime*uSpeed; float n=fbm(st + fbm(st*2.0 + t)*uTurbulence); float veins = abs(sin((st.x + n)*3.1415)); float m = smoothstep(uVeinThickness, 0.0, veins);
        vec3 base = vec3(0.95,0.95,1.0); vec3 vein = vec3(0.1,0.1,0.2); vec3 col = mix(base, vein, m) * uIntensity; gl_FragColor = vec4(col,1.0);} 
    `,
    uniforms: {
      uTime: { value: 0 }, uSpeed: { value: 0.4 }, uScale: { value: 3.0 }, uVeinThickness: { value: 0.2 }, uTurbulence: { value: 2.5 }, uIntensity: { value: 1.0 }
    },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.0, max: 1.5, step: 0.05, default: 0.4 },
      { name: 'Scale', key: 'uScale', type: 'slider', min: 1.0, max: 8.0, step: 0.5, default: 3.0 },
      { name: 'Vein Thickness', key: 'uVeinThickness', type: 'slider', min: 0.0, max: 0.6, step: 0.02, default: 0.2 },
      { name: 'Turbulence', key: 'uTurbulence', type: 'slider', min: 0.5, max: 5.0, step: 0.1, default: 2.5 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.2, max: 2.0, step: 0.1, default: 1.0 }
    ]
  },

  gradientTunnel: {
    name: 'Gradient Tunnel',
    icon: 'gradientTunnel',
    description: 'Hypnotic radial tunnel with twist',
    category: 'distortion',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uTwist; uniform float uSegments; uniform float uBrightness; varying vec2 vUv;
      vec3 hsv2rgb(vec3 c){ vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0); vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www); return c.z*mix(K.xxx, clamp(p-K.xxx, 0.0,1.0), c.y);} 
      void main(){ vec2 st=vUv-0.5; float r=length(st); float a=atan(st.y,st.x); float t=uTime*uSpeed; a += r*uTwist + t*0.5; float bands = sin(a*uSegments + r*20.0 - t*2.0);
        float v = smoothstep(-0.1,0.9,bands); vec3 col = hsv2rgb(vec3(fract(a/6.2831), 0.8, v*uBrightness)); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.2}, uTwist:{value:3.0}, uSegments:{value:12.0}, uBrightness:{value:1.0} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.2, max: 4.0, step: 0.1, default: 1.2 },
      { name: 'Twist', key: 'uTwist', type: 'slider', min: 0.0, max: 8.0, step: 0.2, default: 3.0 },
      { name: 'Segments', key: 'uSegments', type: 'slider', min: 4, max: 40, step: 1, default: 12 },
      { name: 'Brightness', key: 'uBrightness', type: 'slider', min: 0.2, max: 2.0, step: 0.1, default: 1.0 }
    ]
  },

  windTunnel: {
    name: 'Wind Tunnel',
    icon: 'windTunnel',
    description: 'Streamlines flowing through a tunnel',
    category: 'particle',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uFreq; uniform float uFlow; uniform float uContrast; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1,0)); float c=hash(i+vec2(0,1)); float d=hash(i+vec2(1,1)); vec2 u=f*f*(3.0-2.0*f); return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y; }
      void main(){ vec2 st=vUv; float t=uTime*uSpeed; float field = sin(st.y*uFreq + noise(st*4.0 + t)*6.0 + t*4.0);
        float lanes = smoothstep(0.6+uContrast, 0.7+uContrast, field*uFlow);
        vec3 col = mix(vec3(0.02,0.03,0.05), vec3(0.6,0.9,1.0), lanes);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uFreq:{value:30.0}, uFlow:{value:1.0}, uContrast:{value:0.0} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.2, max: 5.0, step: 0.1, default: 1.0 },
      { name: 'Frequency', key: 'uFreq', type: 'slider', min: 10, max: 80, step: 2, default: 30 },
      { name: 'Flow Strength', key: 'uFlow', type: 'slider', min: 0.5, max: 2.0, step: 0.05, default: 1.0 },
      { name: 'Contrast', key: 'uContrast', type: 'slider', min: -0.3, max: 0.5, step: 0.05, default: 0.0 }
    ]
  },

  bioGoo: {
    name: 'Bio Goo',
    icon: 'bioGoo',
    description: 'Organic dripping goo dynamics',
    category: 'organic',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uDrip; uniform float uPulse; uniform float uIntensity; varying vec2 vUv;
      float s(float x){ return smoothstep(0.0,1.0,x); }
      void main(){ vec2 st=vUv; float t=uTime*uSpeed; float rip = sin(st.x*10.0 + t*3.0)*0.1 + sin(st.x*3.0 + t*0.7)*0.05; st.y += rip*uDrip; float blobs = s(0.7 - abs(sin(st.y*15.0 - t*2.0)));
        float beat = 0.7 + 0.3*sin(t*uPulse);
        vec3 col = mix(vec3(0.0,0.02,0.05), vec3(0.2,1.0,0.6), blobs*beat) * uIntensity;
        gl_FragColor = vec4(col, 1.0); }
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uDrip:{value:1.0}, uPulse:{value:2.0}, uIntensity:{value:1.0} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.2, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Drip Amount', key: 'uDrip', type: 'slider', min: 0.4, max: 2.0, step: 0.05, default: 1.0 },
      { name: 'Pulse', key: 'uPulse', type: 'slider', min: 0.5, max: 6.0, step: 0.1, default: 2.0 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.2, max: 2.0, step: 0.1, default: 1.0 }
    ]
  },

  waterCaustics: {
    name: 'Water Caustics',
    icon: 'waterCaustics',
    description: 'Shimmering underwater light patterns',
    category: 'water',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uScale; uniform float uSharp; uniform float uIntensity; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1,0)); float c=hash(i+vec2(0,1)); float d=hash(i+vec2(1,1)); vec2 u=f*f*(3.0-2.0*f); return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y; }
      float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5;} return v; }
      void main(){ vec2 st=(vUv-0.5)*uScale; float t=uTime*uSpeed; float n = fbm(st + fbm(st+ t*0.2)); float lines = pow(abs(sin((st.x+st.y)*10.0 + n*8.0 + t*3.0)), 10.0*uSharp);
        vec3 water = mix(vec3(0.0,0.2,0.5), vec3(0.0,0.7,1.0), 0.6);
        vec3 col = water + vec3(lines)*uIntensity; gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uScale:{value:2.0}, uSharp:{value:0.3}, uIntensity:{value:0.6} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.2, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Scale', key: 'uScale', type: 'slider', min: 1.0, max: 6.0, step: 0.2, default: 2.0 },
      { name: 'Sharpness', key: 'uSharp', type: 'slider', min: 0.1, max: 1.0, step: 0.05, default: 0.3 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.2, max: 1.5, step: 0.05, default: 0.6 }
    ]
  }

,
  // ——— New batch of advanced effects ———
  crystalGrowth: {
    name: 'Crystal Growth',
    icon: 'crystalGrowth',
    description: 'Procedural crystal seeds expanding with facets',
    category: 'crystal',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uSharp; uniform float uScale; uniform float uHue; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453);} 
      float voronoi(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float m=8.0; for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){ vec2 g=vec2(float(x),float(y)); vec2 o=vec2(hash(i+g), hash(i+g+1.23)); o=0.5+0.5*sin(uTime*uSpeed+6.2831*o); vec2 r=g+o-f; float d=dot(r,r); m=min(m,d);} return m; }
      vec3 hsv2rgb(vec3 c){ vec4 K=vec4(1.,2./3.,1./3.,3.); vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www); return c.z*mix(K.xxx, clamp(p-K.xxx,0.,1.), c.y);} 
      void main(){ vec2 st=(vUv-0.5)*uScale; float v=voronoi(st); float edge=smoothstep(uSharp,0.0,v); vec3 col = hsv2rgb(vec3(uHue+v*0.2, 0.6, edge)); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uSharp:{value:0.04}, uScale:{value:6.0}, uHue:{value:0.65} },
    settings: [
      { name: 'Growth Speed', key: 'uSpeed', type: 'slider', min: 0.1, max: 4.0, step: 0.1, default: 1.0 },
      { name: 'Edge Sharpness', key: 'uSharp', type: 'slider', min: 0.005, max: 0.2, step: 0.005, default: 0.04 },
      { name: 'Scale', key: 'uScale', type: 'slider', min: 2.0, max: 12.0, step: 0.5, default: 6.0 },
      { name: 'Hue', key: 'uHue', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.65 }
    ]
  },

  metallicIridescence: {
    name: 'Metallic Iridescence',
    icon: 'metallicIridescence',
    description: 'Thin‑film interference rainbow sheen',
    category: 'distortion',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uRoughness; uniform float uHueShift; uniform float uIntensity; varying vec2 vUv;
      vec3 hsv2rgb(vec3 c){ vec4 K=vec4(1.,2./3.,1./3.,3.); vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www); return c.z*mix(K.xxx, clamp(p-K.xxx,0.,1.), c.y);} 
      void main(){ vec2 st=vUv-0.5; float t=uTime*uSpeed; float angle=atan(st.y,st.x); float rad=length(st); float film = sin(30.0*rad + 8.0*angle + t*2.0); float micro = sin((st.x*st.y)*150.0 + t*3.0)*uRoughness; 
        float hue = fract(uHueShift + film*0.15 + micro*0.05);
        vec3 col = hsv2rgb(vec3(hue, 0.9, (0.6+0.4*sin(film))*uIntensity)); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uRoughness:{value:0.4}, uHueShift:{value:0.0}, uIntensity:{value:1.0} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.0, max: 4.0, step: 0.1, default: 1.0 },
      { name: 'Micro Roughness', key: 'uRoughness', type: 'slider', min: 0.0, max: 1.0, step: 0.05, default: 0.4 },
      { name: 'Hue Shift', key: 'uHueShift', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.0 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.3, max: 2.0, step: 0.05, default: 1.0 }
    ]
  },

  smokeVortex: {
    name: 'Smoke Vortex',
    icon: 'smokeVortex',
    description: 'FBM smoke swirling into a vortex',
    category: 'particle',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uSwirl; uniform float uDensity; uniform float uBrightness; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453);} 
      float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1,0)); float c=hash(i+vec2(0,1)); float d=hash(i+vec2(1,1)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
      float fbm(vec2 p){ float v=0.; float a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p*=2.; a*=0.5;} return v; }
      void main(){ vec2 st=vUv-0.5; float t=uTime*uSpeed; float ang=atan(st.y,st.x); float r=length(st); ang += r*uSwirl + t*0.5; vec2 uv = vec2(cos(ang), sin(ang))*r * uDensity; float d = fbm(uv + fbm(uv+t*0.2)); float smoke = smoothstep(0.4,1.0,d);
        vec3 col = mix(vec3(0.02,0.02,0.03), vec3(0.9), smoke*uBrightness); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uSwirl:{value:3.0}, uDensity:{value:2.0}, uBrightness:{value:0.7} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.2, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Swirl', key: 'uSwirl', type: 'slider', min: 0.0, max: 8.0, step: 0.2, default: 3.0 },
      { name: 'Density', key: 'uDensity', type: 'slider', min: 0.5, max: 6.0, step: 0.2, default: 2.0 },
      { name: 'Brightness', key: 'uBrightness', type: 'slider', min: 0.2, max: 1.5, step: 0.05, default: 0.7 }
    ]
  },

  sandRipples: {
    name: 'Sand Ripples',
    icon: 'sandRipples',
    description: 'Wind‑shaped dune ripples interference',
    category: 'organic',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uAmplitude; uniform float uSpacing; uniform float uAngle; varying vec2 vUv;
      mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c);} 
      void main(){ vec2 st=vUv*2.0; st = rot(uAngle) * (st-vec2(1.0)); float t=uTime*uSpeed; float wave1 = sin(st.x*uSpacing + t*2.0);
        float wave2 = sin(st.x*uSpacing*0.7 + st.y*0.3 + t*1.2);
        float h = wave1*0.6 + wave2*0.4; vec3 col = mix(vec3(0.85,0.78,0.65), vec3(0.93,0.88,0.76), 0.5 + 0.5*h*uAmplitude); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:0.6}, uAmplitude:{value:0.8}, uSpacing:{value:18.0}, uAngle:{value:0.2} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.0, max: 2.0, step: 0.05, default: 0.6 },
      { name: 'Amplitude', key: 'uAmplitude', type: 'slider', min: 0.0, max: 2.0, step: 0.05, default: 0.8 },
      { name: 'Spacing', key: 'uSpacing', type: 'slider', min: 6, max: 40, step: 1, default: 18 },
      { name: 'Angle', key: 'uAngle', type: 'slider', min: -1.57, max: 1.57, step: 0.01, default: 0.2 }
    ]
  },

  lsystemBranches: {
    name: 'L‑System Branches',
    icon: 'lsystemBranches',
    description: 'Recursive branching kaleidoscope',
    category: 'fractal',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uSegments; uniform float uDepth; varying vec2 vUv;
      float branch(vec2 p){ float a=atan(p.y,p.x); float r=length(p); float k=abs(fract(a/6.2831*uSegments)*2.0-1.0); return smoothstep(0.0, 0.02, 0.02-k*r); }
      void main(){ vec2 st=(vUv-0.5)*2.0; float t=uTime*uSpeed; float s=1.0; float acc=0.0; for(int i=0;i<12;i++){ st=mat2(cos(0.5),-sin(0.5),sin(0.5),cos(0.5))*st*1.1 + 0.05*vec2(sin(t+i), cos(t*0.7+i)); acc += branch(st)*pow(0.9, float(i)); if(float(i)>uDepth) break; }
        vec3 col = mix(vec3(0.02,0.01,0.03), vec3(0.6,1.0,0.8), acc); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:0.6}, uSegments:{value:8.0}, uDepth:{value:8.0} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.0, max: 2.0, step: 0.05, default: 0.6 },
      { name: 'Segments', key: 'uSegments', type: 'slider', min: 4, max: 24, step: 1, default: 8 },
      { name: 'Depth', key: 'uDepth', type: 'slider', min: 3, max: 12, step: 1, default: 8 }
    ]
  },

  proteinFold: {
    name: 'Protein Fold',
    icon: 'proteinFold',
    description: 'Iterated folding space map',
    category: 'organic',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uIter; uniform float uFold; varying vec2 vUv;
      vec2 fold(vec2 p){ p=abs(p); p = p*mat2(0.8, -0.6, 0.6, 0.8); return p-0.3; }
      void main(){ vec2 z=(vUv-0.5)*2.0; float t=uTime*uSpeed; z*=0.7+0.3*sin(t*0.5); float m=0.0; for(int i=0;i<24;i++){ if(float(i)>uIter) break; z = mix(z, fold(z), uFold); m += exp(-length(z)*2.0); }
        vec3 col = vec3(0.2,0.9,0.8)*m; gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uIter:{value:12.0}, uFold:{value:0.7} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.0, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Iterations', key: 'uIter', type: 'slider', min: 4, max: 24, step: 1, default: 12 },
      { name: 'Fold Strength', key: 'uFold', type: 'slider', min: 0.0, max: 1.0, step: 0.05, default: 0.7 }
    ]
  },

  muscleFibers: {
    name: 'Muscle Fibers',
    icon: 'muscleFibers',
    description: 'Anisotropic striations with flex',
    category: 'organic',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uStriation; uniform float uFlex; uniform float uTension; varying vec2 vUv;
      void main(){ vec2 st=vUv; float t=uTime*uSpeed; st.y += sin(st.x*8.0 + t*2.0)*0.05*uFlex; float stripes = 0.5+0.5*sin(st.x*uStriation + t*3.0); float tension = 0.5+0.5*sin(st.y*10.0 + t*4.0)*uTension; 
        vec3 col = mix(vec3(0.6,0.1,0.2), vec3(1.0,0.4,0.5), stripes)* (0.7+0.3*tension); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uStriation:{value:40.0}, uFlex:{value:1.0}, uTension:{value:0.6} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.0, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Striation', key: 'uStriation', type: 'slider', min: 10, max: 120, step: 2, default: 40 },
      { name: 'Flex', key: 'uFlex', type: 'slider', min: 0.0, max: 2.0, step: 0.05, default: 1.0 },
      { name: 'Tension', key: 'uTension', type: 'slider', min: 0.0, max: 1.0, step: 0.05, default: 0.6 }
    ]
  },

  materialBend: {
    name: 'Material Bend',
    icon: 'materialBend',
    description: 'Curvature gradient bending',
    category: 'distortion',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uBendX; uniform float uBendY; varying vec2 vUv; 
      void main(){ vec2 st=vUv-0.5; float bx = st.x*st.x*uBendX; float by = st.y*st.y*uBendY; float shade = 0.5 + 0.5*(bx - by); vec3 col = mix(vec3(0.1,0.1,0.15), vec3(0.9,0.9,1.0), shade); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uBendX:{value:1.0}, uBendY:{value:1.0} },
    settings: [
      { name: 'Bend X', key: 'uBendX', type: 'slider', min: -4.0, max: 4.0, step: 0.1, default: 1.0 },
      { name: 'Bend Y', key: 'uBendY', type: 'slider', min: -4.0, max: 4.0, step: 0.1, default: 1.0 }
    ]
  },

  fractalKaleidoscope: {
    name: 'Fractal Kaleidoscope',
    icon: 'fractalKaleidoscope',
    description: 'Segmented kaleidoscopic fractal zoom',
    category: 'fractal',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uSegments; uniform float uZoom; varying vec2 vUv;
      vec2 kale(vec2 p){ float a=atan(p.y,p.x); float r=length(p); float seg=6.2831/uSegments; a = mod(a, seg); a = abs(a - seg*0.5); return vec2(cos(a), sin(a))*r; }
      void main(){ vec2 st=(vUv-0.5)*2.0; float t=uTime*uSpeed; st *= (1.0 + 0.2*sin(t*0.5))*uZoom; vec2 k=kale(st); float rings = sin(length(k)*20.0 - t*3.0); float v = smoothstep(-0.1,0.8,rings);
        vec3 col = mix(vec3(0.02,0.02,0.05), vec3(0.8,0.5,1.0), v); gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uSegments:{value:8.0}, uZoom:{value:1.0} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.0, max: 4.0, step: 0.1, default: 1.0 },
      { name: 'Segments', key: 'uSegments', type: 'slider', min: 4, max: 24, step: 1, default: 8 },
      { name: 'Zoom', key: 'uZoom', type: 'slider', min: 0.5, max: 2.0, step: 0.05, default: 1.0 }
    ]
  },

  starNursery: {
    name: 'Star Nursery',
    icon: 'starNursery',
    description: 'Stellar birth clouds with twinkles',
    category: 'cosmic',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uSpeed; uniform float uStarDensity; uniform float uTwinkle; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453123);} 
      void main(){ vec2 st=vUv*vec2(200.0, 200.0); float t=uTime*uSpeed; float stars=0.0; for(int i=0;i<4;i++){ vec2 cell=floor(st*pow(0.5,float(i))); stars += step(0.995, hash(cell+1.23))* (0.5+0.5*sin(t*uTwinkle + hash(cell)*6.2831)); }
        vec3 neb = vec3(0.02,0.02,0.06) + vec3(0.2,0.1,0.4)*sin(vUv.x*6.0 + t*0.3) + vec3(0.1,0.2,0.3)*sin(vUv.y*5.0 - t*0.2);
        vec3 col = neb + vec3(stars)*uStarDensity; gl_FragColor=vec4(col,1.0);} 
    `,
    uniforms: { uTime:{value:0}, uSpeed:{value:1.0}, uStarDensity:{value:0.8}, uTwinkle:{value:3.0} },
    settings: [
      { name: 'Speed', key: 'uSpeed', type: 'slider', min: 0.0, max: 3.0, step: 0.1, default: 1.0 },
      { name: 'Star Density', key: 'uStarDensity', type: 'slider', min: 0.2, max: 2.0, step: 0.05, default: 0.8 },
      { name: 'Twinkle', key: 'uTwinkle', type: 'slider', min: 0.5, max: 8.0, step: 0.1, default: 3.0 }
    ]
  },

  // BACKGROUNDS CATEGORY
  softGradientLight: {
    name: 'Soft Gradient Light',
    icon: 'cosmicAurora',
    description: 'Beautiful soft directional/radial gradient with light controls',
    category: 'backgrounds',
    vertexShader: `
      varying vec2 vUv;
      void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
    `,
    fragmentShader: `
      uniform float uTime; uniform float uIntensity; uniform float uRadius; uniform float uLightAngleDeg; uniform float uAzimuthDeg; 
      uniform float uLayerCount; uniform float uNoiseStrength; uniform float uNoiseScale; uniform float uNoiseSpeed; uniform float uGamma;
      uniform float uLightX; uniform float uLightY; uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)))*43758.5453123);} 
      float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1.,0.)); float c=hash(i+vec2(0.,1.)); float d=hash(i+vec2(1.,1.)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
      float fbm(vec2 p){ float v=0.; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.; a*=0.5; } return v; }
      void main(){ vec2 st=vUv; vec2 lightPos=vec2(uLightX,uLightY); float ang=radians(uLightAngleDeg); vec2 dir=vec2(cos(ang), sin(ang));
        // Azimuth tilt (fake 3D) by skewing Y based on X
        float az=radians(uAzimuthDeg); vec2 st2 = st; st2.y += (st.x-0.5)*tan(az)*0.25; 
        float d = distance(st2, lightPos);
        float radial = 1.0 - smoothstep(0.0, max(0.0001,uRadius), d);
        vec2 toPix = normalize(st2 - lightPos + 1e-5);
        float directional = clamp(dot(normalize(dir), toPix)*0.5 + 0.5, 0.0, 1.0);
        float t = clamp(radial*0.7 + directional*0.3, 0.0, 1.0);
        // Layered subtle banding with animated fbm
        float bands = 0.0; vec2 q = st2 * uNoiseScale; float time = uTime * uNoiseSpeed; 
        for(int i=0;i<5;i++){
          float active = step(float(i), max(0.0, uLayerCount-1.0));
          float n = fbm(q + float(i)*2.37 + time);
          bands += active * (sin(t*3.1415*float(i+1) + n*3.0) * 0.5 + 0.5);
        }
        bands /= max(1.0, uLayerCount);
        float mixT = clamp(t + bands * uNoiseStrength * 0.5, 0.0, 1.0);
        vec3 base = mix(uColor1, uColor2, mixT);
        vec3 col = mix(base, uColor3, smoothstep(0.6, 1.0, mixT));
        col *= uIntensity;
        col = pow(col, vec3(1.0/(0.0001+uGamma)));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 }, uIntensity: { value: 1.0 }, uRadius: { value: 0.6 }, uLightAngleDeg: { value: 45.0 }, uAzimuthDeg: { value: 0.0 },
      uLayerCount: { value: 3.0 }, uNoiseStrength: { value: 0.3 }, uNoiseScale: { value: 3.0 }, uNoiseSpeed: { value: 0.4 }, uGamma: { value: 1.0 },
      uLightX: { value: 0.3 }, uLightY: { value: 0.4 },
      uColor1: { value: [0.10, 0.12, 0.25] }, uColor2: { value: [0.35, 0.60, 1.00] }, uColor3: { value: [1.00, 0.85, 0.60] }
    },
    settings: [
      { name: 'Light Angle', key: 'uLightAngleDeg', type: 'slider', min: 0, max: 360, step: 1, default: 45 },
      { name: 'Azimuth', key: 'uAzimuthDeg', type: 'slider', min: -60, max: 60, step: 1, default: 0 },
      { name: 'Light X', key: 'uLightX', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.3 },
      { name: 'Light Y', key: 'uLightY', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.4 },
      { name: 'Radius', key: 'uRadius', type: 'slider', min: 0.05, max: 1.2, step: 0.01, default: 0.6 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.2, max: 3.0, step: 0.05, default: 1.0 },
      { name: 'Layers', key: 'uLayerCount', type: 'slider', min: 1, max: 5, step: 1, default: 3 },
      { name: 'Noise Strength', key: 'uNoiseStrength', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.3 },
      { name: 'Noise Scale', key: 'uNoiseScale', type: 'slider', min: 0.5, max: 10.0, step: 0.1, default: 3.0 },
      { name: 'Noise Speed', key: 'uNoiseSpeed', type: 'slider', min: 0.0, max: 5.0, step: 0.1, default: 0.4 },
      { name: 'Gamma', key: 'uGamma', type: 'slider', min: 0.5, max: 2.5, step: 0.05, default: 1.0 },
      { name: 'Color A', key: 'uColor1', type: 'color', default: [0.10, 0.12, 0.25] },
      { name: 'Color B', key: 'uColor2', type: 'color', default: [0.35, 0.60, 1.00] },
      { name: 'Accent', key: 'uColor3', type: 'color', default: [1.00, 0.85, 0.60] }
    ]
  },

  sunriseHorizon: {
    name: 'Sunrise Horizon',
    icon: 'nebulaCrystal',
    description: 'Horizon gradient with sun glow and adjustable azimuth',
    category: 'backgrounds',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uIntensity; uniform float uSunX; uniform float uSunSize; uniform float uGlow; 
      uniform float uHorizonY; uniform float uBandSharpness; uniform float uAzimuthDeg; uniform vec3 uSkyTop; uniform vec3 uSkyBottom; uniform vec3 uSunColor; varying vec2 vUv;
      vec3 mix3(vec3 a, vec3 b, float t){ return a*(1.0-t)+b*t; }
      void main(){ vec2 st = vUv; float az = radians(uAzimuthDeg); mat2 rot = mat2(cos(az), -sin(az), sin(az), cos(az)); st = (rot*(st-0.5))+0.5; 
        float t = smoothstep(0.0, 1.0, st.y); vec3 sky = mix3(uSkyBottom, uSkyTop, pow(t, 1.2));
        float sun = 1.0 - smoothstep(0.0, uSunSize, distance(st, vec2(uSunX, uHorizonY)));
        float glow = exp(-distance(st, vec2(uSunX, uHorizonY))*10.0) * uGlow;
        float bands = smoothstep(0.0, 1.0, sin((st.y - uHorizonY)*20.0) * 0.5 + 0.5);
        bands = pow(bands, uBandSharpness);
        vec3 col = sky + uSunColor * (sun * uIntensity + glow*0.6);
        col = mix(col, uSunColor, bands*0.1);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: {
      uTime:{value:0}, uIntensity:{value:1.0}, uSunX:{value:0.5}, uSunSize:{value:0.18}, uGlow:{value:1.0},
      uHorizonY:{value:0.35}, uBandSharpness:{value:2.0}, uAzimuthDeg:{value:0.0},
      uSkyTop:{value:[0.05,0.10,0.25]}, uSkyBottom:{value:[0.95,0.60,0.40]}, uSunColor:{value:[1.0,0.85,0.55]}
    },
    settings: [
      { name: 'Sun X', key: 'uSunX', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5 },
      { name: 'Sun Size', key: 'uSunSize', type: 'slider', min: 0.05, max: 0.6, step: 0.01, default: 0.18 },
      { name: 'Intensity', key: 'uIntensity', type: 'slider', min: 0.2, max: 3.0, step: 0.05, default: 1.0 },
      { name: 'Glow', key: 'uGlow', type: 'slider', min: 0.0, max: 2.0, step: 0.05, default: 1.0 },
      { name: 'Horizon Y', key: 'uHorizonY', type: 'slider', min: 0.0, max: 1.0, step: 0.01, default: 0.35 },
      { name: 'Band Sharpness', key: 'uBandSharpness', type: 'slider', min: 0.5, max: 6.0, step: 0.1, default: 2.0 },
      { name: 'Azimuth', key: 'uAzimuthDeg', type: 'slider', min: -60, max: 60, step: 1, default: 0 },
      { name: 'Sky Top', key: 'uSkyTop', type: 'color', default: [0.05,0.10,0.25] },
      { name: 'Sky Bottom', key: 'uSkyBottom', type: 'color', default: [0.95,0.60,0.40] },
      { name: 'Sun Color', key: 'uSunColor', type: 'color', default: [1.0,0.85,0.55] }
    ]
  },

  auroraGradientBands: {
    name: 'Aurora Gradient Bands',
    icon: 'quantumField',
    description: 'Layered flowing gradient bands with angle, azimuth and colors',
    category: 'backgrounds',
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      uniform float uTime; uniform float uAngleDeg; uniform float uAzimuthDeg; uniform float uBandCount; uniform float uBandScale; 
      uniform float uNoiseStrength; uniform float uNoiseSpeed; uniform vec3 uColorA; uniform vec3 uColorB; varying vec2 vUv;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453123);} 
      float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); float a=hash(i); float b=hash(i+vec2(1.,0.)); float c=hash(i+vec2(0.,1.)); float d=hash(i+vec2(1.,1.)); vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
      float fbm(vec2 p){ float v=0.; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.; a*=0.5; } return v; }
      void main(){ vec2 st=vUv-0.5; float ang=radians(uAngleDeg); mat2 rot=mat2(cos(ang),-sin(ang),sin(ang),cos(ang)); st=rot*st; st+=0.5; 
        float az=radians(uAzimuthDeg); st.y += (st.x-0.5)*tan(az)*0.3; 
        float t = st.x * uBandScale + fbm(st*3.0 + uTime*uNoiseSpeed)*uNoiseStrength*3.0;
        float bands=0.0; for(int i=0;i<8;i++){ float active = step(float(i), uBandCount-1.0); bands += active * (sin(t + float(i)*0.7) * 0.5 + 0.5); }
        bands /= max(1.0, uBandCount);
        vec3 col = mix(uColorA, uColorB, bands);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: {
      uTime:{value:0}, uAngleDeg:{value:20.0}, uAzimuthDeg:{value:0.0}, uBandCount:{value:5.0}, uBandScale:{value:8.0}, uNoiseStrength:{value:0.3}, uNoiseSpeed:{value:0.5},
      uColorA:{value:[0.1,0.2,0.6]}, uColorB:{value:[0.8,0.9,1.0]}
    },
    settings: [
      { name: 'Angle', key: 'uAngleDeg', type: 'slider', min: 0, max: 360, step: 1, default: 20 },
      { name: 'Azimuth', key: 'uAzimuthDeg', type: 'slider', min: -60, max: 60, step: 1, default: 0 },
      { name: 'Band Count', key: 'uBandCount', type: 'slider', min: 1, max: 8, step: 1, default: 5 },
      { name: 'Band Scale', key: 'uBandScale', type: 'slider', min: 2, max: 20, step: 1, default: 8 },
      { name: 'Noise Strength', key: 'uNoiseStrength', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.3 },
      { name: 'Noise Speed', key: 'uNoiseSpeed', type: 'slider', min: 0, max: 3, step: 0.05, default: 0.5 },
      { name: 'Color A', key: 'uColorA', type: 'color', default: [0.1,0.2,0.6] },
      { name: 'Color B', key: 'uColorB', type: 'color', default: [0.8,0.9,1.0] }
    ]
  }

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
  distortion: 'Distortion & Warping',
  backgrounds: 'Backgrounds & Gradients'
};