export interface SkillCategory {
  id: string;
  title: string;
  code: string;
  description: string;
  skills: string[];
}

export const skillsData: SkillCategory[] = [
  {
    id: 'languages',
    title: 'PROGRAMMING LANGUAGES',
    code: 'SYS.01',
    description: 'Core languages for systems programming, data structures, backend engineering, and script automation.',
    skills: ['Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++'],
  },
  {
    id: 'genai-ml',
    title: 'GENERATIVE AI & MACHINE LEARNING',
    code: 'SYS.02',
    description: 'Knowledge graph retrieval, LLM orchestration, computer vision, and deep learning architectures.',
    skills: [
      'Generative AI',
      'Retrieval-Augmented Generation (RAG)',
      'LightRAG',
      'LLM Integration',
      'Computer Vision',
      'YOLOX',
      'ByteTrack',
      'TensorFlow',
      'OpenCV',
    ],
  },
  {
    id: 'backend',
    title: 'BACKEND & APIS',
    code: 'SYS.03',
    description: 'High-performance microservices, RESTful and asynchronous API architectures, and server engines.',
    skills: ['FastAPI', 'Node.js', 'Express.js', 'Django', 'NestJS'],
  },
  {
    id: 'frontend',
    title: 'FRONTEND DEVELOPMENT',
    code: 'SYS.04',
    description: 'Modern component-driven web interfaces, responsive design systems, and client-side application logic.',
    skills: ['React', 'Next.js', 'HTML', 'CSS', 'Tailwind CSS'],
  },
  {
    id: 'databases',
    title: 'DATABASES',
    code: 'SYS.05',
    description: 'Relational and non-relational database engines used across production data pipelines and application backends.',
    skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite'],
  },
  {
    id: 'voice-infra',
    title: 'VOICE AI & INFRASTRUCTURE',
    code: 'SYS.06',
    description: 'Real-time conversational audio pipelines, containerized deployments, cloud hosting, and developer tooling.',
    skills: ['Pipecat', 'Agora AI', 'Sarvam STT', 'Docker', 'AWS'],
  },
];
