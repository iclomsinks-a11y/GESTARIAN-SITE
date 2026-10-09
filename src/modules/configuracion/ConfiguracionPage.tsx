import React from 'react';

export type PlanType = 'LITE' | 'QUICK' | 'PRO' | 'ENTERPRISE';

interface ConfigOptionProps {
  title: string;
  description: string;
  requiredPlan?: 'PRO' | 'ENTERPRISE';
  currentPlan: PlanType;
  onUpgrade?: () => void;
  onConfigure?: () => void;
}

function ConfigOption({ title, description, requiredPlan, currentPlan, onUpgrade, onConfigure }: ConfigOptionProps) {
  // Lógica para comprobar si la opción está bloqueada para el plan actual
  const planHierarchy: Record<PlanType, number> = { LITE: 0, QUICK: 1, PRO: 2, ENTERPRISE: 3 };
  const isLocked = requiredPlan ? planHierarchy[currentPlan] < planHierarchy[requiredPlan] : false;

  return (
    <div className={`py-6 border-b border-neutral-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all ${isLocked ? 'opacity-40' : 'opacity-100'}`}>
      <div className="space-y-1 max-w-xl">
        <div className="flex items-center gap-3">
          <h3 className="text-[20px] font-medium text-black tracking-tight">{title}</h3>
          {isLocked && (
            <span className="inline-flex items-center bg-neutral-100 text-neutral-800 text-[12px] font-medium px-2.5 py-1 rounded-none uppercase tracking-wider">
              🔒 Requiere {requiredPlan}
            </span>
          )}
        </div>
        <p className="text-[16px] text-neutral-500 font-light leading-snug">{description}</p>
      </div>

      <div className="pt-2 md:pt-0">
        {isLocked ? (
          <button 
            type="button"
            onClick={onUpgrade}
            className="w-full md:w-auto border border-neutral-300 text-black text-[16px] font-medium px-6 py-3 rounded-none hover:bg-black hover:text-white transition-all cursor-pointer"
          >
            Mejorar Plan
          </button>
        ) : (
          <button 
            type="button"
            onClick={onConfigure}
            className="w-full md:w-auto bg-neutral-100 text-black text-[16px] font-medium px-6 py-3 rounded-none hover:bg-neutral-200 transition-all cursor-pointer"
          >
            Configurar
          </button>
        )}
      </div>
    </div>
  );
}

interface ConfiguracionPageProps {
  currentPlan?: PlanType;
  onChangePlan?: (plan: PlanType) => void;
  onNotice?: (msg: string) => void;
}

export default function ConfiguracionPage({ currentPlan = 'LITE', onChangePlan, onNotice }: ConfiguracionPageProps = {}) {
  const userPlan = currentPlan;

  const handleUpgrade = (targetPlan: 'PRO' | 'ENTERPRISE') => {
    if (onChangePlan) {
      onChangePlan(targetPlan);
    }
    if (onNotice) {
      onNotice(`Plan actualizado a ${targetPlan}. Módulo desbloqueado.`);
    }
  };

  const handleConfigure = (nombre: string) => {
    if (onNotice) {
      onNotice(`Ajustes aplicados correctamente para: ${nombre}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-12 font-sans max-w-5xl mx-auto selection:bg-black selection:text-white">
      {/* Título de la página masivo */}
      <header className="mb-12 space-y-2">
        <h1 className="text-[36px] md:text-[48px] font-light tracking-tight text-black">
          Ajustes del <strong className="font-semibold">Sistema</strong>
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-[16px] text-neutral-400">
            Plan activo actual: <span className="text-black font-semibold uppercase">{userPlan}</span>
          </p>
          {onChangePlan && (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-neutral-400">Cambiar versión:</span>
              {(['LITE', 'QUICK', 'PRO', 'ENTERPRISE'] as PlanType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChangePlan(p)}
                  className={`text-xs px-3 py-1 font-mono transition-all ${
                    userPlan === p 
                      ? 'bg-black text-white font-bold' 
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Listado de herramientas agrupadas limpiamente */}
      <main className="space-y-12">
        {/* Core de Facturación */}
        <section>
          <h2 className="text-[14px] uppercase tracking-widest font-semibold text-neutral-400 mb-4">Core de Facturación</h2>
          <div className="border-t border-black">
            <ConfigOption 
              title="Numeración de Documentos" 
              description="Gestione las series y correlativos canónicos automáticos de solicitudes, presupuestos, expedientes y facturas rectificativas."
              currentPlan={userPlan}
              onConfigure={() => handleConfigure('Numeración de Documentos')}
            />
            <ConfigOption 
              title="Panel de Cobros y Recibos" 
              description="Automatización de envío de Recibos de Abonos Parciales e impresión de saldos pendientes."
              requiredPlan="PRO"
              currentPlan={userPlan}
              onUpgrade={() => handleUpgrade('PRO')}
              onConfigure={() => handleConfigure('Panel de Cobros')}
            />
          </div>
        </section>

        {/* Módulos Avanzados */}
        <section>
          <h2 className="text-[14px] uppercase tracking-widest font-semibold text-neutral-400 mb-4">Módulos Avanzados</h2>
          <div className="border-t border-black">
            <ConfigOption 
              title="Gestión y Contabilización de Nóminas" 
              description="Procesamiento de costes de personal, epígrafes de cotización de la Seguridad Social y retenciones a cuenta del IRPF."
              requiredPlan="PRO"
              currentPlan={userPlan}
              onUpgrade={() => handleUpgrade('PRO')}
              onConfigure={() => handleConfigure('Gestión de Nóminas')}
            />
            <ConfigOption 
              title="Inventario de Activos (Muebles / Inmuebles)" 
              description="Control de bienes en propiedad con tablas de amortización lineal o alquileres comerciales con retención del 19%."
              requiredPlan="PRO"
              currentPlan={userPlan}
              onUpgrade={() => handleUpgrade('PRO')}
              onConfigure={() => handleConfigure('Inventario de Activos')}
            />
          </div>
        </section>

        {/* Fiscalidad & AEAT */}
        <section>
          <h2 className="text-[14px] uppercase tracking-widest font-semibold text-neutral-400 mb-4">Fiscalidad & Sede AEAT</h2>
          <div className="border-t border-black">
            <ConfigOption 
              title="Modelos Oficiales de Hacienda (303, 111, 115, 390)" 
              description="Cálculo directo de bases imponibles y generación telemática compatible con la Agencia Tributaria."
              requiredPlan="PRO"
              currentPlan={userPlan}
              onUpgrade={() => handleUpgrade('PRO')}
              onConfigure={() => handleConfigure('Modelos Oficiales')}
            />
            <ConfigOption 
              title="Conexión Directa SII / TicketBAI / Red B2B" 
              description="Transmisión en tiempo real de facturación reglada y sincronización en red para flotas comerciales y empresas."
              requiredPlan="ENTERPRISE"
              currentPlan={userPlan}
              onUpgrade={() => handleUpgrade('ENTERPRISE')}
              onConfigure={() => handleConfigure('Conexión SII / Red')}
            />
          </div>
        </section>

        {/* Apariencia Minimalista Radical & Tipografía */}
        <section>
          <h2 className="text-[14px] uppercase tracking-widest font-semibold text-neutral-400 mb-4">Estilo Visual & Experiencia Móvil</h2>
          <div className="border-t border-black">
            <ConfigOption 
              title="Diseño Documental Minimalista (Estilo Gestarian Quick)" 
              description="Facturas, presupuestos, recibos y órdenes de trabajo en formato minimalista con bordes de color por estado e iconos flotantes al pie."
              currentPlan={userPlan}
              onConfigure={() => handleConfigure('Diseño Documental')}
            />
            <ConfigOption 
              title="Big Typography UI en Pantallas Pequeñas" 
              description="Texto base generoso (16-18px) y encabezados (32-48px) con diseño secuencial adaptado al uso con un solo pulgar."
              currentPlan={userPlan}
              onConfigure={() => handleConfigure('Big Typography UI')}
            />
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="text-neutral-400 text-[14px] pt-12 mt-12 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>&copy; 2026 GESTARIAN S.L. · Gestión Documental Inteligente</div>
        <div className="text-xs uppercase tracking-widest text-neutral-400">Ajustes Canónicos del Sistema</div>
      </footer>
    </div>
  );
}
