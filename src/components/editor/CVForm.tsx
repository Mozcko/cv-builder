import { useState } from 'react';
import type { CVData, Experience, Education, SkillItem, SocialLink } from '../../types/cv';
import type { Translation } from '../../i18n/locales';

interface Props {
  data: CVData;
  onChange: (newData: CVData) => void;
  t: Translation;
}

// --- COMPONENTES AUXILIARES ---

interface InputProps {
    label?: string;
    value: string | number | readonly string[] | undefined;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    className?: string;
    required?: boolean;
}

const Input = ({ label, value, onChange, placeholder, type = "text", disabled = false, className = "", required = false }: InputProps) => (
    <div className={`w-full ${className}`}>
      {label && (
        <label className={`block text-xs font-bold mb-1 uppercase tracking-wider ${disabled ? 'text-slate-600' : 'text-gray-400'}`}>
            {label} {required && <span className="text-red-400" title="Obligatorio">*</span>}
        </label>
      )}
      <input 
        type={type} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-slate-700/50 border rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all
            ${disabled ? 'border-slate-800 text-slate-500 cursor-not-allowed' : 'border-slate-600 focus:border-transparent'}
            ${required && !value ? 'border-l-2 border-l-red-500' : ''}`}
      />
    </div>
);

const TextArea = ({ label, value, onChange, rows = 3 }: any) => (
    <div className="mb-3">
      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono transition-all custom-scrollbar"
      />
    </div>
);

// --- EDITOR DE REDES SOCIALES ---
interface SocialsEditorProps {
    items: SocialLink[];
    onUpdate: (items: SocialLink[]) => void;
    t: Translation;
}

const SocialsEditor = ({ items, onUpdate, t }: SocialsEditorProps) => {
    const safeItems = Array.isArray(items) ? items : [];

    const updateItem = (index: number, field: keyof SocialLink, value: string) => {
        const newItems = [...safeItems];
        newItems[index] = { ...newItems[index], [field]: value };
        onUpdate(newItems);
    };
    const addItem = () => onUpdate([...safeItems, { id: Date.now().toString(), network: "", username: "", url: "" }]);
    const removeItem = (index: number) => onUpdate(safeItems.filter((_, i) => i !== index));

    return (
        <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Links / Socials</label>
                <button onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors">{t.actions.addLink}</button>
            </div>
            {safeItems.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-start group">
                    <Input value={item.network} onChange={(v) => updateItem(idx, 'network', v)} placeholder={t.labels.network} className="w-1/3" />
                    <Input value={item.url} onChange={(v) => updateItem(idx, 'url', v)} placeholder={t.labels.url} className="w-2/3" />
                    <button onClick={() => removeItem(idx)} className="mt-1 text-slate-600 hover:text-red-400 transition-colors p-2 rounded hover:bg-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}
        </div>
    );
};

// --- EDITOR DE LISTAS SIMPLES (Bullets de Experiencia) ---
interface SimpleListEditorProps {
    title: string;
    items: string[];
    onUpdate: (items: string[]) => void;
    t: Translation;
}

const SimpleListEditor = ({ title, items, onUpdate, t }: SimpleListEditorProps) => {
    const safeItems = Array.isArray(items) ? items : [];

    const updateItem = (index: number, value: string) => {
        const newItems = [...safeItems];
        newItems[index] = value;
        onUpdate(newItems);
    };
    const addItem = () => onUpdate([...safeItems, ""]);
    const removeItem = (index: number) => onUpdate(safeItems.filter((_, i) => i !== index));

    return (
        <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</label>
                <button onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors">{t.actions.addBullet}</button>
            </div>
            {safeItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start group animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="mt-2 text-slate-500 text-xs">•</span>
                    <Input value={item} onChange={(v) => updateItem(idx, v)} placeholder="Logro..." />
                    <button onClick={() => removeItem(idx)} className="mt-1 text-slate-600 hover:text-red-400 transition-colors p-2 rounded hover:bg-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}
            {safeItems.length === 0 && <div className="text-xs text-slate-500 italic p-2 text-center border border-dashed border-slate-700 rounded">Sin descripción.</div>}
        </div>
    );
};

// --- EDITOR DE LISTAS DINÁMICAS (Skills / Certs) ---
interface ListEditorProps {
    title: string;
    items: SkillItem[];
    onUpdate: (items: SkillItem[]) => void;
    t: Translation;
}

const DynamicListEditor = ({ title, items, onUpdate, t }: ListEditorProps) => {
    const safeItems = Array.isArray(items) ? items : [];

    const updateItem = (index: number, field: keyof SkillItem, value: string) => {
        const newItems = [...safeItems];
        newItems[index] = { ...newItems[index], [field]: value };
        onUpdate(newItems);
    };
    const addItem = () => onUpdate([...safeItems, { id: Date.now().toString(), category: "", items: "" }]);
    const removeItem = (index: number) => onUpdate(safeItems.filter((_, i) => i !== index));

    return (
        <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</label>
                <button onClick={addItem} className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors">{t.actions.addItem}</button>
            </div>
            {safeItems.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-start group animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input value={item.category} onChange={(v) => updateItem(idx, 'category', v)} placeholder={t.labels.category} className="w-1/3" />
                    <Input value={item.items} onChange={(v) => updateItem(idx, 'items', v)} placeholder={t.labels.itemsList} className="w-2/3" />
                    <button onClick={() => removeItem(idx)} className="mt-1 text-slate-600 hover:text-red-400 transition-colors p-2 rounded hover:bg-slate-800">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            ))}
            {safeItems.length === 0 && <div className="text-xs text-slate-500 italic p-3 text-center bg-slate-800/30 rounded border border-slate-700 border-dashed">No hay elementos.</div>}
        </div>
    );
};

// --- EDITOR DE SECCIONES PERSONALIZADAS ---
interface CustomSectionsEditorProps {
    sections: any[];
    onUpdate: (sections: any[]) => void;
    t: Translation;
}

const CustomSectionsEditor = ({ sections, onUpdate, t }: CustomSectionsEditorProps) => {
    const safeSections = Array.isArray(sections) ? sections : [];

    const addSection = () => onUpdate([...safeSections, { id: Date.now().toString(), title: "Nueva Sección", items: [] }]);
    const removeSection = (idx: number) => { if(confirm(t.actions.confirmDelete)) onUpdate(safeSections.filter((_, i) => i !== idx)); };
    
    const updateSectionTitle = (idx: number, title: string) => {
        const newSecs = [...safeSections];
        newSecs[idx] = { ...newSecs[idx], title };
        onUpdate(newSecs);
    };

    const addItem = (secIdx: number) => {
        const newSecs = [...safeSections];
        newSecs[secIdx].items.push({ id: Date.now(), title: "Elemento", subtitle: "", description: "" });
        onUpdate(newSecs);
    };

    const updateItem = (secIdx: number, itemIdx: number, field: string, val: string) => {
        const newSecs = [...safeSections];
        newSecs[secIdx].items[itemIdx] = { ...newSecs[secIdx].items[itemIdx], [field]: val };
        onUpdate(newSecs);
    };

    return (
        <div className="space-y-6">
            {safeSections.map((section, sIdx) => (
                <div key={section.id} className="border-t border-slate-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <Input value={section.title} onChange={(v) => updateSectionTitle(sIdx, v)} placeholder={t.labels.sectionTitle} className="font-bold text-blue-400" />
                        <button onClick={() => removeSection(sIdx)} className="text-red-400 hover:text-red-300 text-xs uppercase font-bold">{t.actions.delete}</button>
                    </div>
                    {section.items.map((item: any, iIdx: number) => (
                        <div key={item.id} className="bg-slate-800/30 p-3 rounded mb-3 border border-slate-700/50">
                            <Input value={item.title} onChange={(v) => updateItem(sIdx, iIdx, 'title', v)} placeholder={t.labels.itemTitle} className="mb-2" />
                            <Input value={item.subtitle} onChange={(v) => updateItem(sIdx, iIdx, 'subtitle', v)} placeholder={t.labels.itemSubtitle} className="mb-2 text-xs" />
                            <TextArea value={item.description} onChange={(v: string) => updateItem(sIdx, iIdx, 'description', v)} rows={2} />
                        </div>
                    ))}
                    <button onClick={() => addItem(sIdx)} className="text-xs text-blue-400 hover:text-blue-300 font-bold mt-2">{t.actions.addItem}</button>
                </div>
            ))}
            <button onClick={addSection} className="w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-blue-400 hover:border-blue-500/50 transition-colors font-bold uppercase text-xs tracking-wider">
                {t.actions.addSection}
            </button>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---

export default function CVForm({ data, onChange, t }: Props) {
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  
  const updatePersonal = (field: keyof CVData['personal'], value: any) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const updateExp = (index: number, field: keyof Experience, value: any) => {
    const newExp = [...data.experience];
    // @ts-ignore
    newExp[index] = { ...newExp[index], [field]: value };
    if (field === 'isCurrent' && value === true) newExp[index].endDate = null;
    onChange({ ...data, experience: newExp });
  };
  const addExp = () => onChange({ ...data, experience: [...data.experience, { id: Date.now().toString(), company: 'Company', role: 'Role', location: 'Remote', startDate: new Date().toISOString().slice(0, 7), endDate: null, isCurrent: true, description: ["Responsibility 1"] }] });
  const removeExp = (index: number) => { if(confirm(t.actions.confirmDelete)) onChange({ ...data, experience: data.experience.filter((_, i) => i !== index) }); };

  const updateEdu = (index: number, field: keyof Education, value: any) => {
    const newEdu = [...data.education];
    // @ts-ignore
    newEdu[index] = { ...newEdu[index], [field]: value };
    if (field === 'isCurrent' && value === true) newEdu[index].endDate = null;
    onChange({ ...data, education: newEdu });
  };
  const addEdu = () => onChange({ ...data, education: [...data.education, { id: Date.now().toString(), institution: 'University', degree: 'Degree', startDate: new Date().toISOString().slice(0, 7), endDate: null, isCurrent: true }] });
  const removeEdu = (index: number) => { if(confirm(t.actions.confirmDelete)) onChange({ ...data, education: data.education.filter((_, i) => i !== index) }); };

  // Helpers para Projects (usando any para bypass de tipo estricto temporalmente)
  const safeProjects = (data as any).projects || [];
  const updateProject = (index: number, field: string, value: any) => {
      const newProjs = [...safeProjects];
      newProjs[index] = { ...newProjs[index], [field]: value };
      onChange({ ...data, projects: newProjs } as any);
  };
  const addProject = () => onChange({ ...data, projects: [...safeProjects, { id: Date.now().toString(), name: 'Project Name', role: 'Role', startDate: '', endDate: '', description: ["Description..."] }] } as any);
  const removeProject = (index: number) => { if(confirm(t.actions.confirmDelete)) onChange({ ...data, projects: safeProjects.filter((_: any, i: number) => i !== index) } as any); };

  // --- REORDENAMIENTO ---
  const sectionOrder = (data as any).sectionOrder || ['experience', 'projects', 'education', 'skills', 'custom'];
  
  const moveSection = (index: number, direction: 'up' | 'down') => {
      const newOrder = [...sectionOrder];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return;
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      onChange({ ...data, sectionOrder: newOrder } as any);
  };

  return (
    <div className="p-3 md:p-6 space-y-6 md:space-y-8 pb-4">
      
      {/* Aviso de campos vacíos */}
      {showInfoBanner && (
      <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-3 text-xs text-blue-200 flex items-start gap-2 relative animate-in fade-in slide-in-from-top-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mt-0.5 shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1 pr-2">
            <p>{t.header.emptyFieldsNotice}</p>
          </div>
          <button onClick={() => setShowInfoBanner(false)} className="text-blue-400 hover:text-white transition-colors" title={t.actions.close}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" /></svg>
          </button>
      </div>
      )}

      {/* 1. SECCIÓN PERSONAL */}
      <section>
        <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span> {t.sections.personal}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t.labels.fullName} value={data.personal.name} onChange={(v) => updatePersonal('name', v)} required />
            <Input label={t.labels.role} value={data.personal.role} onChange={(v) => updatePersonal('role', v)} required />
            <Input label={t.labels.email} value={data.personal.email} onChange={(v) => updatePersonal('email', v)} />
            <Input label={t.labels.phone} value={data.personal.phone} onChange={(v) => updatePersonal('phone', v)} />
            <Input label={t.labels.city} value={data.personal.city} onChange={(v) => updatePersonal('city', v)} />
        </div>
        
        {/* Editor de Redes Sociales */}
        <SocialsEditor items={data.personal.socials} onUpdate={(newSocials) => updatePersonal('socials', newSocials)} t={t} />

        <div className="mt-4">
            <TextArea label={t.labels.summary} value={data.personal.summary} onChange={(v: string) => updatePersonal('summary', v)} />
        </div>
      </section>

      {/* SECCIONES REORDENABLES */}
      {sectionOrder.map((sectionId: string, index: number) => {
        
        // Header común con controles de orden
        const SectionHeader = ({ title, onAdd }: { title: string, onAdd?: () => void }) => (
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2 group">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="hover:text-blue-400 disabled:opacity-20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" /></svg></button>
                        <button onClick={() => moveSection(index, 'down')} disabled={index === sectionOrder.length - 1} className="hover:text-blue-400 disabled:opacity-20"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg></button>
                    </div>
                    <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2"><span className="w-2 h-6 bg-blue-500 rounded-full"></span> {title}</h3>
                </div>
                {onAdd && <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/20">{t.actions.add}</button>}
            </div>
        );

        if (sectionId === 'experience') return (
          <section key="experience">
            <SectionHeader title={t.sections.experience} onAdd={addExp} />
            <button onClick={addExp} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/20">{t.actions.add}</button>
            <div className="space-y-6">
            {data.experience.map((exp, idx) => (
                <div key={exp.id} className="bg-slate-800/40 p-5 rounded-lg border border-slate-700 relative group hover:border-slate-500 transition-colors">
                    <button onClick={() => removeExp(idx)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1" title={t.actions.delete}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input label={t.labels.company} value={exp.company} onChange={(v) => updateExp(idx, 'company', v)} />
                        <Input label={t.labels.role} value={exp.role} onChange={(v) => updateExp(idx, 'role', v)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <Input label={t.labels.location} value={exp.location} onChange={(v) => updateExp(idx, 'location', v)} />
                         <div className="grid grid-cols-2 gap-2">
                             <Input label={t.labels.startDate} type="month" value={exp.startDate} onChange={(v) => updateExp(idx, 'startDate', v)} />
                             <Input label={t.labels.endDate} type="month" value={exp.endDate || ''} onChange={(v) => updateExp(idx, 'endDate', v)} disabled={exp.isCurrent} />
                         </div>
                    </div>
                    <div className="mb-4 flex items-center gap-2 justify-end">
                        <input type="checkbox" id={`current-exp-${exp.id}`} checked={exp.isCurrent} onChange={(e) => updateExp(idx, 'isCurrent', e.target.checked)} className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 rounded focus:ring-blue-500 cursor-pointer" />
                        <label htmlFor={`current-exp-${exp.id}`} className="text-sm text-slate-300 select-none cursor-pointer">{t.labels.currentWork}</label>
                    </div>
                    
                    {/* Editor de Bullets */}
                    <SimpleListEditor title={t.labels.description} items={exp.description} onUpdate={(items) => updateExp(idx, 'description', items)} t={t} />
                </div>
            ))}
            </div>
          </section>
        );

        if (sectionId === 'projects') return (
          <section key="projects">
            <SectionHeader title={t.sections.projects} onAdd={addProject} />
            <div className="space-y-6">
            {safeProjects.map((proj: any, idx: number) => (
                <div key={proj.id} className="bg-slate-800/40 p-5 rounded-lg border border-slate-700 relative group hover:border-slate-500 transition-colors">
                    <button onClick={() => removeProject(idx)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input label={t.labels.project} value={proj.name} onChange={(v) => updateProject(idx, 'name', v)} />
                        <Input label={t.labels.role} value={proj.role} onChange={(v) => updateProject(idx, 'role', v)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                         <Input label={t.labels.startDate} type="month" value={proj.startDate} onChange={(v) => updateProject(idx, 'startDate', v)} />
                         <Input label={t.labels.endDate} type="month" value={proj.endDate} onChange={(v) => updateProject(idx, 'endDate', v)} />
                    </div>
                    <Input label={t.labels.url} value={proj.url} onChange={(v) => updateProject(idx, 'url', v)} className="mb-4" />
                    <SimpleListEditor title={t.labels.description} items={proj.description} onUpdate={(items) => updateProject(idx, 'description', items)} t={t} />
                </div>
            ))}
            </div>
          </section>
        );

        if (sectionId === 'education') return (
          <section key="education">
            <SectionHeader title={t.sections.edu} onAdd={addEdu} />
            <div className="space-y-6">
            {data.education.map((edu, idx) => (
                <div key={edu.id} className="bg-slate-800/40 p-5 rounded-lg border border-slate-700 relative group hover:border-slate-500 transition-colors">
                    <button onClick={() => removeEdu(idx)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1" title={t.actions.delete}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input label={t.labels.institution} value={edu.institution} onChange={(v) => updateEdu(idx, 'institution', v)} />
                        <Input label={t.labels.degree} value={edu.degree} onChange={(v) => updateEdu(idx, 'degree', v)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <div className="hidden md:block"></div>
                         <div className="grid grid-cols-2 gap-2">
                             <Input label={t.labels.startDate} type="month" value={edu.startDate} onChange={(v) => updateEdu(idx, 'startDate', v)} />
                             <Input label={t.labels.endDate} type="month" value={edu.endDate || ''} onChange={(v) => updateEdu(idx, 'endDate', v)} disabled={edu.isCurrent} />
                         </div>
                    </div>
                    <div className="mb-2 flex items-center gap-2 justify-end">
                        <input type="checkbox" id={`current-edu-${edu.id}`} checked={edu.isCurrent} onChange={(e) => updateEdu(idx, 'isCurrent', e.target.checked)} className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 rounded focus:ring-blue-500 cursor-pointer" />
                        <label htmlFor={`current-edu-${edu.id}`} className="text-sm text-slate-300 select-none cursor-pointer">{t.labels.currentStudy}</label>
                    </div>
                </div>
            ))}
            </div>
          </section>
        );

        if (sectionId === 'skills') return (
          <section key="skills">
            <SectionHeader title={t.sections.skills} />
            <div className="space-y-8">
            <DynamicListEditor title={t.labels.techSkills} items={data.skills} onUpdate={(newSkills) => onChange({...data, skills: newSkills})} t={t} />
            <div className="h-px bg-slate-700/50"></div>
            <DynamicListEditor title={t.labels.certifications} items={data.certifications} onUpdate={(newCerts) => onChange({...data, certifications: newCerts})} t={t} />
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label={t.labels.languages} value={data.languages} onChange={(v) => onChange({...data, languages: v})} />
            <Input label={t.labels.interests} value={data.interests} onChange={(v) => onChange({...data, interests: v})} />
            </div>
          </section>
        );

        if (sectionId === 'custom') return (
          <section key="custom">
            <SectionHeader title={t.sections.custom} />
        <CustomSectionsEditor 
            sections={(data as any).customSections || []} 
            onUpdate={(secs) => onChange({ ...data, customSections: secs } as any)} 
            t={t} 
        />
          </section>
        );

        return null;
      })}

    </div>
  );
}