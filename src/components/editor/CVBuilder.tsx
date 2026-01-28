import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import useLocalStorage from '../../hooks/useLocalStorage';
import useTranslation from '../../hooks/useTranslation';
import { initialCVData, type CVData } from '../../types/cv';
import { generateMarkdown } from '../../utils/markdownGenerator';
import CVForm from './CVForm';
import Navbar from './EditorToolbar'; 
import { themes, getThemeById } from '../../templates'; 

// --- Imports del Editor de Código ---
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markdown'; 
import 'prismjs/themes/prism-tomorrow.css'; 

export default function CVBuilder() {
  const { t, lang, toggleLang } = useTranslation();
  
  // 1. OBTENER DATOS DEL STORAGE
  const [rawData, setRawData] = useLocalStorage<CVData>('cv-data', initialCVData);
  
  // 2. VALIDAR SCHEMA (ANTI-CRASH)
  // Detecta si los datos guardados son de una versión vieja (strings en lugar de arrays)
  const cvData = useMemo(() => {
    const isOldSchema = 
        !Array.isArray(rawData.skills) || 
        !Array.isArray(rawData.certifications) ||
        !Array.isArray(rawData.personal?.socials) ||
        (rawData.experience.length > 0 && typeof rawData.experience[0].description === 'string');

    if (isOldSchema) {
        console.warn("Schema antiguo detectado. Reiniciando datos para evitar errores.");
        return initialCVData;
    }
    return rawData;
  }, [rawData]);

  // Si detectamos datos corruptos/viejos, actualizamos el storage
  useEffect(() => {
      if (cvData !== rawData) {
          setRawData(initialCVData);
      }
  }, [cvData, rawData, setRawData]);


  // 3. GESTIÓN DE TEMAS
  const [activeThemeId, setActiveThemeId] = useLocalStorage<string>('cv-theme-id', 'basic');
  const [customCSS, setCustomCSS] = useLocalStorage<string>('cv-custom-css', themes[0].css);

  // 4. ESTADOS UI
  const [markdown, setMarkdown] = useState<string>('');
  const [editMode, setEditMode] = useState<'form' | 'code'>('form');
  const [isMounted, setIsMounted] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [windowWidth, setWindowWidth] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  
  // ESTADO PARA PREVIEW PDF REAL
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isStale, setIsStale] = useState(true); // Control de cambios para optimizar
  const sourceRef = React.useRef<HTMLDivElement>(null);

  // Calcular escala dinámica para aprovechar el espacio en móvil
  const calculateScale = () => {
      if (windowWidth >= 1024 || windowWidth === 0) return 1;
      // Ancho pantalla - 12px (margen mínimo) / Ancho A4 (794px)
      return Math.min(1, (windowWidth - 12) / 794);
  };
  const scale = calculateScale();

  // Inicialización
  useEffect(() => {
    setIsMounted(true);
    setMarkdown(generateMarkdown(cvData, lang));
    
    // Sincronizar CSS: Si editas el archivo .css en VS Code, actualizamos la vista previa
    // (Solo si estás en modo visual, para no sobrescribir ediciones manuales en el navegador)
    const theme = getThemeById(activeThemeId);
    if (editMode === 'form' && theme && theme.css !== customCSS) {
        setCustomCSS(theme.css);
    }

    // Listener para ajustar la escala del CV en móviles
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sincronización Markdown (Data + Idioma)
  useEffect(() => {
    if (editMode === 'form') {
        setMarkdown(generateMarkdown(cvData, lang));
    }
  }, [cvData, editMode, lang]);

  // GENERACIÓN AUTOMÁTICA DE PREVIEW (Debounced)
  useEffect(() => {
    setIsStale(true); // Marcar como obsoleto cuando cambia el contenido
  }, [markdown, customCSS]);

  useEffect(() => {
    const isVisible = windowWidth >= 1024 || mobileTab === 'preview';
    // Optimización: Solo generar si es visible Y el contenido ha cambiado (isStale)
    if (!isVisible || !isStale) return;

    // En móvil (al cambiar de tab) feedback rápido (500ms). En desktop (al escribir) debounce largo (2s).
    const delay = windowWidth < 1024 ? 500 : 2000;

    const timer = setTimeout(() => {
        if (sourceRef.current) {
            generatePDF('preview');
        }
    }, delay);

    return () => clearTimeout(timer);
  }, [markdown, customCSS, mobileTab, windowWidth, isStale]); 

  // HANDLERS
  const handleDataChange = (newData: CVData) => setRawData(newData);
  
  const handleThemeChange = (theme: any) => {
      setActiveThemeId(theme.id);
      setCustomCSS(theme.css);
  };

  const generatePDF = async (mode: 'save' | 'preview') => {
    // 1. Asegurar que estamos en la pestaña de vista previa (para móviles)
    if (mode === 'save' && mobileTab === 'editor' && windowWidth < 1024) {
        setMobileTab('preview');
        // Esperar a que el DOM se actualice y el elemento sea visible
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Usamos el contenedor oculto (sourceRef) que tiene todo el contenido continuo
    const element = sourceRef.current;
    if (!element) return;

    if (mode === 'preview') setIsPdfLoading(true);

    try {
        // Importación dinámica robusta
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;
        
        // --- SANITIZACIÓN DEL DOM PARA HTML2CANVAS ---
        // Clonamos el nodo para "aplanar" los estilos y convertir colores modernos (oklch) a RGB
        // y eliminar clases de Tailwind que confunden al parser de html2canvas.
        const clone = element.cloneNode(true) as HTMLElement;
        
        // Contenedor temporal fuera de pantalla
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '21cm'; 
        document.body.appendChild(container);
        container.appendChild(clone);

        // Helper para resolver colores a RGB usando Canvas (soporta oklch si el navegador lo soporta)
        const canvas = document.createElement('canvas');
        canvas.width = 1; canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const resolveColor = (color: string) => {
            if (!ctx || !color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return color;
            ctx.clearRect(0, 0, 1, 1);
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
            return `rgba(${r}, ${g}, ${b}, ${a / 255})`;
        };

        // Copiar estilos computados del original al clon
        const applyComputedStyles = (source: HTMLElement, target: HTMLElement) => {
            const computed = window.getComputedStyle(source);
            // Propiedades críticas
            target.style.boxSizing = computed.boxSizing;
            target.style.backgroundColor = resolveColor(computed.backgroundColor);
            target.style.color = resolveColor(computed.color);
            target.style.fontFamily = computed.fontFamily;
            target.style.fontSize = computed.fontSize;
            target.style.fontWeight = computed.fontWeight;
            target.style.lineHeight = computed.lineHeight;
            target.style.textAlign = computed.textAlign;
            
            // Descomponer bordes para evitar problemas con colores modernos (oklch) en shorthands
            target.style.borderTopWidth = computed.borderTopWidth;
            target.style.borderTopStyle = computed.borderTopStyle;
            target.style.borderTopColor = resolveColor(computed.borderTopColor);
            target.style.borderRightWidth = computed.borderRightWidth;
            target.style.borderRightStyle = computed.borderRightStyle;
            target.style.borderRightColor = resolveColor(computed.borderRightColor);
            target.style.borderBottomWidth = computed.borderBottomWidth;
            target.style.borderBottomStyle = computed.borderBottomStyle;
            target.style.borderBottomColor = resolveColor(computed.borderBottomColor);
            target.style.borderLeftWidth = computed.borderLeftWidth;
            target.style.borderLeftStyle = computed.borderLeftStyle;
            target.style.borderLeftColor = resolveColor(computed.borderLeftColor);

            target.style.padding = computed.padding;
            target.style.margin = computed.margin;
            target.style.display = computed.display;
            
            // Propiedades de Layout y Flexbox (Críticas para alineación)
            target.style.width = computed.width;
            target.style.minWidth = computed.minWidth;
            target.style.minHeight = computed.minHeight;
            target.style.maxWidth = computed.maxWidth;
            target.style.whiteSpace = computed.whiteSpace;
            target.style.verticalAlign = computed.verticalAlign;
            target.style.borderCollapse = computed.borderCollapse;
            target.style.flexDirection = computed.flexDirection;
            target.style.justifyContent = computed.justifyContent;
            target.style.alignItems = computed.alignItems;
            target.style.flexGrow = computed.flexGrow;
            target.style.flexShrink = computed.flexShrink;
            
            // Limpiar clases para evitar parsing de CSS externo
            target.removeAttribute('class');
        };

        // Aplicar a la raíz
        applyComputedStyles(element, clone);
        clone.style.transform = 'none'; // Resetear escala
        clone.style.boxShadow = 'none';
        clone.style.opacity = '1'; // Asegurar que sea visible
        clone.style.position = 'static'; // Quitar absolute si lo tiene
        clone.style.filter = 'none'; // Eliminar drop-shadow del PDF
        clone.style.margin = '0';
        clone.style.backgroundImage = 'none'; // Eliminar guías de página del PDF
        clone.style.backgroundColor = '#ffffff'; // Asegurar fondo blanco en el PDF
        clone.style.width = '21cm';

        // Aplicar a todos los descendientes
        const sourceElements = element.querySelectorAll('*');
        const targetElements = clone.querySelectorAll('*');
        sourceElements.forEach((el, i) => {
            if (targetElements[i]) applyComputedStyles(el as HTMLElement, targetElements[i] as HTMLElement);
        });

        // Eliminar padding del contenedor clonado para que html2pdf use sus propios márgenes
        clone.style.padding = '0';

        const opt = {
            margin: 10, // Margen de 1cm (10mm) para evitar que el texto toque el borde
            filename: `${cvData.personal.name.replace(/\s+/g, '_')}_CV.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { 
                scale: mode === 'save' ? 2 : 1, // Optimización: Escala 1 para preview es más rápida
                useCORS: true, 
                logging: false, 
                windowWidth: 794 
            }, 
            jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        const worker = html2pdf().set(opt).from(clone).toPdf();
        
        // Actualizar contador de páginas real
        worker.get('pdf').then((pdf: any) => {
            setPageCount(pdf.internal.getNumberOfPages());
        });

        if (mode === 'save') {
            await worker.save();
        } else {
            const url = await worker.output('bloburl');
            setPdfUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev); // Limpiar memoria
                return url;
            });
        }
        setIsStale(false); // Marcar como actualizado para evitar regeneraciones innecesarias
        
        // Limpieza
        document.body.removeChild(container);

    } catch (error: any) {
        console.error("Error generando PDF:", error);
        if (mode === 'save') alert(`Error al generar el PDF: ${error.message || error}.`);
    }
    if (mode === 'preview') setIsPdfLoading(false);
  };

  const handleReset = () => {
    if(confirm(t.actions.confirmReset)){
        setRawData(initialCVData);
        // Resetear al tema por defecto
        handleThemeChange(themes[0]);
        setEditMode('form');
    }
  }

  // --- LOGICA DE INTELIGENCIA ARTIFICIAL (REAL) ---
  const handleAiAction = async (action: 'enhance' | 'optimize' | 'translate') => {
    setIsAiProcessing(true);
    
    try {
        let jobDescription = "";
        
        // Si la acción es optimizar, necesitamos pedir la descripción del puesto
        if (action === 'optimize') {
            // Nota: Usamos 'as any' por si no has actualizado locales.ts aún, para que no rompa
            const promptText = (t.ai as any).jobDescriptionPrompt || "Pega aquí la descripción del trabajo:";
            jobDescription = prompt(promptText) || "";
            
            // Si el usuario cancela, detenemos todo
            if (!jobDescription) {
                setIsAiProcessing(false);
                return;
            }
        }

        // Llamada a nuestro Endpoint de Astro (que conecta con DeepSeek)
        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                cvData, // Enviamos el estado actual
                lang,   // Enviamos el idioma actual ('es' o 'en')
                jobDescription
            })
        });

        // Verificar si la respuesta es JSON antes de parsear
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("La respuesta del servidor no es válida (posible error 500 o 404).");
        }

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.statusText}`);
        }

        const newCvData = await response.json();

        // Validamos que lo que nos devolvió la IA tenga sentido (mínimo que tenga la sección personal)
        if (!newCvData || !newCvData.personal) {
            throw new Error("La respuesta de la IA no tiene el formato esperado.");
        }

        // Actualizamos el estado con los datos mejorados por IA
        setRawData(newCvData);
        
        // Mensaje de éxito
        const successMsg = {
            enhance: t.ai.alerts.enhance,
            translate: t.ai.alerts.translate,
            optimize: t.ai.alerts.optimize
        }[action];
        
        alert(successMsg);

    } catch (error) {
        console.error("AI Action Error:", error);
        alert("Hubo un error al procesar tu solicitud con IA. Por favor intenta de nuevo.");
    } finally {
        setIsAiProcessing(false);
    }
  };

  const highlightCode = (code: string) => (
    Prism.highlight(code, Prism.languages.markdown, 'markdown')
  );

  if (!isMounted) return <div className="flex h-screen items-center justify-center bg-app-bg text-slate-400">Cargando...</div>;

  return (
    <div className="flex flex-col h-dvh bg-app-bg font-sans text-text-main print:bg-white print:h-auto overflow-hidden relative">
      
      <Navbar 
        t={t}
        lang={lang}
        toggleLang={toggleLang}
        editMode={editMode}
        setEditMode={setEditMode}
        onReset={handleReset}
        onPrint={() => generatePDF('save')}
        isAiProcessing={isAiProcessing}
        onAiAction={handleAiAction}
        currentTheme={activeThemeId}
        onThemeChange={handleThemeChange}
      />

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden print:overflow-visible print:h-auto print:block">
        
        {/* PANEL IZQUIERDO: EDITOR */}
        <section className={`
            w-full lg:w-5/12 xl:w-4/12 
            flex flex-col border-r border-panel-border bg-panel-bg print:hidden overflow-hidden transition-all relative min-w-0
            ${mobileTab === 'editor' ? 'flex-1' : 'hidden lg:flex'} lg:h-auto
        `}>
          
          {/* Overlay de Carga (IA) */}
          {isAiProcessing && (
              <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-purple-300">
                  <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-bold animate-pulse">{t.ai.overlayText}</span>
              </div>
          )}

          {editMode === 'form' ? (
              // MODO VISUAL
              <div className="overflow-y-auto custom-scrollbar h-full pb-28 lg:pb-0">
                  <CVForm data={cvData} onChange={handleDataChange} t={t} />
              </div>
          ) : (
              // MODO CÓDIGO
              <div className="relative h-full flex flex-col bg-[#1d1f21]">
                  <div className="bg-yellow-500/10 text-yellow-500 text-xs py-2 px-4 text-center border-b border-yellow-500/20 shrink-0 font-medium">
                      {t.header.editorWarning}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-28 lg:pb-4">
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

        {/* PANEL DERECHO: PREVIEW */}
        <section className={`
            w-full lg:w-7/12 xl:w-8/12 
            bg-app-bg overflow-hidden print:w-full print:bg-white print:overflow-visible custom-scrollbar relative flex items-center justify-center min-w-0
            ${mobileTab === 'preview' ? 'flex-1' : 'hidden lg:flex'} lg:h-full print:flex!
        `}>
           
           {/* Inyección de CSS dinámico */}
           <style>{customCSS}</style>

           {/* Indicador de Páginas */}
           <div className="absolute top-4 right-6 z-10 print:hidden pointer-events-none">
               <div className="bg-slate-800/90 backdrop-blur text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-600 shadow-lg flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-400">
                       <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                   </svg>
                   {/* @ts-ignore: Las claves page/pages acaban de ser añadidas */}
                   <span>{pageCount} {pageCount === 1 ? t.labels.page : t.labels.pages}</span>
               </div>
           </div>

           {/* CONTENEDOR OCULTO: Fuente de verdad para cálculos y generación de PDF */}
           <div 
                ref={sourceRef}
                className="cv-preview-content absolute top-0 left-0 -z-50 opacity-0 pointer-events-none"
                style={{ width: '21cm', padding: '1cm', margin: 0 }}
           >
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {markdown}
                </ReactMarkdown>
           </div>

           {/* VISTA PREVIA PDF REAL */}
           <div className="absolute top-0 left-0 right-0 bottom-28 lg:inset-0 flex flex-col items-center justify-center bg-slate-900/50 z-0 overflow-hidden">
               
               {/* Loading Overlay */}
               {isPdfLoading && (
                   <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/20 backdrop-blur-[1px]">
                       <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2">
                           <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Actualizando vista previa...
                       </div>
                   </div>
               )}

               {pdfUrl ? (
                   <iframe 
                        src={`${pdfUrl}#toolbar=0&view=${windowWidth < 1024 ? 'FitH' : 'FitV'}`} 
                        className="w-full h-full border-none shadow-2xl relative z-0" 
                        title="CV Preview"
                   />
               ) : (
                   <div className="text-slate-400 text-sm">Generando documento...</div>
               )}
           </div>
        </section>

      </main>

      {/* BARRA DE NAVEGACIÓN MÓVIL (SOLO VISIBLE EN PANTALLAS PEQUEÑAS) */}
      <div className="lg:hidden print:hidden bg-slate-800 border-t border-slate-700 flex text-xs font-bold shrink-0 safe-area-pb shadow-2xl fixed bottom-0 left-0 right-0 z-50">
          <button 
              onClick={() => setMobileTab('editor')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${mobileTab === 'editor' ? 'text-blue-400 bg-slate-700/50 border-t-2 border-blue-500' : 'text-slate-400 border-t-2 border-transparent'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              <span>{t.header.editor}</span>
          </button>
          <div className="w-px bg-slate-700 my-2"></div>
          <button 
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors ${mobileTab === 'preview' ? 'text-blue-400 bg-slate-700/50 border-t-2 border-blue-500' : 'text-slate-400 border-t-2 border-transparent'}`}
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              <span>{t.header.preview}</span>
          </button>
      </div>
    </div>
  );
}