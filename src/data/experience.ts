export type ExperienceCategory =
  | 'GENAI & VOICE AI'
  | 'COMPUTER VISION RESEARCH'
  | 'TECHNICAL LEADERSHIP'
  | 'CYBERSECURITY LEADERSHIP'
  | 'APPLIED AI & OCR';

export interface ProductionHighlight {
  title: string;
  badge: string;
  description: string;
  technologies: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  category: ExperienceCategory;
  location: string;
  period: string;
  status: 'ACTIVE' | 'COMPLETED';
  summary: string;
  contributions: string[];
  productionHighlights?: ProductionHighlight[];
  technologies: string[];
}

export const experienceData: ExperienceItem[] = [
  // 01: Farm Vaidya AI Tech
  {
    id: 'farm-vaidya',
    role: 'GEN AI ENGINEER INTERN',
    company: 'FARM VAIDYA AI TECH PVT LTD',
    category: 'GENAI & VOICE AI',
    location: 'VISAKHAPATNAM / REMOTE',
    period: 'OCT 2025 – JUN 2026',
    status: 'COMPLETED',
    summary:
      'Engineered conversational agricultural AI applications, LightRAG knowledge graph retrieval systems, and real-time Voice AI streaming pipelines.',
    contributions: [
      'Developed conversational agricultural AI workflows utilizing Retrieval-Augmented Generation (RAG) and LightRAG for context-grounded agronomic advisory.',
      'Implemented knowledge graph-based information retrieval to extract and connect relational data across crop health, pest diagnosis, and soil management.',
      'Constructed real-time Voice AI pipelines facilitating low-latency multilingual conversational interactions supporting English and Telugu.',
      'Engineered FastAPI backend microservices integrating speech recognition, vector/graph retrieval, LLM orchestration, and audio response generation.',
      'Maintained production chatbot operations through continuous monitoring, bug resolution, load verification, and system stabilization.',
    ],
    productionHighlights: [
      {
        title: 'Real-Time Voice AI Agent Platform',
        badge: 'INTERNAL PRODUCTION SYSTEM',
        description:
          'End-to-end real-time voice agent architecture combining Pipecat and Agora AI for audio streaming, Sarvam STT for speech recognition, and low-latency audio response pipelines using Python, FastAPI, Docker, and AWS.',
        technologies: ['Pipecat', 'Agora AI', 'Sarvam STT', 'FastAPI', 'Docker', 'AWS', 'Python'],
      },
      {
        title: 'Sevak Operational Dashboard',
        badge: 'INTERNAL PRODUCTION SYSTEM',
        description:
          'Full-stack administrative dashboard providing real-time operational visibility into Pipecat conversation session logs, dialogue tracking, and multi-tier role-based access control.',
        technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'RBAC', 'Pipecat'],
      },
    ],
    technologies: [
      'Python',
      'FastAPI',
      'LightRAG',
      'Pipecat',
      'Agora AI',
      'Sarvam STT',
      'MongoDB',
      'Docker',
      'AWS',
    ],
  },

  // 02: CSIR-CRRI (Delhi)
  {
    id: 'csir-crri',
    role: 'RESEARCH INTERN',
    company: 'CSIR-CRRI',
    category: 'COMPUTER VISION RESEARCH',
    location: 'NEW DELHI, IN',
    period: 'APR 2025 – MAY 2025',
    status: 'COMPLETED',
    summary:
      'Conducted computer vision research developing the Road Safety Scoring System for automated hazard analysis on dashcam video footage.',
    contributions: [
      'Researched and built a computer vision pipeline for automated road safety analysis using vehicle dashcam video footage.',
      'Implemented vehicle detection and multi-object tracking by integrating YOLOX and ByteTrack algorithms.',
      'Applied OpenCV-based frame pre-processing, video sequencing, and Region-of-Interest (ROI) filtering algorithms.',
      'Constructed an interactive Streamlit visualization interface to review hazard detection scores and video analytics.',
      'Collaborated with senior scientists, IIT Delhi researchers, and industry mentors to refine problem formulation and system architecture.',
    ],
    technologies: [
      'Python',
      'YOLOX',
      'ByteTrack',
      'OpenCV',
      'Streamlit',
      'Computer Vision',
    ],
  },

  // 03: Open Forge, GVPCE
  {
    id: 'open-forge',
    role: 'TECHNICAL LEAD',
    company: 'OPEN FORGE, GVPCE',
    category: 'TECHNICAL LEADERSHIP',
    location: 'VISAKHAPATNAM, IN',
    period: 'OCT 2024 – OCT 2025',
    status: 'COMPLETED',
    summary:
      'Provided technical leadership in the college Open Forge club, supporting technical initiatives and fostering collaborative software development.',
    contributions: [
      'Led technical initiatives and guided student developers in adopting modern full-stack development practices.',
      'Supported collaborative software development by conducting structured code reviews and peer technical discussions.',
      'Coordinated technical club activities, project roadmaps, and knowledge sharing around full-stack web architectures.',
      'Assisted student project teams in setting up automated deployment workflows and testing with GitHub Actions.',
    ],
    technologies: [
      'Technical Leadership',
      'Full-Stack Architecture',
      'GitHub Actions',
      'Code Review',
      'Agile Workflows',
    ],
  },

  // 04: Google Developer Student Clubs (GDSC), GVPCE
  {
    id: 'gdsc-gvpce',
    role: 'CYBERSECURITY LEAD',
    company: 'GDSC, GVPCE',
    category: 'CYBERSECURITY LEADERSHIP',
    location: 'VISAKHAPATNAM, IN',
    period: 'NOV 2024 – JAN 2026',
    status: 'COMPLETED',
    summary:
      'Spearheaded cybersecurity technical initiatives, practical hands-on workshops, and community security awareness.',
    contributions: [
      'Spearheaded cybersecurity-related technical initiatives and delivered hands-on technical workshops for university students.',
      'Fostered technical collaboration and knowledge sharing around secure development practices, cryptography, and network defense.',
      'Supported learning initiatives including practical Capture The Flag (CTF) challenges promoting ethical security methodologies.',
      'Promoted awareness and learning around digital security, identity protection, and defensive system configurations.',
    ],
    technologies: [
      'Cybersecurity',
      'Network Security',
      'Cryptography',
      'Vulnerability Assessment',
      'Linux',
      'CTF Challenges',
    ],
  },

  // 05: Infosys Springboard
  {
    id: 'infosys-springboard',
    role: 'AI/ML INTERN',
    company: 'INFOSYS SPRINGBOARD',
    category: 'APPLIED AI & OCR',
    location: 'REMOTE',
    period: 'JAN 2025 – APR 2025',
    status: 'COMPLETED',
    summary:
      'Engineered an automated cheque data extraction pipeline utilizing OCR algorithms and Python data processing.',
    contributions: [
      'Engineered an automated cheque data extraction pipeline utilizing OCR algorithms and Python data processing.',
      'Constructed an interactive Streamlit application to review, validate, and verify extracted financial metadata.',
      'Formulated an architectural solution that improved end-to-end data processing accuracy across the project.',
    ],
    technologies: [
      'Python',
      'Tesseract OCR',
      'Streamlit',
      'MongoDB',
      'Data Pipelines',
    ],
  },
];
