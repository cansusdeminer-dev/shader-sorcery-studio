import React from 'react';

interface AnimatedIconProps {
  type: string;
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({ type, className = "w-6 h-6" }) => {
  const icons = {
    cosmicAurora: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="aurora1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88">
              <animate attributeName="stopColor" values="#00ff88;#0088ff;#8800ff;#00ff88" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#8800ff">
              <animate attributeName="stopColor" values="#8800ff;#ff0088;#00ff88;#8800ff" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path d="M2 12 Q6 8 12 12 T22 12" stroke="url(#aurora1)" strokeWidth="2" fill="none" opacity="0.8">
          <animate attributeName="d" values="M2 12 Q6 8 12 12 T22 12;M2 12 Q6 16 12 12 T22 12;M2 12 Q6 8 12 12 T22 12" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M2 10 Q8 6 14 10 T22 10" stroke="url(#aurora1)" strokeWidth="1.5" fill="none" opacity="0.6">
          <animate attributeName="d" values="M2 10 Q8 6 14 10 T22 10;M2 10 Q8 14 14 10 T22 10;M2 10 Q8 6 14 10 T22 10" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M2 14 Q10 10 16 14 T22 14" stroke="url(#aurora1)" strokeWidth="1" fill="none" opacity="0.4">
          <animate attributeName="d" values="M2 14 Q10 10 16 14 T22 14;M2 14 Q10 18 16 14 T22 14;M2 14 Q10 10 16 14 T22 14" dur="3s" repeatCount="indefinite" />
        </path>
      </svg>
    ),

    plasmaField: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <radialGradient id="plasma1">
            <stop offset="0%" stopColor="#ffff00">
              <animate attributeName="stopColor" values="#ffff00;#ff8800;#ff0088;#ffff00" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ff0088">
              <animate attributeName="stopColor" values="#ff0088;#8800ff;#ffff00;#ff0088" dur="1.5s" repeatCount="indefinite" />
            </stop>
          </radialGradient>
        </defs>
        <circle cx="8" cy="8" r="3" fill="url(#plasma1)" opacity="0.7">
          <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite" />
          <animate attributeName="cx" values="8;10;8" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="16" cy="16" r="2" fill="url(#plasma1)" opacity="0.5">
          <animate attributeName="r" values="2;4;2" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="16;14;16" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <path d="M8 8 L16 16" stroke="url(#plasma1)" strokeWidth="2" opacity="0.6">
          <animate attributeName="stroke-width" values="2;4;2" dur="1s" repeatCount="indefinite" />
        </path>
      </svg>
    ),

    nebulaCrystal: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="crystal1">
            <stop offset="0%" stopColor="#88ff88">
              <animate attributeName="stopColor" values="#88ff88;#8888ff;#ff88ff;#88ff88" dur="4s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ff88ff">
              <animate attributeName="stopColor" values="#ff88ff;#88ffff;#88ff88;#ff88ff" dur="4s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <polygon points="12,4 16,8 12,12 8,8" fill="url(#crystal1)" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" values="0 12 8;360 12 8" dur="3s" repeatCount="indefinite" />
        </polygon>
        <polygon points="12,12 16,16 12,20 8,16" fill="url(#crystal1)" opacity="0.6">
          <animateTransform attributeName="transform" type="rotate" values="0 12 16;-360 12 16" dur="4s" repeatCount="indefinite" />
        </polygon>
        <circle cx="12" cy="12" r="1" fill="url(#crystal1)">
          <animate attributeName="r" values="1;3;1" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),

    quantumField: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <radialGradient id="quantum1">
            <stop offset="0%" stopColor="#00ffff">
              <animate attributeName="stopColor" values="#00ffff;#0088ff;#8800ff;#00ffff" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#8800ff" stopOpacity="0">
              <animate attributeName="stopColor" values="#8800ff;#ff0088;#00ffff;#8800ff" dur="2s" repeatCount="indefinite" />
            </stop>
          </radialGradient>
        </defs>
        <circle cx="6" cy="6" r="2" fill="url(#quantum1)">
          <animate attributeName="cx" values="6;12;18;6" dur="3s" repeatCount="indefinite" />
          <animate attributeName="cy" values="6;12;6;6" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="18" cy="6" r="1.5" fill="url(#quantum1)">
          <animate attributeName="cx" values="18;6;12;18" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="cy" values="6;18;12;6" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="18" r="1" fill="url(#quantum1)">
          <animate attributeName="cx" values="12;18;6;12" dur="2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="18;12;6;18" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),

    liquidMetal: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="metal1">
            <stop offset="0%" stopColor="#c0c0c0">
              <animate attributeName="stopColor" values="#c0c0c0;#ffffff;#808080;#c0c0c0" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#808080">
              <animate attributeName="stopColor" values="#808080;#c0c0c0;#ffffff;#808080" dur="2s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path d="M2 12 Q12 8 22 12 Q12 16 2 12" fill="url(#metal1)" opacity="0.8">
          <animate attributeName="d" values="M2 12 Q12 8 22 12 Q12 16 2 12;M2 12 Q12 16 22 12 Q12 8 2 12;M2 12 Q12 8 22 12 Q12 16 2 12" dur="3s" repeatCount="indefinite" />
        </path>
        <ellipse cx="12" cy="12" rx="8" ry="2" fill="url(#metal1)" opacity="0.4">
          <animate attributeName="ry" values="2;4;2" dur="2s" repeatCount="indefinite" />
        </ellipse>
      </svg>
    ),

    fractalSpiral: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="fractal1">
            <stop offset="0%" stopColor="#ff8800">
              <animate attributeName="stopColor" values="#ff8800;#ffff00;#ff0088;#ff8800" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ff0088">
              <animate attributeName="stopColor" values="#ff0088;#8800ff;#ff8800;#ff0088" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path d="M12 12 Q16 12 16 8 Q16 4 12 4 Q8 4 8 8 Q8 12 12 12" stroke="url(#fractal1)" strokeWidth="2" fill="none">
          <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="4s" repeatCount="indefinite" />
        </path>
        <path d="M12 12 Q14 12 14 10 Q14 8 12 8 Q10 8 10 10 Q10 12 12 12" stroke="url(#fractal1)" strokeWidth="1.5" fill="none">
          <animateTransform attributeName="transform" type="rotate" values="0 12 12;-360 12 12" dur="3s" repeatCount="indefinite" />
        </path>
        <circle cx="12" cy="12" r="1" fill="url(#fractal1)">
          <animate attributeName="r" values="1;2;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),

    particleStorm: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <radialGradient id="storm1">
            <stop offset="0%" stopColor="#00aaff">
              <animate attributeName="stopColor" values="#00aaff;#ffffff;#00ffff;#00aaff" dur="1s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#0066ff" stopOpacity="0">
              <animate attributeName="stopColor" values="#0066ff;#00aaff;#ffffff;#0066ff" dur="1s" repeatCount="indefinite" />
            </stop>
          </radialGradient>
        </defs>
        {[...Array(6)].map((_, i) => (
          <circle key={i} cx="12" cy="12" r="1" fill="url(#storm1)">
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values={`0 12 12;360 12 12`}
              dur={`${1 + i * 0.2}s`} 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="cx" 
              values={`12;${12 + Math.cos(i * Math.PI / 3) * 8};12`}
              dur={`${1 + i * 0.2}s`} 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="cy" 
              values={`12;${12 + Math.sin(i * Math.PI / 3) * 8};12`}
              dur={`${1 + i * 0.2}s`} 
              repeatCount="indefinite" 
            />
          </circle>
        ))}
      </svg>
    ),

    wormhole: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <radialGradient id="wormhole1">
            <stop offset="0%" stopColor="#000000" />
            <stop offset="40%" stopColor="#4400ff">
              <animate attributeName="stopColor" values="#4400ff;#8800ff;#ff00aa;#4400ff" dur="2s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ff00aa" stopOpacity="0">
              <animate attributeName="stopColor" values="#ff00aa;#ffaa00;#4400ff;#ff00aa" dur="2s" repeatCount="indefinite" />
            </stop>
          </radialGradient>
        </defs>
        {[...Array(4)].map((_, i) => (
          <circle key={i} cx="12" cy="12" r={6 - i * 1.5} fill="none" stroke="url(#wormhole1)" strokeWidth="1" opacity={0.8 - i * 0.15}>
            <animateTransform 
              attributeName="transform" 
              type="rotate" 
              values={`0 12 12;${i % 2 === 0 ? 360 : -360} 12 12`}
              dur={`${2 + i * 0.5}s`} 
              repeatCount="indefinite" 
            />
          </circle>
        ))}
        <circle cx="12" cy="12" r="2" fill="url(#wormhole1)">
          <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),

    // Additional new effect icons
    fireStorm: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="fire1">
            <stop offset="0%" stopColor="#ffff00">
              <animate attributeName="stopColor" values="#ffff00;#ff8800;#ff0000;#ffff00" dur="1s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ff0000">
              <animate attributeName="stopColor" values="#ff0000;#ff8800;#ffff00;#ff0000" dur="1s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path d="M12 20 Q8 16 10 12 Q12 8 14 12 Q16 16 12 20" fill="url(#fire1)">
          <animate attributeName="d" values="M12 20 Q8 16 10 12 Q12 8 14 12 Q16 16 12 20;M12 20 Q6 14 11 10 Q13 6 13 10 Q18 14 12 20;M12 20 Q8 16 10 12 Q12 8 14 12 Q16 16 12 20" dur="1.5s" repeatCount="indefinite" />
        </path>
        <path d="M12 16 Q10 14 11 12 Q12 10 13 12 Q14 14 12 16" fill="url(#fire1)" opacity="0.8">
          <animate attributeName="d" values="M12 16 Q10 14 11 12 Q12 10 13 12 Q14 14 12 16;M12 16 Q9 13 11.5 11 Q12.5 9 12.5 11 Q15 13 12 16;M12 16 Q10 14 11 12 Q12 10 13 12 Q14 14 12 16" dur="1.2s" repeatCount="indefinite" />
        </path>
      </svg>
    ),

    electricWeb: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="electric1">
            <stop offset="0%" stopColor="#00ffff">
              <animate attributeName="stopColor" values="#00ffff;#ffffff;#88aaff;#00ffff" dur="0.8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#8888ff">
              <animate attributeName="stopColor" values="#8888ff;#00ffff;#ffffff;#8888ff" dur="0.8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path d="M4 4 L12 12 L20 4" stroke="url(#electric1)" strokeWidth="2" fill="none">
          <animate attributeName="stroke-width" values="2;4;2" dur="0.5s" repeatCount="indefinite" />
        </path>
        <path d="M4 20 L12 12 L20 20" stroke="url(#electric1)" strokeWidth="2" fill="none">
          <animate attributeName="stroke-width" values="2;4;2" dur="0.7s" repeatCount="indefinite" />
        </path>
        <path d="M4 12 L20 12" stroke="url(#electric1)" strokeWidth="3" fill="none">
          <animate attributeName="stroke-width" values="3;6;3" dur="0.6s" repeatCount="indefinite" />
        </path>
        <circle cx="12" cy="12" r="2" fill="url(#electric1)">
          <animate attributeName="r" values="2;4;2" dur="0.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),

    // New unique animated icons
    lavaLamp: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="lava1">
            <stop offset="0%" stopColor="#ff66aa" />
            <stop offset="100%" stopColor="#ffcc66" />
          </linearGradient>
        </defs>
        <rect x="7" y="3" width="10" height="18" rx="3" stroke="url(#lava1)" />
        {[...Array(4)].map((_,i)=> (
          <ellipse key={i} cx={12} cy={16 - i*3} rx={3 - i*0.5} ry={1.5} fill="url(#lava1)" opacity={0.7 - i*0.15}>
            <animate attributeName="cy" values={`${16 - i*3};${8 + i};${16 - i*3}`} dur={`${2 + i*0.4}s`} repeatCount="indefinite" />
            <animate attributeName="rx" values={`${3 - i*0.5};${2 - i*0.4};${3 - i*0.5}`} dur={`${2 + i*0.5}s`} repeatCount="indefinite" />
          </ellipse>
        ))}
      </svg>
    ),

    marbleVeins: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <defs>
          <linearGradient id="marble1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#cfd8ff" />
          </linearGradient>
        </defs>
        {[...Array(5)].map((_,i)=> (
          <path key={i} d={`M2 ${4+i*4} C 8 ${2+i*2}, 16 ${6+i*2}, 22 ${4+i*4}`} stroke="url(#marble1)" strokeWidth={0.7} opacity={0.4}>
            <animate attributeName="d" values={`M2 ${4+i*4} C 8 ${2+i*2}, 16 ${6+i*2}, 22 ${4+i*4};M2 ${4+i*4} C 8 ${4+i*2}, 16 ${8+i*2}, 22 ${4+i*4};M2 ${4+i*4} C 8 ${2+i*2}, 16 ${6+i*2}, 22 ${4+i*4}`} dur={`${3 + i*0.3}s`} repeatCount="indefinite" />
          </path>
        ))}
      </svg>
    ),

    gradientTunnel: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(5)].map((_, i) => (
          <circle key={i} cx="12" cy="12" r={4 + i*2} stroke="hsl(260,80%,60%)" opacity={0.6 - i*0.1}>
            <animateTransform attributeName="transform" type="rotate" values={`0 12 12;${i%2===0?360:-360} 12 12`} dur={`${2 + i*0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),

    windTunnel: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(6)].map((_, i) => (
          <path key={i} d={`M2 ${4+i*3} Q 12 ${2+i*2}, 22 ${4+i*3}`} stroke="hsl(200,90%,70%)" opacity={0.6}>
            <animate attributeName="d" values={`M2 ${4+i*3} Q 12 ${2+i*2}, 22 ${4+i*3};M2 ${4+i*3} Q 12 ${6+i*2}, 22 ${4+i*3};M2 ${4+i*3} Q 12 ${2+i*2}, 22 ${4+i*3}`} dur={`${1 + i*0.2}s`} repeatCount="indefinite" />
          </path>
        ))}
      </svg>
    ),

    bioGoo: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(4)].map((_, i) => (
          <path key={i} d={`M4 ${6+i*3} C 8 ${8+i*2}, 16 ${4+i*2}, 20 ${6+i*3}`} stroke="hsl(150,80%,60%)" opacity={0.5}>
            <animate attributeName="d" values={`M4 ${6+i*3} C 8 ${8+i*2}, 16 ${4+i*2}, 20 ${6+i*3};M4 ${6+i*3} C 8 ${10+i*2}, 16 ${6+i*2}, 20 ${6+i*3};M4 ${6+i*3} C 8 ${8+i*2}, 16 ${4+i*2}, 20 ${6+i*3}`} dur={`${1.8 + i*0.3}s`} repeatCount="indefinite" />
          </path>
        ))}
      </svg>
    ),

    waterCaustics: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(6)].map((_, i) => (
          <circle key={i} cx="12" cy="12" r={2 + i} stroke="hsl(195,90%,60%)" opacity={0.5 - i*0.06}>
            <animate attributeName="r" values={`${2 + i};${3 + i};${2 + i}`} dur={`${1.5 + i*0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),

    // Newly added icons for advanced effects
    crystalGrowth: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(6)].map((_,i)=> (
          <polygon key={i} points="12,4 16,8 12,12 8,8" stroke="hsl(260,80%,70%)" opacity={0.6 - i*0.08}>
            <animateTransform attributeName="transform" type="rotate" values={`0 12 12;${i%2===0?360:-360} 12 12`} dur={`${2 + i*0.3}s`} repeatCount="indefinite" />
          </polygon>
        ))}
      </svg>
    ),

    metallicIridescence: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(4)].map((_,i)=> (
          <circle key={i} cx="12" cy="12" r={4 + i} stroke="hsl(280,90%,70%)" opacity={0.5 - i*0.1}>
            <animate attributeName="stroke" values="hsl(280,90%,70%);hsl(200,90%,70%);hsl(340,90%,70%);hsl(280,90%,70%)" dur={`${1.5 + i*0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),

    smokeVortex: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(6)].map((_,i)=> (
          <circle key={i} cx="12" cy="12" r={2 + i} stroke="hsl(220,20%,70%)" opacity={0.5 - i*0.07}>
            <animateTransform attributeName="transform" type="rotate" values={`0 12 12;${i%2===0?360:-360} 12 12`} dur={`${2 + i*0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    ),

    sandRipples: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(5)].map((_,i)=> (
          <path key={i} d={`M2 ${6+i*3} Q 12 ${4+i*1.5}, 22 ${6+i*3}`} stroke="hsl(40,60%,70%)" opacity={0.6 - i*0.1}>
            <animate attributeName="d" values={`M2 ${6+i*3} Q 12 ${4+i*1.5}, 22 ${6+i*3};M2 ${6+i*3} Q 12 ${8+i*1.5}, 22 ${6+i*3};M2 ${6+i*3} Q 12 ${4+i*1.5}, 22 ${6+i*3}`} dur={`${2 + i*0.2}s`} repeatCount="indefinite" />
          </path>
        ))}
      </svg>
    ),

    lsystemBranches: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(6)].map((_,i)=> (
          <line key={i} x1="12" y1="12" x2={12 + Math.cos(i*Math.PI/3)*8} y2={12 + Math.sin(i*Math.PI/3)*8} stroke="hsl(150,70%,60%)">
            <animate attributeName="x2" values={`${12 + Math.cos(i*Math.PI/3)*8};${12 + Math.cos(i*Math.PI/3)*6};${12 + Math.cos(i*Math.PI/3)*8}`} dur={`${1.8 + i*0.2}s`} repeatCount="indefinite" />
          </line>
        ))}
      </svg>
    ),

    proteinFold: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <path d="M4 12 C 8 6, 16 18, 20 12" stroke="hsl(180,70%,60%)">
          <animate attributeName="d" values="M4 12 C 8 6, 16 18, 20 12;M4 12 C 6 8, 18 16, 20 12;M4 12 C 8 6, 16 18, 20 12" dur="2s" repeatCount="indefinite" />
        </path>
      </svg>
    ),

    muscleFibers: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(4)].map((_,i)=> (
          <rect key={i} x={4+i*4} y="6" width="2" height="12" fill="hsl(350,70%,60%)">
            <animate attributeName="y" values="6;8;6" dur={`${1 + i*0.2}s`} repeatCount="indefinite" />
          </rect>
        ))}
      </svg>
    ),

    materialBend: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        <path d="M2 12 Q 12 8, 22 12" stroke="hsl(220,60%,70%)">
          <animate attributeName="d" values="M2 12 Q 12 8, 22 12;M2 12 Q 12 16, 22 12;M2 12 Q 12 8, 22 12" dur="2s" repeatCount="indefinite" />
        </path>
      </svg>
    ),

    fractalKaleidoscope: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(6)].map((_,i)=> (
          <polygon key={i} points="12,4 20,12 12,20 4,12" stroke="hsl(290,80%,70%)" opacity={0.6 - i*0.08}>
            <animateTransform attributeName="transform" type="rotate" values={`0 12 12;${i%2===0?360:-360} 12 12`} dur={`${2 + i*0.2}s`} repeatCount="indefinite" />
          </polygon>
        ))}
      </svg>
    ),

    starNursery: (
      <svg viewBox="0 0 24 24" className={className} fill="none">
        {[...Array(12)].map((_,i)=> (
          <circle key={i} cx={Math.random()*24} cy={Math.random()*24} r="1" fill="hsl(260,80%,80%)">
            <animate attributeName="r" values="1;0.5;1" dur={`${0.8 + (i%4)*0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    )
  };

  return icons[type] || icons.cosmicAurora;
};