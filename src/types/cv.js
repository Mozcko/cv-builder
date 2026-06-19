export const initialCVData = {
  personal: {
    name: 'John Doe',
    role: 'Software Engineer',
    email: 'email@example.com',
    phone: '+1 234 567 890',
    city: 'New York, USA',
    summary:
      'Software Engineer with experience in **Cloud Computing**, **Data Analysis**, and **Full Stack Development**. Passionate about building scalable solutions and optimizing workflows.',
    socials: [
      { id: '1', network: 'LinkedIn', username: 'johndoe', url: 'https://linkedin.com/in/johndoe' },
      { id: '2', network: 'GitHub', username: 'johndoe', url: 'https://github.com/johndoe' },
      { id: '3', network: 'Portfolio', username: 'johndoe.dev', url: 'https://johndoe.dev' },
    ],
  },
  experience: [
    {
      id: '1',
      company: 'Tech Company Inc.',
      role: 'Senior Developer',
      location: 'New York, NY (Remote)',
      startDate: '2023-01',
      endDate: null,
      isCurrent: true,
      description: [
        'Led the migration of legacy systems to a microservices architecture, improving scalability by 40%.',
        'Mentored junior developers and conducted code reviews to ensure high-quality standards.',
      ],
    },
    {
      id: '2',
      company: 'Startup Solutions',
      role: 'Junior Software Engineer',
      location: 'San Francisco, CA (Hybrid)',
      startDate: '2020-06',
      endDate: '2022-12',
      isCurrent: false,
      description: [
        'Developed and maintained RESTful APIs using Node.js and Express.',
        'Collaborated with the product team to implement new features based on user feedback.',
      ],
    },
  ],
  // Datos iniciales estructurados
  skills: [
    {
      id: '1',
      category: 'Languages',
      items: 'JavaScript, TypeScript, Python, Java',
    },
    {
      id: '2',
      category: 'Frameworks',
      items: 'React, Next.js, Node.js, Django',
    },
    { id: '3', category: 'Cloud & DevOps', items: 'AWS, Docker, Kubernetes, CI/CD' },
    { id: '4', category: 'Databases', items: 'PostgreSQL, MongoDB, Redis' },
  ],
  education: [
    {
      id: '1',
      degree: 'Master of Computer Science',
      institution: 'State University',
      startDate: '2018-09',
      endDate: '2020-06',
      isCurrent: false,
    },
    {
      id: '2',
      degree: 'Bachelor of Science in Computer Engineering',
      institution: 'City College',
      startDate: '2014-09',
      endDate: '2018-06',
      isCurrent: false,
    },
  ],
  certifications: [
    {
      id: '1',
      category: 'Cloud',
      items: 'AWS Certified Solutions Architect',
    },
    {
      id: '2',
      category: 'Security',
      items: 'CompTIA Security+',
    },
  ],
  languages: 'English (Native), Spanish (Intermediate).',
  interests: 'Open Source, AI Research, Hiking, Photography.',
};
