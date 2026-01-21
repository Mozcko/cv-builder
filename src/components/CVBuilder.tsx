import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import useLocalStorage from '../hooks/useLocalStorage';
import useTranslation from '../hooks/useTranslation';
import { initialCVData, type CVData } from '../types/cv';
import { generateMarkdown } from '../utils/markdownGenerator';
import CVForm from './CVForm';
import Navbar from './Navbar'; 

// --- Imports del Editor de Código ---
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown'; 
import 'prismjs/themes/prism-tomorrow.css'; 

// @ts-ignore
import defaultCssFile from '../templates/basic.css?raw';

export default function CVBuilder() {
  const { t, lang, toggleLang } = useTranslation();
  
  // --- Estados de Datos ---
  const [cvData, setCvData] = useLocalStorage<CVData>('cv-data', initialCVData);
  const [markdown, setMarkdown] = useState<string>('');
  const [currentStyles, setCurrentStyles] = useLocalStorage<string>('cv-styles', defaultCssFile);

  // --- Estados de UI ---
  const [editMode, setEditMode] = useState<'form' | 'code'>('form');
  const [isMounted, setIsMounted] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Inicialización (Client-side only)
  useEffect(() => {
    setIsMounted(true);
    setMarkdown(generateMarkdown(cvData));
  }, []);

  // Sincronización: Cuando cambia el JSON (por el Formulario o por la IA), regeneramos el Markdown
  useEffect(() => {
    if (editMode === 'form') {
        setMarkdown(generateMarkdown(cvData));
    }
  }, [cvData, editMode]);

  // --- Handlers ---

  const handlePrint = () => window.print();

  const handleReset = () => {
    if(confirm(t.actions.confirmReset)){
        setCvData(initialCVData);
        setCurrentStyles(defaultCssFile);
        setEditMode('form');
    }
  }

  // Simulación de IA (Aquí conectarás tu agente n8n en el futuro)
  const handleAiAction = async (action: 'enhance' | 'optimize' | 'translate') => {
    setIsAiProcessing(true);
    
    // Simulación de delay de red (API Call)
    setTimeout(() => {
        const newData = { ...cvData };

        if (action === 'enhance') {
            // Ejemplo: Mejorar el resumen
            newData.personal.summary = "Results-oriented Data Analyst with a proven track record in designing scalable ETL pipelines using Azure Data Factory. Expert in transforming raw data into actionable business intelligence using Python and SQL.";
            alert("✨ IA: He mejorado la redacción de tu perfil profesional para que sea más impactante.");
        } 
        else if (action === 'translate') {
            // Ejemplo: Traducir puestos clave
            newData.personal.role = lang === 'es' ? "Data Analyst" : "Analista de Datos"; 
            // (Nota: En una implementación real, la IA traduciría todo el objeto)
            alert(lang === 'es' ? "🌐 AI: Translated role to English." : "🌐 IA: Rol traducido al Español.");
        }
        else if (action === 'optimize') {
            alert("🎯 IA: (Simulación) He ajustado las keywords de tu experiencia para coincidir con la descripción del trabajo.");
        }

        // Al actualizar 'cvData', el useEffect de arriba regenerará el Markdown automáticamente.
        setCvData(newData);
        setIsAiProcessing(false);
    }, 1500);
  };

  // Resaltado de sintaxis para el editor de código
  const highlightCode = (code: string) => (
    Prism.highlight(code, Prism.languages.markdown, 'markdown')
  );

  if (!isMounted) return <div className="flex h-screen items-center justify-center bg-app-bg text-slate-400">Cargando...</div>;

  return (
    <div className="flex flex-col h-screen bg-app-bg font-sans text-text-main">
      
      {/* Componente Navbar separado con controles de IA */}
      <Navbar 
        t={t}
        lang={lang}
        toggleLang={toggleLang}
        editMode={editMode}
        setEditMode={setEditMode}
        onReset={handleReset}
        onPrint={handlePrint}
        isAiProcessing={isAiProcessing}
        onAiAction={handleAiAction}
      />

      {/* ÁREA DE TRABAJO */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* PANEL IZQUIERDO: EDITOR (Formulario o Código) */}
        <section className="w-1/2 flex flex-col border-r border-panel-border bg-panel-bg print:hidden overflow-hidden transition-all relative">
          
          {/* Overlay de carga si la IA está trabajando */}
          {isAiProcessing && (
              <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-purple-300">
                  <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-bold animate-pulse">Generando mejoras con IA...</span>
              </div>
          )}

          {editMode === 'form' ? (
              // --- MODO FORMULARIO ---
              <div className="overflow-y-auto custom-scrollbar h-full">
                  <CVForm data={cvData} onChange={setCvData} t={t} />
              </div>
          ) : (
              // --- MODO CÓDIGO (Editor Avanzado) ---
              <div className="relative h-full flex flex-col bg-[#1d1f21]">
                  <div className="bg-yellow-500/10 text-yellow-500 text-xs py-2 px-4 text-center border-b border-yellow-500/20 shrink-0 font-medium">
                      {t.header.editorWarning}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                    <Editor
                      value={markdown}
                      onValueChange={(code) => setMarkdown(code)}
                      highlight={highlightCode}
                      padding={10}
                      className="font-mono text-sm"
                      style={{
                        fontFamily: '"Fira Code", "Fira Mono", monospace',
                        fontSize: 14,
                        minHeight: '100%'
                      }}
                      textareaClassName="focus:outline-none"
                    />
                  </div>
              </div>
          )}
        </section>

        {/* PANEL DERECHO: PREVIEW (Resultado Final) */}
        <section className="w-1/2 bg-app-bg overflow-y-auto print:w-full print:bg-white print:overflow-visible custom-scrollbar relative flex items-start justify-center">
           
           {/* Inyección de CSS dinámico */}
           <style>{currentStyles}</style>

           <div className="py-12 px-8 print:p-0 transition-transform duration-300">
               {/* Hoja A4 Simulada */}
               <div className="bg-white text-slate-900 shadow-2xl min-h-[29.7cm] w-[21cm] print:shadow-none print:w-full relative">
                 
                 {/* Contenido HTML generado desde Markdown */}
                 <div className="cv-preview-content p-[1cm] print:p-0 h-full">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                        {markdown}
                    </ReactMarkdown>
                 </div>

               </div>
           </div>
        </section>

      </main>
    </div>
  );
}