import type { CVData, Experience, Education, SkillItem } from '../types/cv';
import { initialCVData } from '../types/cv';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface Project {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  url: string;
  description: string[];
}

interface CustomSection {
  title: string;
  items: {
    title: string;
    subtitle: string;
    description: string;
  }[];
}

export interface ParseResult {
  success: boolean;
  data: CVData | null;
  /** Sections or fields that couldn't be fully parsed */
  warnings: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// Localized section title maps (must match markdownGenerator.ts titlesMap)
// ────────────────────────────────────────────────────────────────────────────

const titlesMap: Record<string, Record<string, string>> = {
  es: {
    exp: 'Experiencia Profesional',
    skills: 'Habilidades Técnicas',
    edu: 'Educación',
    certs: 'Certificaciones',
    lang: 'Idiomas',
    int: 'Intereses',
    projects: 'Proyectos Destacados',
  },
  en: {
    exp: 'Professional Experience',
    skills: 'Technical Skills',
    edu: 'Education',
    certs: 'Certifications',
    lang: 'Languages',
    int: 'Interests',
    projects: 'Key Projects',
  },
  pt: {
    exp: 'Experiência Profissional',
    skills: 'Habilidades Técnicas',
    edu: 'Educação',
    certs: 'Certificações',
    lang: 'Idiomas',
    int: 'Interesses',
    projects: 'Projetos em Destaque',
  },
};

/**
 * Build a reverse lookup: localized title → section key.
 * Includes titles for ALL languages so the parser can handle
 * a CV written in any language regardless of the `lang` parameter.
 */
function buildTitleToKeyMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const langTitles of Object.values(titlesMap)) {
    for (const [key, title] of Object.entries(langTitles)) {
      map.set(title.toLowerCase(), key);
    }
  }
  return map;
}

const titleToKey = buildTitleToKeyMap();

// ────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ────────────────────────────────────────────────────────────────────────────

let idCounter = 0;
function nextId(): string {
  return String(++idCounter);
}

function resetIdCounter(): void {
  idCounter = 0;
}

/**
 * Try to convert a human-readable date like "Jan 2023" or "ene 2023" back to "2023-01".
 * Also handles "Presente" / "Present" → null (for isCurrent).
 */
function parseDateString(dateStr: string): { date: string; isCurrent: boolean } {
  const trimmed = dateStr.trim();
  if (!trimmed) return { date: '', isCurrent: false };

  const currentPatterns = ['presente', 'present', 'actual', 'current'];
  if (currentPatterns.includes(trimmed.toLowerCase())) {
    return { date: '', isCurrent: true };
  }

  // Try parsing with Intl-friendly Date parsing
  // The generator outputs: "Jan 2023", "ene 2023", etc.
  // Strategy: try creating a Date from the string
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 1900) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    return { date: `${year}-${month}`, isCurrent: false };
  }

  // Fallback: try to extract month/year manually
  // Pattern: "Mon YYYY" or "YYYY-MM"
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})$/);
  if (isoMatch) {
    return { date: trimmed, isCurrent: false };
  }

  // Try with month names in multiple languages
  const monthNames: Record<string, number> = {
    // English
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
    // Spanish
    ene: 1,
    abr: 4,
    ago: 8,
    dic: 12,
    // Portuguese
    fev: 2,
    mai: 5,
    set: 9,
    out: 10,
    dez: 12,
    // Long month names (English)
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
    // Long month names (Spanish)
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
    // Long month names (Portuguese)
    janeiro: 1,
    fevereiro: 2,
    março: 3,
    maio: 5,
    junho: 6,
    julho: 7,
    setembro: 9,
    outubro: 10,
    novembro: 11,
    dezembro: 12,
  };

  const monthYearMatch = trimmed.match(/^([a-záéíóúñç.]+)\s+(\d{4})$/i);
  if (monthYearMatch) {
    const monthKey = monthYearMatch[1].replace('.', '').toLowerCase();
    const year = monthYearMatch[2];
    const monthNum = monthNames[monthKey];
    if (monthNum) {
      return { date: `${year}-${String(monthNum).padStart(2, '0')}`, isCurrent: false };
    }
  }

  // Last resort: if we can extract just a year
  const yearMatch = trimmed.match(/(\d{4})/);
  if (yearMatch) {
    return { date: `${yearMatch[1]}-01`, isCurrent: false };
  }

  return { date: '', isCurrent: false };
}

/**
 * Split markdown into sections by `## ` headings.
 * Returns an array of { title, content } where the first entry has title = '' (the header).
 */
function splitSections(md: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = md.split('\n');
  let currentTitle = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      // Save previous section
      sections.push({ title: currentTitle, content: currentLines.join('\n').trim() });
      currentTitle = h2Match[1].trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  // Save last section
  sections.push({ title: currentTitle, content: currentLines.join('\n').trim() });

  return sections;
}

// ────────────────────────────────────────────────────────────────────────────
// Section Parsers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Parse the header block (before any ## heading).
 * Expected format:
 *   # Name
 *   **City** | **Email** | **Phone**
 *   <br>
 *   **[LinkedIn](url)** | **[GitHub](url)**
 *   Summary text...
 */
function parseHeader(content: string, warnings: string[]): CVData['personal'] {
  const lines = content.split('\n').map((l) => l.trim());
  const personal: CVData['personal'] = {
    name: '',
    role: '',
    email: '',
    phone: '',
    city: '',
    summary: '',
    socials: [],
  };

  let lineIndex = 0;

  // Skip empty lines
  while (lineIndex < lines.length && !lines[lineIndex]) lineIndex++;

  // Parse # Name
  if (lineIndex < lines.length) {
    const h1Match = lines[lineIndex].match(/^#\s+(.+)$/);
    if (h1Match) {
      personal.name = h1Match[1].trim();
      lineIndex++;
    } else {
      warnings.push('Could not find H1 name in header');
    }
  }

  // Skip empty lines
  while (lineIndex < lines.length && !lines[lineIndex]) lineIndex++;

  // Parse **City** | **Email** | **Phone**
  if (lineIndex < lines.length) {
    const contactLine = lines[lineIndex];
    const boldParts = [...contactLine.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim());
    if (boldParts.length >= 3) {
      personal.city = boldParts[0];
      personal.email = boldParts[1];
      personal.phone = boldParts[2];
      lineIndex++;
    } else if (boldParts.length === 2) {
      // Maybe city + email only, or email + phone
      personal.city = boldParts[0];
      personal.email = boldParts[1];
      lineIndex++;
      warnings.push('Only found 2 contact fields in header (expected 3)');
    } else {
      warnings.push('Could not parse contact line in header');
    }
  }

  // Skip <br> and empty lines
  while (
    lineIndex < lines.length &&
    (!lines[lineIndex] || lines[lineIndex] === '<br>' || lines[lineIndex] === '<br/>')
  ) {
    lineIndex++;
  }

  // Parse social links: **[Network](url)** | **[Network](url)**
  if (lineIndex < lines.length) {
    const socialLine = lines[lineIndex];
    const socialMatches = [...socialLine.matchAll(/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g)];
    if (socialMatches.length > 0) {
      personal.socials = socialMatches.map((m) => ({
        id: nextId(),
        network: m[1],
        username: '',
        url: m[2],
      }));
      lineIndex++;
    }
    // If no socials found, that's fine — not all CVs have them
  }

  // Skip empty lines
  while (lineIndex < lines.length && !lines[lineIndex]) lineIndex++;

  // Everything remaining is the summary
  const summaryLines: string[] = [];
  while (lineIndex < lines.length) {
    summaryLines.push(lines[lineIndex]);
    lineIndex++;
  }
  personal.summary = summaryLines.join('\n').trim();

  return personal;
}

/**
 * Parse experience section.
 * Expected format per entry:
 *   <table>
 *     <tr><td><strong>Company</strong></td><td><em>Role</em></td></tr>
 *     <tr><td><em>Location</em></td><td><em>Start - End</em></td></tr>
 *   </table>
 *   - Bullet 1
 *   - Bullet 2
 */
function parseExperience(content: string, warnings: string[]): Experience[] {
  const experiences: Experience[] = [];

  // Split by <table> blocks
  const tableBlocks = content.split(/<table>/i);

  for (const block of tableBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const exp: Experience = {
      id: nextId(),
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: null,
      isCurrent: false,
      description: [],
    };

    // Extract company and role from first <tr>
    const firstRowMatch = trimmed.match(
      /<tr>\s*<td><strong>([^<]*)<\/strong><\/td>\s*<td><em>([^<]*)<\/em><\/td>\s*<\/tr>/i
    );
    if (firstRowMatch) {
      exp.company = firstRowMatch[1].trim();
      exp.role = firstRowMatch[2].trim();
    }

    // Extract location and dates from second <tr>
    const secondRowMatch = trimmed.match(
      /<tr>\s*<td><em>([^<]*)<\/em><\/td>\s*<td><em>([^<]*)<\/em><\/td>\s*<\/tr>/i
    );
    if (secondRowMatch) {
      exp.location = secondRowMatch[1].trim();
      const dateRange = secondRowMatch[2].trim();
      const dateParts = dateRange.split(/\s*-\s*/);
      if (dateParts.length >= 2) {
        const startParsed = parseDateString(dateParts[0]);
        const endParsed = parseDateString(dateParts.slice(1).join('-'));
        exp.startDate = startParsed.date;
        exp.isCurrent = endParsed.isCurrent;
        exp.endDate = endParsed.isCurrent ? null : endParsed.date || null;
      }
    }

    // Extract bullet points after </table>
    const afterTable = trimmed.split(/<\/table>/i)[1] || '';
    const bullets = afterTable
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.trim().replace(/^-\s*/, ''));
    exp.description = bullets;

    // Only add if we got at least a company or role
    if (exp.company || exp.role) {
      experiences.push(exp);
    } else if (bullets.length > 0) {
      warnings.push('Found experience bullets without a company/role table');
    }
  }

  return experiences;
}

/**
 * Parse skills or certifications section.
 * Expected format:
 *   - **Category:** Items
 */
function parseCategoryList(content: string): SkillItem[] {
  const items: SkillItem[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.trim().match(/^-\s+\*\*([^*]+):\*\*\s*(.+)$/);
    if (match) {
      items.push({
        id: nextId(),
        category: match[1].trim(),
        items: match[2].trim(),
      });
    }
  }

  return items;
}

/**
 * Parse education section.
 * Expected format:
 *   **Degree**
 *   <br>
 *   *Institution | Start - End*
 */
function parseEducation(content: string, warnings: string[]): Education[] {
  const educations: Education[] = [];

  // Split by <br> which separates education entries
  // The format is: **Degree**\n<br>\n*Institution | Start - End*
  // Multiple entries separated by \n<br>\n
  const blocks = content.split(/\n<br>\n/);

  // Process pairs: each education entry spans potentially two blocks
  // Pattern: block with **Degree** followed by block with *Institution | dates*
  let i = 0;
  while (i < blocks.length) {
    const block = blocks[i].trim();
    if (!block) {
      i++;
      continue;
    }

    const edu: Education = {
      id: nextId(),
      institution: '',
      degree: '',
      startDate: '',
      endDate: null,
      isCurrent: false,
    };

    // Try to find degree and institution in this block and possibly the next
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    for (const line of lines) {
      // Check for **Degree**
      const degreeMatch = line.match(/^\*\*([^*]+)\*\*$/);
      if (degreeMatch) {
        edu.degree = degreeMatch[1].trim();
        continue;
      }

      // Check for *Institution | Start - End*
      const instMatch = line.match(/^\*([^*]+)\*$/);
      if (instMatch) {
        const instContent = instMatch[1].trim();
        const pipeIndex = instContent.indexOf('|');
        if (pipeIndex !== -1) {
          edu.institution = instContent.substring(0, pipeIndex).trim();
          const dateRange = instContent.substring(pipeIndex + 1).trim();
          const dateParts = dateRange.split(/\s*-\s*/);
          if (dateParts.length >= 2) {
            const startParsed = parseDateString(dateParts[0]);
            const endParsed = parseDateString(dateParts.slice(1).join('-'));
            edu.startDate = startParsed.date;
            edu.isCurrent = endParsed.isCurrent;
            edu.endDate = endParsed.isCurrent ? null : endParsed.date || null;
          }
        } else {
          edu.institution = instContent;
        }
        continue;
      }
    }

    // If we have a degree but no institution, check next block
    if (edu.degree && !edu.institution && i + 1 < blocks.length) {
      i++;
      const nextBlock = blocks[i].trim();
      const nextLines = nextBlock
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      for (const line of nextLines) {
        const instMatch = line.match(/^\*([^*]+)\*$/);
        if (instMatch) {
          const instContent = instMatch[1].trim();
          const pipeIndex = instContent.indexOf('|');
          if (pipeIndex !== -1) {
            edu.institution = instContent.substring(0, pipeIndex).trim();
            const dateRange = instContent.substring(pipeIndex + 1).trim();
            const dateParts = dateRange.split(/\s*-\s*/);
            if (dateParts.length >= 2) {
              const startParsed = parseDateString(dateParts[0]);
              const endParsed = parseDateString(dateParts.slice(1).join('-'));
              edu.startDate = startParsed.date;
              edu.isCurrent = endParsed.isCurrent;
              edu.endDate = endParsed.isCurrent ? null : endParsed.date || null;
            }
          } else {
            edu.institution = instContent;
          }
        }
      }
    }

    if (edu.degree || edu.institution) {
      educations.push(edu);
    }

    i++;
  }

  if (educations.length === 0 && content.trim()) {
    warnings.push('Could not parse education entries');
  }

  return educations;
}

/**
 * Parse projects section.
 * Expected format:
 *   ### Project Name
 *   *Role* | Start - End | Link
 *   - Bullet 1
 */
function parseProjects(content: string, _warnings: string[]): Project[] {
  const projects: Project[] = [];

  // Split by ### headings
  const projectBlocks = content.split(/^###\s+/m);

  for (const block of projectBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n');
    const name = lines[0].trim();

    const proj: Project = {
      name,
      role: '',
      startDate: '',
      endDate: '',
      url: '',
      description: [],
    };

    // Parse the metadata line: *Role* | DateRange | Link
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check for *Role* | dates pattern
      const metaMatch = line.match(/^\*([^*]+)\*\s*\|\s*(.+)$/);
      if (metaMatch) {
        proj.role = metaMatch[1].trim();
        const rest = metaMatch[2].trim();

        // Check if there's a "| Link" at the end
        if (rest.includes('| Link')) {
          const datesPart = rest.replace(/\|\s*Link\s*$/, '').trim();
          const dateParts = datesPart.split(/\s*-\s*/);
          if (dateParts.length >= 2) {
            proj.startDate = parseDateString(dateParts[0]).date;
            proj.endDate = parseDateString(dateParts.slice(1).join('-')).date;
          }
          proj.url = 'link'; // Placeholder — original URL is lost in generation
        } else {
          const dateParts = rest.split(/\s*-\s*/);
          if (dateParts.length >= 2) {
            proj.startDate = parseDateString(dateParts[0]).date;
            proj.endDate = parseDateString(dateParts.slice(1).join('-')).date;
          }
        }
        continue;
      }

      // Collect bullet points
      if (line.startsWith('-')) {
        proj.description.push(line.replace(/^-\s*/, ''));
      }
    }

    if (proj.name) {
      projects.push(proj);
    }
  }

  return projects;
}

/**
 * Parse the skills section content which may contain:
 * - Skills list (- **Category:** Items)
 * - Certifications subsection (## Certifications heading within)
 * - **Languages:** line
 * - **Interests:** line
 *
 * Since the generator combines skills, certifications, languages, and interests
 * into a single "skills" section slot, we need to split them here.
 */
function parseSkillsComposite(
  content: string,
  _warnings: string[]
): {
  skills: SkillItem[];
  certifications: SkillItem[];
  languages: string;
  interests: string;
} {
  const result = {
    skills: [] as SkillItem[],
    certifications: [] as SkillItem[],
    languages: '',
    interests: '',
  };

  // The content might contain inline ## headings for Certifications
  // Split by ## within the content
  const subSections = content.split(/^##\s+/m);

  for (let i = 0; i < subSections.length; i++) {
    const block = subSections[i].trim();
    if (!block) continue;

    // For the first block (i=0), it's the skills content (no heading prefix)
    // For subsequent blocks, the first line is the heading
    let sectionContent = block;
    let isCertsSection = false;

    if (i > 0) {
      const firstLineEnd = block.indexOf('\n');
      const heading = firstLineEnd !== -1 ? block.substring(0, firstLineEnd).trim() : block;
      sectionContent = firstLineEnd !== -1 ? block.substring(firstLineEnd + 1).trim() : '';
      const key = titleToKey.get(heading.toLowerCase());
      if (key === 'certs') {
        isCertsSection = true;
      }
    }

    // Extract **Languages:** and **Interests:** lines
    const langMatch = sectionContent.match(/\*\*(?:Idiomas|Languages):\*\*\s*(.+)/i);
    if (langMatch) {
      result.languages = langMatch[1].trim();
      sectionContent = sectionContent.replace(langMatch[0], '').trim();
    }

    const intMatch = sectionContent.match(/\*\*(?:Intereses|Interests|Interesses):\*\*\s*(.+)/i);
    if (intMatch) {
      result.interests = intMatch[1].trim();
      sectionContent = sectionContent.replace(intMatch[0], '').trim();
    }

    // Parse category list items
    const items = parseCategoryList(sectionContent);
    if (isCertsSection) {
      result.certifications = items;
    } else if (i === 0) {
      result.skills = items;
    } else {
      // Unknown subsection, treat as skills
      result.skills.push(...items);
    }
  }

  return result;
}

/**
 * Parse a custom section.
 * Expected format:
 *   ### Item Title
 *   *Subtitle*
 *
 *   Description text
 */
function parseCustomSection(title: string, content: string): CustomSection {
  const section: CustomSection = { title, items: [] };

  const itemBlocks = content.split(/^###\s+/m);

  for (const block of itemBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n');
    const itemTitle = lines[0].trim();

    let subtitle = '';
    const descriptionLines: string[] = [];
    let foundSubtitle = false;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!foundSubtitle) {
        const subMatch = line.match(/^\*([^*]+)\*$/);
        if (subMatch) {
          subtitle = subMatch[1].trim();
          foundSubtitle = true;
          continue;
        }
      }
      if (line || descriptionLines.length > 0) {
        descriptionLines.push(lines[i]); // Keep original indentation
      }
    }

    if (itemTitle) {
      section.items.push({
        title: itemTitle,
        subtitle,
        description: descriptionLines.join('\n').trim(),
      });
    }
  }

  return section;
}

// ────────────────────────────────────────────────────────────────────────────
// Main Parser
// ────────────────────────────────────────────────────────────────────────────

/**
 * Parse a markdown string (as generated by markdownGenerator.ts) back into
 * a structured CVData object.
 *
 * @param markdown - The raw markdown string
 * @param lang - Language hint (used to match section headings)
 * @returns ParseResult with success flag, data, and any warnings
 */
export function parseMarkdownToCV(markdown: string, lang: string = 'en'): ParseResult {
  resetIdCounter();
  const warnings: string[] = [];
  // Validate language (the titleToKey map already handles all languages)
  void (['es', 'en', 'pt'].includes(lang.toLowerCase()) ? lang.toLowerCase() : 'en');

  if (!markdown || !markdown.trim()) {
    return { success: false, data: null, warnings: ['Empty markdown content'] };
  }

  try {
    // Split into sections by ## headings
    const sections = splitSections(markdown);

    if (sections.length === 0) {
      return { success: false, data: null, warnings: ['No sections found in markdown'] };
    }

    // Parse header (first section, no ## heading)
    const headerSection = sections[0];
    const personal = parseHeader(headerSection.content, warnings);

    // Initialize CVData with defaults
    const cvData: CVData & {
      projects: Project[];
      customSections: CustomSection[];
      sectionOrder: string[];
    } = {
      ...initialCVData,
      personal,
      experience: [],
      skills: [],
      education: [],
      certifications: [],
      languages: '',
      interests: '',
      projects: [],
      customSections: [],
      sectionOrder: [],
    };

    // Track section order as we encounter them
    const sectionOrder: string[] = [];

    // Process each ## section
    for (let i = 1; i < sections.length; i++) {
      const { title, content } = sections[i];
      if (!content.trim() && !title) continue;

      const key = titleToKey.get(title.toLowerCase());

      switch (key) {
        case 'exp': {
          cvData.experience = parseExperience(content, warnings);
          sectionOrder.push('experience');
          break;
        }
        case 'skills': {
          // The "skills" section in the generator also includes certifications,
          // languages, and interests. However, those may appear as separate
          // ## subsections within the content. We handle the composite here.
          const compositeContent = `${content}`;

          // Check if subsequent sections are certifications (they were generated
          // inline under the skills slot in the generator)
          let fullContent = compositeContent;
          while (
            i + 1 < sections.length &&
            titleToKey.get(sections[i + 1].title.toLowerCase()) === 'certs'
          ) {
            fullContent += `\n## ${sections[i + 1].title}\n${sections[i + 1].content}`;
            i++;
          }

          const composite = parseSkillsComposite(fullContent, warnings);
          cvData.skills = composite.skills;
          cvData.certifications = composite.certifications;
          cvData.languages = composite.languages;
          cvData.interests = composite.interests;
          sectionOrder.push('skills');
          break;
        }
        case 'certs': {
          // Standalone certifications section (if not already consumed by skills)
          const certs = parseCategoryList(content);
          cvData.certifications.push(...certs);

          // Also check for languages/interests inline
          const langMatch = content.match(/\*\*(?:Idiomas|Languages):\*\*\s*(.+)/i);
          if (langMatch) cvData.languages = langMatch[1].trim();
          const intMatch = content.match(/\*\*(?:Intereses|Interests|Interesses):\*\*\s*(.+)/i);
          if (intMatch) cvData.interests = intMatch[1].trim();

          // If skills slot isn't in sectionOrder yet, add it
          if (!sectionOrder.includes('skills')) {
            sectionOrder.push('skills');
          }
          break;
        }
        case 'edu': {
          cvData.education = parseEducation(content, warnings);
          sectionOrder.push('education');
          break;
        }
        case 'projects': {
          cvData.projects = parseProjects(content, warnings);
          sectionOrder.push('projects');
          break;
        }
        default: {
          // Unknown section → treat as custom section
          const customSection = parseCustomSection(title, content);

          // If there are no ### sub-items, create one item with the content as description
          if (customSection.items.length === 0 && content.trim()) {
            customSection.items.push({
              title: title,
              subtitle: '',
              description: content.trim(),
            });
          }

          cvData.customSections.push(customSection);
          if (!sectionOrder.includes('custom')) {
            sectionOrder.push('custom');
          }
          break;
        }
      }
    }

    cvData.sectionOrder = sectionOrder;

    // Determine success: we need at least a name or some content in any section
    const hasContent =
      personal.name ||
      cvData.experience.length > 0 ||
      cvData.education.length > 0 ||
      cvData.skills.length > 0 ||
      cvData.projects.length > 0;

    return {
      success: hasContent ? true : false,
      data: cvData as unknown as CVData,
      warnings,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      data: null,
      warnings: [`Parser error: ${errorMsg}`],
    };
  }
}
