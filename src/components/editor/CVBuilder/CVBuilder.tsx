import React, { useEffect, useState } from 'react';
import useTranslation from '../../../hooks/useTranslation';
import Navbar from '../EditorToolbar';
import { useCVLogic } from './hooks/useCVLogic';
import { usePDFPreview } from './hooks/usePDFPreview';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import MobileNavigation from './components/MobileNavigation';
import ATSModal from '../ATSModal';
import CoverLetterModal from '../CoverLetterModal';
import AuthRequiredModal from '../AuthRequiredModal';
import GuestBanner from '../GuestBanner';
import OptimizeModal from '../OptimizeModal';
import AIChoiceModal from '../AIChoiceModal';
import Toast from '../../ui/Toast';

export default function CVBuilder() {
  const { t, lang, toggleLang } = useTranslation();
  const safeLang = lang as 'es' | 'en' | 'pt';
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [isMounted, setIsMounted] = useState(false);

  const cvLogic = useCVLogic(t, safeLang);
  const {
    resumeId,
    saveStatus,
    handleSave,
    cvData,
    markdown,
    customCSS,
    isAiProcessing,
    handleAiAction,
    handleReset,
    resumeTitle,
    setResumeTitle,
    editMode,
    setEditMode,
    activeThemeId,
    handleThemeChange,
    handleDataChange,
    setMarkdown,
    isDirty,
    isAtsModalOpen,
    setIsAtsModalOpen,
    handleAtsAnalysis,
    isCoverLetterOpen,
    setIsCoverLetterOpen,
    isOptimizeModalOpen,
    setIsOptimizeModalOpen,
    isChoiceModalOpen,
    setIsChoiceModalOpen,
    handleChoiceApplied,
    handleGenerateCoverLetter,
    handleUndo,
    handleRedo,
    canUndo,
    canRedo,
    isGuest,
    isPro,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalConfig,
    toasts,
    removeToast,
    isInitializing,
  } = cvLogic;

  const pdfPreview = usePDFPreview(markdown, customCSS, mobileTab, windowWidth, cvData);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handlePrint = async () => {
    if (mobileTab === 'editor' && windowWidth < 1024) {
      setMobileTab('preview');
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    pdfPreview.generatePDF('save');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          handleSave();
        } else if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleUndo, handleRedo]);

  // LÓGICA DE AUTO-GUARDADO (Refinada)
  useEffect(() => {
    if (!resumeId || saveStatus === 'saving' || !isDirty) return;
    const timer = setTimeout(() => handleSave(), 3000);
    return () => clearTimeout(timer);
  }, [resumeId, saveStatus, handleSave, isDirty]);

  if (!isMounted || isInitializing)
    return (
      <div className="bg-app-bg flex h-screen items-center justify-center text-slate-400">
        Cargando...
      </div>
    );

  return (
    <div className="bg-app-bg text-text-main flex h-dvh flex-col overflow-hidden font-sans print:h-auto print:bg-white">
      {isGuest && <GuestBanner lang={safeLang} onSignUp={() => setIsAuthModalOpen(true)} />}
      <div className="bg-panel-bg border-panel-border z-50 shrink-0 border-b">
        <Navbar
          t={t}
          lang={safeLang}
          toggleLang={toggleLang}
          onReset={handleReset}
          onPrint={handlePrint}
          isAiProcessing={isAiProcessing}
          onAiAction={(action) => {
            if (action === 'optimize') setIsOptimizeModalOpen(true);
            else handleAiAction(action);
          }}
          onSave={handleSave}
          saveStatus={saveStatus}
          resumeTitle={resumeTitle}
          onTitleChange={setResumeTitle}
          onAtsSimulator={() => setIsAtsModalOpen(true)}
          onCoverLetter={() => setIsCoverLetterOpen(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          isPro={isPro}
        />
      </div>

      <main className="relative z-0 flex min-h-0 flex-1 flex-col lg:flex-row">
        <EditorPanel
          editMode={editMode}
          setEditMode={setEditMode}
          activeThemeId={activeThemeId}
          handleThemeChange={handleThemeChange}
          isAiProcessing={isAiProcessing}
          t={t}
          cvData={cvData}
          handleDataChange={handleDataChange}
          markdown={markdown}
          setMarkdown={setMarkdown}
          isVisible={mobileTab === 'editor'}
        />
        <PreviewPanel
          customCSS={customCSS}
          pageCount={pdfPreview.pageCount}
          t={t}
          markdown={markdown}
          isPdfLoading={pdfPreview.isPdfLoading}
          pdfUrl={pdfPreview.pdfUrl}
          windowWidth={windowWidth}
          sourceRef={pdfPreview.sourceRef as React.RefObject<HTMLDivElement>}
          isVisible={mobileTab === 'preview'}
        />
      </main>

      <ATSModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
        t={t}
        onAnalyze={handleAtsAnalysis}
      />
      <CoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={() => setIsCoverLetterOpen(false)}
        t={t}
        onGenerate={handleGenerateCoverLetter}
      />
      <OptimizeModal
        isOpen={isOptimizeModalOpen}
        onClose={() => setIsOptimizeModalOpen(false)}
        t={t}
        onOptimize={(jd) => handleAiAction('optimize', jd)}
        isProcessing={isAiProcessing}
      />

      <AIChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        onChoice={handleChoiceApplied}
        t={t}
        lang={safeLang}
      />

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={safeLang}
        {...authModalConfig}
      />

      <MobileNavigation mobileTab={mobileTab} setMobileTab={setMobileTab} t={t} />

      {/* Toast Notifications container */}
      <div className="pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-end gap-2 p-8">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
