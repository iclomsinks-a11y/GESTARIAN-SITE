import React, { useState } from 'react';

interface ClientLoginProps {
  onSuccess?: (email: string, dni: string) => void;
  onCancel?: () => void;
}

export default function ClientLogin({ onSuccess, onCancel }: ClientLoginProps = {}) {
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccess) {
      onSuccess(email, dni);
    } else {
      // Si se abre de forma independiente, guardar en localStorage y redirigir
      localStorage.setItem('gestarian_client_session', JSON.stringify({
        email,
        dni,
        razonSocial: 'Cliente Área Gestarian',
        tipo: 'CLIENTE_PARTICULAR'
      }));
      window.location.hash = '#expedientes';
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between p-6 md:p-12 font-sans selection:bg-black selection:text-white">
      {/* Encabezado limpio */}
      <header className="pt-4 flex justify-between items-center">
        <span className="text-xs uppercase tracking-widest font-medium text-neutral-400">://gestarian.com</span>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="text-xs text-neutral-400 hover:text-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            ✕ Cerrar
          </button>
        )}
      </header>

      {/* Bloque Central de Input */}
      <main className="max-w-md w-full mx-auto my-auto space-y-8">
        <h1 className="text-[32px] md:text-[44px] font-light tracking-tight leading-none text-neutral-900">
          Entrar al <br /><strong className="font-semibold text-black">Área de Cliente</strong>
        </h1>
        
        <p className="text-[16px] text-neutral-500 leading-relaxed font-light">
          Introduce tus datos de registro para acceder al seguimiento de tus expedientes y presupuestos en curso. Sin contraseñas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <input 
              type="text" 
              placeholder="DNI, NIE o CIF" 
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full text-[18px] p-5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-black focus:bg-white transition-all placeholder-neutral-400 font-light text-black"
              required
            />
          </div>

          <div className="space-y-2">
            <input 
              type="email" 
              placeholder="Correo electrónico" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-[18px] p-5 bg-neutral-50 border border-neutral-200 rounded-none focus:outline-none focus:border-black focus:bg-white transition-all placeholder-neutral-400 font-light text-black"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-black text-white text-[18px] font-medium p-5 rounded-none hover:bg-neutral-800 active:scale-[0.99] transition-all tracking-wide pt-5 pb-5 block text-center cursor-pointer"
          >
            Acceder al portal
          </button>
        </form>
      </main>

      {/* Pie de página */}
      <footer className="text-neutral-400 text-[14px] text-center md:text-left pt-6 border-t border-neutral-100">
        &copy; 2026 GESTARIAN S.L. · Gestión Documental Inteligente
      </footer>
    </div>
  );
}
