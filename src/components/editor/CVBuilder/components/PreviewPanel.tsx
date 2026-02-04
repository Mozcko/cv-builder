import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { Translation } from '../../../../i18n/locales';

interface PreviewPanelProps {
    customCSS: string;
    pageCount: number;
    t: Translation;
    markdown: string;
    isPdfLoading: boolean;
    pdfUrl: string | null;
    windowWidth: number;
    sourceRef: React.RefObject<HTMLDivElement>;
    isVisible: boolean;
}

export default function PreviewPanel({
    customCSS, pageCount, t, markdown, isPdfLoading, pdfUrl, windowWidth, sourceRef, isVisible
}: PreviewPanelProps) {
    return (
        <section className={`w-full lg:w-7/12 xl:w-8/12 bg-app-bg print:w-full print:bg-white print:overflow-visible relative ${isVisible ? 'flex-1 h-full block' : 'hidden lg:block'}`}>
            <style>{customCSS}</style>

            {/* Page Indicator */}
            <div className="absolute top-4 right-6 z-20 print:hidden pointer-events-none">
                <div className="bg-slate-800/90 backdrop-blur text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-600 shadow-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-400"><path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" /></svg>
                    <span>{pageCount} {pageCount === 1 ? t.labels.page : t.labels.pages}</span>
                </div>
            </div>

            {/* Hidden Source */}
            <div ref={sourceRef} className="cv-preview-content absolute top-0 left-0 -z-50 opacity-0 pointer-events-none" style={{ width: '21cm', padding: '1cm', margin: 0 }}>
                <ReactMarkdown rehypePlugins={[rehypeRaw]}>{markdown}</ReactMarkdown>
            </div>

            {/* PDF Iframe */}
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900/50 z-0 overflow-hidden">
                {isPdfLoading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/20 backdrop-blur-[1px]">
                        <div className="bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Actualizando vista previa...
                        </div>
                    </div>
                )}

                {pdfUrl ? (
                    <iframe 
                        src={`${pdfUrl}#toolbar=0&view=${windowWidth < 1024 ? 'FitH' : 'FitV'}`} 
                        className="w-full h-full border-none shadow-2xl relative z-10" 
                        title="CV Preview"
                        style={{ display: 'block' }}
                    />
                ) : <div className="text-slate-400 text-sm">Generando documento...</div>}
            </div>
        </section>
    );
}