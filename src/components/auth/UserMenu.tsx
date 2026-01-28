import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });

    // Cerrar menú al hacer click fuera
    function handleClickOutside(event: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        subscription.unsubscribe();
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <a 
        href="/login" 
        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Iniciar Sesión
      </a>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
        {/* BOTÓN AVATAR */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 focus:outline-none hover:opacity-80 transition-opacity"
        >
            <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white max-w-30 truncate">
                    {user.user_metadata?.full_name || 'Usuario'}
                </div>
            </div>

            {user.user_metadata?.avatar_url ? (
                <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className={`w-9 h-9 rounded-full border-2 transition-colors ${isOpen ? 'border-blue-500' : 'border-slate-600'}`}
                />
            ) : (
                <div className={`w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs border-2 ${isOpen ? 'border-blue-300' : 'border-slate-500'}`}>
                    {(user.email?.[0] || 'U').toUpperCase()}
                </div>
            )}
        </button>

        {/* MENÚ DESPLEGABLE */}
        {isOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* Header del menú (móvil) */}
                <div className="px-4 py-2 border-b border-slate-700 sm:hidden">
                    <p className="text-white text-sm font-bold truncate">{user.user_metadata?.full_name}</p>
                    <p className="text-slate-400 text-xs truncate">{user.email}</p>
                </div>

                {/* Opción 1: Dashboard */}
                <a 
                    href="/app/dashboard" 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Ir al Dashboard
                </a>

                 {/* Opción 2: Nuevo CV */}
                 <a 
                    href="/app/editor" 
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Nuevo CV
                </a>

                <div className="h-px bg-slate-700 my-1 mx-2"></div>

                {/* Opción 3: Salir */}
                <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar Sesión
                </button>
            </div>
        )}
    </div>
  );
}