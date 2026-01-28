import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function HeroActions() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión al cargar
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setLoading(false);
    });
  }, []);

  if (loading) {
    // Un estado de carga sutil para evitar saltos bruscos
    return (
        <div className="flex gap-4 animate-pulse">
            <div className="h-14 w-48 bg-slate-800 rounded-xl"></div>
            <div className="h-14 w-32 bg-slate-800 rounded-xl hidden sm:block"></div>
        </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
        {user ? (
            // --- ESTADO LOGUEADO: Ver Dashboard ---
            <a 
                href="/app/dashboard" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                Ver mis Currículums
            </a>
        ) : (
            // --- ESTADO INVITADO: Crear Gratis ---
            <a 
                href="/app/editor" 
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
            >
                Crear mi CV Gratis &rarr;
            </a>
        )}

        {/* El botón secundario siempre es igual */}
        <a 
            href="#demo" 
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl text-lg font-bold border border-slate-700 transition-all text-center"
        >
            Ver Demo
        </a>
    </div>
  );
}