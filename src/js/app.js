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
   ========================================================= */
let isBudget419Accepted = true;
let currentExpVersion = 'pro';
let currentExpTab = 'roadmap';

function initExpedientesState() {
  const saved = localStorage.getItem('gestarian_budget_419_accepted');
  if (saved !== null) {
    isBudget419Accepted = saved === 'true';
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
  
  if (btnPro && btnEnt) {
    btnPro.classList.toggle('active', !isEnt);
    btnEnt.classList.toggle('active', isEnt);
    btnEnt.classList.toggle('enterprise-active', isEnt);
  }
  
  if (titlePlanName) {
    titlePlanName.textContent = isEnt ? 'Versión ENTERPRISE' : 'Versión PRO';
    titlePlanName.style.color = isEnt ? 'var(--c-ent)' : 'var(--c-pro)';
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

function toggleBudgetAcceptedState(accepted) {
  isBudget419Accepted = !!accepted;
  localStorage.setItem('gestarian_budget_419_accepted', isBudget419Accepted ? 'true' : 'false');
  applyBudget419DOMState();
}

function applyBudget419DOMState() {
  const isAcc = isBudget419Accepted;
  const nowStr = new Date().toLocaleDateString('es-ES') + ' ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // 1. Roadmap header badge
  const roadmapBadge = document.getElementById('roadmap-status-badge');
  if (roadmapBadge) {
    roadmapBadge.className = 'step-badge ' + (isAcc ? 'step-badge-green' : 'step-badge-amber');
    roadmapBadge.textContent = isAcc ? '✓ PRESUPUESTO ACEPTADO POR EL CLIENTE' : '⏳ PENDIENTE DE APROBACIÓN POR EL CLIENTE';
  }

  // 2. Roadmap Step 3 (Acceptance phase)
  const stepAccept = document.getElementById('roadmap-step-acceptance');
  const step3Icon = document.getElementById('step-3-icon');
  const step3Badge = document.getElementById('step-3-badge');
  const step3Desc = document.getElementById('step-3-desc');
  const step3Log = document.getElementById('step-3-log');

  if (stepAccept) {
    stepAccept.className = 'roadmap-step-item ' + (isAcc ? 'step-accepted-live' : 'step-pending-approval');
  }
  if (step3Icon) {
    step3Icon.textContent = isAcc ? '✓' : '⏳';
  }
  if (step3Badge) {
    step3Badge.className = 'step-badge ' + (isAcc ? 'step-badge-green' : 'step-badge-amber');
    step3Badge.textContent = isAcc ? '✓ Aceptado en Área de Clientes' : '⏳ Pendiente en Área de Clientes';
  }
  if (step3Desc) {
    step3Desc.textContent = isAcc
      ? 'El cliente ha revisado las partidas y ha aceptado el presupuesto #PRE-2026-419 desde su Área de Clientes con firma y conformidad digital.'
      : 'Presupuesto #PRE-2026-419 remitido al cliente por email y WhatsApp. En espera de aceptación y firma digital desde el Área de Clientes.';
  }
  if (step3Log) {
    step3Log.innerHTML = isAcc
      ? `<span>🟢</span> <strong>${nowStr}</strong> · Aceptado por Juan Pérez Gómez (DNI: 48.912.431-K) mediante invitación segura.`
      : `<span>⏳</span> <strong>Notificación emitida</strong> · Pendiente de respuesta y firma del cliente en su enlace exclusivo.`;
  }

  // 3. Roadmap Step 4 (Execution phase)
  const stepExec = document.getElementById('roadmap-step-execution');
  const step4Icon = document.getElementById('step-4-icon');
  const step4Badge = document.getElementById('step-4-badge');
  const step4Desc = document.getElementById('step-4-desc');

  if (stepExec) {
    stepExec.className = 'roadmap-step-item ' + (isAcc ? 'step-active-now' : '');
  }
  if (step4Icon) {
    step4Icon.textContent = isAcc ? '⚙️' : '4';
  }
  if (step4Badge) {
    step4Badge.className = 'step-badge ' + (isAcc ? 'step-badge-purple' : 'step-badge-gray');
    step4Badge.textContent = isAcc ? 'En Curso / Activa' : 'En Espera de Aceptación';
  }
  if (step4Desc) {
    step4Desc.textContent = isAcc
      ? 'Mecánico asignado. Módulo de evolución visual activo: se están registrando fotos y notas del proceso en tiempo real para el cliente.'
      : 'En pausa hasta que el cliente acepte el presupuesto desde su área privada.';
  }

  // 4. Tarjeta del Presupuesto #PRE-2026-419
  const budgetCard419 = document.getElementById('budget-card-419');
  const budgetBadge419 = document.getElementById('budget-badge-status-419');
  const budgetAudit419 = document.getElementById('budget-audit-text-419');

  if (budgetCard419) {
    budgetCard419.classList.toggle('budget-accepted', isAcc);
  }
  if (budgetBadge419) {
    budgetBadge419.className = 'step-badge ' + (isAcc ? 'step-badge-green' : 'step-badge-amber');
    budgetBadge419.textContent = isAcc ? '🟢 ACEPTADO POR EL CLIENTE' : '⏳ PENDIENTE DE APROBACIÓN';
  }
  if (budgetAudit419) {
    budgetAudit419.innerHTML = isAcc
      ? `✓ <strong>Presupuesto aceptado digitalmente</strong> por el cliente el <span>${nowStr}</span>. Expediente EXP-2026-0842 en fase de reparación.`
      : `⏳ <strong>Presupuesto emitido y notificado</strong>. En espera de aceptación del cliente desde el Área de Clientes.`;
  }

  // 5. Simulador Área de Clientes
  const simClientBadge = document.getElementById('sim-client-badge');
  if (simClientBadge) {
    simClientBadge.className = 'step-badge ' + (isAcc ? 'step-badge-green' : 'step-badge-amber');
    simClientBadge.textContent = isAcc ? 'ACEPTADO' : 'PENDIENTE DE FIRMA';
  }
}

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

// Login
async function handleLoginSubmit(e) {
  e.preventDefault();
  hideAlerts();

  const submitBtn = document.getElementById('btn-submit-login');
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showError('Por favor, ingresa tu email y contraseña.');
    return;
  }

  setBtnText(submitBtn, 'Iniciando sesión...', true);

  try {
    const loggedInUser = { email, plan: selectedPlan };

    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        showError('Credenciales incorrectas o usuario no encontrado: ' + error.message);
        setBtnText(submitBtn, 'Iniciar Sesión y Entrar', false);
        return;
      }
      if (data && data.user) loggedInUser.id = data.user.id;
    }

    localStorage.setItem('gestarian_user_session', JSON.stringify(loggedInUser));
    showUserLoggedInUI(loggedInUser);
    closeModal('modal-auth');
    window.location.href = PLAN_URLS[selectedPlan] || PLAN_URLS.pro;
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
