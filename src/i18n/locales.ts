export const locales = {
  es: {
    header: {
      title: "CV Builder",
      reset: "Resetear",
      download: "Descargar PDF",
      visualEditor: "Editor Visual",
      codeEditor: "Código Markdown",
      editorWarning: "⚠️ Modo Avanzado: Los cambios directos al código no actualizan el formulario visual.",
    },
    sections: {
      personal: "Información Personal",
      experience: "Experiencia Laboral",
      skills: "Habilidades y Otros",
    },
    labels: {
      fullName: "Nombre Completo",
      role: "Rol / Título",
      email: "Email",
      phone: "Teléfono",
      city: "Ciudad",
      linkedin: "LinkedIn URL",
      github: "GitHub URL",
      portfolio: "Portfolio URL",
      summary: "Resumen Profesional",
      company: "Empresa",
      location: "Ubicación",
      dates: "Fechas",
      description: "Descripción (Bullets)",
      techSkills: "Skills Técnicos",
      certifications: "Certificaciones",
      languages: "Idiomas",
      interests: "Intereses",
    },
    actions: {
      add: "+ Agregar",
      delete: "Eliminar",
      confirmDelete: "¿Eliminar esta experiencia?",
      confirmReset: "¿Estás seguro de reiniciar al CV por defecto? Perderás los cambios actuales."
    }
  },
  en: {
    header: {
      title: "CV Builder",
      reset: "Reset",
      download: "Download PDF",
      visualEditor: "Visual Editor",
      codeEditor: "Markdown Code",
      editorWarning: "⚠️ Advanced Mode: Direct code changes do not update the visual form.",
    },
    sections: {
      personal: "Personal Information",
      experience: "Work Experience",
      skills: "Skills & Others",
    },
    labels: {
      fullName: "Full Name",
      role: "Role / Title",
      email: "Email",
      phone: "Phone",
      city: "City/Location",
      linkedin: "LinkedIn URL",
      github: "GitHub URL",
      portfolio: "Portfolio URL",
      summary: "Professional Summary",
      company: "Company",
      location: "Location",
      dates: "Dates",
      description: "Description (Bullets)",
      techSkills: "Technical Skills",
      certifications: "Certifications",
      languages: "Languages",
      interests: "Interests",
    },
    actions: {
      add: "+ Add",
      delete: "Delete",
      confirmDelete: "Delete this experience entry?",
      confirmReset: "Are you sure you want to reset to default? You will lose current changes."
    }
  }
};

// Tipo derivado para usar en los componentes
export type Translation = typeof locales.es;