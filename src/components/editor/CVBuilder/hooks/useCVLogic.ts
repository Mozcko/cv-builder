import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/astro/react';
import { api } from '../../../../lib/api';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import { initialCVData, type CVData } from '../../../../types/cv';
import { generateMarkdown } from '../../../../utils/markdownGenerator';
import type { CvTheme } from '../../../../templates';
import { themes } from '../../../../templates';
import type { Translation } from '../../../../i18n/locales';

export function useCVLogic(t: Translation, lang: 'es' | 'en' | 'pt') {
  const { getToken, userId, isLoaded } = useAuth();
  const isGuest = !userId;

  const [rawData, setRawData] = useLocalStorage<CVData>('cv-data', initialCVData);
  const [resumeId, setResumeId] = useLocalStorage<string | null>('cv-resume-id', null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [resumeTitle, setResumeTitle] = useState<string>('');
  const [isPro, setIsPro] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{
    title?: string;
    description?: string;
    mode?: 'auth' | 'upgrade';
  }>({});
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [pendingAiData, setPendingAiData] = useState<{
    data: CVData;
    action: string;
    lang: string;
  } | null>(null);
  const [toasts, setToasts] = useState<
    { id: string; message: string; type: 'success' | 'error' | 'info' }[]
  >([]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const triggerAuthModal = useCallback(
    (title?: string, description?: string, mode: 'auth' | 'upgrade' = 'auth') => {
      setAuthModalConfig({ title, description, mode });
      setIsAuthModalOpen(true);
    },
    []
  );

  useEffect(() => {
    const fetchProStatus = async () => {
      if (!isLoaded || !userId) return;
      try {
        const token = await getToken();
        const profile = await api.getUserProfile(token);
        setIsPro(profile.is_pro);
      } catch (err: unknown) {
        console.error(err);
      }
    };
    fetchProStatus();
  }, [isLoaded, userId, getToken]);

  const [isDirty, setIsDirty] = useState(false);
  const [past, setPast] = useState<CVData[]>([]);
  const [future, setFuture] = useState<CVData[]>([]);
  const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentDataRef = useRef<CVData>(rawData);

  useEffect(() => {
    currentDataRef.current = rawData;
  }, [rawData]);

  const [activeThemeId, setActiveThemeId] = useLocalStorage<string>('cv-theme-id', 'basic');
  const [customCSS, setCustomCSS] = useLocalStorage<string>('cv-custom-css', themes[0].css);
  const [markdown, setMarkdownState] = useState<string>('');
  const [editMode, setEditMode] = useState<'form' | 'code'>('form');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const cvData = useMemo(() => {
    const personal = {
      name: '',
      role: '',
      summary: '',
      email: '',
      phone: '',
      city: '',
      socials: [],
      ...rawData?.personal,
    };

    const experience = Array.isArray(rawData?.experience) ? rawData.experience : [];
    const education = Array.isArray(rawData?.education) ? rawData.education : [];
    const skills = Array.isArray(rawData?.skills) ? rawData.skills : [];
    const certifications = Array.isArray(rawData?.certifications) ? rawData.certifications : [];
    const projects = Array.isArray((rawData as unknown as { projects?: unknown[] })?.projects)
      ? (rawData as unknown as { projects: unknown[] }).projects
      : [];
    const customSections = Array.isArray(
      (rawData as unknown as { customSections?: unknown[] })?.customSections
    )
      ? (rawData as unknown as { customSections: unknown[] }).customSections
      : [];

    const defaultOrder = ['experience', 'projects', 'education', 'skills', 'custom'];
    const sectionOrder = (rawData as unknown as { sectionOrder?: string[] })?.sectionOrder as
      | string[]
      | undefined;

    let finalOrder: string[];
    if (!Array.isArray(sectionOrder) || sectionOrder.length === 0) {
      finalOrder = defaultOrder;
    } else {
      const currentOrder = sectionOrder.map((s: string) => String(s).toLowerCase());
      const missingDefaults = defaultOrder.filter((s) => !currentOrder.includes(s));
      finalOrder = [...currentOrder, ...missingDefaults];
    }

    return {
      ...rawData,
      personal,
      experience,
      education,
      skills,
      certifications,
      projects,
      customSections,
      sectionOrder: finalOrder,
    };
  }, [rawData]);

  useEffect(() => {
    if (editMode === 'form') {
      setMarkdownState(generateMarkdown(cvData, lang));
    }
  }, [cvData, editMode, lang]);

  useEffect(() => {
    const initData = async () => {
      if (!isLoaded || !userId) return;
      const token = await getToken();
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');

      try {
        if (urlId) {
          setResumeId(urlId);
          const data = await api.getCV(urlId, token);
          if (data && data.content) {
            const userCvData = data.content as Record<string, unknown>;
            if (userCvData.mode === 'markdown') {
              setMarkdownState(userCvData.markdown as string);
              setEditMode('code');
            } else {
              setRawData({ ...(userCvData as unknown as CVData), language: data.language || 'ES' });
              setEditMode('form');
            }
            if (data.title) setResumeTitle(data.title);
            setIsDirty(false);
            setSaveStatus('saved');
          }
        }
      } catch (err: any) {
        console.error(err);
        if (err.status === 404) {
          setResumeId(null);
          // Limpiar el ID inválido de la URL sin recargar
          window.history.replaceState(null, '', window.location.pathname);
          showToast(
            lang === 'es'
              ? 'CV no encontrado, iniciando uno nuevo'
              : lang === 'pt'
                ? 'CV não encontrado, iniciando um novo'
                : 'CV not found, starting fresh',
            'info'
          );
        }
      }
    };
    initData();
  }, [isLoaded, userId, getToken, setResumeId, setRawData]);

  const handleDataChange = useCallback(
    (newData: CVData) => {
      if (historyTimeoutRef.current) clearTimeout(historyTimeoutRef.current);
      const previousState = currentDataRef.current;
      historyTimeoutRef.current = setTimeout(() => {
        setPast((prev) => [...prev, previousState].slice(-50));
      }, 800);
      if (future.length > 0) setFuture([]);
      setRawData(newData);
      setIsDirty(true);
      setSaveStatus('idle');
    },
    [future.length, setRawData]
  );

  const pushImmediateHistory = (stateToSave: CVData) => {
    setPast((prev) => [...prev, stateToSave]);
    setFuture([]);
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setFuture([rawData, ...future]);
    setRawData(previous);
    setPast(past.slice(0, -1));
    setIsDirty(true);
    setSaveStatus('idle');
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setPast([...past, rawData]);
    setRawData(next);
    setFuture(future.slice(1));
    setIsDirty(true);
    setSaveStatus('idle');
  };

  const handleThemeChange = (theme: CvTheme) => {
    setActiveThemeId(theme.id);
    setCustomCSS(theme.css);
    setIsDirty(true);
    setSaveStatus('idle');
  };

  const handleMarkdownChange = (newMarkdown: string) => {
    setMarkdownState(newMarkdown);
    setIsDirty(true);
    setSaveStatus('idle');
  };

  const handleReset = () => {
    if (confirm(t.actions.confirmReset)) {
      pushImmediateHistory(rawData);
      setRawData(initialCVData);
      handleThemeChange(themes[0]);
      setEditMode('form');
      setIsDirty(true);
      setSaveStatus('idle');
    }
  };

  const handleSave = useCallback(async () => {
    if (isGuest) {
      triggerAuthModal();
      return;
    }
    if (saveStatus === 'saving' || (!isDirty && saveStatus === 'saved')) return;

    const token = await getToken();
    setSaveStatus('saving');
    let finalTitle = resumeTitle;
    let dataPayload = cvData;

    if (editMode === 'code') {
      dataPayload = { mode: 'markdown', markdown } as unknown as CVData;
      if (!finalTitle) {
        const h1Match = markdown.match(/^#\s+(.*)/);
        finalTitle = h1Match ? h1Match[1].trim() : 'Markdown CV';
      }
    } else if (!finalTitle) {
      finalTitle = cvData.personal.role || 'Mi CV';
    }

    try {
      if (resumeId && resumeId !== 'null') {
        try {
          await api.updateCV(
            resumeId,
            {
              title: finalTitle,
              content: dataPayload,
              language: (dataPayload as unknown as { language?: string }).language || 'ES',
            },
            token
          );
        } catch (err: any) {
          if (err.status === 404) {
            // Si el ID es inválido/stale, creamos uno nuevo
            const res = await api.createCV(
              {
                id: crypto.randomUUID(),
                title: finalTitle,
                content: dataPayload,
                language: (dataPayload as unknown as { language?: string }).language || 'ES',
              },
              token
            );
            if (res) {
              setResumeId(res.id);
              window.history.replaceState(null, '', `/app/editor?id=${res.id}`);
            }
          } else {
            throw err;
          }
        }
      } else {
        const newId = crypto.randomUUID();
        const res = await api.createCV(
          {
            id: newId,
            title: finalTitle,
            content: dataPayload,
            language: (dataPayload as unknown as { language?: string }).language || 'ES',
          },
          token
        );
        if (res) {
          setResumeId(res.id);
          window.history.replaceState(null, '', `/app/editor?id=${res.id}`);
        }
      }
      setSaveStatus('saved');
      setIsDirty(false);
      showToast(lang === 'es' ? 'CV guardado' : lang === 'pt' ? 'Currículo salvo' : 'CV saved');
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('error');
      showToast(
        lang === 'es' ? 'Error al guardar' : lang === 'pt' ? 'Erro ao salvar' : 'Error saving',
        'error'
      );
    }
  }, [
    cvData,
    resumeId,
    resumeTitle,
    editMode,
    markdown,
    isDirty,
    saveStatus,
    getToken,
    isGuest,
    lang,
    showToast,
    triggerAuthModal,
    setResumeId,
    setResumeTitle,
  ]);

  const handleAiAction = async (
    action: 'enhance' | 'optimize' | 'translate',
    providedJd?: string
  ) => {
    if (isGuest) {
      triggerAuthModal();
      return;
    }
    if (!isPro) {
      triggerAuthModal(undefined, undefined, 'upgrade');
      return;
    }
    setIsAiProcessing(true);
    const token = await getToken();
    try {
      const response = await api.improveText(
        JSON.stringify(cvData),
        `Action: ${action}, Lang: ${lang}, JD: ${providedJd || ''}`,
        token
      );
      const aiData = JSON.parse(response.improved_text) as Record<string, unknown>;
      if (!aiData || !aiData.personal) throw new Error('Invalid AI response');

      const safeAiPersonal = (aiData.personal || {}) as Record<string, unknown>;
      const finalAiCvData: CVData = {
        ...rawData,
        ...(aiData as unknown as CVData),
        personal: {
          ...rawData.personal,
          name: (safeAiPersonal.name as string) || rawData.personal.name,
          role: (safeAiPersonal.role as string) || rawData.personal.role,
          email: (safeAiPersonal.email as string) || rawData.personal.email,
          phone: (safeAiPersonal.phone as string) || rawData.personal.phone,
          city: (safeAiPersonal.city as string) || rawData.personal.city,
          summary: (safeAiPersonal.summary as string) || rawData.personal.summary,
          socials:
            Array.isArray(safeAiPersonal.socials) && safeAiPersonal.socials.length > 0
              ? (safeAiPersonal.socials as CVData['personal']['socials'])
              : rawData.personal.socials,
        },
        experience:
          Array.isArray(aiData.experience) && aiData.experience.length > 0
            ? (aiData.experience as CVData['experience'])
            : rawData.experience,
        education:
          Array.isArray(aiData.education) && aiData.education.length > 0
            ? (aiData.education as CVData['education'])
            : rawData.education,
        skills:
          Array.isArray(aiData.skills) && aiData.skills.length > 0
            ? (aiData.skills as CVData['skills'])
            : rawData.skills,
        certifications:
          Array.isArray(aiData.certifications) && aiData.certifications.length > 0
            ? (aiData.certifications as CVData['certifications'])
            : rawData.certifications,
        projects:
          Array.isArray(aiData.projects) && aiData.projects.length > 0
            ? (aiData.projects as unknown as CVData['experience'])
            : (rawData as unknown as { projects: CVData['experience'] }).projects,
        customSections:
          Array.isArray(aiData.customSections) && aiData.customSections.length > 0
            ? (aiData.customSections as unknown as CVData['experience'])
            : (rawData as unknown as { customSections: CVData['experience'] }).customSections,
        sectionOrder:
          Array.isArray(aiData.sectionOrder) && aiData.sectionOrder.length > 0
            ? (aiData.sectionOrder as string[]).map((s: string) => s.toLowerCase())
            : (rawData as unknown as { sectionOrder: string[] }).sectionOrder,
      };

      setPendingAiData({ data: finalAiCvData, action, lang });
      setIsChoiceModalOpen(true);
    } catch {
      showToast('Error con la IA', 'error');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleChoiceApplied = async (choice: 'overwrite' | 'copy') => {
    if (!pendingAiData) return;
    const { data: finalAiCvData, action, lang: aiLang } = pendingAiData;
    const token = await getToken();
    const currentSessionId = resumeId;
    const currentManualData = { ...rawData };
    const currentTitle = resumeTitle;
    const targetLanguage =
      action === 'translate' ? aiLang.toUpperCase() : currentManualData.language || 'ES';

    try {
      if (choice === 'copy') {
        setResumeId(null);
        if (isDirty && currentSessionId && currentSessionId !== 'null') {
          try {
            await api.updateCV(
              currentSessionId,
              {
                title: currentTitle,
                content: currentManualData,
                language: currentManualData.language || 'ES',
              },
              token
            );
          } catch (e) {
            console.warn(e);
          }
        }
        const newId = crypto.randomUUID();
        const copyTitle = `${currentTitle || 'CV'} (AI Optimized)`;
        const created = await api.createCV(
          { id: newId, title: copyTitle, content: finalAiCvData, language: targetLanguage },
          token
        );
        if (created) {
          setResumeId(created.id);
          setResumeTitle(copyTitle);
          setRawData({ ...finalAiCvData, language: targetLanguage });
          setIsDirty(false);
          setSaveStatus('saved');
          window.history.replaceState(null, '', `/app/editor?id=${created.id}`);
          showToast('Copy Created');
        }
      } else {
        pushImmediateHistory(currentManualData);
        setRawData({ ...finalAiCvData, language: targetLanguage });
        setIsDirty(true);
        setSaveStatus('idle');
        showToast('Applied');
      }
    } catch {
      showToast('Error', 'error');
    } finally {
      setIsChoiceModalOpen(false);
      setPendingAiData(null);
    }
  };

  const handleAtsAnalysis = async (jd: string) => {
    if (isGuest) {
      triggerAuthModal();
      return null;
    }
    if (!isPro) {
      triggerAuthModal(undefined, undefined, 'upgrade');
      return null;
    }
    const token = await getToken();
    try {
      return await api.simulateATS(cvData, jd, token);
    } catch {
      showToast('Error ATS', 'error');
      return null;
    }
  };

  const handleGenerateCoverLetter = async (jd: string) => {
    if (isGuest) {
      triggerAuthModal();
      return null;
    }
    if (!isPro) {
      triggerAuthModal(undefined, undefined, 'upgrade');
      return null;
    }
    const token = await getToken();
    try {
      return await api.generateCoverLetter(cvData, jd, token);
    } catch {
      showToast('Error Cover Letter', 'error');
      return null;
    }
  };

  return {
    cvData,
    handleDataChange,
    activeThemeId,
    handleThemeChange,
    customCSS,
    setCustomCSS,
    markdown,
    setMarkdown: handleMarkdownChange,
    editMode,
    setEditMode,
    isAiProcessing,
    handleAiAction,
    saveStatus,
    handleSave,
    handleReset,
    resumeTitle,
    setResumeTitle: (nt: string) => {
      setResumeTitle(nt);
      setIsDirty(true);
      setSaveStatus('idle');
    },
    resumeId,
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
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    isGuest,
    isPro,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalConfig,
    toasts,
    removeToast,
  };
}
