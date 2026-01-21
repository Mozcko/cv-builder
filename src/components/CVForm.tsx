import React from 'react';
import type { CVData, Experience } from '../types/cv';
import type { Translation } from '../i18n/locales';

interface Props {
  data: CVData;
  onChange: (newData: CVData) => void;
  t: Translation;
}

// --- COMPONENTES AUXILIARES (Fuera para evitar pérdida de foco) ---

interface InputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

const Input = ({ label, value, onChange, placeholder }: InputProps) => (
    <div className="mb-3">
      <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
      />
    </div>
);

interface TextAreaProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    rows?: number;
}

const TextArea = ({ label, value, onChange, rows = 3 }: TextAreaProps) => (
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

// --- COMPONENTE PRINCIPAL ---

export default function CVForm({ data, onChange, t }: Props) {
  
  const updatePersonal = (field: keyof CVData['personal'], value: string) => {
    onChange({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const updateExp = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...data.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    onChange({ ...data, experience: newExp });
  };

  const addExp = () => {
    onChange({
      ...data,
      experience: [...data.experience, { 
          id: Date.now().toString(), 
          company: 'Company Name', 
          role: 'Role', 
          location: 'Remote', 
          date: 'Present', 
          description: '- Task 1\n- Task 2' 
      }]
    });
  };
    
  const removeExp = (index: number) => {
      if(confirm(t.actions.confirmDelete)) {
        const newExp = data.experience.filter((_, i) => i !== index);
        onChange({ ...data, experience: newExp });
      }
  };

  return (
    <div className="p-6 space-y-8 pb-20">
      
      {/* Sección Personal */}
      <section>
        <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            {t.sections.personal}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t.labels.fullName} value={data.personal.name} onChange={(v) => updatePersonal('name', v)} />
            <Input label={t.labels.role} value={data.personal.role} onChange={(v) => updatePersonal('role', v)} />
            <Input label={t.labels.email} value={data.personal.email} onChange={(v) => updatePersonal('email', v)} />
            <Input label={t.labels.phone} value={data.personal.phone} onChange={(v) => updatePersonal('phone', v)} />
            <Input label={t.labels.city} value={data.personal.city} onChange={(v) => updatePersonal('city', v)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
             <Input label={t.labels.linkedin} value={data.personal.linkedin} onChange={(v) => updatePersonal('linkedin', v)} />
             <Input label={t.labels.github} value={data.personal.github} onChange={(v) => updatePersonal('github', v)} />
             <Input label={t.labels.portfolio} value={data.personal.portfolio} onChange={(v) => updatePersonal('portfolio', v)} />
        </div>
        <div className="mt-4">
            <TextArea label={t.labels.summary} value={data.personal.summary} onChange={(v) => updatePersonal('summary', v)} />
        </div>
      </section>

      {/* Experiencia */}
      <section>
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
            <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                {t.sections.experience}
            </h3>
            <button 
                onClick={addExp} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/20"
            >
                {t.actions.add}
            </button>
        </div>
        
        <div className="space-y-6">
            {data.experience.map((exp, idx) => (
                <div key={exp.id} className="bg-slate-800/40 p-5 rounded-lg border border-slate-700 relative group hover:border-slate-500 transition-colors">
                    <button 
                        onClick={() => removeExp(idx)} 
                        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1"
                        title={t.actions.delete}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <Input label={t.labels.company} value={exp.company} onChange={(v) => updateExp(idx, 'company', v)} />
                        <Input label={t.labels.role} value={exp.role} onChange={(v) => updateExp(idx, 'role', v)} />
                        <Input label={t.labels.location} value={exp.location} onChange={(v) => updateExp(idx, 'location', v)} />
                        <Input label={t.labels.dates} value={exp.date} onChange={(v) => updateExp(idx, 'date', v)} />
                    </div>
                    <TextArea label={t.labels.description} value={exp.description} onChange={(v) => updateExp(idx, 'description', v)} rows={4} />
                </div>
            ))}
        </div>
      </section>

      {/* Skills y Otros */}
      <section>
        <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            {t.sections.skills}
        </h3>
        <div className="space-y-4">
            <TextArea label={t.labels.techSkills} value={data.skills} onChange={(v) => onChange({...data, skills: v})} />
            <TextArea label={t.labels.certifications} value={data.certifications} onChange={(v) => onChange({...data, certifications: v})} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label={t.labels.languages} value={data.languages} onChange={(v) => onChange({...data, languages: v})} />
                <Input label={t.labels.interests} value={data.interests} onChange={(v) => onChange({...data, interests: v})} />
            </div>
        </div>
      </section>

    </div>
  );
}