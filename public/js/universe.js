/* =========================================================
   El Universo GESTARIAN · Three.js
   - Sol: tarjeta dorada (billboard, no gira) con shader de calor
   - 4 planetas orbitando + 4 satélites que les siguen en su traslación
   - Interacción: arrastrar = girar, hover = primer plano,
     click Sol = al frente + pausa + scroll zoom, click planeta = tarjeta
   ========================================================= */
import * as THREE from 'three';

THREE.ColorManagement.enabled = false;

const DEFAULT_PLANS = {
  lite: {
    id: 'lite',
    name: 'Lite',
    tagline: 'El más básico',
    price: 'Gratis',
    period: 'para siempre',
    short: 'Gratis para siempre',
    limit: 'Guardado local en tu dispositivo',
    satellites: [
      { title: 'Gestión Local', chip: '📁 Gestión Local', items: ['Confección de documentos', 'WhatsApp y Email', 'Impresión directa', 'Guardado local en tu equipo'], desc: 'Gestión ágil sin complicaciones: redacta presupuestos y facturas, imprímelos o compártelos directamente sin depender de la nube.', url: 'https://lite-gestarian.web.app' }
    ]
  },
  quick: {
    id: 'quick',
    name: 'Quick',
    tagline: 'El siguiente paso',
    price: 'Gratis',
    period: '+ extras opcionales',
    short: 'Gratis + extras',
    limit: 'Solo facturas',
    satellites: [
      { title: 'Facturación Rápida', chip: '⚡ Facturación Rápida', items: ['BD Clientes y Proveedores', 'Facturas en 1-click', 'OCR facturas recibidas', 'Rastreo por email'], desc: 'Facturación instantánea con base de datos propia y OCR opcional para escanear facturas recibidas automáticamente.', url: 'https://quick-gestarian.web.app' }
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'El profesional',
    price: '59 €',
    period: '/ año',
    short: '59 €/año',
    limit: 'Hasta 50 empleados',
    satellites: [
      { title: 'Potencia', chip: '⚡ Potencia · IA', items: ['IA Integrada', 'OCR Ilimitado', 'BD Ilimitada', 'Hasta 50 usuarios'], desc: 'Automatización inteligente con IA y escaneo OCR ilimitado para clasificar gastos y presupuestos de forma autónoma.', url: 'https://pro-gestarian.web.app' },
      { title: 'Portal de Clientes', chip: '🛰️ Portal de Clientes', items: ['Invitación automática', 'Acceso seguro DNI/CIF', 'Seguimiento en tiempo real', 'Citas y presupuestos', 'Notificaciones inmediatas', 'Documentos siempre disponibles'], desc: 'Tus clientes acceden a su área privada mediante el enlace que les envías por email o WhatsApp. Sin registros complicados, sin contraseñas perdidas. Ellos entran con su email y DNI/CIF, y ven en tiempo real todo lo que haces en su vehículo.', url: 'https://clientes-gestarian.web.app' },
      { title: 'Experiencia Visual', chip: '📸 Experiencia Visual', items: ['Evolución del vehículo', 'Fotos y vídeos del proceso', 'Historial gráfico paso a paso', 'Notas técnicas'], desc: 'Seguimiento visual con fotos y vídeos de la evolución de los trabajos en el vehículo desde recepción hasta entrega final.', img: 'assets/vehiculo-evolucion.jpg', url: 'https://pro-gestarian.web.app' }
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'El máximo',
    price: '299 €',
    period: '/ año',
    short: '299 €/año',
    limit: 'Hasta 100 empleados · más: consultar',
    satellites: [
      { title: 'Red', chip: '🌐 Red Empresarial', items: ['Red Empresarial', 'Vinculación AEAT', 'Certificación digital', 'Evita gestoría'], desc: 'Red empresarial interconectada con 10 estaciones de datos y vinculación directa con la Agencia Tributaria.', url: 'https://enterprise-gestarian.web.app' },
      { title: 'Cobertura', chip: '🛡️ Cobertura Total', items: ['Cobertura Total', 'Derivación de clientes por agenda', 'Hasta 100 empleados'], desc: 'Cobertura total con derivación automática de citas y clientes por agenda entre las sedes de la red.', url: 'https://enterprise-gestarian.web.app' }
    ]
  }
};

function getPlan(id) {
  return (window.GESTARIAN_PLANS && window.GESTARIAN_PLANS[id]) || DEFAULT_PLANS[id] || { name: id, short: '', tagline: '' };
}

const section = document.getElementById('universo');
const canvas = document.getElementById('universe-canvas');
const overlay = document.getElementById('u-overlay');
const sunPanel = document.getElementById('sun-panel');

const isTouch = window.matchMedia('(hover: none)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const tween = (target, vars) => {
  if (window.gsap) return window.gsap.to(target, vars);
  const { duration, delay, ease, onComplete, ...props } = vars;
  Object.assign(target, props);
  if (onComplete) onComplete();
  return null;
};
const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);

const GLSL_NOISE = /* glsl */`
  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
  float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<4;i++){ v+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=0.5; } return v; }
  float sdRoundBox(vec2 p, vec2 b, float r){ vec2 q=abs(p)-b+r; return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r; }
`;

const GLSL_NOISE3 = /* glsl */`
  float hash3(vec3 p){ p = fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float noise3(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(hash3(i),hash3(i+vec3(1.0,0.0,0.0)),f.x), mix(hash3(i+vec3(0.0,1.0,0.0)),hash3(i+vec3(1.0,1.0,0.0)),f.x),f.y),
               mix(mix(hash3(i+vec3(0.0,0.0,1.0)),hash3(i+vec3(1.0,0.0,1.0)),f.x), mix(hash3(i+vec3(0.0,1.0,1.0)),hash3(i+vec3(1.0,1.0,1.0)),f.x),f.y), f.z); }
  float fbm3(vec3 p){ float v=0.0; float a=0.5; for(int i=0;i<4;i++){ v+=a*noise3(p); p*=2.03; a*=0.5; } return v; }
`;

function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.35)');
  grd.addColorStop(0.6, 'rgba(255,255,255,0.08)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* Textura de difusión ultra-suave y etérea para el glow del Sol (sin cortes duros) */
function makeSunDiffuseGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const imgData = g.createImageData(256, 256);
  const data = imgData.data;
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const dx = (x - 128) / 128;
      const dy = (y - 128) / 128;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= 1.0) continue;
      // Caída gaussiana / cosenoidal de orden superior para máxima difusión
      const alpha = Math.pow(Math.cos(dist * Math.PI * 0.5), 2.8);
      const idx = (y * 256 + x) * 4;
      data[idx] = 255;
      data[idx + 1] = 255;
      data[idx + 2] = 255;
      data[idx + 3] = Math.round(alpha * 255);
    }
  }
  g.putImageData(imgData, 0, 0);
  return new THREE.CanvasTexture(c);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function createSunRingTexture() {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const text = '★ GESTARIAN ★';
  const count = 4;
  const segW = c.width / count;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 80px "Outfit", "Inter", sans-serif';

  for (let i = 0; i < count; i++) {
    const x = i * segW + segW / 2;
    const y = c.height / 2;

    const grad = ctx.createLinearGradient(x - segW / 2, 0, x + segW / 2, 0);
    grad.addColorStop(0, 'rgba(245, 196, 81, 0.01)');
    grad.addColorStop(0.5, 'rgba(245, 196, 81, 0.18)');
    grad.addColorStop(1, 'rgba(245, 196, 81, 0.01)');
    ctx.fillStyle = grad;
    ctx.fillRect(i * segW, 20, segW, c.height - 40);

    ctx.shadowColor = '#f5c451';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#fffdf0';
    ctx.fillText(text, x, y);

    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3.5;
    ctx.strokeText(text, x, y);
  }

  ctx.shadowColor = '#f5c451';
  ctx.shadowBlur = 18;
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 36);
  ctx.lineTo(c.width, 36);
  ctx.moveTo(0, c.height - 36);
  ctx.lineTo(c.width, c.height - 36);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

function createPlanetEquatorialTextTexture(name, count, colorHex) {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const uppercaseName = name.toUpperCase();
  const segW = c.width / count;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = count === 3 ? 96 : 84;
  ctx.font = `900 ${fontSize}px "Outfit", "Inter", sans-serif`;

  for (let i = 0; i < count; i++) {
    const x = i * segW + segW / 2;
    const y = c.height / 2;

    const grad = ctx.createLinearGradient(x - segW / 2, 0, x + segW / 2, 0);
    grad.addColorStop(0, 'rgba(255,255,255,0.0)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.08)');
    grad.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(i * segW, 20, segW, c.height - 40);

    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 24;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(uppercaseName, x, y);

    ctx.shadowBlur = 8;
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 3.5;
    ctx.strokeText(uppercaseName, x, y);

    // Divisor estelar luminoso entre repeticiones
    ctx.shadowBlur = 14;
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(i * segW + segW, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Filetes luminosos perimetrales
  ctx.shadowBlur = 12;
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 42);
  ctx.lineTo(c.width, 42);
  ctx.moveTo(0, c.height - 42);
  ctx.lineTo(c.width, c.height - 42);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

/* ---------------------------------------------------------
   Universo
   --------------------------------------------------------- */
function initUniverse() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  let pixelRatio = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500);

  const quality = isTouch ? 'low' : 'high';
  const SEG = quality === 'high' ? 64 : 36;
  const glowTex = makeGlowTexture();
  const sunGlowTex = makeSunDiffuseGlowTexture();

  /* ---------- Estado ---------- */
  let isSunLabelHovered = false;
  let isLateralTouchActive = false;
  let touchLateralTimer = null;

  function triggerTouchLateralActive() {
    isLateralTouchActive = true;
    clearTimeout(touchLateralTimer);
    touchLateralTimer = setTimeout(() => {
      isLateralTouchActive = false;
    }, 2800);
  }

  const state = {
    time: 0,
    timeScale: reducedMotion ? 0.3 : 1,
    baseTimeScale: reducedMotion ? 0.3 : 1,
    theta: 0.55, phi: 1.1, dist: 26,
    vTheta: 0, vPhi: 0,
    intro: 0,
    hovered: null,
    sunHover: 0,
    sunFocus: false,
    sunPull: 0,
    sunZoom: 1, sunZoomTarget: 1,
    running: true,
    layout: null
  };

  /* ---------- Estrellas ---------- */
  const STAR_COUNT = quality === 'high' ? 2400 : 1000;
  const starGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(STAR_COUNT * 3);
  const sCol = new Float32Array(STAR_COUNT * 3);
  const sSize = new Float32Array(STAR_COUNT);
  const sPhase = new Float32Array(STAR_COUNT);
  const starPalette = [[1, 1, 1], [0.78, 0.82, 1], [0.86, 0.75, 1], [1, 0.9, 0.7], [0.7, 0.9, 1]];
  for (let i = 0; i < STAR_COUNT; i++) {
    const r = 80 + Math.random() * 120;
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    sPos.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
    sCol.set(starPalette[(Math.random() * starPalette.length) | 0], i * 3);
    sSize[i] = Math.random() < 0.08 ? 2.4 + Math.random() * 1.6 : 0.8 + Math.random() * 1.2;
    sPhase[i] = Math.random() * Math.PI * 2;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(sCol, 3));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));
  starGeo.setAttribute('aPhase', new THREE.BufferAttribute(sPhase, 1));
  const starMat = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPR: { value: pixelRatio } },
    vertexShader: /* glsl */`
      attribute float aSize; attribute float aPhase; attribute vec3 color;
      uniform float uTime; uniform float uPR;
      varying vec3 vColor; varying float vTw;
      void main(){
        vColor = color;
        vTw = 0.55 + 0.45 * sin(uTime * (0.8 + fract(aPhase) * 1.6) + aPhase * 6.0);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPR * (140.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vTw;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor, a * a * vTw);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ---------- Helper Sprite Glow ---------- */
  function makeGlowSprite(color, opacity) {
    const m = new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
    return new THREE.Sprite(m);
  }

  function makeSunDiffuseGlowSprite(color, opacity) {
    const m = new THREE.SpriteMaterial({ map: sunGlowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
    return new THREE.Sprite(m);
  }

  /* ---------- Sol (Esfera solar realista con tonos anaranjados y detalles rojos) ---------- */
  const CW = 3.4, CH = 4.45;
  const sun = new THREE.Group();
  scene.add(sun);

  // Esfera solar realista con fotosfera viva, naranja solar, filamentos rojos y núcleo brillante
  const sunGeo = new THREE.SphereGeometry(6.5, 48, 48);
  const sunMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDim: { value: 0 }
    },
    vertexShader: /* glsl */`
      varying vec3 vN;
      varying vec3 vP;
      void main() {
        vN = normalize(normalMatrix * normal);
        vP = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uDim;
      varying vec3 vN;
      varying vec3 vP;
      ${GLSL_NOISE3}
      void main() {
        vec3 p = normalize(vP);
        float t = uTime * 0.045;
        float n1 = fbm3(p * 3.3 + vec3(0.0, t * 0.7, t * 0.4));
        float n2 = fbm3(p * 6.8 - vec3(t * 0.5, 0.0, t * 0.8));
        float plasma = clamp(n1 * 0.64 + n2 * 0.36, 0.0, 1.0);

        // Paleta solar realista:
        vec3 colRed = vec3(0.88, 0.12, 0.02);        // #e01e05 rojo vivo
        vec3 colDeepOrange = vec3(1.0, 0.36, 0.0);   // #ff5c00 naranja intenso
        vec3 colOrange = vec3(1.0, 0.58, 0.05);      // #ff940d naranja cálido
        vec3 colGold = vec3(1.0, 0.82, 0.18);        // #ffd12e oro solar
        vec3 colCore = vec3(1.0, 0.96, 0.76);        // #fff5c2 núcleo incandescente

        // Mezcla orgánica de convección solar
        vec3 col = mix(colRed, colDeepOrange, smoothstep(0.12, 0.38, plasma));
        col = mix(col, colOrange, smoothstep(0.35, 0.62, plasma));
        col = mix(col, colGold, smoothstep(0.58, 0.82, plasma));
        col = mix(col, colCore, smoothstep(0.80, 0.98, plasma));

        // Oscurecimiento de limbo y corona perimetral suave
        float fresnel = 1.0 - max(dot(vN, vec3(0.0, 0.0, 1.0)), 0.0);
        float limb = pow(fresnel, 2.2);
        col = mix(col, mix(colOrange, colRed, 0.65), limb * 0.65);

        // Detalles y filamentos menores rojizos en crestas turbulentas
        float flares = smoothstep(0.66, 0.71, n2) * (1.0 - smoothstep(0.71, 0.76, n2));
        col = mix(col, colRed * 1.18, flares * 0.48);

        // Oscurecimiento del 80% cuando se despliegan tarjetas
        col = mix(col, col * 0.2, uDim);

        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const sunCard = new THREE.Mesh(sunGeo, sunMat);
  sun.add(sunCard);

  // Halo atmosférico solar muy difuminado y suave (sin líneas sólidas)
  const sunOrangeGlow = makeSunDiffuseGlowSprite(new THREE.Color('#ff4500'), 0.52);
  sunOrangeGlow.scale.setScalar(29.0);
  sun.add(sunOrangeGlow);

  // Halo intermedio dorado difuminado
  const sunGoldGlow = makeSunDiffuseGlowSprite(new THREE.Color('#ff9900'), 0.56);
  sunGoldGlow.scale.setScalar(19.5);
  sun.add(sunGoldGlow);

  // Núcleo incandescente cálido ultra-difuso
  const sunCoreGlow = makeSunDiffuseGlowSprite(new THREE.Color('#fff4cc'), 0.65);
  sunCoreGlow.scale.setScalar(12.8);
  sun.add(sunCoreGlow);

  // Hit target transparente y amplio para raycasting (visible para Raycaster, invisible a los ojos)
  const sunHit = new THREE.Mesh(new THREE.SphereGeometry(8.5, 16, 16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false }));
  sunHit.userData = { type: 'sun' };
  sun.add(sunHit);

  // Pulsera-anillo celestial dorado al Sol: "GESTARIAN"
  const sunRingTex = createSunRingTexture();
  const sunRingGeo = new THREE.CylinderGeometry(9.6, 9.6, 1.6, 64, 1, true);
  const sunRingMat = new THREE.MeshBasicMaterial({
    map: sunRingTex,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const sunRing = new THREE.Mesh(sunRingGeo, sunRingMat);
  sunRing.rotation.set(0.36, 0.2, 0.12);
  sun.add(sunRing);

  // Etiqueta HTML del Sol en el centro (rectángulo con esquinas redondeadas)
  const sunLabel = document.createElement('div');
  sunLabel.className = 'u-sun-label';
  sunLabel.innerHTML = `
    <div class="inner">
      <span class="name">EL SOL DE GESTARIAN</span>
      <span class="meta">Ecosistema Integral de Gestión con IA</span>
      <span class="cta">${isTouch ? 'Toca para abrir la información' : 'Haz click para abrir la información'}</span>
    </div>`;
  sunLabel.addEventListener('mouseenter', () => { isSunLabelHovered = true; });
  sunLabel.addEventListener('mouseleave', () => { isSunLabelHovered = false; });
  sunLabel.addEventListener('click', (e) => {
    e.stopPropagation();
    enterSunFocus();
  });
  overlay.appendChild(sunLabel);

  /* ---------- Planetas ---------- */
  const sphereGeo = new THREE.SphereGeometry(1, SEG, SEG);         // geometría compartida (instancing ligero)
  const hitGeo = new THREE.SphereGeometry(1, 10, 10);
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.001, depthWrite: false });

  const planetVert = /* glsl */`
    varying vec3 vN; varying vec3 vW; varying vec3 vP;
    void main(){
      vP = position;
      vec4 w = modelMatrix * vec4(position, 1.0);
      vW = w.xyz;
      vN = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * viewMatrix * w;
    }`;
  const planetFrag = /* glsl */`
    uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
    uniform float uTime; uniform float uDim; uniform float uFocus; uniform float uSeed; uniform float uBands;
    varying vec3 vN; varying vec3 vW; varying vec3 vP;
    ${GLSL_NOISE3}
    void main(){
      vec3 N = normalize(vN);
      vec3 L = normalize(-vW);
      vec3 V = normalize(cameraPosition - vW);
      vec3 p = normalize(vP);
      float warp = fbm3(p * 2.5 + uSeed + vec3(0.0, 0.0, uTime * 0.05));
      float bands = fbm3(vec3(p.x * 1.2, p.y * uBands + warp * 2.2, p.z * 1.2) + uSeed * 1.7);
      vec3 base = mix(uA, uB, smoothstep(0.25, 0.75, bands));
      base = mix(base, uC, smoothstep(0.62, 0.9, bands) * 0.8);
      float diff = max(dot(N, L), 0.0);
      float wrap = dot(N, L) * 0.5 + 0.5;
      float fres = pow(1.0 - max(dot(N, V), 0.0), 2.2);
      // Planeta con relieve y presencia
      vec3 col = base * (0.35 + 0.65 * diff + 0.25 * wrap);
      col += uB * fres * (0.7 + 0.5 * uFocus);
      col += uC * pow(fres, 3.5) * 0.45;
      col += vec3(1.0, 0.85, 0.5) * pow(diff, 12.0) * 0.2;
      col = mix(col, col * 0.25 + vec3(0.02, 0.02, 0.04), uDim);
      gl_FragColor = vec4(col, 1.0);
    }`;

  // PLANETAS: Órbitas amplias y bien separadas para evitar cualquier solapamiento
  const PLANET_DEFS = [
    { id: 'lite', R: 18.0, size: 3.60, speed: 0.08, angle: 0, colors: ['#1d2a63', '#7c93ff', '#d5ddff'], bands: 7, seed: 1.3, satSize: 1.25 },
    { id: 'quick', R: 30.0, size: 4.10, speed: 0.08, angle: Math.PI * 0.5, colors: ['#08324f', '#38bdf8', '#c4f0ff'], bands: 9, seed: 4.1, satSize: 1.40 },
    { id: 'pro', R: 44.0, size: 6.20, speed: 0.08, angle: Math.PI, colors: ['#2b0d57', '#a855f7', '#f0dcff'], bands: 6, seed: 7.7, satSize: 1.62 },
    { id: 'enterprise', R: 60.0, size: 8.80, speed: 0.08, angle: Math.PI * 1.5, colors: ['#17125a', '#6366f1', '#cfc6ff'], bands: 5, seed: 2.9, satSize: 1.85, ring: true }
  ];

  const hex = (h) => new THREE.Color(h);
  const lighten = (h, k) => new THREE.Color(h).lerp(new THREE.Color('#ffffff'), k);

  const planets = [];
  const hitTargets = [sunHit];
  const orbitLines = [];

  function makePlanetMaterial(colors, seed, bands) {
    return new THREE.ShaderMaterial({
      uniforms: {
        uA: { value: colors[0] }, uB: { value: colors[1] }, uC: { value: colors[2] },
        uTime: { value: 0 }, uDim: { value: 0 }, uFocus: { value: 0 }, uSeed: { value: seed }, uBands: { value: bands }
      },
      vertexShader: planetVert,
      fragmentShader: planetFrag
    });
  }

  PLANET_DEFS.forEach((def) => {
    const plan = getPlan(def.id);
    const colors = def.colors.map(hex);

    const group = new THREE.Group();
    const mat = makePlanetMaterial(colors, def.seed, def.bands);
    const mesh = new THREE.Mesh(sphereGeo, mat);
    group.add(mesh);

    // Nombres en la superficie del planeta pegados a su ecuador:
    // Enterprise: 3 nombres repetidos para que al girar se vea siempre (uno se va y otro llega)
    // Pro, Quick, Lite: 4 nombres repetidos alrededor del ecuador
    const nameRepetitions = def.id === 'enterprise' ? 3 : 4;
    const planetTextTex = createPlanetEquatorialTextTexture(plan.name, nameRepetitions, def.colors[1]);
    const textBandGeo = new THREE.CylinderGeometry(1.008, 1.008, 0.42, 64, 1, true);
    const textBandMat = new THREE.MeshBasicMaterial({
      map: planetTextTex,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const textBand = new THREE.Mesh(textBandGeo, textBandMat);
    mesh.add(textBand);

    // Glow ceñido y concentrado (menos radio, más intenso)
    const glow = makeGlowSprite(colors[1], 0.85);
    glow.scale.setScalar(2.2);
    group.add(glow);

    let ring = null;
    if (def.ring) {
      const ringMat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: colors[2] }, uDim: { value: 0 }, uInner: { value: 1.12 }, uOuter: { value: 1.48 } },
        vertexShader: /* glsl */`varying float vR; void main(){ vR = length(position.xy); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: /* glsl */`
          uniform vec3 uColor; uniform float uDim; uniform float uInner; uniform float uOuter; varying float vR;
          void main(){
            float t = (vR - uInner) / (uOuter - uInner);
            float b = 0.55 + 0.45 * sin(t * 38.0) * sin(t * 11.0 + 1.0);
            float a = smoothstep(0.0, 0.08, t) * smoothstep(1.0, 0.82, t) * b * 0.55 * (1.0 - uDim * 0.8);
            gl_FragColor = vec4(uColor * (0.6 + 0.5 * b), a);
          }`,
        transparent: true, depthWrite: false, side: THREE.DoubleSide
      });
      // Anillos de Enterprise de radio pequeño y elegante
      ring = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.48, 96, 1), ringMat);
      ring.rotation.set(Math.PI / 2.35, 0.25, 0);
      group.add(ring);
    }

    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.scale.setScalar(def.ring ? 1.6 : 1.4);
    group.add(hit);
    scene.add(group);

    // Línea de órbita
    const pts = [];
    for (let i = 0; i <= 256; i++) {
      const a = (i / 256) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const orbit = new THREE.LineLoop(
      orbitGeo,
      new THREE.LineBasicMaterial({ color: colors[1], transparent: true, opacity: 0.16, depthWrite: false })
    );
    scene.add(orbit);
    orbitLines.push({ line: orbit, geo: orbitGeo, R: def.R });

    // Etiqueta HTML (solo el nombre del planeta, sin píldoras ni precios)
    const label = document.createElement('div');
    label.className = 'u-label';
    label.style.setProperty('--lc', def.colors[1]);
    label.innerHTML = `
      <div class="inner">
        <span class="name">${plan.name}</span>
      </div>`;
    label.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.focusUniversePlanet === 'function') {
        window.focusUniversePlanet(def.id);
      }
    });
    overlay.appendChild(label);

    const planet = {
      id: def.id, def, plan, group, mesh, mat, glow, ring, hit, label,
      angle: def.angle, focus: 0, dim: 0, away: 0,
      orbitPos: new THREE.Vector3(), pos: new THREE.Vector3(), worldRadius: def.size,
      sats: []
    };
    hit.userData = { type: 'planet', planet };
    hitTargets.push(hit);

    // Satélites
    (plan.satellites || []).forEach((s, i) => {
      const sColors = [lighten(def.colors[0], 0.1 + i * 0.08), lighten(def.colors[1], 0.15 + i * 0.12), lighten(def.colors[2], 0.2)];
      const sGroup = new THREE.Group();
      const sMat = makePlanetMaterial(sColors, def.seed + 3.1 * (i + 1), 10 + i * 4);
      const sMesh = new THREE.Mesh(sphereGeo, sMat);
      sGroup.add(sMesh);
      // Glow de satélite ceñido y luminoso
      const sGlow = makeGlowSprite(sColors[1], 0.85);
      sGlow.scale.setScalar(2.0);
      sGroup.add(sGlow);
      const sHit = new THREE.Mesh(hitGeo, hitMat);
      sHit.scale.setScalar(2.0);
      sGroup.add(sHit);
      scene.add(sGroup);

      // --- Satélite Red Empresarial: 10 estaciones espaciales con forma de DISCO PLANO PLATEADO y actividad continua ---
      let redEmpresarialStations = null;
      let redEmpresarialVehicles = null;
      const isRedEmpresarial = (def.id === 'enterprise' && i === 0) || (s.chip && s.chip.includes('Red Empresarial'));

      if (isRedEmpresarial) {
        const stationCount = 10;
        const stGroup = new THREE.Group();
        sGroup.add(stGroup);

        // Estaciones espaciales: DISCOS PLANOS PLATEADOS
        const discGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.032, 32);
        const rimGeo = new THREE.RingGeometry(0.38, 0.54, 32);
        const hubGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.042, 24);
        const beaconGeo = new THREE.SphereGeometry(0.045, 8, 8);

        // Acabado metálico plateado / cromo pulido
        const discMat = new THREE.MeshStandardMaterial({
          color: 0xdce5ef,
          metalness: 0.96,
          roughness: 0.12,
          emissive: 0x1e293b,
          emissiveIntensity: 0.32
        });
        const rimMat = new THREE.MeshStandardMaterial({
          color: 0xf1f5f9,
          metalness: 0.98,
          roughness: 0.08,
          emissive: 0x334155,
          emissiveIntensity: 0.40,
          side: THREE.DoubleSide
        });
        const hubMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          metalness: 0.92,
          roughness: 0.20
        });

        const stations = [];
        for (let k = 0; k < stationCount; k++) {
          const stn = new THREE.Group();

          // Disco plano plateado principal
          const disc = new THREE.Mesh(discGeo, discMat);
          stn.add(disc);

          // Anillo plateado biselado perimetral
          const rim = new THREE.Mesh(rimGeo, rimMat);
          rim.rotation.x = Math.PI / 2;
          stn.add(rim);

          // Centro de control plateado
          const hub = new THREE.Mesh(hubGeo, hubMat);
          stn.add(hub);

          // Baliza con luz estelar tenue
          const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
          const beacon = new THREE.Mesh(beaconGeo, beaconMat);
          beacon.position.y = 0.04;
          stn.add(beacon);

          // Disposición orbital de las 10 estaciones alrededor del satélite (órbita limpia y compacta)
          const baseAngle = (k / stationCount) * Math.PI * 2;
          const orbitR = 1.65 + (k % 3) * 0.35;
          const heightY = ((k % 5) - 2) * 0.26;
          const orbitSpeed = (0.28 + (k % 4) * 0.08) / 3.0; // Velocidad reducida / 3
          const tiltX = ((k % 3) - 1) * 0.18;
          const tiltZ = ((k % 2) - 0.5) * 0.22;

          stn.position.set(Math.cos(baseAngle) * orbitR, heightY, Math.sin(baseAngle) * orbitR);
          stn.rotation.set(tiltX, 0, tiltZ);
          stGroup.add(stn);

          stations.push({
            group: stn,
            baseAngle,
            orbitR,
            heightY,
            orbitSpeed,
            tiltX,
            tiltZ,
            beacon,
            beaconMat,
            beaconPhase: k * 0.65
          });
        }
        redEmpresarialStations = stations;

        // Actividad con vehículos: viajan entre los discos Y también hacia el satélite (velocidad / 3)
        const vehicleCount = 18;
        const vehicleGeo = new THREE.SphereGeometry(0.055, 8, 8);
        const vColors = [0xffffff, 0xfde047, 0x38bdf8]; // blanco, amarillo, celeste
        const vehicles = [];

        for (let v = 0; v < vehicleCount; v++) {
          const fromIdx = v % stationCount;
          let toIdx = (fromIdx + 2 + (v % 5)) % stationCount;
          if (toIdx === fromIdx) toIdx = (fromIdx + 1) % stationCount;

          // Rutas: unas entre discos, otras entre discos y el satélite central
          const isToSatRoute = v >= 10;
          const routeType = !isToSatRoute ? 'disc-to-disc' : (v % 2 === 0 ? 'disc-to-sat' : 'sat-to-disc');

          const colHex = vColors[v % vColors.length];
          const vMesh = new THREE.Mesh(vehicleGeo, new THREE.MeshBasicMaterial({ color: colHex, transparent: true, opacity: 1.0 }));
          const vGlow = makeGlowSprite(new THREE.Color(colHex), 0.95);
          vGlow.scale.setScalar(0.35);
          vMesh.add(vGlow);
          stGroup.add(vMesh);

          vehicles.push({
            mesh: vMesh,
            glow: vGlow,
            fromIdx,
            toIdx,
            routeType,
            progress: (v / vehicleCount),
            speed: (0.16 + (v % 4) * 0.05) / 3.0, // Velocidad / 3
            arcHeight: 0.18 + (v % 3) * 0.14,
            blinkFreq: (4.5 + (v % 5) * 1.8) / 3.0,
            blinkPhase: v * 0.95
          });
        }
        redEmpresarialVehicles = vehicles;
      }

      const isPortalClientes = (def.id === 'pro' && i === 1) || (s.title && s.title.toLowerCase().includes('portal')) || (s.chip && s.chip.toLowerCase().includes('clientes'));
      const isExperiencia = (def.id === 'pro' && i === 2) || (s.title && s.title.includes('Experiencia')) || (s.chip && s.chip.includes('Experiencia'));
      const sLabel = document.createElement('div');
      sLabel.className = 'u-sat' + (s.img ? ' u-sat-has-media' : '') + (isExperiencia ? ' u-sat-experiencia' : '') + (isPortalClientes ? ' u-sat-portal-clientes' : '');
      sLabel.style.setProperty('--lc', def.colors[1]);
      sLabel.innerHTML = `
        <div class="card ${s.img ? 'card-has-media' : ''} ${isPortalClientes ? 'card-portal-clientes' : ''}">
          <button type="button" class="sat-card-close" onclick="event.stopPropagation(); window.unpinUniversePlanet && window.unpinUniversePlanet();" title="Cerrar tarjetas y volver al universo">&times;</button>
          <h4>${plan.name} · ${s.title}</h4>
          <div class="chips">${s.items.map(it => `<span>${it}</span>`).join('')}</div>
          ${s.desc ? `<p>${s.desc}</p>` : ''}
          ${s.img ? `<img src="${s.img}" alt="Evolución visual del vehículo" loading="lazy">` : ''}
          <div class="sat-card-footer" style="margin-top:0.5rem;display:flex;justify-content:space-between;align-items:center;gap:0.4rem;flex-wrap:wrap">
            ${s.url ? `
              <a href="${s.url}" target="_blank" rel="noopener" class="sat-link-btn" onclick="event.stopPropagation()">
                <span>Conectar a ${s.title}</span> →
              </a>` : ''}
            ${isPortalClientes ? `
              <button type="button" class="sat-info-btn" onclick="event.stopPropagation(); if(window.openPortalClientesInfo) window.openPortalClientesInfo();">
                Explicación del Portal
              </button>
              <button type="button" class="sat-info-btn" onclick="event.stopPropagation(); if(window.openExpedientesModal) window.openExpedientesModal('pro');" style="background: rgba(168, 85, 247, 0.25); border-color: #d8b4fe; color: #fff;">
                📋 Expedientes y Roadmap
              </button>` : ''}
            ${def.id === 'enterprise' ? `
              <button type="button" class="sat-info-btn" onclick="event.stopPropagation(); if(window.openExpedientesModal) window.openExpedientesModal('enterprise');" style="background: rgba(99, 102, 241, 0.25); border-color: #cfc6ff; color: #fff;">
                📋 Expedientes en Red
              </button>` : ''}
            ${def.id === 'lite' ? `
              <button type="button" class="sat-info-btn" onclick="event.stopPropagation(); if(window.openLiteModal) window.openLiteModal();">
                Ver tarjeta explicativa
              </button>` : ''}
            ${def.id === 'quick' ? `
              <button type="button" class="sat-info-btn" onclick="event.stopPropagation(); if(window.openQuickModal) window.openQuickModal();">
                Ver tarjeta explicativa
              </button>` : ''}
            ${def.id === 'enterprise' ? `
              <button type="button" class="sat-info-btn" onclick="event.stopPropagation(); if(window.openPlanDetails) window.openPlanDetails('enterprise');">
                Ver detalles
              </button>` : ''}
            ${isExperiencia ? `
              <button type="button" class="sat-info-btn" onclick="event.stopPropagation(); if(window.openPlanDetails) window.openPlanDetails('pro');">
                Ver Pro
              </button>` : ''}
          </div>
        </div>`;
      sLabel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isPortalClientes && typeof window.openPortalClientesInfo === 'function') {
          window.openPortalClientesInfo();
        } else if (def.id === 'lite' && typeof window.openLiteModal === 'function') {
          window.openLiteModal();
        } else if (def.id === 'quick' && typeof window.openQuickModal === 'function') {
          window.openQuickModal();
        } else if (typeof window.openSatelliteModal === 'function') {
          window.openSatelliteModal(planet.id, i);
        }
      });
      overlay.appendChild(sLabel);

      const sat = {
        index: i, planet, group: sGroup, mesh: sMesh, mat: sMat, glow: sGlow, label: sLabel,
        card: sLabel.querySelector('.card'), cardW: 250, cardH: 120, pos: new THREE.Vector3(), size: def.satSize || 0.28,
        hasMedia: !!s.img, isExperiencia, isPortalClientes,
        redEmpresarialStations, redEmpresarialVehicles
      };
      sHit.userData = { type: 'sat', planet, sat };
      hitTargets.push(sHit);
      planet.sats.push(sat);
    });

    planets.push(planet);
  });

  /* ---------- Flota de naves viajando desde satélites hacia planetas ---------- */
  // Pequeñas naves mostradas como puntitos con luz intermitente blanca, amarilla o celeste
  const interplanetaryFleet = [];
  const shipDotGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const shipColors = [
    { name: 'blanca', hex: 0xffffff },
    { name: 'amarilla', hex: 0xffea55 },
    { name: 'celeste', hex: 0x38bdf8 }
  ];

  planets.forEach((p) => {
    (p.sats || []).forEach((sat) => {
      // 5 naves por cada satélite viajando hacia su planeta
      const shipsPerSat = 5;
      for (let sIdx = 0; sIdx < shipsPerSat; sIdx++) {
        const cObj = shipColors[(p.def.R + sat.index * 3 + sIdx) % shipColors.length];
        const sGroup = new THREE.Group();

        // Puntito luminoso de la nave
        const dotMesh = new THREE.Mesh(shipDotGeo, new THREE.MeshBasicMaterial({ color: cObj.hex }));
        sGroup.add(dotMesh);

        // Halo/destello de la baliza intermitente
        const dotGlow = makeGlowSprite(new THREE.Color(cObj.hex), 0.95);
        dotGlow.scale.setScalar(0.65);
        sGroup.add(dotGlow);

        scene.add(sGroup);

        // Desviación lateral de órbita y arco espacial de transferencia
        const angle = (sIdx / shipsPerSat) * Math.PI * 2 + sat.index * 1.5;
        const arcDir = new THREE.Vector3(
          Math.cos(angle) * 0.7,
          Math.sin(sIdx * 1.8) * 0.6,
          Math.sin(angle) * 0.7
        ).normalize();

        interplanetaryFleet.push({
          group: sGroup,
          dotMesh,
          dotGlow,
          sat,
          planet: p,
          progress: (sIdx / shipsPerSat) + Math.random() * 0.15,
          speed: 0.11 + Math.random() * 0.08, // 5 a 9 segundos por trayecto
          arcDir,
          arcHeight: 0.8 + Math.random() * 0.9,
          blinkFreq: 6.5 + Math.random() * 5.5,
          blinkPhase: Math.random() * Math.PI * 2
        });
      }
    });
  });

  /* ---------- Layout responsive ---------- */
  let W = 1, H = 1;
  function measureCards() {
    planets.forEach(p => p.sats.forEach(s => { s.cardW = s.card.offsetWidth || 250; s.cardH = s.card.offsetHeight || 120; }));
  }

  function updateOrbitGeometries(L) {
    orbitLines.forEach((o) => {
      const posAttr = o.geo.attributes.position;
      const posArray = posAttr.array;
      const R = o.R;
      const isPort = L.portrait;
      const Rx = isPort ? R * L.orbitScaleX : R * L.orbitScale;
      const Ry = isPort ? R * L.orbitScaleY : 0;
      const Rz = isPort ? R * L.orbitScaleZ : R * L.orbitScale;
      for (let i = 0; i <= 256; i++) {
        const a = (i / 256) * Math.PI * 2;
        posArray[i * 3] = Math.cos(a) * Rx;
        posArray[i * 3 + 1] = Math.sin(a) * Ry;
        posArray[i * 3 + 2] = Math.sin(a) * Rz;
      }
      posAttr.needsUpdate = true;
    });
  }

  function computeLayout() {
    const newW = section.clientWidth || window.innerWidth || 1024;
    const newH = section.clientHeight || window.innerHeight || 768;
    if (Math.abs(newW - W) < 2 && Math.abs(newH - H) < 2 && state.layout) return;
    W = newW;
    H = newH;
    const aspect = Math.max(0.1, W / (H || 1));
    const portrait = aspect < 1.0;
    const L = portrait
      ? {
          portrait,
          orbitScaleX: clamp(aspect * 0.94 * 1.5, 0.70, 1.15),
          orbitScaleY: clamp((1 / Math.max(0.35, aspect)) * 0.44 * 1.5, 1.15, 1.65),
          orbitScaleZ: clamp(aspect * 0.94 * 1.5, 0.70, 1.15),
          orbitScale: 0.975, // 0.65 * 1.5
          sizeScale: clamp(aspect * 1.0 * 1.5, 1.05, 1.40),
          sunScale: clamp(aspect * 0.92 * 1.5, 1.10, 1.40),
          phi: 1.12,
          fov: 46
        }
      : {
          portrait,
          orbitScaleX: 1.0,
          orbitScaleY: 0,
          orbitScaleZ: 1.0,
          orbitScale: 1.0,
          sizeScale: 1.0,
          sunScale: 1.0,
          phi: 1.1,
          fov: 42
        };
    camera.fov = L.fov;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const tanV = Math.tan(THREE.MathUtils.degToRad(L.fov / 2));
    const tanH = tanV * aspect;
    const outerX = 60.0 * (portrait ? L.orbitScaleX : L.orbitScale) + 8.8 * L.sizeScale;
    const outerY = 60.0 * (portrait ? L.orbitScaleY : L.orbitScale * Math.cos(L.phi)) + 8.8 * L.sizeScale;
    const dH = (outerX * (portrait ? 1.05 : 1.12)) / tanH;
    const dV = (outerY * (portrait ? 1.15 : 1.08)) / tanV;
    L.dist = portrait ? (Math.max(dH, dV, 36) / 1.5) : Math.max(dH, dV, 36);
    L.tanV = tanV;
    state.layout = L;
    state.phi = L.phi;
    renderer.setSize(W, H, false);
    updateOrbitGeometries(L);
    measureCards();
  }
  computeLayout();

  let resizeRaf = null;
  const debouncedComputeLayout = () => {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => computeLayout());
  };
  window.addEventListener('resize', debouncedComputeLayout, { passive: true });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => debouncedComputeLayout()).observe(section);
  }

  /* ---------- Interacción ---------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const pointer = { x: 0, y: 0, inside: false, needsPick: false, down: false, startX: 0, startY: 0, lastX: 0, lastY: 0, moved: 0, t0: 0, type: 'mouse', id: null };
  let unhoverTimer = null;

  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(hitTargets, false);
    if (!hits.length) return null;
    // prioridad: planeta/satélite enfocado > sol > resto
    const focused = hits.find(h => h.object.userData.planet && h.object.userData.planet === state.hovered);
    if (focused) return focused.object.userData;
    const planetHit = hits.find(h => h.object.userData.type !== 'sun');
    const sunH = hits.find(h => h.object.userData.type === 'sun');
    if (planetHit && sunH && sunH.distance < planetHit.distance) return sunH.object.userData;
    return (planetHit || sunH).object.userData;
  }

  let pinnedPlanet = null;

  function setHover(planet, pin = false) {
    clearTimeout(unhoverTimer);
    if (pin) {
      pinnedPlanet = planet;
    }
    const targetPlanet = pinnedPlanet || planet;
    if (state.hovered === targetPlanet) return;
    state.hovered = targetPlanet;
    const hasAnyPlanet = !!targetPlanet;
    section.classList.toggle('has-hover', hasAnyPlanet);
    section.classList.toggle('has-focus', hasAnyPlanet);
    section.classList.toggle('has-expanded-cards', hasAnyPlanet);
    section.classList.toggle('hide-sun-card', hasAnyPlanet);
    document.body.classList.toggle('universe-focused', hasAnyPlanet);
    const siteHeader = document.querySelector('.site-header');
    if (siteHeader) {
      siteHeader.classList.toggle('header-hidden-for-universe', hasAnyPlanet);
    }
    tween(state, { timeScale: targetPlanet ? state.baseTimeScale * 0.18 : state.baseTimeScale, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
  }

  function unpinPlanets() {
    pinnedPlanet = null;
    clearTimeout(unhoverTimer);
    setHover(null);
  }

  function scheduleUnhover(delay = 320) {
    clearTimeout(unhoverTimer);
    if (!state.hovered || pinnedPlanet) return;
    unhoverTimer = setTimeout(() => {
      if (!pinnedPlanet) setHover(null);
    }, delay);
  }

  function enterSunFocus() {
    if (state.sunFocus) return;
    state.sunFocus = true;
    setHover(null);
    state.sunZoomTarget = 1;
    section.classList.add('sun-focus');
    // El Sol NO debe agrandarse al pulsar sobre él: solo despliega su tarjeta informativa
    state.sunPull = 0;
    tween(state, { timeScale: 0.15, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
    sunPanel.classList.add('ready');
  }
  function exitSunFocus() {
    if (!state.sunFocus) return;
    state.sunFocus = false;
    sunPanel.classList.remove('ready');
    section.classList.remove('sun-focus');
    state.sunPull = 0;
    tween(state, { timeScale: state.baseTimeScale, duration: 1.0, ease: 'power2.inOut', overwrite: 'auto' });
  }
  window.GestarianUniverse = { enterSunFocus, exitSunFocus, setHover, unpinPlanets };
  window.enterSunFocus = enterSunFocus;
  window.exitSunFocus = exitSunFocus;
  window.unpinUniversePlanet = unpinPlanets;
  window.focusUniversePlanet = (planetId) => {
    const pl = planets.find(p => p.id === planetId);
    if (pl) setHover(pl, true);
  };

  /* ---------------------------------------------------------
     Música melódica relajante de documental espacial (Web Audio API)
     --------------------------------------------------------- */
  let audioCtx = null;
  let masterGain = null;
  let isMusicPlaying = false;
  // Silenciada por defecto en móvil y arranque seguro sin petardeo
  let isUserMuted = true;
  let synthInterval = null;

  function initSpaceAudio() {
    if (audioCtx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioCtx = new AudioCtx();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    } catch (_) {}
  }

  function playSpaceAmbientMusic() {
    if (isUserMuted) return;
    initSpaceAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    if (isMusicPlaying) return;
    isMusicPlaying = true;

    // Fade-in suave de 3 segundos en el volumen maestro
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime + 3.0);

    startCosmicSoundscape();
    updateAudioButtonUI();
  }

  function pauseSpaceAmbientMusic() {
    if (!audioCtx || !isMusicPlaying) return;
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
  }

  function resumeSpaceAmbientMusic() {
    if (!audioCtx || isUserMuted || !isMusicPlaying) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime + 2.5);
  }

  function toggleUniverseMusic() {
    isUserMuted = !isUserMuted;
    if (isUserMuted) {
      pauseSpaceAmbientMusic();
    } else {
      playSpaceAmbientMusic();
      resumeSpaceAmbientMusic();
    }
    updateAudioButtonUI();
  }

  function updateAudioButtonUI() {
    const btn = document.getElementById('btn-universe-audio');
    if (!btn) return;
    if (isUserMuted) {
      btn.classList.add('muted');
      btn.innerHTML = '<span id="universe-audio-icon">🔇</span> Música en pausa';
    } else {
      btn.classList.remove('muted');
      btn.innerHTML = '<span id="universe-audio-icon">🎵</span> Música Espacial';
    }
  }

  function startCosmicSoundscape() {
    if (synthInterval) return;

    // Progresión armónica celestial de documental (Eb9 -> Cm9 -> AbM7 -> Bbsus4)
    const chords = [
      [155.56, 233.08, 311.13, 392.00, 466.16], // Eb maj9
      [130.81, 196.00, 261.63, 311.13, 392.00], // Cm9
      [103.83, 155.56, 207.65, 261.63, 311.13], // Ab maj7
      [116.54, 174.61, 233.08, 349.23, 466.16]  // Bb sus4
    ];

    let chordIdx = 0;

    function playChord() {
      if (!audioCtx || isUserMuted) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      // Pad atmosférico suave con filtro pasa-bajos cálido
      const padFilter = audioCtx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(420, audioCtx.currentTime);
      padFilter.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 4.5);
      padFilter.frequency.exponentialRampToValueAtTime(380, audioCtx.currentTime + 9.0);

      const padGain = audioCtx.createGain();
      padGain.gain.setValueAtTime(0, audioCtx.currentTime);
      padGain.gain.linearRampToValueAtTime(0.07, audioCtx.currentTime + 3.2);
      padGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 8.8);

      padFilter.connect(padGain);
      padGain.connect(masterGain);

      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.detune.value = (i - 2) * 5;
        osc.connect(padFilter);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 9.0);
      });

      // Campanitas estelares melódicas en frecuencias pentatónicas altas (estrellas titilando)
      const bells = [622.25, 783.99, 932.33, 1046.50, 1244.51];
      const randomBell = bells[Math.floor(Math.random() * bells.length)];
      setTimeout(() => {
        if (!audioCtx || isUserMuted) return;
        const bellOsc = audioCtx.createOscillator();
        const bellGain = audioCtx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(randomBell, audioCtx.currentTime);
        bellGain.gain.setValueAtTime(0, audioCtx.currentTime);
        bellGain.gain.linearRampToValueAtTime(0.035, audioCtx.currentTime + 0.1);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.5);
        bellOsc.connect(bellGain);
        bellGain.connect(masterGain);
        bellOsc.start(audioCtx.currentTime);
        bellOsc.stop(audioCtx.currentTime + 3.6);
      }, 1400 + Math.random() * 2500);
    }

    playChord();
    synthInterval = setInterval(playChord, 8000);
  }

  document.getElementById('sun-exit')?.addEventListener('click', exitSunFocus);
  document.getElementById('sun-panel-close')?.addEventListener('click', exitSunFocus);
  document.getElementById('btn-universe-audio')?.addEventListener('click', toggleUniverseMusic);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (pinnedPlanet || state.hovered) unpinPlanets();
      else if (state.sunFocus && !document.querySelector('.modal-overlay.active')) exitSunFocus();
    }
  });
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') state.vTheta -= 0.04;
    if (e.key === 'ArrowRight') state.vTheta += 0.04;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); state.sunFocus ? exitSunFocus() : enterSunFocus(); }
  });

  canvas.addEventListener('pointerdown', (e) => {
    pointer.down = true;
    pointer.id = e.pointerId;
    pointer.type = e.pointerType;
    pointer.startX = pointer.lastX = e.clientX;
    pointer.startY = pointer.lastY = e.clientY;
    pointer.moved = 0;
    pointer.t0 = performance.now();
    state.vTheta = 0; state.vPhi = 0;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* noop */ }
  });

  canvas.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.inside = true;
    if (pointer.down && e.pointerId === pointer.id) {
      const dx = e.clientX - pointer.lastX;
      const dy = e.clientY - pointer.lastY;
      pointer.lastX = e.clientX; pointer.lastY = e.clientY;
      pointer.moved += Math.abs(dx) + Math.abs(dy);
      // Detección de scroll lateral en pantalla táctil
      if (e.pointerType !== 'mouse' && Math.abs(dx) >= Math.abs(dy) * 0.7 && Math.abs(dx) > 2) {
        triggerTouchLateralActive();
      }
      if (pointer.moved > 12) {
        if (!state.sunFocus) {
          canvas.classList.add('dragging');
          if (pinnedPlanet && pointer.moved > 45) {
            unpinPlanets();
          } else if (!pinnedPlanet && state.hovered) {
            setHover(null);
          }
          state.vTheta = -dx * 0.0055;
          state.vPhi = pointer.type === 'mouse' ? -dy * 0.004 : 0;
          state.theta += state.vTheta;
          state.phi = clamp(state.phi + state.vPhi, 0.45, 1.42);
        }
      }
    } else if (e.pointerType === 'mouse') {
      if (!pinnedPlanet) {
        pointer.needsPick = true;
      }
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  section.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  section.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length === 1) {
      const tX = e.touches[0].clientX;
      const tY = e.touches[0].clientY;
      const dX = tX - touchStartX;
      const dY = tY - touchStartY;
      if (Math.abs(dX) > 8 && Math.abs(dX) > Math.abs(dY) * 0.7) {
        triggerTouchLateralActive();
      }
    }
  }, { passive: true });

  function endPointer(e, cancelled) {
    if (!pointer.down || e.pointerId !== pointer.id) return;
    pointer.down = false;
    canvas.classList.remove('dragging');
    const isTap = !cancelled && pointer.moved <= 22 && performance.now() - pointer.t0 < 750;
    if (!isTap) return;
    const hit = pick(e.clientX, e.clientY);
    if (state.sunFocus) {
      if (!hit || hit.type !== 'sun') exitSunFocus();
      return;
    }
    if (!hit) {
      if (pinnedPlanet) {
        unpinPlanets();
      } else if (state.hovered) {
        setHover(null);
      }
      return;
    }
    if (hit.type === 'sun') {
      unpinPlanets();
      enterSunFocus();
      return;
    }

    // Si es un satélite
    if (hit.type === 'sat') {
      const sat = hit.sat;
      if (sat && sat.isPortalClientes) {
        if (typeof window.openPortalClientesInfo === 'function') {
          window.openPortalClientesInfo();
          return;
        }
      }
      if (sat && sat.planet && sat.planet.id === 'lite') {
        if (typeof window.openLiteModal === 'function') {
          window.openLiteModal();
          return;
        }
      }
      if (sat && sat.planet && sat.planet.id === 'quick') {
        if (typeof window.openQuickModal === 'function') {
          window.openQuickModal();
          return;
        }
      }
      if (typeof window.openSatelliteModal === 'function') {
        window.openSatelliteModal(sat.planet.id, sat.index);
        return;
      }
      return;
    }

    // Si es un planeta:
    const planet = hit.planet;
    if (pinnedPlanet === planet) {
      // Ya estaba desplegado y se pulsa de nuevo sobre el planeta: abrir modal completo
      if (typeof window.openPlanDetails === 'function') window.openPlanDetails(planet.id);
    } else {
      // DESPLEGAR LAS TARJETAS DEL PLANETA EN EL UNIVERSO
      setHover(planet, true);
    }
  }
  canvas.addEventListener('pointerup', (e) => endPointer(e, false));
  canvas.addEventListener('pointercancel', (e) => endPointer(e, true));
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    state.running = false;
  }, false);
  canvas.addEventListener('webglcontextrestored', () => {
    state.running = true;
    computeLayout();
  }, false);
  canvas.addEventListener('pointerleave', (e) => {
    pointer.inside = false;
    if (e.pointerType === 'mouse') { scheduleUnhover(350); state.sunHover = 0; canvas.classList.remove('pointer'); }
  });

  section.addEventListener('wheel', () => {}, { passive: true });

  /* ---------- Visibilidad / rendimiento y Entrada fluida ---------- */
  let introStarted = false;
  function triggerUniverseEntry() {
    if (introStarted) return;
    introStarted = true;
    section.classList.add('canvas-ready');
    state.intro = 0;
    tween(state, { intro: 1, duration: 2.2, ease: 'power2.out', overwrite: 'auto' });
  }

  window.enterUniverseIntro = (e) => {
    if (e) e.preventDefault();
    const hero = document.getElementById('inicio');
    if (hero) {
      // Fade off suave del contenido inicial
      hero.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      hero.style.opacity = '0';
      hero.style.transform = 'scale(0.96)';
    }
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth' });
      triggerUniverseEntry();
      setTimeout(() => {
        if (hero) {
          hero.style.opacity = '';
          hero.style.transform = '';
        }
      }, 1600);
    }, 450);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      state.running = en.isIntersecting;
      if (en.isIntersecting) {
        triggerUniverseEntry();
      } else {
        pauseSpaceAmbientMusic();
      }
    });
  }, { threshold: 0.04 });
  io.observe(section);
  document.addEventListener('visibilitychange', () => { if (document.hidden) state.running = false; else state.running = section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < window.innerHeight; });

  // Calidad adaptativa: si el rendimiento cae, reducimos resolución y estrellas
  const perf = { frames: 0, acc: 0, step: 0 };
  function adaptQuality(dt) {
    if (perf.step >= 2) return;
    perf.frames++; perf.acc += dt;
    if (perf.frames < 90) return;
    const fps = perf.frames / perf.acc;
    perf.frames = 0; perf.acc = 0;
    if (fps < 42) {
      perf.step++;
      pixelRatio = Math.max(1, pixelRatio * 0.7);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(W, H, false);
      starMat.uniforms.uPR.value = pixelRatio;
      if (perf.step === 2) starGeo.setDrawRange(0, Math.floor(STAR_COUNT * 0.5));
    } else {
      perf.step = 2;
    }
  }

  /* ---------- Bucle principal ---------- */
  const tmpV = new THREE.Vector3();
  const camRight = new THREE.Vector3();
  const camUp = new THREE.Vector3();
  const corner = new THREE.Vector3();

  function toScreen(v) {
    tmpV.copy(v).project(camera);
    return { x: (tmpV.x + 1) * 0.5 * W, y: (1 - tmpV.y) * 0.5 * H, behind: tmpV.z > 1 };
  }
  function pxRadius(r, pos) {
    const d = camera.position.distanceTo(pos);
    const tanV = state.layout ? state.layout.tanV : 0.38;
    return (r * H * 0.5) / (d * tanV);
  }

  function tick(dtRaw) {
    if (!state.running) return;
    if (!state.layout || section.clientWidth !== W || section.clientHeight !== H) {
      computeLayout();
    }
    const L = state.layout;
    if (!L) return;
    const dt = Math.min(dtRaw, 0.05);
    adaptQuality(dt);
    state.time += dt;
    const orbitTime = dt * state.timeScale;

    // Cámara (movimiento orgánico continuo y aleatorio en el espacio 3D + rotación con inercia)
    if (!pointer.down) {
      state.theta += state.vTheta;
      state.phi = clamp(state.phi + state.vPhi, 0.45, 1.42);
      state.vTheta *= Math.pow(0.04, dt);
      state.vPhi *= Math.pow(0.04, dt);

      if (!state.hovered && !state.sunFocus && !reducedMotion) {
        // Rotación continua con suave deriva espacial aleatoria
        const t = state.time;
        const driftThetaSpeed = (0.018 + Math.sin(t * 0.12) * 0.009 + Math.cos(t * 0.055) * 0.006);
        state.theta += driftThetaSpeed * dt * 60 * 0.016;

        // Fluctuación orgánica del ángulo polar (inclinación en el espacio)
        const driftPhiTarget = L.phi + Math.sin(t * 0.078 + 1.2) * 0.16 + Math.cos(t * 0.038) * 0.10;
        state.phi = damp(state.phi, clamp(driftPhiTarget, 0.52, 1.36), 0.5, dt);
      } else {
        // Vuelve suavemente a la inclinación por defecto al enfocar
        if (Math.abs(state.vPhi) < 0.0005) state.phi = damp(state.phi, L.phi, 0.6, dt);
      }
    }

    const introK = smooth(clamp(state.intro, 0, 1));
    const t = state.time;

    // Desplazamiento aleatorio de profundidad y zoom en el espacio (la cámara no permanece estática)
    const randomDistWave = (!state.hovered && !state.sunFocus && !reducedMotion)
      ? (Math.sin(t * 0.065) * 0.14 + Math.cos(t * 0.032 + 1.5) * 0.08)
      : 0;
    const dist = L.dist * (1 + (1 - introK) * 0.7 + randomDistWave);

    camera.position.set(
      dist * Math.sin(state.phi) * Math.sin(state.theta),
      dist * Math.cos(state.phi),
      dist * Math.sin(state.phi) * Math.cos(state.theta)
    );

    // Punto de mira con sutil deriva espacial viva (centrado en el espacio disponible en portrait)
    const portraitLookY = 0;
    const lookX = (!state.hovered && !state.sunFocus && !reducedMotion) ? Math.sin(t * 0.09) * 1.8 : 0;
    const lookY = portraitLookY + ((!state.hovered && !state.sunFocus && !reducedMotion) ? Math.cos(t * 0.068) * 1.2 : 0);
    const lookZ = (!state.hovered && !state.sunFocus && !reducedMotion) ? Math.sin(t * 0.052 + 1.0) * 1.5 : 0;
    camera.lookAt(lookX, lookY, lookZ);
    camera.updateMatrixWorld();
    camRight.setFromMatrixColumn(camera.matrixWorld, 0);
    camUp.setFromMatrixColumn(camera.matrixWorld, 1);

    stars.rotation.y += dt * 0.004;
    starMat.uniforms.uTime.value = state.time;

    // Hover por ratón (pick una vez por frame): solo actualiza cursor interactivo y estado del Sol (sin abrir tarjetas de planetas)
    if (pointer.needsPick && !pointer.down && pointer.inside) {
      pointer.needsPick = false;
      if (!pinnedPlanet) {
        const hit = state.sunFocus ? null : pick(pointer.x, pointer.y);
        state.sunHover = hit && hit.type === 'sun' ? 1 : 0;
        canvas.classList.toggle('pointer', !!hit && !state.sunFocus);
      }
    }

    // ----- Sol (El Sol NO debe agrandarse al pulsar sobre él, solo despliega su tarjeta informativa) -----
    sun.position.set(0, 0, 0); // Fijo y centrado en la galaxia
    sun.quaternion.copy(camera.quaternion); // siempre de frente, sin girar sobre sí misma
    if (sunRing) {
      sunRing.rotation.y += dt * 0.12;
    }
    const sunScale = L.sunScale * (0.85 + 0.15 * introK);
    sun.scale.setScalar(sunScale);
    if (sunMat && sunMat.uniforms && sunMat.uniforms.uTime) {
      sunMat.uniforms.uTime.value = state.time;
    }

    // Cálculo del nivel de despliegue de tarjetas para oscurecer todo el contenido anterior al 80% (las estrellas siguen brillando)
    const maxFocus = planets.reduce((m, pl) => Math.max(m, pl.focus), 0);
    const dim80 = maxFocus * 0.8;
    const brightFactor = 1.0 - dim80;

    // Atenuar el Sol al 80% cuando se despliegan tarjetas
    if (sunMat && sunMat.uniforms && sunMat.uniforms.uDim) {
      sunMat.uniforms.uDim.value = dim80;
    }
    if (sunOrangeGlow && sunOrangeGlow.material) sunOrangeGlow.material.opacity = 0.52 * brightFactor;
    if (sunGoldGlow && sunGoldGlow.material) sunGoldGlow.material.opacity = 0.56 * brightFactor;
    if (sunCoreGlow && sunCoreGlow.material) sunCoreGlow.material.opacity = 0.65 * brightFactor;

    // Etiqueta HTML del Sol en el centro (solo visible al pasar el ratón en PC o al hacer scroll lateral táctil)
    if (sunLabel) {
      const sunScreen = toScreen(sun.position);
      const isAnyPlanetCardUnfolded = !!state.hovered || planets.some(p => p.focus > 0.05);
      const shouldShowOnPC = (state.sunHover > 0 || isSunLabelHovered);
      const shouldShowOnTouch = isLateralTouchActive;
      const shouldShowSunCard = (shouldShowOnPC || shouldShowOnTouch) &&
        !isAnyPlanetCardUnfolded &&
        !state.sunFocus &&
        !sunScreen.behind;

      if (shouldShowSunCard) {
        sunLabel.classList.add('visible');
        sunLabel.style.opacity = '1';
        sunLabel.style.pointerEvents = 'auto';
        sunLabel.style.visibility = 'visible';
        const sunRpx = pxRadius(6.5 * sunScale, sun.position);
        const sunOffsetDown = L.portrait ? sunRpx + 45 : sunRpx + 58;
        sunLabel.style.transform = `translate3d(${sunScreen.x.toFixed(1)}px, ${(sunScreen.y + sunOffsetDown).toFixed(1)}px, 0)`;
      } else {
        sunLabel.classList.remove('visible');
        sunLabel.style.opacity = '0';
        sunLabel.style.pointerEvents = 'none';
        sunLabel.style.visibility = 'hidden';
      }
    }

    // ----- Planetas -----
    const anyHover = state.hovered;
    planets.forEach((p) => {
      const isFocus = anyHover === p && !state.sunFocus;
      if (!isFocus) p.angle += p.def.speed * orbitTime;
      p.focus = damp(p.focus, isFocus ? 1 : 0, 5, dt);
      const dimTarget = state.sunFocus ? 1 : (anyHover && anyHover !== p ? 1 : 0);
      p.dim = damp(p.dim, dimTarget, 5, dt);
      const fE = smooth(clamp(p.focus, 0, 1));

      const isPort = L.portrait;
      const Rx = isPort ? p.def.R * L.orbitScaleX : p.def.R * L.orbitScale;
      const Ry = isPort ? p.def.R * L.orbitScaleY : 0;
      const Rz = isPort ? p.def.R * L.orbitScaleZ : p.def.R * L.orbitScale;
      p.orbitPos.set(Math.cos(p.angle) * Rx, Math.sin(p.angle) * Ry, Math.sin(p.angle) * Rz);
      // primer plano: se acerca por la línea de visión (mantiene su posición en pantalla)
      p.pos.copy(p.orbitPos).lerp(camera.position, 0.42 * fE);
      // los demás se alejan
      if (p.dim > 0.001 && !state.sunFocus) {
        tmpV.copy(p.orbitPos).sub(camera.position).normalize().multiplyScalar(2.2 * p.dim);
        p.pos.add(tmpV);
      }
      p.group.position.copy(p.pos);
      const introS = smooth(clamp(state.intro * 1.4 - planets.indexOf(p) * 0.1, 0, 1));

      // Escala dinámica según distancia 3D: lejos se reduce hasta /5 (0.20x), enfocado mantiene presencia
      const pDist = camera.position.distanceTo(p.pos);
      const pDistRatio = clamp(Math.pow(L.dist / Math.max(1, pDist), 1.3), 0.20, 1.4);
      const pScale = THREE.MathUtils.lerp(pDistRatio, 1.0, fE);

      p.worldRadius = p.def.size * L.sizeScale * (1 + 0.35 * fE) * introS * pScale;
      p.group.scale.setScalar(Math.max(p.worldRadius, 0.0001));
      p.mesh.rotation.y += dt * 0.25;
      p.mat.uniforms.uTime.value = state.time;
      p.mat.uniforms.uDim.value = p.dim * 0.85;
      p.mat.uniforms.uFocus.value = fE;
      p.glow.material.opacity = (0.5 + 0.35 * fE) * (1 - p.dim * 0.8);
      if (p.ring) p.ring.material.uniforms.uDim.value = p.dim;

      // Etiqueta del Planeta:
      // Cuando se despliegan sus tarjetas, el título del planeta se mantiene ARRIBA CENTRADO
      const s = toScreen(p.pos);
      const rpx = pxRadius(p.worldRadius, p.pos);
      const labelW = p.label.offsetWidth || 180;
      const lx = clamp(s.x, labelW / 2 + 16, W - labelW / 2 - 16);
      const ly = clamp(s.y - rpx - 28, 45, H - 40);

      // Posición arriba centrado al desplegar tarjetas
      const targetCenterLx = W / 2;
      const targetCenterLy = clamp(48, H * 0.08, 70);
      const finalLx = THREE.MathUtils.lerp(lx, targetCenterLx, fE);
      const finalLy = THREE.MathUtils.lerp(ly, targetCenterLy, fE);

      p.label.style.transform = `translate3d(${finalLx.toFixed(1)}px, ${finalLy.toFixed(1)}px, 0) scale(${pScale.toFixed(3)})`;
      p.label.style.zIndex = isFocus ? 45 : 10;
      p.label.classList.toggle('focus', isFocus);
      p.label.classList.toggle('dim', dimTarget === 1);
      p.label.classList.toggle('hidden', s.behind || introS < 0.2);

      // ----- Satélites: orbitan alrededor de su planeta acompañándolo en su traslación -----
      p.sats.forEach((sat) => {
        const isEnterprise = p.def.id === 'enterprise';
        const isRedEmpresarial = (isEnterprise && sat.index === 0) || (sat.chip && sat.chip.includes('Red Empresarial'));
        const side = L.portrait ? 0 : (sat.index === 0 ? -1 : 1);

        // Posición de traslación orbital: satélites orbitando alrededor de su planeta (siempre visibles y en formación natural)
        const satCount = p.sats.length;
        let rSat, satAngle, satOrbX, satOrbY, satOrbZ;
        if (p.def.id === 'pro') {
          // 3 satélites independientes y perfectamente espaciados a 120° alrededor de Pro:
          // Sat 0: Potencia · IA (fase 0°)
          // Sat 1: Portal de Clientes (fase 120°)
          // Sat 2: Experiencia Visual (fase 240°)
          const proRadius = (p.def.size * 1.35 + 3.8 + sat.index * 1.2) * L.sizeScale;
          const proSpeed = 0.42;
          satAngle = state.time * proSpeed + (sat.index * (Math.PI * 2 / 3));
          const proHeight = (sat.index === 0 ? 0.9 : (sat.index === 1 ? -0.3 : -0.7)) * L.sizeScale;
          satOrbX = p.orbitPos.x + Math.cos(satAngle) * proRadius;
          satOrbY = p.orbitPos.y + Math.sin(satAngle * 1.12) * (proRadius * 0.32) + proHeight;
          satOrbZ = p.orbitPos.z + Math.sin(satAngle) * proRadius;
        } else {
          rSat = isEnterprise
            ? (p.def.size * L.sizeScale * 1.45 + 5.2 + sat.index * 3.0)
            : (p.def.size * L.sizeScale * 1.35 + 3.6 + sat.index * 1.4);
          satAngle = state.time * (0.48 + (sat.index % 2) * 0.14) + (sat.index * (Math.PI * 2 / Math.max(1, satCount)));
          satOrbX = p.orbitPos.x + Math.cos(satAngle) * rSat;
          satOrbY = p.orbitPos.y + Math.sin(satAngle * 1.15) * (rSat * 0.35) + ((sat.index % 2 === 0 ? 0.8 : -0.8) + (sat.index === 2 ? 0.6 : 0)) * L.sizeScale;
          satOrbZ = p.orbitPos.z + Math.sin(satAngle) * rSat;
        }
        const trail = tmpV.set(satOrbX, satOrbY, satOrbZ);
        if (p.dim > 0.001 && !state.sunFocus) {
          trail.add(corner.copy(trail).sub(camera.position).normalize().multiplyScalar(2.2 * p.dim));
        }

        // Posición en primer plano: al acercarse los satélites se separan ampliamente para mostrarse mejor
        const baseOff = p.worldRadius * 2.2 + sat.size * L.sizeScale * 2.5 + 4.5;
        const focusOff = p.worldRadius * 2.8 + sat.size * L.sizeScale * 5.2 + 9.5;
        const off = THREE.MathUtils.lerp(baseOff, focusOff, fE);

        const focusPos = corner.copy(p.pos);
        if (L.portrait) {
          const yOffsets = [-off * 1.05, off * 0.15, off * 1.25];
          focusPos.addScaledVector(camUp, yOffsets[sat.index] !== undefined ? yOffsets[sat.index] : (sat.index === 0 ? off : -off));
        } else {
          if (p.sats.length === 3) {
            // Pro: Sat 0 (Potencia) arriba-izq, Sat 1 (Portal Clientes) abajo-izq, Sat 2 (Experiencia) derecha
            let xSide = -1.18;
            let yShift = 0.42;
            if (sat.index === 1) { xSide = -1.18; yShift = -0.52; }
            else if (sat.index === 2) { xSide = 1.18; yShift = -0.05; }
            focusPos.addScaledVector(camRight, xSide * off).addScaledVector(camUp, yShift * off);
          } else {
            // Sat 0 a la izquierda y arriba, Sat 1 a la derecha y abajo
            const xSide = sat.index === 0 ? -1 : 1;
            const yShift = sat.index === 0 ? 0.36 : -0.36;
            focusPos.addScaledVector(camRight, xSide * off).addScaledVector(camUp, yShift * off);
          }
        }
        sat.pos.copy(trail).lerp(focusPos, fE);
        sat.group.position.copy(sat.pos);

        // Escala del satélite: lejos reduce a /5 (0.20), de cerca/enfocado aumenta hasta x5
        const satDist = camera.position.distanceTo(sat.pos);
        const satDistRatio = clamp(Math.pow(L.dist / Math.max(1, satDist), 1.3), 0.20, 1.4);
        const farSatScale = sat.size * L.sizeScale * 0.65 * satDistRatio * introS;
        const nearSatScale = sat.size * L.sizeScale * 4.8 * introS;
        const sr = THREE.MathUtils.lerp(farSatScale, nearSatScale, fE);
        sat.group.scale.setScalar(Math.max(sr, 0.0001));

        // Rotación del satélite (velocidad reducida / 3)
        sat.mesh.rotation.y += dt * 0.13;
        sat.mat.uniforms.uTime.value = state.time;
        sat.mat.uniforms.uDim.value = p.dim * 0.85;
        sat.mat.uniforms.uFocus.value = fE;
        sat.glow.material.opacity = (0.45 + 0.3 * fE) * (1 - p.dim * 0.8);

        // Actualizar estaciones espaciales en disco plateado y vehículos activos de Red Empresarial
        if (sat.redEmpresarialStations && sat.redEmpresarialVehicles) {
          const stns = sat.redEmpresarialStations;
          // Separación y aumento de tamaño de estaciones espaciales
          const separateMult = THREE.MathUtils.lerp(1.0, 2.4, fE);
          const stnScale = THREE.MathUtils.lerp(satDistRatio, 4.2, fE);

          stns.forEach((stn) => {
            const angle = stn.baseAngle + state.time * stn.orbitSpeed;
            const stnR = stn.orbitR * separateMult;
            stn.group.position.set(
              Math.cos(angle) * stnR,
              stn.heightY * THREE.MathUtils.lerp(1.0, 1.6, fE) + Math.sin(state.time * 0.4 + stn.baseAngle) * 0.08,
              Math.sin(angle) * stnR
            );
            stn.group.scale.setScalar(stnScale);
            stn.group.rotation.y += dt * 0.22; // Rotación suave / 3
            // Luz de baliza estelar suave
            const isBeaconOn = Math.sin(state.time * 2.2 + stn.beaconPhase) > -0.2;
            stn.beacon.visible = isBeaconOn;
          });

          // Vehículos viajando entre discos y hacia el satélite con luz continua modulada 30% - 100%
          const vehScale = THREE.MathUtils.lerp(satDistRatio, 3.6, fE);
          sat.redEmpresarialVehicles.forEach((veh) => {
            veh.progress += dt * veh.speed;
            if (veh.progress >= 1.0) {
              veh.progress = 0;
              veh.fromIdx = veh.toIdx;
              let nextIdx = (veh.fromIdx + 2 + Math.floor(Math.random() * 7)) % stns.length;
              if (nextIdx === veh.fromIdx) nextIdx = (veh.fromIdx + 1) % stns.length;
              veh.toIdx = nextIdx;
            }

            let posA, posB;
            if (veh.routeType === 'disc-to-sat') {
              posA = stns[veh.fromIdx].group.position;
              posB = tmpV.set(0, 0, 0); // Satélite central
            } else if (veh.routeType === 'sat-to-disc') {
              posA = tmpV.set(0, 0, 0); // Satélite central
              posB = stns[veh.toIdx].group.position;
            } else {
              posA = stns[veh.fromIdx].group.position;
              posB = stns[veh.toIdx].group.position;
            }

            const vt = veh.progress;
            veh.mesh.position.lerpVectors(posA, posB, vt);
            veh.mesh.position.y += Math.sin(Math.PI * vt) * veh.arcHeight * separateMult;
            veh.mesh.scale.setScalar(vehScale);

            // Luz que modula suavemente de 30% a 100% de luminosidad (siempre visible, sin parpadeo brusco)
            const lum = 0.30 + 0.70 * (0.5 + 0.5 * Math.sin(state.time * veh.blinkFreq + veh.blinkPhase));
            veh.mesh.visible = true;
            veh.mesh.material.opacity = lum;
            veh.glow.material.opacity = lum * 0.95;
          });
        }

        // etiqueta del satélite: ubicada ABAJO del satélite
        const ss = toScreen(sat.pos);
        const spx = pxRadius(sr, sat.pos);

        // Escala dinámica según distancia 3D (se hacen pequeños al alejarse, igual que los satélites)
        const satScale = THREE.MathUtils.lerp(satDistRatio, 1.0, fE);

        sat.label.style.transform = `translate3d(${ss.x.toFixed(1)}px, ${(ss.y + spx + 10).toFixed(1)}px, 0) scale(${satScale.toFixed(3)})`;
        sat.label.style.zIndex = isFocus ? 40 : 9;

        // Distribución ordenada de las tarjetas informativas SIN SOLAPARSE unas con otras y sin scroll
        if (isFocus) {
          const satCount = p.sats.length;
          const isExperiencia = sat.isExperiencia || sat.hasMedia;
          let targetCardX, targetCardY, cardW, cardH;

          if (satCount === 1) {
            cardW = isExperiencia ? Math.min(410, W - 28) : Math.min(360, W - 32);
            cardH = sat.card.offsetHeight || (isExperiencia ? 260 : 160);
            targetCardX = W / 2;
            targetCardY = clamp(H / 2 + 35, cardH / 2 + 105, H - cardH / 2 - 25);
          } else if (satCount === 3 && !L.portrait && W >= 860) {
            // 3 satélites en PC / Tablet Landscape:
            // Columna Izquierda: Sat 0 (Potencia) arriba, Sat 1 (Portal Clientes) abajo
            // Columna Derecha: Sat 2 (Experiencia) centro
            const colW = Math.min(375, Math.floor((W - 90) / 2));
            const leftColX = (W / 2) - (colW / 2) - 40;
            const rightColX = (W / 2) + (colW / 2) + 40;
            if (sat.index === 0) {
              cardW = colW;
              cardH = sat.card.offsetHeight || 135;
              targetCardX = leftColX;
              targetCardY = clamp(H / 2 - 95, cardH / 2 + 75, H / 2 - 25);
            } else if (sat.index === 1) {
              cardW = colW;
              cardH = sat.card.offsetHeight || 165;
              targetCardX = leftColX;
              targetCardY = clamp(H / 2 + 115, H / 2 + 30, H - cardH / 2 - 20);
            } else {
              cardW = Math.min(420, colW);
              cardH = sat.card.offsetHeight || 270;
              targetCardX = rightColX;
              targetCardY = clamp(H / 2 + 15, cardH / 2 + 85, H - cardH / 2 - 20);
            }
          } else if (satCount === 2 && !L.portrait && W >= 860) {
            // Dos columnas simétricas en PC y Tablet Landscape
            cardW = isExperiencia
              ? Math.min(415, Math.floor((W - 80) / 2))
              : Math.min(350, Math.floor((W - 80) / 2));
            cardH = sat.card.offsetHeight || (isExperiencia ? 270 : 180);
            const gap = clamp((W - 760) * 0.35, 24, 70);

            if (sat.index === 0) {
              targetCardX = (W / 2) - 180 - (gap / 2);
            } else {
              targetCardX = (W / 2) + 205 + (gap / 2);
            }
            targetCardY = clamp(H / 2 + 25, cardH / 2 + 95, H - cardH / 2 - 25);
          } else {
            // Apiladas ordenadamente en vertical en Móvil y Tablet Portrait
            cardW = isExperiencia ? Math.min(340, W - 24) : Math.min(320, W - 28);
            cardH = sat.card.offsetHeight || (isExperiencia ? 220 : 155);
            targetCardX = W / 2;
            if (satCount === 3) {
              if (sat.index === 0) targetCardY = clamp(H / 2 - 145, cardH / 2 + 65, H / 2 - 75);
              else if (sat.index === 1) targetCardY = clamp(H / 2 + 5, H / 2 - 35, H / 2 + 55);
              else targetCardY = clamp(H / 2 + 165, H / 2 + 95, H - cardH / 2 - 15);
            } else {
              targetCardY = sat.index === 0
                ? clamp(H / 2 - 105, cardH / 2 + 95, H - cardH - 30)
                : clamp(H / 2 + 115, cardH * 1.5 + 115, H - cardH / 2 - 16);
            }
          }

          const relX = targetCardX - ss.x;
          const relY = targetCardY - (ss.y + spx + 10);
          sat.card.style.left = `${relX.toFixed(1)}px`;
          sat.card.style.top = `${relY.toFixed(1)}px`;
          sat.card.style.width = `${cardW.toFixed(0)}px`;
          sat.card.style.maxWidth = `${cardW.toFixed(0)}px`;
        }

        // Detección de ocultación detrás del planeta (cuando el satélite pasa por detrás de la esfera 3D del planeta):
        const distPlanetToCam = camera.position.distanceTo(p.pos);
        const distSatToCam = camera.position.distanceTo(sat.pos);
        const screenDistToPlanet = Math.hypot(ss.x - s.x, ss.y - s.y);
        const isBehindPlanetSphere = !isFocus && (distSatToCam > distPlanetToCam) && (screenDistToPlanet < rpx * 0.95);

        sat.label.classList.toggle('focus', isFocus);
        sat.label.classList.toggle('dim', dimTarget === 1);
        sat.label.classList.toggle('hidden', ss.behind || introS < 0.2 || isBehindPlanetSphere);
        if (sat.glow && sat.glow.material) {
          sat.glow.material.opacity = isBehindPlanetSphere ? 0 : ((0.45 + 0.3 * fE) * (1 - p.dim * 0.8));
        }
      });
    });

    // ----- Naves viajando desde los satélites hacia los planetas (luz modulada 30% - 100%, velocidad reducida / 3) -----
    interplanetaryFleet.forEach((ship) => {
      ship.progress += dt * ship.speed;
      if (ship.progress >= 1.0) {
        ship.progress = 0;
        ship.speed = (0.11 + Math.random() * 0.08) / 3.0;
      }
      const t = ship.progress;
      const startPos = ship.sat.pos;
      const endPos = ship.planet.pos;

      // Desplazamiento desde el satélite hacia el planeta con arco espacial
      ship.group.position.lerpVectors(startPos, endPos, t);
      const arc = Math.sin(Math.PI * t) * ship.arcHeight;
      ship.group.position.addScaledVector(ship.arcDir, arc);

      // Escala de profundidad: se reducen lejos hasta /5 y crecen de cerca
      const shipDist = camera.position.distanceTo(ship.group.position);
      const shipDistRatio = clamp(Math.pow(L.dist / Math.max(1, shipDist), 1.2), 0.20, 3.5);

      // Luz modulada suavemente de 30% a 100% de luminosidad (siempre encendida)
      const shipLum = 0.30 + 0.70 * (0.5 + 0.5 * Math.sin(state.time * ship.blinkFreq + ship.blinkPhase));

      ship.group.visible = introK > 0.08;
      ship.dotGlow.material.opacity = shipLum * 0.95 * (1 - ship.planet.dim * 0.7) * brightFactor;
      ship.dotMesh.material.opacity = shipLum;
      ship.dotMesh.scale.setScalar((0.75 + 0.45 * shipLum) * shipDistRatio);
      ship.dotGlow.scale.setScalar(0.65 * clamp(shipDistRatio, 0.3, 2.5));
    });

    // Anti-colisión en pantalla: evita que los títulos de planetas y satélites se tapen en reposo
    const visibleLabels = [];
    const isAnyPlanetCardUnfolded = !!state.hovered || planets.some(p => p.focus > 0.05);
    if (sunLabel && sunLabel.classList.contains('visible')) {
      const sunSc = toScreen(sun.position);
      const sunOffsetDown = L.portrait ? 55 : 70;
      visibleLabels.push({ el: sunLabel, x: sunSc.x, y: sunSc.y + sunOffsetDown, w: 160, h: 32, scale: 1.0 });
    }
    planets.forEach(p => {
      if (p.label && !p.label.classList.contains('hidden') && !p.label.classList.contains('focus')) {
        const s = toScreen(p.pos);
        const rpx = pxRadius(p.worldRadius, p.pos);
        const pDist = camera.position.distanceTo(p.pos);
        const pDistRatio = clamp(L.dist / Math.max(1, pDist), 0.38, 1.35);
        const pScale = THREE.MathUtils.lerp(pDistRatio, 1.0, p.focus);
        visibleLabels.push({ el: p.label, x: s.x, y: s.y - rpx - 28, w: 180 * pScale, h: 44 * pScale, scale: pScale });
      }
    });

    for (let i = 0; i < visibleLabels.length; i++) {
      for (let j = i + 1; j < visibleLabels.length; j++) {
        const a = visibleLabels[i];
        const b = visibleLabels[j];
        const dx = Math.abs(a.x - b.x);
        const dy = Math.abs(a.y - b.y);
        const reqDx = (a.w + b.w) * 0.45;
        const reqDy = (a.h + b.h) * 0.55;
        if (dx < reqDx && dy < reqDy) {
          b.y += (reqDy - dy + 10);
          b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) scale(${(b.scale || 1.0).toFixed(3)})`;
        }
      }
    }

    orbitLines.forEach((o, i) => {
      o.line.scale.set(1, 1, 1);
      o.line.material.opacity = 0.16 * introK * (1 - planets[i].dim * 0.7) * brightFactor + 0.12 * planets[i].focus;
    });

    renderer.render(scene, camera);
  }

  if (window.gsap) {
    window.gsap.ticker.add((time, deltaMs) => tick(deltaMs / 1000));
  } else {
    let last = performance.now();
    const loop = (now) => { tick((now - last) / 1000); last = now; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
}

/* ---------------------------------------------------------
   Texto de la tarjeta del Sol (dibujado en canvas)
   --------------------------------------------------------- */
function drawSunText(c) {
  const W = 1024;
  const H = Math.round(W * 4.45 / 3.4);
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const setSpacing = (v) => { if ('letterSpacing' in ctx) ctx.letterSpacing = v; };

  const eyebrowFont = '800 34px Inter, sans-serif';
  const titleFont = '800 96px Outfit, Inter, sans-serif';
  const pFont = '600 44px Inter, sans-serif';
  ctx.font = titleFont;
  const titleLines = wrapText(ctx, 'Nivel Profesional y Asistencia Completa', 840);
  ctx.font = pFont;
  const pLines = wrapText(ctx, 'Pro y Enterprise: la élite de la gestión. IA que trabaja por ti y la asistencia más completa.', 800);

  const blocks = 40 + 50 + titleLines.length * 104 + 40 + pLines.length * 60 + 56 + 70 + 64 + 112 + 26 + 112;
  let y = (H - blocks) / 2;

  ctx.fillStyle = '#5a3200';
  ctx.font = eyebrowFont;
  setSpacing('9px');
  ctx.fillText('EL SOL DEL UNIVERSO', W / 2, y + 20);
  setSpacing('0px');
  y += 40 + 50;

  ctx.font = titleFont;
  ctx.fillStyle = '#241200';
  titleLines.forEach((l) => { ctx.fillText(l, W / 2, y + 50); y += 104; });
  y += 40;

  ctx.font = pFont;
  ctx.fillStyle = '#3a2000';
  pLines.forEach((l) => { ctx.fillText(l, W / 2, y + 28); y += 60; });
  y += 56;

  // chips Pro / Enterprise
  ctx.font = '800 34px Inter, sans-serif';
  const chips = ['PRO · 59 €/año', 'ENTERPRISE · 299 €/año'];
  const widths = chips.map(t => ctx.measureText(t).width + 56);
  const gap = 24;
  let x = (W - (widths[0] + widths[1] + gap)) / 2;
  chips.forEach((t, i) => {
    roundRect(ctx, x, y, widths[i], 70, 35);
    ctx.fillStyle = 'rgba(42,22,0,0.85)';
    ctx.fill();
    ctx.fillStyle = '#ffe7a3';
    ctx.fillText(t, x + widths[i] / 2, y + 36);
    x += widths[i] + gap;
  });
  y += 70 + 64;

  // botones
  const bw = 820, bx = (W - bw) / 2;
  roundRect(ctx, bx, y, bw, 112, 56);
  ctx.fillStyle = '#241200';
  ctx.fill();
  ctx.fillStyle = '#ffe7a3';
  ctx.font = '700 46px Inter, sans-serif';
  ctx.fillText('Acceder', W / 2, y + 58);
  y += 112 + 26;

  roundRect(ctx, bx, y, bw, 112, 56);
  ctx.fillStyle = 'rgba(42,22,0,0.28)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(42,22,0,0.5)';
  ctx.stroke();
  ctx.fillStyle = '#2a1600';
  ctx.fillText('Más Información', W / 2, y + 58);
}

/* ---------------------------------------------------------
   Inicialización segura del Universo
   --------------------------------------------------------- */
function startUniverseSafe() {
  const sec = document.getElementById('universo');
  const cnv = document.getElementById('universe-canvas');
  if (!sec || !cnv) return;
  if (!webglAvailable()) {
    sec.classList.add('no-webgl');
    return;
  }
  try {
    initUniverse();
  } catch (err) {
    console.error('[Universo] Error inicializando WebGL:', err);
    sec.classList.add('no-webgl');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startUniverseSafe);
} else {
  startUniverseSafe();
}

