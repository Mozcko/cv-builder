import { useEffect, useState } from 'react';
import useTranslation from '../../../hooks/useTranslation';
import Navbar from '../EditorToolbar'; 
import { useCVLogic } from './hooks/useCVLogic';
import { usePDFPreview } from './hooks/usePDFPreview';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import MobileNavigation from './components/MobileNavigation';

export default function CVBuilder() {
  const { t, lang, toggleLang } = useTranslation();
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [windowWidth, setWindowWidth] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Custom Hooks
  const cvLogic = useCVLogic(t, lang);
  const pdfPreview = usePDFPreview(cvLogic.markdown, cvLogic.customCSS, mobileTab, windowWidth, cvLogic.cvData);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrint = async () => {
    if (mobileTab === 'editor' && windowWidth < 1024) {
        setMobileTab('preview');
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    pdfPreview.generatePDF('save');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            cvLogic.handleSave();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cvLogic.handleSave]);

  useEffect(() => {
    if (!cvLogic.resumeId || cvLogic.saveStatus === 'saving' || cvLogic.saveStatus === 'error') return;
    const timer = setTimeout(() => cvLogic.handleSave(), 3000);
    return () => clearTimeout(timer);
  }, [cvLogic.cvData, cvLogic.resumeId]);

  if (!isMounted) return <div className="flex h-screen items-center justify-center bg-app-bg text-slate-400">Cargando...</div>;

  return (
    <div className="flex flex-col h-dvh bg-app-bg font-sans text-text-main print:bg-white print:h-auto overflow-hidden">
      <div className="shrink-0 z-50 bg-panel-bg border-b border-panel-border">
          <Navbar 
            t={t}
            lang={lang}
            toggleLang={toggleLang}
            onReset={cvLogic.handleReset}
            onPrint={handlePrint}
            isAiProcessing={cvLogic.isAiProcessing}
            onAiAction={cvLogic.handleAiAction}
            onSave={cvLogic.handleSave}
            saveStatus={cvLogic.saveStatus}
            resumeTitle={cvLogic.resumeTitle}
            onTitleChange={cvLogic.setResumeTitle}
          />
      </div>

      <main className="flex-1 min-h-0 flex flex-col lg:flex-row relative z-0">
        <EditorPanel 
            editMode={cvLogic.editMode}
            setEditMode={cvLogic.setEditMode}
            activeThemeId={cvLogic.activeThemeId}
            handleThemeChange={cvLogic.handleThemeChange}
            isAiProcessing={cvLogic.isAiProcessing}
            t={t}
            cvData={cvLogic.cvData}
            handleDataChange={cvLogic.handleDataChange}
            markdown={cvLogic.markdown}
            setMarkdown={cvLogic.setMarkdown}
            isVisible={mobileTab === 'editor'}
        />
        <PreviewPanel 
            customCSS={cvLogic.customCSS}
            pageCount={pdfPreview.pageCount}
            t={t}
            markdown={cvLogic.markdown}
            isPdfLoading={pdfPreview.isPdfLoading}
            pdfUrl={pdfPreview.pdfUrl}
            windowWidth={windowWidth}
            sourceRef={pdfPreview.sourceRef}
            isVisible={mobileTab === 'preview'}
        />
      </main>
      <MobileNavigation mobileTab={mobileTab} setMobileTab={setMobileTab} t={t} />
    </div>
  );
}