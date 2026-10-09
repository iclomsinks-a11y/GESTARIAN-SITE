/* =========================================================
   GESTARIAN · Datos de planes, modales y autenticación
   (script clásico: expone funciones globales usadas por el HTML
   y por js/universe.js)
   ========================================================= */

// --- SUPABASE & CONSTANTS ---
const SUPABASE_URL = 'https://qjeqvgbsathhxikwdcco.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZXF2Z2JzYXRoaHhpa3dkY2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2OTI2NDAsImV4cCI6MjEwNDI2ODY0MH0.sHdOYpsU1WgEhZkZkmSyZBENy0_lJyPJf8FDlb8wkHE';

let supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn('[Supabase] Error al inicializar cliente:', e);
  }
}

const PLAN_URLS = {
  quick: 'https://quick-gestarian.web.app',
  lite: 'https://lite-gestarian.web.app',
  pro: 'https://pro-gestarian.web.app',
  enterprise: 'https://enterprise-gestarian.web.app',
  clientes: 'https://clientes-gestarian.web.app'
};

/* ---------- Datos de planes (fuente única para universo, grid y modales) ---------- */
const PLANS = {
  lite: {
    id: 'lite',
    name: 'Lite',
    tagline: 'El más básico',
    price: 'Gratis',
    period: 'para siempre',
    short: 'Gratis para siempre',
    limit: 'Guardado local en tu dispositivo',
    color: '#7c93ff',
    inherits: null,
    features: [
      'Confección de documentos.',
      'Envío por WhatsApp y Email.',
      'Impresión directa.',
      'Sin base de datos: guardado local en el dispositivo.',
      'Guardado documental interanual gratis.',
      'Asistencia total documental.'
    ],
    extras: [
      { label: 'Guardar más de 1 año', price: '19 €/año' }
    ],
    notes: [],
    satellites: [
      { title: 'Gestión Local', chip: '📁 Gestión Local', items: ['Confección de documentos', 'WhatsApp y Email', 'Impresión directa', 'Guardado local en tu equipo'], desc: 'Gestión ágil sin complicaciones: redacta presupuestos y facturas, imprímelos o compártelos directamente sin depender de la nube.', url: 'https://lite-gestarian.web.app' }
    ],
    summary: ['Confección de documentos', 'Envío por WhatsApp y Email', 'Impresión directa', 'Guardado local en el dispositivo']
  },
  quick: {
    id: 'quick',
    name: 'Quick',
    tagline: 'El siguiente paso',
    price: 'Gratis',
    period: '+ extras opcionales',
    short: 'Gratis + extras',
    limit: 'Solo facturas',
    color: '#38bdf8',
    inherits: 'Lite',
    features: [
      'Base de datos de clientes y proveedores.',
      'Facturas en un solo click.',
      'OCR para facturas recibidas (opcional · gratis sin OCR).'
    ],
    extras: [
      { label: 'Guardado de más de 1 año', price: '19 €/año' },
      { label: 'OCR de facturas recibidas', price: '+9,90 €/año' },
      { label: 'Rastreo automático de facturas por email + aviso en tiempo real', price: '+9,90 €/año' }
    ],
    notes: ['Solo facturas, NO presupuestos.'],
    satellites: [
      { title: 'Facturación Rápida', chip: '⚡ Facturación Rápida', items: ['BD Clientes y Proveedores', 'Facturas en 1-click', 'OCR facturas recibidas', 'Rastreo por email'], desc: 'Facturación instantánea con base de datos propia y OCR opcional para escanear facturas recibidas automáticamente.', url: 'https://quick-gestarian.web.app' }
    ],
    summary: ['Todo lo de Lite', 'BD de clientes y proveedores', 'Facturas en un solo click', 'OCR opcional (+9,90 €/año)']
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'El profesional',
    price: '59 €',
    period: '/ año',
    short: '59 €/año',
    limit: 'Hasta 50 empleados',
    color: '#a855f7',
    inherits: 'Quick',
    features: [
      'Gestión de presupuestos.',
      'Portal de clientes (Área de Clientes con acceso por invitación en clientes-gestarian.web.app).',
      'IA integrada para gestionar.',
      'Avisos de obligaciones fiscales.',
      'Generación y envío automático de informes a gestoría, previa confirmación.',
      'Agenda.',
      'Experiencia audiovisual: seguimiento visual con imágenes de la evolución del vehículo.'
    ],
    extras: [],
    notes: [],
    media: { src: 'assets/vehiculo-evolucion.jpg', alt: 'Seguimiento visual de la evolución de la reparación de un vehículo', captions: ['Recepción', 'En proceso', 'Entregado'] },
    satellites: [
      { title: 'Potencia', chip: '⚡ Potencia · IA', items: ['IA Integrada', 'OCR Ilimitado', 'BD Ilimitada', 'Hasta 50 usuarios'], desc: 'Automatización inteligente con IA y escaneo OCR ilimitado para clasificar gastos y presupuestos de forma autónoma.', url: 'https://pro-gestarian.web.app' },
      { title: 'Portal de Clientes', chip: '🛰️ Portal de Clientes', items: ['Invitación automática', 'Acceso seguro DNI/CIF', 'Seguimiento en tiempo real', 'Citas y presupuestos', 'Notificaciones inmediatas', 'Documentos siempre disponibles'], desc: 'Tus clientes acceden a su área privada mediante el enlace que les envías por email o WhatsApp. Sin registros complicados, sin contraseñas perdidas. Ellos entran con su email y DNI/CIF, y ven en tiempo real todo lo que haces en su vehículo.', url: 'https://clientes-gestarian.web.app' },
      { title: 'Experiencia Visual', chip: '📸 Experiencia Visual', items: ['Evolución del vehículo', 'Fotos y vídeos del proceso', 'Historial gráfico paso a paso', 'Notas técnicas'], desc: 'Seguimiento visual con fotos y vídeos de la evolución de los trabajos en el vehículo desde recepción hasta entrega final.', img: 'assets/vehiculo-evolucion.jpg', url: 'https://pro-gestarian.web.app' }
    ],
    summary: ['Todo lo de Quick', 'Presupuestos y Agenda', 'IA integrada + avisos fiscales', 'Portal de clientes e informes a gestoría']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'El máximo',
    price: '299 €',
    period: '/ año',
    short: '299 €/año',
    limit: 'Hasta 100 empleados · más: consultar',
    color: '#6366f1',
    inherits: 'Pro',
    status: 'Próximamente',
    features: [
      'Interconexión de empresas (red empresarial).',
      'Vinculación directa con la AEAT mediante certificación digital (evita gestoría).',
      'Órdenes de trabajo y pedidos entre empresas de la red.',
      'Cobertura total integrada (derivación de clientes por agenda).'
    ],
    extras: [],
    notes: ['Aún no operativa: disponible próximamente. Para más de 100 empleados, consulta condiciones.'],
    satellites: [
      { title: 'Red', chip: 'Red Empresarial', items: ['Red Empresarial', 'Vinculación AEAT', 'Certificación digital', 'Evita gestoría'], desc: 'Red empresarial interconectada con 10 estaciones de datos y vinculación directa con la Agencia Tributaria.', url: 'https://enterprise-gestarian.web.app' },
      { title: 'Cobertura', chip: 'Cobertura Total', items: ['Cobertura Total', 'Derivación de clientes por agenda', 'Hasta 100 empleados'], desc: 'Cobertura total con derivación automática de citas y clientes por agenda entre las sedes de la red.', url: 'https://enterprise-gestarian.web.app' }
    ],
    summary: ['Todo lo de Pro', 'Red empresarial interconectada', 'Vinculación AEAT (evita gestoría)', 'Cobertura total · hasta 100 empleados']
  }
};
window.GESTARIAN_PLANS = PLANS;

const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const ARROW_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';

let selectedPlan = 'pro';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  renderPlansGrid();
  checkUserSession();
  handleUrlQueryParams();
  initHeaderScroll();
  initHeroAnimation();
  initPlansAnimation();
});

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initHeroAnimation() {
  if (!window.gsap) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero h1', { y: 35, opacity: 0, duration: 0.9 })
    .from('.hero-sub', { y: 25, opacity: 0, duration: 0.8 }, '-=0.55')
    .from('.hero-actions .btn', { y: 20, opacity: 0, duration: 0.6, stagger: 0.12 }, '-=0.5')
    .from('.scroll-cue', { opacity: 0, duration: 0.8 }, '-=0.2');
}

/* Animación de aparición de tarjetas de planes: fade in 2 segundos cada una, la siguiente entra tras 1 segundo de la anterior */
function initPlansAnimation() {
  const cards = document.querySelectorAll('.plan-card');
  if (!cards.length) return;

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(cards,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 2.0, // Fade in de 2 segundos cada una
        stagger: 1.0,  // La siguiente entra tras un segundo de la anterior
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#plans-grid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  } else {
    // Fallback con IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cards.forEach((card, idx) => {
            card.style.transition = `opacity 2.0s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 1.0}s, transform 2.0s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 1.0}s`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.12 });

    const grid = document.getElementById('plans-grid');
    if (grid) observer.observe(grid);
  }
}

/* ---------- Grid resumen (accesible / fallback sin WebGL) ---------- */
function renderPlansGrid() {
  const grid = document.getElementById('plans-grid');
  if (!grid) return;
  grid.innerHTML = Object.values(PLANS).map(p => `
    <article class="plan-card" style="--pc:${p.color}" id="plan-card-${p.id}">
      ${p.status ? `<span class="soon">${p.status}</span>` : ''}
      <div class="orb"></div>
      <h3>${p.name}</h3>
      <div class="tagline">${p.tagline}</div>
      <div class="price">${p.price} <small>${p.period}</small></div>
      <ul>${p.summary.map(s => `<li>${s}</li>`).join('')}</ul>
      <div class="actions">
        <a href="${PLAN_URLS[p.id]}" target="_blank" rel="noopener" class="btn btn-sm ${p.id === 'pro' ? 'btn-primary' : ''}" id="grid-access-${p.id}">
          <span>${p.id === 'enterprise' ? 'Consultar' : 'Acceder a ' + p.name}</span>
          ${ARROW_SVG}
        </a>
        <button class="btn btn-sm" id="grid-details-${p.id}" onclick="openPlanDetails('${p.id}')" style="background:transparent">Ver detalles</button>
        <button class="btn btn-sm btn-ghost-gold" onclick="openPlanVideo('${p.id}')" style="margin-top: 4px; border-color: rgba(245, 196, 81, 0.35); color: #ffe7a3">🎥 Ver vídeo</button>
      </div>
    </article>
  `).join('');
}

/* ---------- Sesión ---------- */
function checkUserSession() {
  const savedSession = localStorage.getItem('gestarian_user_session');
  if (savedSession) {
    try {
      showUserLoggedInUI(JSON.parse(savedSession));
    } catch (e) {
      console.error('Error leyendo sesión local:', e);
    }
  } else if (supabaseClient) {
    supabaseClient.auth.getSession().then(({ data }) => {
      if (data && data.session && data.session.user) {
        const user = { email: data.session.user.email, id: data.session.user.id };
        localStorage.setItem('gestarian_user_session', JSON.stringify(user));
        showUserLoggedInUI(user);
      }
    });
  }
}

function showUserLoggedInUI(user) {
  const userBadge = document.getElementById('user-badge');
  const loginBtn = document.getElementById('btn-login-trigger');
  const emailDisplay = document.getElementById('user-email-display');
  const avatarDisplay = document.getElementById('user-avatar');

  if (userBadge && loginBtn) {
    userBadge.style.display = 'inline-flex';
    loginBtn.style.display = 'none';
    if (emailDisplay) emailDisplay.textContent = user.email || 'Usuario';
    if (avatarDisplay) avatarDisplay.textContent = (user.email || 'U').charAt(0).toUpperCase();
  }
}

function logoutUser() {
  localStorage.removeItem('gestarian_user_session');
  if (supabaseClient) supabaseClient.auth.signOut();
  window.location.reload();
}

// Deep-linking via query params (e.g. ?plan=pro or ?action=register&plan=lite)
function handleUrlQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const planParam = urlParams.get('plan');
  const actionParam = urlParams.get('action');

  if (planParam && PLAN_URLS[planParam.toLowerCase()]) {
    selectedPlan = planParam.toLowerCase();
  }
  if (actionParam === 'register') openAuthModal('register', selectedPlan);
  else if (actionParam === 'login') openAuthModal('login', selectedPlan);
}

// --- MAIN ACCEDER LOGIC ---
// - Logged in → acceso directo a la versión.
// - No registrado → acceso a la versión o formulario fiscal.
function handlePlanAccess(plan) {
  selectedPlan = plan || 'pro';
  closeAllModals();
  const url = PLAN_URLS[selectedPlan] || PLAN_URLS.pro;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ---------- Modales genéricos ---------- */
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
  if (!document.querySelector('.modal-overlay.active')) document.body.classList.remove('modal-open');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  document.body.classList.remove('modal-open');
}

window.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const open = document.querySelectorAll('.modal-overlay.active');
    if (open.length) closeModal(open[open.length - 1].id);
  }
});

/* ---------- Modales Explicativos de Versiones y Satélites ---------- */
function openLiteModal() {
  openModal('modal-lite');
}

function openQuickModal() {
  openModal('modal-quick');
}

function openPortalClientesInfo() {
  openModal('modal-portal-clientes');
}

/* =========================================================
   GESTIÓN DE EXPEDIENTES, ROADMAP Y PRESUPUESTOS (PRO & ENTERPRISE)
   Arquitectura Minimalista Auténtica Gestarian Pro
   ========================================================= */
let isCitaConfirmada = true;
let citaFecha = '2026-10-12';
let citaHora = '09:30';
let isBudget419Accepted = true;
let isRepair419Finished = false;
let isCalidadRoadmapActive = false;
let roadmapCobradoAmount = 0.00;
let roadmapCobroHistorial = [];
let currentExpVersion = 'pro';
let currentExpTab = 'roadmap';
let activeMinimalistDoc = null;

function formatearFechaCitaCorta(fechaIso) {
  if (!fechaIso) return '12 OCT';
  try {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const parts = fechaIso.split('-');
    if (parts.length === 3) {
      const dia = parseInt(parts[2], 10);
      const mes = meses[parseInt(parts[1], 10) - 1] || 'OCT';
      return `${dia} ${mes}`;
    }
    return fechaIso;
  } catch(e) {
    return '12 OCT';
  }
}

function initExpedientesState() {
  const savedCita = localStorage.getItem('gestarian_cita_confirmada');
  if (savedCita !== null) {
    isCitaConfirmada = savedCita === 'true';
  }
  const savedCitaFecha = localStorage.getItem('gestarian_cita_fecha');
  if (savedCitaFecha) citaFecha = savedCitaFecha;
  const savedCitaHora = localStorage.getItem('gestarian_cita_hora');
  if (savedCitaHora) citaHora = savedCitaHora;

  const savedBudget = localStorage.getItem('gestarian_budget_419_accepted');
  if (savedBudget !== null) {
    isBudget419Accepted = savedBudget === 'true';
  }
  const savedRepair = localStorage.getItem('gestarian_repair_419_finished');
  if (savedRepair !== null) {
    isRepair419Finished = savedRepair === 'true';
  }
  const savedCalidad = localStorage.getItem('gestarian_calidad_active');
  if (savedCalidad !== null) {
    isCalidadRoadmapActive = savedCalidad === 'true';
  }
  const savedCobrado = localStorage.getItem('gestarian_cobrado_amount');
  if (savedCobrado !== null) {
    roadmapCobradoAmount = parseFloat(savedCobrado) || 0;
  }
  const savedHistorial = localStorage.getItem('gestarian_cobro_historial');
  if (savedHistorial) {
    try { roadmapCobroHistorial = JSON.parse(savedHistorial) || []; } catch(e) {}
  }
}

function openExpedientesModal(version = 'pro') {
  currentExpVersion = version === 'enterprise' ? 'enterprise' : 'pro';
  initExpedientesState();
  switchExpedientesVersion(currentExpVersion);
  switchExpedientesTab('roadmap');
  applyBudget419DOMState();
  openModal('modal-expedientes');
}

function switchExpedientesVersion(version) {
  currentExpVersion = version === 'enterprise' ? 'enterprise' : 'pro';
  const isEnt = currentExpVersion === 'enterprise';
  
  const btnPro = document.getElementById('btn-version-pro');
  const btnEnt = document.getElementById('btn-version-enterprise');
  const titlePlanName = document.getElementById('exp-current-plan-name');
  const enterpriseStrip = document.getElementById('exp-enterprise-network-strip');
  const enterpriseCitaAction = document.getElementById('cita-enterprise-action');
  
  if (btnPro && btnEnt) {
    btnPro.classList.toggle('active', !isEnt);
    btnEnt.classList.toggle('active', isEnt);
    btnEnt.classList.toggle('enterprise-active', isEnt);
  }
  
  if (titlePlanName) {
    titlePlanName.textContent = isEnt ? 'Versión ENTERPRISE' : 'Versión PRO';
    titlePlanName.style.color = isEnt ? 'var(--c-ent)' : 'var(--c-pro)';
  }

  if (enterpriseStrip) {
    enterpriseStrip.style.display = isEnt ? 'flex' : 'none';
  }

  if (enterpriseCitaAction) {
    enterpriseCitaAction.style.display = isEnt ? 'inline-flex' : 'none';
  }
}

function switchExpedientesTab(tabName) {
  currentExpTab = tabName;
  const tabs = ['roadmap', 'budgets', 'simulator'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-exp-${t}`);
    const view = document.getElementById(`view-exp-${t}`);
    if (btn) btn.classList.toggle('active', t === tabName);
    if (view) view.style.display = t === tabName ? 'block' : 'none';
  });
}

function toggleRoadmapProDrawer(drawerId) {
  const drawer = document.getElementById(`drawer-pro-${drawerId}`);
  if (!drawer) return;
  const isHidden = drawer.style.display === 'none' || !drawer.style.display;
  drawer.style.display = isHidden ? 'block' : 'none';

  // Toggle icon on the corresponding bar
  const bar = document.getElementById(`bar-pro-${drawerId}`);
  if (bar) {
    const circle = bar.querySelector('.circle-icon');
    if (circle) {
      circle.textContent = isHidden ? '−' : '＋';
    }
  }
}

function marcarCitaPro(confirmada, customFecha, customHora) {
  isCitaConfirmada = typeof confirmada === 'boolean' ? confirmada : true;
  if (customFecha) citaFecha = customFecha;
  if (customHora) citaHora = customHora;

  localStorage.setItem('gestarian_cita_confirmada', isCitaConfirmada ? 'true' : 'false');
  localStorage.setItem('gestarian_cita_fecha', citaFecha);
  localStorage.setItem('gestarian_cita_hora', citaHora);

  applyBudget419DOMState();
  if (isCitaConfirmada) {
    showAppNotice(`✓ Cita confirmada: ${formatearFechaCitaCorta(citaFecha)} a las ${citaHora}h.`);
  } else {
    showAppNotice('⏳ Cita marcada como pendiente.');
  }
}

function enviarNotificacionCitaWhatsApp() {
  const fechaTexto = `${formatearFechaCitaCorta(citaFecha)} a las ${citaHora}h`;
  const mensaje = encodeURIComponent(`Hola Juan Pérez, confirmamos su cita en taller Gestarian para su vehículo MERCEDES-BENZ (2849-LKR) el ${fechaTexto}. Le esperamos.`);
  window.open(`https://wa.me/?text=${mensaje}`, '_blank');
  showAppNotice('📲 Recordatorio de cita enviado por WhatsApp.');
}

function derivarCitaRedEnterprise() {
  showAppNotice('🌐 Cita derivada automáticamente a la Estación 02 de la Red B2B Gestarian Enterprise.');
  const subCita = document.getElementById('sub-pro-cita');
  if (subCita) {
    subCita.textContent = 'DERIVADA A RED B2B · ESTACIÓN 02';
  }
}

function toggleBudgetAcceptedState(accepted) {
  isBudget419Accepted = !!accepted;
  localStorage.setItem('gestarian_budget_419_accepted', isBudget419Accepted ? 'true' : 'false');
  if (!isBudget419Accepted) {
    isRepair419Finished = false;
    localStorage.setItem('gestarian_repair_419_finished', 'false');
  }
  applyBudget419DOMState();
}

function toggleRepairFinishedState(forceVal) {
  if (typeof forceVal === 'boolean') {
    isRepair419Finished = forceVal;
  } else {
    isRepair419Finished = !isRepair419Finished;
  }
  localStorage.setItem('gestarian_repair_419_finished', isRepair419Finished ? 'true' : 'false');
  applyBudget419DOMState();
  if (isRepair419Finished) {
    showAppNotice('⚙️ Taller finalizado · Factura oficial F260042 y Control de Cobro desbloqueados.');
  }
}

function toggleControlCalidadRoadmap() {
  isCalidadRoadmapActive = !isCalidadRoadmapActive;
  localStorage.setItem('gestarian_calidad_active', isCalidadRoadmapActive ? 'true' : 'false');
  applyBudget419DOMState();
  if (isCalidadRoadmapActive) {
    showAppNotice('✓ Fase de Control de Calidad activada en el Roadmap.');
  } else {
    showAppNotice('ℹ️ Control de Calidad desactivado (Opcional).');
  }
}

function handleRoadmapImageUpload(event, phase) {
  const files = event.target.files;
  if (!files || !files.length) return;
  const container = document.getElementById(`roadmap-images-${phase}`);
  if (!container) return;

  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = `Foto ${phase}`;
      img.className = 'roadmap-img-thumb';
      img.title = file.name;
      container.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
  showAppNotice(`📷 Imagen adjuntada con éxito a ${phase}.`);
}

function applyBudget419DOMState() {
  const isAcc = isBudget419Accepted;
  const isRepFin = isRepair419Finished && isAcc;
  const totalFactura = 459.80;
  const pendiente = Math.max(0, totalFactura - roadmapCobradoAmount);
  const isTotalCobrado = pendiente === 0;

  // 1. BARRA 1: RECEPCIÓN
  const barRecepcion = document.getElementById('bar-pro-recepcion');
  const subRecepcion = document.getElementById('sub-pro-recepcion');
  if (barRecepcion) barRecepcion.className = 'roadmap-pro-bar bar-green';
  if (subRecepcion) subRecepcion.textContent = 'RECEPCIÓN REGISTRADA';

  // 2. BARRA 2: PRESUPUESTO
  const barPresupuesto = document.getElementById('bar-pro-presupuesto');
  const subPresupuesto = document.getElementById('sub-pro-presupuesto');
  const metaPresupuesto = document.getElementById('presupuesto-meta-estado');
  if (barPresupuesto) {
    barPresupuesto.className = 'roadmap-pro-bar ' + (isAcc ? 'bar-orange' : 'bar-gray');
  }
  if (subPresupuesto) {
    subPresupuesto.textContent = isAcc ? 'PRESUPUESTO ACEPTADO · 459,80 €' : 'PRESUPUESTO BORRADOR · PENDIENTE';
  }
  if (metaPresupuesto) {
    metaPresupuesto.innerHTML = isAcc
      ? `Estado: <strong style="color:#86efac">Aceptado</strong>`
      : `Estado: <strong style="color:#fde68a">Borrador</strong>`;
  }

  // 3. BARRA 3: CITA
  const barCita = document.getElementById('bar-pro-cita');
  const subCita = document.getElementById('sub-pro-cita');
  const pillCitaFecha = document.getElementById('cita-pill-fecha');
  const pillCitaHora = document.getElementById('cita-pill-hora');
  const pillCitaEstado = document.getElementById('cita-pill-estado');
  if (barCita) {
    barCita.className = 'roadmap-pro-bar ' + (isCitaConfirmada ? 'bar-blue' : 'bar-gray');
  }
  if (subCita) {
    subCita.textContent = isCitaConfirmada
      ? `CITA CONFIRMADA · ${formatearFechaCitaCorta(citaFecha)} ${citaHora}H`
      : 'PENDIENTE DE CITA';
  }
  if (pillCitaFecha) pillCitaFecha.textContent = citaFecha;
  if (pillCitaHora) pillCitaHora.textContent = `${citaHora}h`;
  if (pillCitaEstado) {
    pillCitaEstado.innerHTML = isCitaConfirmada
      ? `Estado: <strong style="color:#86efac">Confirmada</strong>`
      : `Estado: <strong style="color:#fde68a">Pendiente</strong>`;
  }

  // 4. BARRA 4: TALLER
  const barTaller = document.getElementById('bar-pro-taller');
  const subTaller = document.getElementById('sub-pro-taller');
  const metaTaller = document.getElementById('taller-meta-estado');
  const btnToggleFinTaller = document.getElementById('btn-toggle-fin-taller');
  if (barTaller) {
    if (isRepFin) {
      barTaller.className = 'roadmap-pro-bar bar-green';
    } else if (isAcc) {
      barTaller.className = 'roadmap-pro-bar bar-purple';
    } else {
      barTaller.className = 'roadmap-pro-bar bar-gray';
    }
  }
  if (subTaller) {
    if (isRepFin) {
      subTaller.textContent = 'TALLER FINALIZADO · FACTURACIÓN ACTIVA';
    } else if (isAcc) {
      subTaller.textContent = 'EN CURSO · REPARACIÓN';
    } else {
      subTaller.textContent = 'PENDIENTE INICIO TALLER';
    }
  }
  if (metaTaller) {
    metaTaller.innerHTML = isRepFin
      ? `Estado: <strong style="color:#86efac">Finalizado</strong>`
      : (isAcc ? `Estado: <strong style="color:#c084fc">En Curso</strong>` : `Estado: <strong>En Espera</strong>`);
  }
  if (btnToggleFinTaller) {
    btnToggleFinTaller.textContent = isRepFin
      ? '✓ Taller Finalizado (Pulsar para Reabrir)'
      : '⚙️ Marcar Finalizado → Desbloquear Facturación';
    btnToggleFinTaller.style.background = isRepFin
      ? 'rgba(34,197,94,0.2)'
      : 'linear-gradient(135deg,#a855f7,#6366f1)';
    btnToggleFinTaller.style.border = isRepFin ? '1px solid #22c55e' : 'none';
  }

  // 5. BARRA 5: CONTROL DE CALIDAD
  const barCalidad = document.getElementById('bar-pro-calidad');
  const subCalidad = document.getElementById('sub-pro-calidad');
  const metaCalidad = document.getElementById('calidad-meta-estado');
  const btnCalidadAction = document.getElementById('btn-toggle-calidad-action');
  if (barCalidad) {
    if (isCalidadRoadmapActive) {
      barCalidad.className = 'roadmap-pro-bar bar-cyan';
    } else {
      barCalidad.className = 'roadmap-pro-bar bar-gray';
    }
  }
  if (subCalidad) {
    if (isCalidadRoadmapActive) {
      subCalidad.textContent = isRepFin ? 'CONTROL DE CALIDAD SUPERADO' : 'EN PRUEBAS DE CALIDAD';
    } else {
      subCalidad.textContent = 'OPCIONAL · PULSAR PARA ACTIVAR';
    }
  }
  if (metaCalidad) {
    metaCalidad.innerHTML = isCalidadRoadmapActive
      ? `Estado: <strong style="color:#38bdf8">${isRepFin ? 'Superado' : 'Activo'}</strong>`
      : `Estado: <strong>Desactivado</strong>`;
  }
  if (btnCalidadAction) {
    btnCalidadAction.textContent = isCalidadRoadmapActive ? '✓ Fase Calidad Activa (1 Clic Desactivar)' : '⚡ Activar Calidad con 1 Clic';
    btnCalidadAction.style.background = isCalidadRoadmapActive ? 'rgba(56,189,248,0.25)' : '#0284c7';
    btnCalidadAction.style.border = isCalidadRoadmapActive ? '1px solid #38bdf8' : 'none';
  }

  // 6. BARRA 6: FACTURACIÓN
  const barFacturacion = document.getElementById('bar-pro-facturacion');
  const subFacturacion = document.getElementById('sub-pro-facturacion');
  const metaFactura = document.getElementById('factura-meta-estado');
  const actionFactura = document.getElementById('drawer-action-factura');
  if (barFacturacion) {
    barFacturacion.className = 'roadmap-pro-bar ' + (isRepFin ? 'bar-green' : 'bar-gray');
  }
  if (subFacturacion) {
    subFacturacion.textContent = isRepFin
      ? 'FACTURA F260042 DISPONIBLE'
      : 'BLOQUEADA (ESPERANDO FIN DE TALLER)';
  }
  if (metaFactura) {
    metaFactura.innerHTML = isRepFin
      ? `Estado: <strong style="color:#86efac">Emitida</strong>`
      : `Estado: <strong style="color:#94a3b8">Bloqueada</strong>`;
  }
  if (actionFactura) {
    actionFactura.style.display = isRepFin ? 'block' : 'none';
  }

  // 7. BARRA 7: CONTROL DE COBRO & RECIBOS
  const barCobro = document.getElementById('bar-pro-cobro');
  const subCobro = document.getElementById('sub-pro-cobro');
  const elCobrado = document.getElementById('roadmap-cobro-cobrado');
  const elPendiente = document.getElementById('roadmap-cobro-pendiente');
  const listAbonos = document.getElementById('roadmap-abonos-list');
  if (barCobro) {
    if (isRepFin) {
      if (isTotalCobrado) {
        barCobro.className = 'roadmap-pro-bar bar-green';
      } else if (roadmapCobradoAmount > 0) {
        barCobro.className = 'roadmap-pro-bar bar-amber';
      } else {
        barCobro.className = 'roadmap-pro-bar bar-orange';
      }
    } else {
      barCobro.className = 'roadmap-pro-bar bar-gray';
    }
  }
  if (subCobro) {
    if (isRepFin) {
      if (isTotalCobrado) {
        subCobro.textContent = 'TOTALMENTE COBRADO · 459,80 €';
      } else if (roadmapCobradoAmount > 0) {
        subCobro.textContent = `COBRADO: ${roadmapCobradoAmount.toFixed(2)} € · PENDIENTE: ${pendiente.toFixed(2)} €`;
      } else {
        subCobro.textContent = 'PENDIENTE DE COBRO · 459,80 €';
      }
    } else {
      subCobro.textContent = 'EN ESPERA DE FACTURACIÓN';
    }
  }
  if (elCobrado) elCobrado.textContent = `${roadmapCobradoAmount.toFixed(2)} €`;
  if (elPendiente) elPendiente.textContent = `${pendiente.toFixed(2)} €`;

  if (listAbonos) {
    if (roadmapCobroHistorial.length === 0) {
      listAbonos.innerHTML = `
        <li class="roadmap-abono-row" style="color:var(--text-muted)">
          <span>Sin abonos registrados aún. Pulsa en los botones superiores para registrar cobros.</span>
        </li>
      `;
    } else {
      listAbonos.innerHTML = roadmapCobroHistorial.map((ab) => `
        <li class="roadmap-abono-row">
          <span>💶 Recibo #${ab.id} · ${ab.fecha} (${ab.metodo})</span>
          <strong style="color:#4ade80">+${ab.importe.toFixed(2)} €</strong>
        </li>
      `).join('');
    }
  }

  // 8. Tarjeta del Presupuesto #PRE-2026-419 (Tab 2)
  const budgetCard419 = document.getElementById('budget-card-419');
  const budgetBadge419 = document.getElementById('budget-badge-status-419');
  const budgetAudit419 = document.getElementById('budget-audit-text-419');
  const nowStr = new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  if (budgetCard419) {
    budgetCard419.classList.toggle('budget-accepted', isAcc);
  }
  if (budgetBadge419) {
    budgetBadge419.className = 'step-badge ' + (isAcc ? 'step-badge-green' : 'step-badge-amber');
    budgetBadge419.textContent = isAcc ? '🟢 ACEPTADO POR EL CLIENTE' : '⏳ PENDIENTE DE APROBACIÓN';
  }
  if (budgetAudit419) {
    budgetAudit419.innerHTML = isAcc
      ? `✓ <strong>Presupuesto aceptado digitalmente</strong> el <span>${nowStr}</span>. (Factura disponible al finalizar taller).`
      : `⏳ <strong>Presupuesto emitido</strong>. En espera de aceptación del cliente.`;
  }
}

function registrarAbonoRoadmap(importe) {
  const numImp = parseFloat(importe) || 0;
  const nuevoCobrado = Math.min(459.80, roadmapCobradoAmount + numImp);
  const realSumado = nuevoCobrado - roadmapCobradoAmount;
  if (realSumado <= 0) {
    showAppNotice('ℹ️ La factura ya está totalmente liquidada.');
    return;
  }
  roadmapCobradoAmount = nuevoCobrado;
  localStorage.setItem('gestarian_cobrado_amount', roadmapCobradoAmount.toString());

  const nuevoAbono = {
    id: `R26-${String(roadmapCobroHistorial.length + 1).padStart(3, '0')}`,
    fecha: new Date().toLocaleDateString('es-ES'),
    importe: realSumado,
    metodo: 'Tarjeta / TPV Taller'
  };
  roadmapCobroHistorial.push(nuevoAbono);
  localStorage.setItem('gestarian_cobro_historial', JSON.stringify(roadmapCobroHistorial));

  applyBudget419DOMState();
  showAppNotice(`💶 Abono de ${realSumado.toFixed(2)} € registrado con éxito. Recibo #${nuevoAbono.id} generado.`);
}

function abrirReciboDesdeRoadmap() {
  const total = 459.80;
  const cobrado = roadmapCobradoAmount > 0 ? roadmapCobradoAmount : 200.00;
  const pendiente = Math.max(0, total - cobrado);

  const reciboDoc = {
    tipo: 'RECIBO',
    id: `R26-00${Math.max(1, roadmapCobroHistorial.length)}`,
    fecha: new Date().toISOString().split('T')[0],
    fechaPropuestaEntrega: '2026-10-12',
    expedienteId: 'EXP-2026-0842',
    estado: pendiente === 0 ? 'COBRADA_TOTAL' : 'ABONO_PARCIAL',
    emisor: {
      nombre: 'DM CAR TALLER MECÁNICO S.L.',
      cif: 'B12345678',
      direccion: 'Calle Metalurgia 18, 28830 Madrid',
      telefono: '+34 912 345 678',
      email: 'cobros@dmcar-taller.es'
    },
    cliente: {
      razonSocial: 'Juan Pérez Gómez',
      cifNif: '48.912.431-K',
      direccion: 'Av. América 45, 3ºB, Madrid',
      telefono: '+34 600 123 456',
      email: 'juan.perez@email.com'
    },
    vehiculo: {
      marcaModelo: 'Mercedes-Benz A200d (W177)',
      matricula: '2849-LKR'
    },
    lineas: [
      { concepto: 'Abono / Pago de liquidación factura F260042', cantidad: 1, precioUnitario: cobrado, total: cobrado }
    ],
    totales: {
      baseImponible: Number((cobrado / 1.21).toFixed(2)),
      tipoIva: 21,
      cuotaIva: Number((cobrado - cobrado / 1.21).toFixed(2)),
      total: cobrado,
      cobrado: cobrado,
      pendiente: pendiente
    },
    metodoPago: 'TPV / Tarjeta Bancaria',
    observaciones: `Recibo de abono expedido por DM CAR TALLER MECÁNICO S.L. Saldo pendiente del expediente: ${pendiente.toFixed(2)} €.`
  };

  DOCUMENTOS_MINIMALISTAS_DB[reciboDoc.id] = reciboDoc;
  openMinimalistDocModal('RECIBO', reciboDoc.id);
}

function enviarRecordatorioPagoRoadmap() {
  const pendiente = Math.max(0, 459.80 - roadmapCobradoAmount);
  if (pendiente <= 0) {
    showAppNotice('✓ La factura está totalmente pagada. No existen deudas pendientes.');
    return;
  }
  const text = encodeURIComponent(`Hola Juan Pérez Gómez, le recordamos que dispone de un saldo pendiente de ${pendiente.toFixed(2)} € correspondiente a la factura F260042 (Mercedes-Benz 2849-LKR). Puede abonarlo en recepción o mediante enlace seguro.`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
  showAppNotice('📲 Recordatorio de pago transmitido por WhatsApp.');
}

/* =========================================================
   VISOR DOCUMENTAL MINIMALISTA (ESTILO GESTARIAN QUICK)
   Facturas, Presupuestos, Recibos, Órdenes de Trabajo, Solicitudes
   ========================================================= */
const DOCUMENTOS_MINIMALISTAS_DB = {
  'PRE-2026-419': {
    tipo: 'PRESUPUESTO',
    id: 'P260082',
    altId: 'PRE-2026-419',
    fecha: '2026-10-07',
    fechaPropuestaEntrega: '2026-10-12',
    expedienteId: 'EXP-2026-0842',
    solicitudId: 'SOL-2026-001',
    estado: 'ACEPTADO POR EL CLIENTE',
    emisor: {
      nombre: 'DM CAR TALLER MECÁNICO S.L.',
      cif: 'B12345678',
      direccion: 'Calle Metalurgia 18, 28830 Madrid',
      telefono: '+34 912 345 678',
      email: 'contacto@dmcar-taller.es'
    },
    cliente: {
      razonSocial: 'Juan Pérez Gómez',
      cifNif: '48.912.431-K',
      direccion: 'Av. América 45, 3ºB, Madrid',
      telefono: '+34 600 123 456',
      email: 'juan.perez@email.com'
    },
    vehiculo: {
      marcaModelo: 'Mercedes-Benz A200d (W177)',
      matricula: '2849-LKR',
      km: '84.210'
    },
    lineas: [
      { concepto: 'Mano de obra especializada (Diagnosis y Sustitución de piezas)', cantidad: 3.5, precioUnitario: 51.43, total: 180.00 },
      { concepto: 'Kit de distribución original reforzado con tensor hidráulico', cantidad: 1, precioUnitario: 145.00, total: 145.00 },
      { concepto: 'Bomba de agua de refrigeración y junta estanca', cantidad: 1, precioUnitario: 55.00, total: 55.00 },
      { concepto: 'Inspección técnica visual, diagnosis OCR y verificación IA', cantidad: 1, precioUnitario: 0.00, total: 0.00 }
    ],
    totales: {
      baseImponible: 380.00,
      tipoIva: 21,
      cuotaIva: 79.80,
      total: 459.80
    },
    observaciones: 'Presupuesto validado digitalmente. La factura final oficial se genera únicamente al finalizar la reparación en el Roadmap.'
  },
  'F260042': {
    tipo: 'FACTURA',
    id: 'F260042',
    fecha: '2026-10-08',
    fechaPropuestaEntrega: '2026-10-12',
    expedienteId: 'EXP-2026-0842',
    solicitudId: 'SOL-2026-001',
    estado: 'EMITIDA (FIN DE REPARACIÓN)',
    emisor: {
      nombre: 'DM CAR TALLER MECÁNICO S.L.',
      cif: 'B12345678',
      direccion: 'Calle Metalurgia 18, 28830 Madrid',
      telefono: '+34 912 345 678',
      email: 'facturacion@dmcar-taller.es'
    },
    cliente: {
      razonSocial: 'Juan Pérez Gómez',
      cifNif: '48.912.431-K',
      direccion: 'Av. América 45, 3ºB, Madrid',
      telefono: '+34 600 123 456',
      email: 'juan.perez@email.com'
    },
    vehiculo: {
      marcaModelo: 'Mercedes-Benz A200d (W177)',
      matricula: '2849-LKR',
      km: '84.215'
    },
    lineas: [
      { concepto: 'Mano de obra certificada según orden de taller finalizada', cantidad: 3.5, precioUnitario: 51.43, total: 180.00 },
      { concepto: 'Kit de distribución original Mercedes-Benz', cantidad: 1, precioUnitario: 145.00, total: 145.00 },
      { concepto: 'Bomba de agua + Líquido refrigerante G12', cantidad: 1, precioUnitario: 55.00, total: 55.00 }
    ],
    totales: {
      baseImponible: 380.00,
      tipoIva: 21,
      cuotaIva: 79.80,
      total: 459.80,
      cobrado: 0.00,
      pendiente: 459.80
    },
    observaciones: 'Factura Ordinaria generada automáticamente al finalizar la parada de taller en el Roadmap del expediente EXP-2026-0842.'
  }
};

function openMinimalistDocModal(tipo, docKey) {
  const doc = DOCUMENTOS_MINIMALISTAS_DB[docKey] || {
    tipo: tipo || 'FACTURA',
    id: docKey || 'DOC-2026-001',
    fecha: new Date().toISOString().split('T')[0],
    fechaPropuestaEntrega: '2026-10-15',
    expedienteId: 'EXP-2026-0842',
    estado: 'DOCUMENTO OFICIAL',
    emisor: {
      nombre: 'DM CAR TALLER MECÁNICO S.L.',
      cif: 'B12345678',
      direccion: 'Calle Metalurgia 18, 28830 Madrid',
      telefono: '+34 912 345 678',
      email: 'contacto@dmcar-taller.es'
    },
    cliente: {
      razonSocial: 'Cliente Gestarian',
      cifNif: '12345678Z',
      email: 'cliente@gestarian.com'
    },
    vehiculo: {
      marcaModelo: 'Mercedes-Benz A200d',
      matricula: '2849-LKR'
    },
    lineas: [
      { concepto: 'Trabajos técnicos y mantenimiento general', cantidad: 1, precioUnitario: 380.00, total: 380.00 }
    ],
    totales: {
      baseImponible: 380.00,
      tipoIva: 21,
      cuotaIva: 79.80,
      total: 459.80
    }
  };

  activeMinimalistDoc = doc;

  const container = document.getElementById('doc-minimalista-wrapper');
  const content = document.getElementById('doc-minimalista-content');
  if (!content || !container) return;

  const isCompleted = doc.estado.includes('ACEPTADO') || doc.estado.includes('FINALIZ') || doc.estado.includes('COBRAD');
  const isProgress = doc.estado.includes('CURSO') || doc.estado.includes('EMITIDA');
  
  container.className = 'modal-container doc-minimalista-container ' + (isCompleted ? 'border-status-completed' : (isProgress ? 'border-status-progress' : 'border-status-pending'));

  content.innerHTML = `
    <!-- Cabecera Minimalista Superior -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:1.2rem;margin-bottom:1.4rem;gap:1rem;flex-wrap:wrap">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
          <span style="font-size:0.75rem;padding:3px 10px;border-radius:999px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;background:${isCompleted ? 'rgba(34,197,94,0.15);color:#86efac;border:1px solid rgba(34,197,94,0.3)' : 'rgba(56,189,248,0.15);color:#7dd3fc;border:1px solid rgba(56,189,248,0.3)'}">
            ${doc.tipo} · ${doc.estado}
          </span>
          ${doc.expedienteId ? `<span style="font-size:0.75rem;font-family:monospace;padding:2px 8px;border-radius:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#cbd5e1">📁 ${doc.expedienteId}</span>` : ''}
        </div>
        <h2 style="font-size:1.6rem;font-weight:800;font-family:'Outfit',sans-serif;color:#fff;margin:0 0 4px 0">
          ${doc.tipo === 'FACTURA' ? 'Factura Oficial Ordinaria' : (doc.tipo === 'PRESUPUESTO' ? 'Presupuesto Técnico Detallado' : 'Documento Oficial Gestarian')}
        </h2>
        <div style="font-family:monospace;font-size:1rem;font-weight:700;color:#e2e8f0">
          Ref: <span style="color:var(--c-gold)">${doc.id}</span> ${doc.altId ? `<span style="color:rgba(255,255,255,0.4)">(${doc.altId})</span>` : ''}
        </div>
      </div>

      <div style="text-align:right;font-size:0.82rem">
        <div style="color:var(--text-muted)">Fecha de Emisión:</div>
        <div style="font-family:monospace;font-weight:700;color:#fff;margin-bottom:4px">${doc.fecha}</div>
        ${doc.fechaPropuestaEntrega ? `
          <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:4px">
            <div style="color:#f5c451;font-size:0.75rem;font-weight:600">Fecha Propuesta Entrega:</div>
            <div style="font-family:monospace;font-weight:700;color:#ffdf8a">${doc.fechaPropuestaEntrega}</div>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Empresa Emisora & Cliente -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1rem;margin-bottom:1.2rem;font-size:0.82rem">
      <div style="background:rgba(255,255,255,0.02);padding:0.9rem 1.1rem;border-radius:12px;border:1px solid rgba(255,255,255,0.06)">
        <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);font-weight:700;display:block;margin-bottom:4px">Emisor / Taller</span>
        <div style="font-weight:700;color:#fff;font-size:0.95rem">${doc.emisor.nombre}</div>
        <div style="font-family:monospace;color:var(--text-muted)">CIF: ${doc.emisor.cif}</div>
        <div style="color:var(--text-muted)">${doc.emisor.direccion}</div>
        <div style="color:rgba(255,255,255,0.5)">${doc.emisor.telefono} · ${doc.emisor.email}</div>
      </div>

      <div style="background:rgba(255,255,255,0.02);padding:0.9rem 1.1rem;border-radius:12px;border:1px solid rgba(255,255,255,0.06)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.4);font-weight:700">Cliente / Titular</span>
          <div style="display:flex;align-items:center;gap:8px">
            ${doc.cliente.telefono ? `
              <a href="tel:${doc.cliente.telefono}" title="Llamar a ${doc.cliente.telefono}" style="color:rgba(255,255,255,0.4);text-decoration:none;display:inline-flex;align-items:center" onmouseover="this.style.color='#34d399'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </a>
              <a href="https://wa.me/${doc.cliente.telefono.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" title="Enviar WhatsApp" style="color:rgba(255,255,255,0.4);text-decoration:none;display:inline-flex;align-items:center" onmouseover="this.style.color='#34d399'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </a>
            ` : ''}
            ${doc.cliente.email ? `
              <a href="mailto:${doc.cliente.email}" title="Enviar email" style="color:rgba(255,255,255,0.4);text-decoration:none;display:inline-flex;align-items:center" onmouseover="this.style.color='#38bdf8'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </a>
            ` : ''}
            <!-- Botón flotante eliminar cliente: cubo de basura, sin relleno, sin envoltorio -->
            <button type="button" onclick="eliminarClienteDeDocumento('${doc.id}', '${doc.cliente.razonSocial}')" title="Eliminar cliente" aria-label="Eliminar cliente" style="background:none;border:none;padding:0;margin:0;color:rgba(255,255,255,0.4);cursor:pointer;display:inline-flex;align-items:center;transition:color 0.15s ease" onmouseover="this.style.color='#fb7185'" onmouseout="this.style.color='rgba(255,255,255,0.4)'">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
        <div id="doc-modal-cliente-name" style="font-weight:700;color:#fff;font-size:0.95rem">${doc.cliente.razonSocial}</div>
        <div id="doc-modal-cliente-nif" style="font-family:monospace;color:var(--text-muted)">NIF/CIF: ${doc.cliente.cifNif}</div>
        ${doc.cliente.direccion ? `<div style="color:var(--text-muted)">${doc.cliente.direccion}</div>` : ''}
        <div style="color:rgba(255,255,255,0.5)">${doc.cliente.telefono || ''} · ${doc.cliente.email || ''}</div>
      </div>
    </div>

    <!-- Ficha del Vehículo & Fecha de Entrega -->
    ${doc.vehiculo ? `
      <div style="background:linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01));padding:0.8rem 1.1rem;border-radius:12px;border:1px solid rgba(255,255,255,0.08);margin-bottom:1.2rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.8rem;font-size:0.82rem">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,0.06);display:grid;place-items:center;font-size:1.1rem">🚗</div>
          <div>
            <span style="font-size:0.68rem;text-transform:uppercase;color:rgba(255,255,255,0.4);font-weight:700;display:block">Vehículo Vinculado</span>
            <strong style="color:#fff;font-size:0.92rem">${doc.vehiculo.marcaModelo}</strong>
            ${doc.vehiculo.km ? `<span style="color:var(--text-muted);font-size:0.78rem"> (${doc.vehiculo.km} km)</span>` : ''}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:14px;font-family:monospace">
          <div>
            <span style="font-size:0.68rem;color:rgba(255,255,255,0.4);display:block">Matrícula:</span>
            <span style="background:rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.15);padding:2px 8px;border-radius:6px;font-weight:700;letter-spacing:0.08em;color:#fff">${doc.vehiculo.matricula}</span>
          </div>
          ${doc.fechaPropuestaEntrega ? `
            <div>
              <span style="font-size:0.68rem;color:#f5c451;display:block">Entrega Propuesta:</span>
              <strong style="color:#ffdf8a">${doc.fechaPropuestaEntrega}</strong>
            </div>
          ` : ''}
        </div>
      </div>
    ` : ''}

    <!-- Tabla Minimalista de Partidas -->
    <div style="border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;margin-bottom:1.2rem">
      <table style="width:100%;border-collapse:collapse;font-size:0.82rem;text-align:left">
        <thead>
          <tr style="background:rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.08);font-size:0.72rem;text-transform:uppercase;letter-spacing:0.04em;color:rgba(255,255,255,0.4)">
            <th style="padding:0.7rem 0.9rem">Descripción / Partida</th>
            <th style="padding:0.7rem 0.9rem;text-align:center">Uds / Horas</th>
            <th style="padding:0.7rem 0.9rem;text-align:right">Precio Unitario</th>
            <th style="padding:0.7rem 0.9rem;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${doc.lineas.map(l => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
              <td style="padding:0.7rem 0.9rem;color:#f1f5f9;font-weight:500">${l.concepto}</td>
              <td style="padding:0.7rem 0.9rem;text-align:center;font-family:monospace;color:var(--text-muted)">${l.cantidad}</td>
              <td style="padding:0.7rem 0.9rem;text-align:right;font-family:monospace;color:var(--text-muted)">${l.precioUnitario.toFixed(2)} €</td>
              <td style="padding:0.7rem 0.9rem;text-align:right;font-family:monospace;font-weight:700;color:#fff">${l.total.toFixed(2)} €</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totales y Resumen -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;font-size:0.82rem;padding-top:0.6rem">
      <div style="max-width:360px;color:var(--text-muted);font-size:0.78rem">
        ${doc.tipo === 'PRESUPUESTO' ? `
          <div style="background:rgba(245,196,81,0.1);border:1px solid rgba(245,196,81,0.25);border-radius:8px;padding:0.6rem 0.8rem;color:#ffe7a3;margin-bottom:6px">
            ⚠️ <strong>Facturación reglada:</strong> La factura final no se genera directamente desde este presupuesto. Se activará en el Roadmap al marcar la reparación en taller como finalizada.
          </div>
        ` : ''}
        <p style="margin:0">Documento confeccionado y registrado mediante la plataforma GESTARIAN.</p>
      </div>

      <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:0.8rem 1.2rem;min-width:240px;font-family:monospace">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--text-muted)">
          <span>Base Imponible:</span>
          <span>${doc.totales.baseImponible.toFixed(2)} €</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;color:var(--text-muted)">
          <span>IVA (${doc.totales.tipoIva}%):</span>
          <span>${doc.totales.cuotaIva.toFixed(2)} €</span>
        </div>
        <div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;font-size:1.1rem;font-weight:800;color:var(--c-gold)">
          <span style="font-family:'Outfit',sans-serif">Total:</span>
          <span>${doc.totales.total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  `;

  openModal('modal-doc-minimalista');
}

function shareDocViaWhatsApp() {
  if (!activeMinimalistDoc) return;
  const doc = activeMinimalistDoc;
  const text = encodeURIComponent(`Hola ${doc.cliente.razonSocial}, le compartimos el documento oficial ${doc.id} (${doc.tipo}) por importe de ${doc.totales.total.toFixed(2)} €. Taller DM CAR.`);
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareDocViaEmail() {
  if (!activeMinimalistDoc) return;
  const doc = activeMinimalistDoc;
  const subject = encodeURIComponent(`${doc.tipo} ${doc.id} · DM CAR TALLER MECÁNICO`);
  const body = encodeURIComponent(`Estimado/a ${doc.cliente.razonSocial}:\n\nAdjuntamos los datos de su documento ${doc.id} por importe de ${doc.totales.total.toFixed(2)} €.\n\nAtentamente,\nDM CAR TALLER MECÁNICO.`);
  window.location.href = `mailto:${doc.cliente.email || ''}?subject=${subject}&body=${body}`;
}

function downloadDocData() {
  if (!activeMinimalistDoc) return;
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeMinimalistDoc, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `${activeMinimalistDoc.id}_minimalista.json`);
  dlAnchor.click();
}

function eliminarClienteDeDocumento(docId, clienteNombre) {
  const nameEl = document.getElementById('doc-modal-cliente-name');
  const nifEl = document.getElementById('doc-modal-cliente-nif');
  if (nameEl) {
    nameEl.innerHTML = `<span style="color:#fb7185;font-style:italic">🗑️ Cliente desvinculado / eliminado</span>`;
  }
  if (nifEl) {
    nifEl.innerHTML = `<span style="color:rgba(255,255,255,0.4);font-size:0.75rem">Ficha de cliente eliminada del documento</span>`;
  }
  showAppNotice(`🗑️ Cliente ${clienteNombre || ''} eliminado de la tarjeta del documento ${docId}.`);
}

function eliminarClienteRoadmapPro(clienteNombre) {
  const el = document.getElementById('datos-drawer-cliente-nombre');
  if (el) {
    el.innerHTML = `<span style="color:#e11d48;font-style:italic">Cliente eliminado</span>`;
  }
  showAppNotice(`🗑️ Cliente ${clienteNombre || ''} eliminado de la tarjeta del expediente.`);
}

function eliminarClientePresupuestoPro(presId, clienteNombre) {
  const el = document.getElementById(`budget-cliente-nombre-${presId}`);
  if (el) {
    el.innerHTML = `<span style="color:#fb7185;font-style:italic">Cliente eliminado</span>`;
  }
  showAppNotice(`🗑️ Cliente ${clienteNombre || ''} eliminado de la tarjeta de presupuesto.`);
}

window.eliminarClienteDeDocumento = eliminarClienteDeDocumento;
window.eliminarClienteRoadmapPro = eliminarClienteRoadmapPro;
window.eliminarClientePresupuestoPro = eliminarClientePresupuestoPro;
window.openMinimalistDocModal = openMinimalistDocModal;
window.toggleRepairFinishedState = toggleRepairFinishedState;
window.shareDocViaWhatsApp = shareDocViaWhatsApp;
window.shareDocViaEmail = shareDocViaEmail;
window.downloadDocData = downloadDocData;

// Inicializar estado al cargar
document.addEventListener('DOMContentLoaded', () => {
  initExpedientesState();
});

function openSatelliteModal(planId, satIndex) {
  if (planId === 'lite') {
    openLiteModal();
    return;
  }
  if (planId === 'quick') {
    openQuickModal();
    return;
  }
  const p = PLANS[planId];
  if (!p || !p.satellites || !p.satellites[satIndex]) {
    openPlanDetails(planId);
    return;
  }
  const sat = p.satellites[satIndex];
  if ((sat.title && sat.title.toLowerCase().includes('portal')) || (sat.chip && sat.chip.toLowerCase().includes('clientes'))) {
    openPortalClientesInfo();
    return;
  }
  openPlanDetails(planId);
}

/* ---------- Tarjeta de detalles de planeta ---------- */
function openPlanDetails(planId) {
  const p = PLANS[planId] || PLANS.pro;
  selectedPlan = p.id;
  const c = document.getElementById('details-content');
  const container = document.getElementById('details-container');
  container.style.setProperty('--mc', p.color);
  container.setAttribute('data-plan', p.id);

  const sats = p.satellites ? `
    <div class="pd-section-title">Satélites del planeta (pulsa para información o acceso)</div>
    <div class="pd-sats">
      ${p.satellites.map((s, idx) => `
        <div class="pd-sat" onclick="openSatelliteModal('${p.id}', ${idx})" style="cursor:pointer" title="Pulsa para más detalles">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <strong>${s.title}</strong>
            <span style="font-size:0.75rem;padding:2px 8px;border-radius:6px;background:rgba(255,255,255,0.1);color:#fff">${s.chip}</span>
          </div>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:6px">${s.items.join(' · ')}</div>
          ${s.url ? `<a href="${s.url}" target="_blank" rel="noopener" class="sat-direct-link" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;gap:4px;color:var(--c-gold);font-size:0.82rem;font-weight:600;margin-top:4px">Conectar a ${s.title} →</a>` : ''}
        </div>`).join('')}
    </div>` : '';

  const extras = p.extras.length ? `
    <div class="pd-section-title">Extras opcionales</div>
    <div class="pd-extras">${p.extras.map(x => `<div class="pd-extra"><span>${x.label}</span><b>${x.price}</b></div>`).join('')}</div>` : '';

  const media = p.media ? `
    <div class="pd-media">
      <img src="${p.media.src}" alt="${p.media.alt}" loading="lazy">
      <div class="captions">${p.media.captions.map(t => `<span>${t}</span>`).join('')}</div>
    </div>` : '';

  const isEnt = p.id === 'enterprise';

  c.innerHTML = `
    <div class="pd-head">
      <div class="pd-orb"></div>
      <div>
        <div class="pd-eyebrow">Planeta · ${p.tagline}</div>
        <h2 class="pd-title" id="details-title">GESTARIAN ${p.name}</h2>
      </div>
    </div>
    ${p.status ? `<div class="pd-status">● ${p.status} · Consultar</div>` : ''}
    <div class="pd-price-row">
      <span class="pd-price">${p.price}</span>
      <span class="pd-period">${p.period}</span>
      <span class="pd-limit">${p.limit}</span>
    </div>
    ${p.inherits ? `<div class="pd-inherit">Todo lo de <strong>${p.inherits}</strong>, más:</div>` : '<div class="pd-section-title" style="margin-top:0">Incluye</div>'}
    <ul class="pd-list">${p.features.map(f => `<li>${CHECK_SVG}<span>${f}</span></li>`).join('')}</ul>
    ${media}
    ${extras}
    ${sats}
    ${p.notes.map(n => `<div class="pd-note">${n}</div>`).join('')}
    <div class="pd-actions">
      <a href="${PLAN_URLS[p.id]}" target="_blank" rel="noopener" class="btn ${isEnt ? 'btn-gold' : 'btn-primary'}" id="btn-details-access">
        <span>${isEnt ? 'Consultar · Próximamente' : 'Acceder a ' + p.name}</span>${ARROW_SVG}
      </a>
      ${(p.id === 'pro' || p.id === 'enterprise') ? `
        <button class="btn btn-ghost-portal" onclick="closeModal('modal-details'); openExpedientesModal('${p.id}')" style="border-color: rgba(168, 85, 247, 0.4); color: #d8b4fe">
          📋 Ver Expedientes y Roadmap
        </button>` : ''}
      <button class="btn btn-ghost-gold" onclick="closeModal('modal-details'); openPlanVideo('${p.id}')" style="border-color: rgba(245, 196, 81, 0.35); color: #ffe7a3">🎥 Ver vídeo explicativo</button>
    </div>
  `;
  openModal('modal-details');
  container.scrollTop = 0;
}

function openSunInfo() {
  openModal('modal-sun');
}

// Global exports
window.openPlanDetails = openPlanDetails;
window.openSunInfo = openSunInfo;
window.openLiteModal = openLiteModal;
window.openQuickModal = openQuickModal;
window.openPortalClientesInfo = openPortalClientesInfo;
window.openExpedientesModal = openExpedientesModal;
window.switchExpedientesVersion = switchExpedientesVersion;
window.switchExpedientesTab = switchExpedientesTab;
window.toggleBudgetAcceptedState = toggleBudgetAcceptedState;
window.openSatelliteModal = openSatelliteModal;
window.handlePlanAccess = handlePlanAccess;
window.openModal = openModal;
window.closeModal = closeModal;

/* ---------- Auth modal ---------- */
function openAuthModal(mode = 'register', plan = selectedPlan) {
  selectedPlan = plan;
  const planNameDisplay = document.getElementById('auth-plan-name');
  if (planNameDisplay) {
    const p = PLANS[selectedPlan];
    planNameDisplay.textContent = selectedPlan.toUpperCase();
    planNameDisplay.style.color = p ? p.color : '';
  }
  hideAlerts();
  switchAuthTab(mode);
  openModal('modal-auth');
}

function switchAuthTab(tab) {
  const regTab = document.getElementById('tab-register');
  const loginTab = document.getElementById('tab-login');
  const regForm = document.getElementById('form-register');
  const loginForm = document.getElementById('form-login');
  hideAlerts();
  const isReg = tab === 'register';
  regTab.classList.toggle('active', isReg);
  loginTab.classList.toggle('active', !isReg);
  regForm.style.display = isReg ? 'block' : 'none';
  loginForm.style.display = isReg ? 'none' : 'block';
}

function hideAlerts() {
  ['auth-error', 'auth-success'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function showError(msg) {
  const errBox = document.getElementById('auth-error');
  if (errBox) { errBox.textContent = msg; errBox.style.display = 'block'; }
}

function setBtnText(btn, text, disabled) {
  if (!btn) return;
  btn.disabled = disabled;
  btn.querySelector('span').textContent = text;
}

// Registro fiscal
async function handleRegisterSubmit(e) {
  e.preventDefault();
  hideAlerts();

  const submitBtn = document.getElementById('btn-submit-reg');
  const razonSocial = document.getElementById('reg-razon').value.trim();
  const nif = document.getElementById('reg-nif').value.trim();
  const telefono = document.getElementById('reg-telefono').value.trim();
  const direccion = document.getElementById('reg-direccion').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  if (!razonSocial || !nif || !telefono || !direccion || !email || !password) {
    showError('Por favor, rellene todos los campos obligatorios (*).');
    return;
  }

  setBtnText(submitBtn, 'Registrando...', true);

  const userData = { razonSocial, nif, telefono, direccion, email, plan: selectedPlan, registeredAt: new Date().toISOString() };

  try {
    let authUserId = null;

    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: userData } });

      if (error) {
        console.warn('[Supabase Auth Warning]:', error.message);
        if (error.message.includes('already registered')) {
          showError('Este email ya está registrado. Por favor, cambia a la pestaña "Iniciar Sesión".');
          setBtnText(submitBtn, 'Completar Registro y Entrar', false);
          return;
        }
      } else if (data && data.user) {
        authUserId = data.user.id;
      }

      try {
        await supabaseClient.from('gestarian_usuarios').upsert({
          id: authUserId,
          email,
          razon_social: razonSocial,
          nif_cif: nif,
          telefono,
          direccion,
          plan_contratado: selectedPlan,
          updated_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn('[Supabase DB Table warning]:', dbErr);
      }
    }

    const sessionObj = { email, razonSocial, nif, telefono, plan: selectedPlan, id: authUserId || ('user_' + Date.now()) };
    localStorage.setItem('gestarian_user_session', JSON.stringify(sessionObj));

    await triggerPostRegistrationBackend(sessionObj);

    closeModal('modal-auth');
    showRegistrationSuccessModal(sessionObj);
  } catch (err) {
    console.error('Error durante el registro:', err);
    showError('Ocurrió un inconveniente al completar el registro. Inténtelo de nuevo.');
  } finally {
    setBtnText(submitBtn, 'Completar Registro y Entrar', false);
  }
}

// Login con soporte para Taller (Email + Contraseña) y Clientes (Email + DNI/CIF)
async function handleLoginSubmit(e) {
  e.preventDefault();
  hideAlerts();

  const submitBtn = document.getElementById('btn-submit-login');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const clientModeToggle = document.getElementById('login-is-cliente');

  const email = (emailInput ? emailInput.value : '').trim().toLowerCase();
  const passwordOrDni = (passwordInput ? passwordInput.value : '').trim();

  if (!email || !passwordOrDni) {
    showError('Por favor, ingresa tu email y contraseña o DNI/CIF.');
    return;
  }

  setBtnText(submitBtn, 'Verificando acceso...', true);

  // Registro de clientes reconocidos por defecto en la base de datos de Gestarian
  const CLIENTES_REGISTRADOS = [
    { email: 'facturacion@soluciones-tec.com', dni: 'A87654321', nombre: 'Soluciones Tecnológicas S.A.', plan: 'PRO' },
    { email: 'logistica@transgomez.es', dni: 'B11223344', nombre: 'Transportes Marítimos Gómez S.L.', plan: 'PRO' },
    { email: 'admon@talleresiberica.es', dni: 'B98765432', nombre: 'Talleres y Logística Ibérica S.L.', plan: 'PRO' },
    { email: 'facturas@suministrosur.es', dni: 'A41223344', nombre: 'Suministros Industriales del Sur S.A.', plan: 'PRO' },
    { email: 'cliente@gestarian.com', dni: '12345678Z', nombre: 'Cliente Particular DM Car', plan: 'PRO' }
  ];

  const normDni = passwordOrDni.replace(/[\s\-_.]/g, '').toUpperCase();
  const isClientMode = clientModeToggle ? clientModeToggle.checked : false;

  // Comprobar si coincide con un cliente registrado por su email y DNI/CIF
  const clienteMatch = CLIENTES_REGISTRADOS.find(c => 
    c.email.toLowerCase() === email && 
    (c.dni.toUpperCase() === normDni || c.dni.replace(/[\s\-_.]/g, '').toUpperCase() === normDni)
  );

  // Detección heurística de DNI/CIF español (8 números + 1 letra, o letra + 7/8 dígitos)
  const looksLikeDni = /^[A-Z0-9]{8,10}$/.test(normDni) || normDni.length >= 8;

  try {
    let loggedInUser = null;

    // A) Flujo de acceso como CLIENTE con Email y DNI/CIF (o detección automática si coincide)
    if (isClientMode || clienteMatch || (looksLikeDni && !isClientMode)) {
      let clientData = clienteMatch;

      // Buscar en Supabase tabla clientes si no está en la lista estática
      if (!clientData && supabaseClient) {
        try {
          const { data: dbClientes } = await supabaseClient
            .from('clientes')
            .select('*')
            .ilike('email', email);
          
          if (dbClientes && dbClientes.length > 0) {
            const found = dbClientes.find(c => {
              const cDni = (c.dni || '').replace(/[\s\-_.]/g, '').toUpperCase();
              return cDni === normDni || (c.password && c.password === passwordOrDni);
            });
            if (found) {
              clientData = {
                email: found.email || email,
                dni: found.dni || normDni,
                nombre: found.nombre || 'Cliente Registrado',
                plan: selectedPlan || 'PRO'
              };
            }
          }
        } catch (dbErr) {
          console.warn('[Cliente DB Query warning]:', dbErr);
        }
      }

      // Si no hay Supabase o es un cliente nuevo con formato válido de DNI y email
      if (!clientData && looksLikeDni) {
        clientData = {
          email: email,
          dni: normDni,
          nombre: email.split('@')[0].toUpperCase(),
          plan: selectedPlan || 'PRO'
        };
      }

      if (clientData) {
        const targetPlan = selectedPlan === 'ENTERPRISE' ? 'ENTERPRISE' : 'PRO';
        loggedInUser = {
          email: clientData.email,
          dni: clientData.dni,
          razonSocial: clientData.nombre,
          nombre: clientData.nombre,
          rol: 'CLIENTE',
          isCliente: true,
          plan: targetPlan,
          id: 'cli_' + clientData.dni
        };

        // Guardar credenciales de sesión cliente
        localStorage.setItem('gestarian_user_session', JSON.stringify(loggedInUser));
        localStorage.setItem('gestarian_cliente_portal_saved_auth', JSON.stringify({
          email: clientData.email,
          pass: clientData.dni,
          nombre: clientData.nombre
        }));
        sessionStorage.setItem('gestarian_account_chosen', 'true');

        // Notificar a la Suite Unificada de React
        window.dispatchEvent(new CustomEvent('gestarian-auth-change', { detail: loggedInUser }));

        showUserLoggedInUI(loggedInUser);
        closeModal('modal-auth');

        // Desplazar a la Suite Unificada y enfocar el espacio de trabajo
        const suiteEl = document.getElementById('suite-workspace');
        if (suiteEl) {
          suiteEl.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
    }

    // B) Flujo de acceso como TALLER / USUARIO
    loggedInUser = { email, plan: selectedPlan, rol: 'ADMIN' };

    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: passwordOrDni });
      if (error) {
        // Si falló supabase y parecía DNI, avisar amigablemente
        if (looksLikeDni) {
          showError('No se encontró cliente con ese Email y DNI. Comprueba los dígitos o marca la casilla de Cliente.');
        } else {
          showError('Credenciales incorrectas: ' + error.message);
        }
        setBtnText(submitBtn, 'Iniciar Sesión y Entrar', false);
        return;
      }
      if (data && data.user) loggedInUser.id = data.user.id;
    }

    localStorage.setItem('gestarian_user_session', JSON.stringify(loggedInUser));
    window.dispatchEvent(new CustomEvent('gestarian-auth-change', { detail: loggedInUser }));
    showUserLoggedInUI(loggedInUser);
    closeModal('modal-auth');
    
    // Desplazar a la suite
    const suiteEl = document.getElementById('suite-workspace');
    if (suiteEl) {
      suiteEl.scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error('Error iniciando sesión:', err);
    showError('Error al iniciar sesión. Compruebe sus datos.');
  } finally {
    setBtnText(submitBtn, 'Iniciar Sesión y Entrar', false);
  }
}

// Email + WhatsApp post-registro
async function triggerPostRegistrationBackend(user) {
  const planName = (user.plan || 'pro').toUpperCase();
  const dashUrl = PLAN_URLS[user.plan] || PLAN_URLS.pro;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #0a0e17; color: #f8fafc; padding: 30px; border-radius: 12px;">
      <h1 style="color: #a855f7; margin-bottom: 10px;">¡Bienvenido a GESTARIAN, ${user.razonSocial || 'Cliente'}!</h1>
      <p style="font-size: 16px; color: #cbd5e1; line-height: 1.5;">
        Tu registro en el plan <strong>GESTARIAN ${planName}</strong> se ha completado con éxito.
      </p>
      <div style="background-color: #111827; border: 1px solid #1f2937; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #38bdf8; margin-top: 0;">Resumen de Registro Fiscal:</h3>
        <p style="margin: 5px 0;"><strong>Razón Social:</strong> ${user.razonSocial}</p>
        <p style="margin: 5px 0;"><strong>NIF/CIF:</strong> ${user.nif}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
        <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${user.telefono}</p>
      </div>
      <p style="font-size: 15px; color: #cbd5e1;">Haz clic a continuación para acceder a tu panel de gestión:</p>
      <a href="${dashUrl}" style="display: inline-block; background: #a855f7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 25px;">Acceder a mi Dashboard (${planName})</a>
      <hr style="border: 0; border-top: 1px solid #1f2937; margin: 20px 0;">
      <p style="font-size: 14px; color: #94a3b8;">Toda tu gestión documental, con acceso inmediato en tiempo real, en tu bolsillo.</p>
    </div>
  `;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.functions.invoke('send-communication', {
        body: { recipient: user.email, subject: `¡Bienvenido a GESTARIAN ${planName}!`, content: emailHtml }
      });
      console.log('[Backend Email Notification Response]:', data, error);
    } catch (e) {
      console.warn('Incapaz de invocar Edge Function directamente:', e);
    }
  }

  if (user.telefono) {
    const cleanPhone = user.telefono.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Hola ${user.razonSocial}, ¡bienvenido a GESTARIAN ${planName}! Tu cuenta está lista. Accede a tu panel aquí: ${dashUrl}`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  }
}

function showRegistrationSuccessModal(user) {
  const planDisplay = document.getElementById('success-plan-display');
  const p = PLANS[user.plan];
  if (planDisplay) {
    planDisplay.innerHTML = `Plan Activado: <strong style="color:${p ? p.color : '#a855f7'}">GESTARIAN ${user.plan.toUpperCase()}</strong>`;
  }
  showUserLoggedInUI(user);
  openModal('modal-success-dash');
}

function redirectToDashboard() {
  window.location.href = PLAN_URLS[selectedPlan] || PLAN_URLS.pro;
}

/* =========================================================
   GESTARIAN · REPRODUCTOR DE VÍDEO EXPLICATIVO INTERACTIVO
   ========================================================= */

// Playlist de capítulos y guiones detallados en Español (España) - Muestra y habla exclusivamente de las versiones
const VIDEO_DATA = {
  lite: {
    title: 'Versión Lite',
    color: '#7c93ff',
    duration: 80,
    chapters: [
      {
        title: 'Introducción a la Versión Lite',
        time: 0,
        sub: 'Bienvenidos a la versión Lite, la solución definitiva y completamente gratuita para profesionales autónomos que se inician en el mundo de la facturación y la gestión documental.',
        slide: `
          <div class="video-slide-layout" style="--sc: #7c93ff">
            <div class="animated-icon-scene">
              <div class="main-doc-icon">📄</div>
              <div class="floating-badge shadow-gold">GRATIS</div>
            </div>
            <div class="slide-labels">
              <h3>Versión Lite</h3>
              <p>Tu punto de inicio sin coste alguno</p>
            </div>
          </div>`
      },
      {
        title: 'Confección y Envío Express',
        time: 20,
        sub: 'Con la versión Lite, puedes confeccionar presupuestos, albaranes y facturas de manera limpia y rápida. Una vez listos, envíalos directamente a tus clientes mediante WhatsApp o correo electrónico con un solo toque, o imprímelos al instante.',
        slide: `
          <div class="video-slide-layout" style="--sc: #38bdf8">
            <div class="phone-mockup-scene">
              <div class="phone-screen-inner">
                <div class="msg-bubble sent">Enviado por WhatsApp ✓</div>
                <div class="msg-bubble doc-link">📄 Factura_Lite.pdf</div>
              </div>
            </div>
            <div class="slide-labels">
              <h3>Envío Express</h3>
              <p>Envío instantáneo por WhatsApp y Email</p>
            </div>
          </div>`
      },
      {
        title: 'Almacenamiento Local Seguro',
        time: 40,
        sub: 'Tu privacidad es lo primero. En la versión Lite, todos los datos se guardan de forma local y cien por cien segura en tu propio dispositivo móvil u ordenador. No necesitas internet ni bases de datos en la nube para mantener tu negocio organizado.',
        slide: `
          <div class="video-slide-layout" style="--sc: #22c55e">
            <div class="secure-storage-scene">
              <div class="shield-icon">🛡️</div>
              <div class="storage-indicators">
                <span>📱 Local</span>
                <span>💻 PC</span>
              </div>
            </div>
            <div class="slide-labels">
              <h3>Privacidad Absoluta</h3>
              <p>Guardado local y seguro en tu dispositivo</p>
            </div>
          </div>`
      },
      {
        title: 'Asistencia y Soporte Total',
        time: 60,
        sub: 'Y no te preocupes por el papeleo viejo: te regalamos el guardado documental interanual completamente gratis, junto con asistencia total para resolver cualquier duda que te surja en el camino. ¡Empieza hoy mismo gratis!',
        slide: `
          <div class="video-slide-layout" style="--sc: #a855f7">
            <div class="support-list-scene">
              <div class="list-item">🌟 Guardado Interanual Gratis</div>
              <div class="list-item">📞 Asistencia Documental Completa</div>
              <div class="list-item">💻 100% Funcional sin Internet</div>
            </div>
            <button class="btn btn-primary btn-sm btn-video-action" onclick="closeVideoModal(); handlePlanAccess('lite')">Empezar con la Versión Lite</button>
          </div>`
      }
    ]
  },
  quick: {
    title: 'Versión Quick',
    color: '#38bdf8',
    duration: 80,
    chapters: [
      {
        title: 'Presentamos la Versión Quick',
        time: 0,
        sub: 'Si estás listo para subir de nivel y automatizar de verdad tus facturas, te presentamos la versión Quick, el entorno de agilidad contable sin complicaciones.',
        slide: `
          <div class="video-slide-layout" style="--sc: #38bdf8">
            <div class="animated-icon-scene">
              <div class="main-doc-icon">⚡</div>
              <div class="floating-badge">NUBE</div>
            </div>
            <div class="slide-labels">
              <h3>Versión Quick</h3>
              <p>Automatización ágil en la nube</p>
            </div>
          </div>`
      },
      {
        title: 'Clientes y Proveedores Conectados',
        time: 20,
        sub: 'La versión Quick incluye una potente base de datos en la nube para registrar a todos tus clientes y proveedores. Genera facturas profesionales personalizadas en un solo click asociando los datos fiscales guardados automáticamente.',
        slide: `
          <div class="video-slide-layout" style="--sc: #a855f7">
            <div class="db-tables-scene">
              <div class="db-card">📁 Clientes</div>
              <div class="db-card">📁 Proveedores</div>
            </div>
            <div class="slide-labels">
              <h3>Base de Datos en la Nube</h3>
              <p>Tus contactos y facturas siempre a salvo</p>
            </div>
          </div>`
      },
      {
        title: 'Escaneo Inteligente OCR',
        time: 40,
        sub: 'Olvídate de picar datos a mano. Nuestro módulo de reconocimiento óptico de caracteres escanea tus facturas recibidas de forma automática y extrae el NIF, la base imponible y el IVA con precisión absoluta.',
        slide: `
          <div class="video-slide-layout" style="--sc: #eab308">
            <div class="ocr-scanning-scene">
              <div class="laser-scanner"></div>
              <div class="invoice-box">🧾 ESCANEANDO...</div>
            </div>
            <div class="slide-labels">
              <h3>Módulo OCR Inteligente</h3>
              <p>Escanear y archivar gastos en 3 segundos</p>
            </div>
          </div>`
      },
      {
        title: 'Rastreo de Facturas por Email',
        time: 60,
        sub: 'Puedes activar el rastreo automático de facturas en tu correo electrónico. Cada factura que recibas por email será detectada, procesada y archivada con un aviso en tiempo real en tu móvil por tan solo nueve con noventa al año.',
        slide: `
          <div class="video-slide-layout" style="--sc: #6366f1">
            <div class="email-process-scene">
              <div class="email-step">✉️ Email recibido</div>
              <div class="arrow-indicator">➔</div>
              <div class="email-step">💾 Guardado en Quick</div>
            </div>
            <button class="btn btn-primary btn-sm btn-video-action" onclick="closeVideoModal(); handlePlanAccess('quick')">Acceder a la Versión Quick</button>
          </div>`
      }
    ]
  },
  pro: {
    title: 'Versión Pro',
    color: '#a855f7',
    duration: 80,
    chapters: [
      {
        title: 'Versión Pro: Inteligencia Integrada',
        time: 0,
        sub: 'Bienvenidos a la versión Pro, el corazón inteligente de la gestión con IA. Diseñado especialmente para profesionales y pymes de hasta cincuenta empleados que buscan delegar su gestión contable.',
        slide: `
          <div class="video-slide-layout" style="--sc: #a855f7">
            <div class="animated-icon-scene">
              <div class="main-doc-icon">✨</div>
              <div class="floating-badge">AUTOMATIZACIÓN</div>
            </div>
            <div class="slide-labels">
              <h3>Versión Pro</h3>
              <p>La IA trabajando para tu negocio</p>
            </div>
          </div>`
      },
      {
        title: 'Inteligencia Artificial Integrada',
        time: 20,
        sub: 'Nuestra inteligencia artificial integrada lee, comprende y clasifica todos tus gastos y presupuestos de forma autónoma. Además, te avisa en tiempo real de tus próximas obligaciones fiscales para evitar sanciones.',
        slide: `
          <div class="video-slide-layout" style="--sc: #38bdf8">
            <div class="ai-processing-scene">
              <div class="ai-circle">⚡</div>
              <div class="ai-verdict">Categoría: Gasto Deducible ✓</div>
            </div>
            <div class="slide-labels">
              <h3>IA + OCR Ilimitado</h3>
              <p>Clasificación inteligente automática</p>
            </div>
          </div>`
      },
      {
        title: 'Portal de Cliente e Invitaciones',
        time: 40,
        sub: 'Ofrece una experiencia de élite a tus clientes: dales acceso a su propio Portal de Cliente por invitación para descargar presupuestos y facturas en tiempo real. Gestiona citas y compromisos con la agenda unificada.',
        slide: `
          <div class="video-slide-layout" style="--sc: #22c55e">
            <div class="client-portal-scene">
              <div class="portal-header">Área Privada de Cliente</div>
              <div class="portal-body">🔑 Descarga directa en 1 Click</div>
            </div>
            <div class="slide-labels">
              <h3>Portal de Cliente</h3>
              <p>Transparencia y descarga de facturas</p>
            </div>
          </div>`
      },
      {
        title: 'Seguimiento Audiovisual de Vehículos',
        time: 60,
        sub: 'Para talleres y servicios técnicos, la versión Pro ofrece el seguimiento audiovisual de la evolución del vehículo. Sube fotos de cada etapa del proceso y tus clientes verán el progreso desde su Portal con transparencia absoluta.',
        slide: `
          <div class="video-slide-layout" style="--sc: #eab308">
            <div class="timeline-stepper">
              <div class="step finished">🛠️ Recepción</div>
              <div class="step active">⚙️ En taller</div>
              <div class="step">🚗 Entregado</div>
            </div>
            <button class="btn btn-primary btn-sm btn-video-action" onclick="closeVideoModal(); handlePlanAccess('pro')">Acceder a la Versión Pro</button>
          </div>`
      }
    ]
  },
  enterprise: {
    title: 'Versión Enterprise',
    color: '#6366f1',
    duration: 80,
    chapters: [
      {
        title: 'Versión Enterprise: Sin Límites',
        time: 0,
        sub: 'Para grandes corporaciones, redes empresariales y grupos de hasta cien empleados, os presentamos la versión Enterprise, la cúspide de la gestión documental interconectada.',
        slide: `
          <div class="video-slide-layout" style="--sc: #6366f1">
            <div class="animated-icon-scene">
              <div class="main-doc-icon">🏢</div>
              <div class="floating-badge">CORPORATE</div>
            </div>
            <div class="slide-labels">
              <h3>Versión Enterprise</h3>
              <p>Red de empresas interconectadas</p>
            </div>
          </div>`
      },
      {
        title: 'Red Empresarial Interconectada',
        time: 20,
        sub: 'La versión Enterprise conecta a todas las empresas de tu red. Envía y recibe órdenes de trabajo, pedidos de suministro y facturas internas directamente en el ecosistema Enterprise, eliminando intermediarios y llamadas.',
        slide: `
          <div class="video-slide-layout" style="--sc: #a855f7">
            <div class="corporate-transfer-scene">
              <div class="corp-node">Sede A</div>
              <div class="corp-transfer-link">🧾 Pedidos e Informes ➔</div>
              <div class="corp-node">Sede B</div>
            </div>
            <div class="slide-labels">
              <h3>Facturación y Pedidos en Red</h3>
              <p>Intercambio directo y automático de datos</p>
            </div>
          </div>`
      },
      {
        title: 'Vinculación Directa con la AEAT',
        time: 40,
        sub: 'Evita las gestorías tradicionales. Vincula tu certificado digital para reportar directamente tus obligaciones fiscales e IVA a la Agencia Tributaria, con total validez legal y cumplimiento de normativas.',
        slide: `
          <div class="video-slide-layout" style="--sc: #eab308">
            <div class="aeat-connection-scene">
              <div class="government-seal">CONECTADO AEAT ✓</div>
              <div class="description">Certificación Digital Oficial</div>
            </div>
            <div class="slide-labels">
              <h3>Tributación Directa</h3>
              <p>Reporta tus impuestos sin salir de la plataforma</p>
            </div>
          </div>`
      },
      {
        title: 'Cobertura Total y Crecimiento',
        time: 60,
        sub: 'Con la cobertura total integrada, nuestro sistema deriva clientes y citas automáticamente por agenda entre las sedes de tu red empresarial. La solución definitiva para escalar tu empresa al infinito.',
        slide: `
          <div class="video-slide-layout" style="--sc: #38bdf8">
            <div class="global-map-scene">
              <div class="marker">📍 Sede Central</div>
              <div class="marker">📍 Sede Sur</div>
            </div>
            <button class="btn btn-primary btn-sm btn-video-action" onclick="closeVideoModal(); handlePlanAccess('enterprise')">Consultar Versión Enterprise</button>
          </div>`
      }
    ]
  }
};

// =========================================================
// AUDIO & SPEECH SYNTHESIS ENGINE (ESPAÑOL DE ESPAÑA)
// Con soporte para móviles modernos y fallback acústico
// para teléfonos como Huawei Honor Play 5 sin Google TTS
// =========================================================
let videoActivePlan = 'pro';
let videoCurrentTime = 0;
let videoIsPlaying = false;
let videoTimerInterval = null;
let videoAudioEnabled = true;
let currentChapterIdx = 0;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTransitionChime() {
  if (!videoAudioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) { /* ignore */ }
}

function getSpanishVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  // Filtrar voces en español
  const spanishVoices = voices.filter(v => 
    v.lang.toLowerCase().startsWith('es') || 
    v.lang.toLowerCase().includes('spanish')
  );
  if (!spanishVoices.length) return voices[0];

  // Algoritmo de puntuación para seleccionar la voz más humana, profesional y natural
  const scoreVoice = (v) => {
    let score = 0;
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();

    // Preferencia dialectal: es-ES (España)
    if (lang === 'es-es' || lang === 'es_es') score += 50;
    else if (lang.startsWith('es')) score += 25;

    // Voces neuronales / naturales de alta fidelidad:
    if (name.includes('natural')) score += 120;
    if (name.includes('neural')) score += 110;
    if (name.includes('online')) score += 70;
    if (name.includes('google')) score += 80;
    if (name.includes('premium') || name.includes('enhanced')) score += 60;
    if (name.includes('jorge') || name.includes('mónica') || name.includes('monica') || 
        name.includes('alvaro') || name.includes('elvira') || name.includes('paulina') || 
        name.includes('diego') || name.includes('raquel')) score += 40;

    // Penalizar voces robóticas sintéticas antiguas:
    if (name.includes('desktop')) score -= 70;
    if (name.includes('espeak')) score -= 90;
    if (name.includes('compact')) score -= 40;

    return score;
  };

  spanishVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return spanishVoices[0];
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    getSpanishVoice();
  };
}

function speakChapterText(text) {
  if (!videoAudioEnabled) return;
  
  // Siempre emitir el chime sonoro armónico de transición
  playTransitionChime();

  if (!window.speechSynthesis) {
    showAudioFallbackNotice();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    // Eliminar cualquier mención de GESTARIAN de los audios para hablar exclusivamente de las versiones
    let speechCleanText = text
      .replace(/GESTARIAN\s*/gi, '')
      .replace(/Gestárian\s*/gi, '')
      .replace(/Gestarian\s*/gi, '')
      .replace(/\bAEAT\b/g, 'la Agencia Tributaria')
      .replace(/\bOCR\b/g, 'escaneo OCR')
      .replace(/(\d+)\s*%/g, '$1 por ciento')
      .replace(/\s{2,}/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(speechCleanText);
    utterance.lang = 'es-ES';
    // Habla más pausada, articulada y profesional (no acelerada ni robótica)
    utterance.rate = 0.86;
    utterance.pitch = 0.98;
    
    const voice = getSpanishVoice();
    if (voice) {
      utterance.voice = voice;
      const hint = document.getElementById('audio-device-hint');
      if (hint) {
        const cleanName = voice.name.replace(/Microsoft |Google |Online \(Natural\) - | Desktop/gi, '').trim();
        hint.textContent = `🎙️ Locución profesional natural (${cleanName})`;
      }
    }

    const wave = document.getElementById('voice-wave');
    utterance.onstart = () => {
      if (wave) wave.classList.add('active');
    };
    utterance.onend = () => {
      if (wave && !videoIsPlaying) wave.classList.remove('active');
    };
    utterance.onerror = () => {
      if (wave) wave.classList.remove('active');
      showAudioFallbackNotice();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Voz] Error al reproducir síntesis:', err);
    showAudioFallbackNotice();
  }
}

function showAudioFallbackNotice() {
  const hint = document.getElementById('audio-device-hint');
  if (hint) {
    hint.textContent = '💡 En móviles Huawei/Honor sin Google TTS instalado, pulsa "📢 Escuchar locución" o activa el motor en Ajustes.';
    hint.style.color = 'var(--c-gold)';
  }
}

function manualTriggerSpeech() {
  getAudioContext();
  const planData = VIDEO_DATA[videoActivePlan];
  if (!planData) return;
  const ch = planData.chapters[currentChapterIdx] || planData.chapters[0];
  if (ch) {
    videoAudioEnabled = true;
    updateAudioButtonUI();
    speakChapterText(`${ch.title}. ${ch.sub}`);
  }
}

function toggleVideoAudio() {
  videoAudioEnabled = !videoAudioEnabled;
  if (!videoAudioEnabled) {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const wave = document.getElementById('voice-wave');
    if (wave) wave.classList.remove('active');
  } else {
    manualTriggerSpeech();
  }
  updateAudioButtonUI();
}

function updateAudioButtonUI() {
  const btn = document.getElementById('btn-audio-toggle');
  const icon = document.getElementById('audio-btn-icon');
  if (icon) {
    icon.textContent = videoAudioEnabled ? '🔊' : '🔇';
  }
  if (btn) {
    btn.setAttribute('title', videoAudioEnabled ? 'Silenciar voz' : 'Activar voz');
    btn.style.color = videoAudioEnabled ? 'var(--c-gold)' : 'var(--text-muted)';
  }
}

function openPlanVideo(planId) {
  videoActivePlan = planId || 'pro';
  videoCurrentTime = 0;
  videoIsPlaying = false;
  currentChapterIdx = 0;
  
  // Desbloquear audio mediante el gesto de pulsación del usuario
  getAudioContext();
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  }
  
  // Detener intervalo anterior si existiera
  clearInterval(videoTimerInterval);
  
  // Renderizar la barra de capítulos (playlist)
  renderVideoPlaylist();
  
  // Cargar el capítulo 0
  loadVideoChapter(0);
  
  // Mostrar modal de vídeo
  openModal('modal-video');
  
  // Auto-play al abrir
  togglePlayVideo();

  // Iniciar la locución con el gesto directo
  if (videoAudioEnabled) {
    const planData = VIDEO_DATA[videoActivePlan];
    if (planData && planData.chapters[0]) {
      speakChapterText(`${planData.chapters[0].title}. ${planData.chapters[0].sub}`);
    }
  }
}

function closeVideoModal() {
  closeModal('modal-video');
  videoIsPlaying = false;
  clearInterval(videoTimerInterval);
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  updatePlayPauseButtonUI();
}

function renderVideoPlaylist() {
  const container = document.getElementById('video-playlist-items');
  if (!container) return;
  
  const planData = VIDEO_DATA[videoActivePlan];
  if (!planData) return;
  
  container.innerHTML = planData.chapters.map((ch, idx) => `
    <div class="playlist-item" id="playlist-item-${idx}" onclick="loadVideoChapter(${idx})">
      <div class="playlist-idx">${idx + 1}</div>
      <div class="playlist-text">
        <h4>${ch.title}</h4>
        <span>00:${ch.time.toString().padStart(2, '0')}</span>
      </div>
    </div>
  `).join('');
}

function loadVideoChapter(idx) {
  const planData = VIDEO_DATA[videoActivePlan];
  if (!planData || idx < 0 || idx >= planData.chapters.length) return;
  
  currentChapterIdx = idx;
  videoCurrentTime = planData.chapters[idx].time;
  
  // Actualizar clases activas en playlist
  document.querySelectorAll('.playlist-item').forEach((item, i) => {
    item.classList.toggle('active', i === idx);
  });
  
  updateVideoScreenUI(idx);

  // Locución con voz
  if (videoIsPlaying && videoAudioEnabled) {
    const ch = planData.chapters[idx];
    speakChapterText(`${ch.title}. ${ch.sub}`);
  }
}

function updateVideoScreenUI(chapterIdx) {
  const planData = VIDEO_DATA[videoActivePlan];
  const ch = planData.chapters[chapterIdx];
  if (!ch) return;
  
  // Actualizar etiqueta de la versión
  const badge = document.getElementById('video-plan-badge');
  if (badge) {
    badge.textContent = `VERSIÓN ${videoActivePlan.toUpperCase()}`;
    badge.style.background = planData.color;
  }
  
  // Actualizar contenido visual (Slide)
  const screenContent = document.getElementById('video-screen-content');
  if (screenContent) {
    screenContent.innerHTML = ch.slide;
  }
  
  // Actualizar subtítulos
  const subtitles = document.getElementById('video-subtitles-text');
  if (subtitles) {
    subtitles.textContent = ch.sub;
  }
  
  // Actualizar temporizador de texto
  const timer = document.getElementById('video-timer');
  if (timer) {
    const totalMinutes = Math.floor(planData.duration / 60).toString().padStart(2, '0');
    const totalSeconds = (planData.duration % 60).toString().padStart(2, '0');
    const curMinutes = Math.floor(videoCurrentTime / 60).toString().padStart(2, '0');
    const curSeconds = (videoCurrentTime % 60).toString().padStart(2, '0');
    timer.textContent = `${curMinutes}:${curSeconds} / ${totalMinutes}:${totalSeconds}`;
  }
  
  // Actualizar barra de progreso
  const progress = document.getElementById('video-progress-filled');
  if (progress) {
    const percentage = (videoCurrentTime / planData.duration) * 100;
    progress.style.width = `${percentage}%`;
  }
}

function togglePlayVideo() {
  getAudioContext();
  videoIsPlaying = !videoIsPlaying;
  updatePlayPauseButtonUI();
  
  const voiceWave = document.getElementById('voice-wave');
  if (voiceWave) {
    voiceWave.classList.toggle('active', videoIsPlaying && videoAudioEnabled);
  }
  
  if (videoIsPlaying) {
    if (videoAudioEnabled && window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    videoTimerInterval = setInterval(() => {
      videoCurrentTime++;
      
      const planData = VIDEO_DATA[videoActivePlan];
      if (videoCurrentTime >= planData.duration) {
        // Fin de la reproducción, reiniciar
        videoCurrentTime = 0;
        loadVideoChapter(0);
        return;
      }
      
      // Encontrar en qué capítulo estamos actualmente según el tiempo
      let newChIdx = 0;
      for (let i = 0; i < planData.chapters.length; i++) {
        if (videoCurrentTime >= planData.chapters[i].time) {
          newChIdx = i;
        }
      }
      
      if (newChIdx !== currentChapterIdx) {
        loadVideoChapter(newChIdx);
      } else {
        updateVideoScreenUI(newChIdx);
      }
      
    }, 1000);
  } else {
    clearInterval(videoTimerInterval);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

function updatePlayPauseButtonUI() {
  const btn = document.getElementById('btn-play-pause');
  if (!btn) return;
  if (videoIsPlaying) {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
  }
}

function prevChapter() {
  const planData = VIDEO_DATA[videoActivePlan];
  let curChIdx = 0;
  for (let i = 0; i < planData.chapters.length; i++) {
    if (videoCurrentTime >= planData.chapters[i].time) {
      curChIdx = i;
    }
  }
  if (curChIdx > 0) {
    loadVideoChapter(curChIdx - 1);
  }
}

function nextChapter() {
  const planData = VIDEO_DATA[videoActivePlan];
  let curChIdx = 0;
  for (let i = 0; i < planData.chapters.length; i++) {
    if (videoCurrentTime >= planData.chapters[i].time) {
      curChIdx = i;
    }
  }
  if (curChIdx < planData.chapters.length - 1) {
    loadVideoChapter(curChIdx + 1);
  }
}

function handleProgressBarClick(e) {
  const planData = VIDEO_DATA[videoActivePlan];
  const bar = e.currentTarget;
  const rect = bar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const percentage = clickX / rect.width;
  
  videoCurrentTime = Math.floor(percentage * planData.duration);
  
  // Encontrar el capítulo que corresponde
  let chIdx = 0;
  for (let i = 0; i < planData.chapters.length; i++) {
    if (videoCurrentTime >= planData.chapters[i].time) {
      chIdx = i;
    }
  }
  
  loadVideoChapter(chIdx);
  updateVideoScreenUI(chIdx);
}

// Exponer funciones al window
window.openPlanVideo = openPlanVideo;
window.closeVideoModal = closeVideoModal;
window.togglePlayVideo = togglePlayVideo;
window.loadVideoChapter = loadVideoChapter;
window.prevChapter = prevChapter;
window.nextChapter = nextChapter;
window.handleProgressBarClick = handleProgressBarClick;
window.toggleVideoAudio = toggleVideoAudio;
window.manualTriggerSpeech = manualTriggerSpeech;

// Roadmap interactivo: Calidad opcional, subida de fotos, cobros y recibos
window.toggleRoadmapProDrawer = toggleRoadmapProDrawer;
window.marcarCitaPro = marcarCitaPro;
window.enviarNotificacionCitaWhatsApp = enviarNotificacionCitaWhatsApp;
window.derivarCitaRedEnterprise = derivarCitaRedEnterprise;
window.openExpedientesModal = openExpedientesModal;
window.switchExpedientesVersion = switchExpedientesVersion;
window.switchExpedientesTab = switchExpedientesTab;
window.toggleBudgetAcceptedState = toggleBudgetAcceptedState;
window.toggleRepairFinishedState = toggleRepairFinishedState;
window.toggleControlCalidadRoadmap = toggleControlCalidadRoadmap;
window.handleRoadmapImageUpload = handleRoadmapImageUpload;
window.registrarAbonoRoadmap = registrarAbonoRoadmap;
window.abrirReciboDesdeRoadmap = abrirReciboDesdeRoadmap;
window.enviarRecordatorioPagoRoadmap = enviarRecordatorioPagoRoadmap;
