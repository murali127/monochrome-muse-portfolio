export type AchievementCategory = 'HONOR' | 'CERTIFICATION' | 'COURSEWORK';

export interface AchievementItem {
  id: string;
  title: string;
  issuerOrOrganization: string;
  year: string;
  detail: string;
  category: AchievementCategory;
  badge: string;
}

export const achievementsData: AchievementItem[] = [
  {
    id: 'dti-ideathon-2024',
    title: 'Top 2 Finalist – DTI Ideathon',
    issuerOrOrganization: 'DTI Ideathon',
    year: '2024',
    detail: 'Recognized as Top 2 finalist for designing and presenting an innovative full-stack platform built with the MERN stack.',
    category: 'HONOR',
    badge: 'HACKATHON FINALIST',
  },
  {
    id: 'infosys-springboard-recognition',
    title: 'Infosys Springboard Project Recognition',
    issuerOrOrganization: 'Infosys Springboard',
    year: '2025',
    detail: 'Commended for formulating an innovative technical solution for automated cheque processing and document data extraction.',
    category: 'HONOR',
    badge: 'INDUSTRY COMMENDATION',
  },
  {
    id: 'cisco-ccna',
    title: 'Cisco Certified Network Associate (CCNA)',
    issuerOrOrganization: 'Cisco Networking Academy',
    year: '2024',
    detail: 'Certified in networking foundations, IP routing protocols, switching, security infrastructure, and enterprise connectivity.',
    category: 'CERTIFICATION',
    badge: 'INDUSTRY CERTIFICATION',
  },
  {
    id: 'postman-api-expert',
    title: 'Postman API Fundamentals Student Expert',
    issuerOrOrganization: 'Postman',
    year: '2025',
    detail: 'Certified in RESTful API requests, collection architecture, test automation scripting, and collaborative API workspaces.',
    category: 'CERTIFICATION',
    badge: 'INDUSTRY CERTIFICATION',
  },
  {
    id: 'nit-rourkela-deep-learning',
    title: 'Deep Learning Specialization',
    issuerOrOrganization: 'NIT Rourkela',
    year: '2024',
    detail: 'Completed technical specialization covering artificial neural networks, convolutional vision architectures, and deep model optimization.',
    category: 'COURSEWORK',
    badge: 'ACADEMIC SPECIALIZATION',
  },
  {
    id: 'nptel-blockchain',
    title: 'Blockchain Technology Coursework',
    issuerOrOrganization: 'NPTEL (IIT Kharagpur)',
    year: '2024',
    detail: 'Completed comprehensive technical coursework on distributed ledgers, consensus algorithms, and decentralized smart contract logic.',
    category: 'COURSEWORK',
    badge: 'NPTEL ACADEMIC COURSE',
  },
  {
    id: 'cisco-python-essentials',
    title: 'Python Essentials Coursework',
    issuerOrOrganization: 'Cisco Networking Academy',
    year: '2024',
    detail: 'Completed verified coursework in Python algorithms, data structures, modular architecture, and object-oriented paradigms.',
    category: 'COURSEWORK',
    badge: 'CISCO COURSEWORK',
  },
  {
    id: 'cisco-intro-cybersecurity',
    title: 'Introduction to Cybersecurity Coursework',
    issuerOrOrganization: 'Cisco Networking Academy',
    year: '2024',
    detail: 'Completed verified coursework in foundational security concepts, threat identification, network defense measures, and data privacy.',
    category: 'COURSEWORK',
    badge: 'CISCO COURSEWORK',
  },
  {
    id: 'coursera-cybersecurity',
    title: 'Foundations of Cybersecurity Specialization',
    issuerOrOrganization: 'Coursera / Google',
    year: '2024',
    detail: 'Completed course specialization covering core cybersecurity frameworks, security operations, threat landscapes, and defensive controls.',
    category: 'COURSEWORK',
    badge: 'COURSE SPECIALIZATION',
  },
];
