export type ProjectCategory =
  | 'genai'
  | 'voice-ai'
  | 'full-stack'
  | 'computer-vision'
  | 'other';

export type RepositoryStatus =
  | 'public'
  | 'internal-production'
  | 'local-only'
  | 'unmapped-pending-confirmation';

export type DeploymentStatus =
  | 'live'
  | 'production'
  | 'local'
  | 'prototype'
  | 'none';

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: ProjectCategory;
  categoryLabel: string;
  technologies: string[];
  
  // Repository configuration
  repositoryStatus: RepositoryStatus;
  repositoryUrl?: string;
  
  // Deployment configuration
  deploymentStatus: DeploymentStatus;
  liveDemoUrl?: string;
  
  // Mapping verification
  isVerified: boolean;
  verificationNotes?: string;
  
  // Presentation flags
  featured: boolean;

  // Rich Detail Specs for Modal / Drawer
  problemStatement?: string;
  whatIBuilt?: string[];
  architectureWorkflow?: string[];
}

export const projectFilterCategories = [
  { id: 'all', label: 'ALL SYSTEMS' },
  { id: 'genai', label: 'GEN AI & RAG' },
  { id: 'voice-ai', label: 'VOICE AI' },
  { id: 'full-stack', label: 'FULL-STACK' },
  { id: 'computer-vision', label: 'COMPUTER VISION' },
  { id: 'other', label: 'ARCHIVE / OTHER' },
] as const;

export const projectsData: ProjectItem[] = [
  // ==========================================
  // FEATURED PROJECT 01: Farm Vaidya - Conversational Agricultural AI
  // ==========================================
  {
    id: 'farm-vaidya-conversational-ai',
    title: 'Farm Vaidya – Conversational Agricultural AI',
    tagline: 'Knowledge-Graph Driven Agricultural Advisory System',
    description:
      'A production conversational AI backend providing farmers with agricultural guidance. Built on FastAPI and LightRAG knowledge graph architecture for context-grounded agronomic reasoning.',
    category: 'genai',
    categoryLabel: 'GEN AI & RAG',
    technologies: ['FastAPI', 'LightRAG', 'Python', 'Knowledge Graphs', 'MongoDB'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/farmvaidya-ai/Farmvaidya_chatbot',
    deploymentStatus: 'production',
    isVerified: true,
    verificationNotes: 'Backend repository under farmvaidya-ai organization with FastAPI service and LightRAG server integration.',
    featured: true,
    problemStatement:
      'Agricultural practitioners face fragmented, generic advice when troubleshooting crop diseases and soil conditions. Conventional search engines fail to understand localized soil types, regional pest outbreaks, and multi-variable agronomic dependencies.',
    whatIBuilt: [
      'Engineered FastAPI backend services integrating speech recognition, retrieval, LLM orchestration, and audio response pipelines.',
      'Configured LightRAG knowledge-graph architecture on dedicated ports to connect relational agricultural concepts.',
      'Implemented bilingual contextual question-answering workflows facilitating localized advisory in English and Telugu.',
      'Maintained system reliability through ongoing production monitoring, bug fixing, and release stabilization.',
    ],
    architectureWorkflow: [
      'Inbound query arrives at FastAPI gateway from client application or voice interface.',
      'LightRAG extracts agricultural entities and executes dual-level vector and knowledge-graph traversal.',
      'Retrieved crop, pest, and climate contexts are synthesized with prompt guardrails into grounded LLM responses.',
      'Responses and session metadata are archived in MongoDB for longitudinal conversation memory.',
    ],
  },

  // ==========================================
  // FEATURED PROJECT 02: Real-Time Voice AI Agent Platform
  // ==========================================
  {
    id: 'voice-ai-agent-platform',
    title: 'Real-Time Voice AI Agent Platform',
    tagline: 'Bidirectional Real-Time Audio Streaming Pipeline',
    description:
      'A production-grade conversational voice assistant platform integrating low-latency audio transmission with real-time Speech-to-Text and automated intent processing.',
    category: 'voice-ai',
    categoryLabel: 'VOICE AI',
    technologies: ['Pipecat', 'Agora AI', 'Sarvam STT', 'WebSockets', 'Python', 'Docker', 'AWS'],
    repositoryStatus: 'internal-production',
    deploymentStatus: 'production',
    isVerified: true,
    verificationNotes: 'Internal production platform. No public repository exists.',
    featured: true,
    problemStatement:
      'Traditional turn-based audio assistants introduce multi-second latencies that break natural human conversational rhythms, particularly for rural and non-English speaking users who rely on seamless verbal interaction.',
    whatIBuilt: [
      'Engineered an end-to-end voice AI pipeline using the Pipecat framework and Agora AI RTC audio streams.',
      'Integrated Sarvam Speech-to-Text (STT) for low-latency, accurate transcription of Indian accents and regional languages.',
      'Constructed streaming audio response synthesis pipelines enabling natural interruptibility and fluid voice dialogue.',
      'Containerized the pipeline with Docker and deployed onto AWS cloud infrastructure for production resilience.',
    ],
    architectureWorkflow: [
      'User audio stream is captured and ingested through Agora AI WebRTC low-latency audio channels.',
      'Pipecat pipeline orchestrates audio buffer streaming into Sarvam STT for live transcription.',
      'Transcripts trigger contextual LLM generation hooked into domain knowledge retrieval.',
      'Synthesized text-to-speech audio frames are immediately streamed back over WebSockets with interruption handling.',
    ],
  },

  // ==========================================
  // FEATURED PROJECT 03: Bhuvi Chatbot
  // ==========================================
  {
    id: 'bhuvi-chatbot',
    title: 'Bhuvi Chatbot',
    tagline: 'Multilingual Crop & Pest Guidance Assistant',
    description:
      'Interactive conversational assistant created for Farm Vaidya to assist growers with crop health, pest diagnosis, and farming practices with persistent MongoDB chat history.',
    category: 'genai',
    categoryLabel: 'GEN AI & RAG',
    technologies: ['React', 'TypeScript', 'LightRAG', 'MongoDB', 'Node.js'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/farmvaidya-ai/Bhuvi_chatbot',
    deploymentStatus: 'production',
    isVerified: true,
    verificationNotes: 'Public repository under farmvaidya-ai organization.',
    featured: true,
    problemStatement:
      'Farmers require an accessible, clear digital interface to input complex multi-turn farming inquiries, review previous diagnostics, and receive structured agronomic recommendations on mobile screens.',
    whatIBuilt: [
      'Developed a responsive conversational frontend with React and TypeScript designed for mobile and web accessibility.',
      'Integrated persistent conversation session management using MongoDB to maintain multi-turn memory across sessions.',
      'Connected client UI to the LightRAG knowledge graph backend API for real-time agricultural problem resolution.',
    ],
    architectureWorkflow: [
      'Client chat interface authenticates and loads user session history from MongoDB.',
      'User questions are dispatched via REST/WebSocket to the LightRAG inference server.',
      'Structured responses render formatted agronomic steps, treatment precautions, and follow-up guidance.',
    ],
  },

  // ==========================================
  // FEATURED PROJECT 04: Sevak Operational Dashboard
  // ==========================================
  {
    id: 'sevak-dashboard',
    title: 'Sevak Operational Dashboard',
    tagline: 'Conversation Analytics & Multi-Role Management Interface',
    description:
      'Full-stack administrative dashboard built to fetch and visualize Pipecat conversation session logs with four distinct role-based access tiers (master, superadmin, admin, user).',
    category: 'full-stack',
    categoryLabel: 'FULL-STACK',
    technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Pipecat Logs', 'RBAC'],
    repositoryStatus: 'internal-production',
    deploymentStatus: 'production',
    isVerified: true,
    verificationNotes: 'Internal production dashboard. No public repository exists.',
    featured: true,
    problemStatement:
      'Operating production conversational AI agents requires real-time observability into session health, error logs, latency spikes, and user interactions with strict role-based data isolation across organizations.',
    whatIBuilt: [
      'Architected a full-stack dashboard to fetch, parse, and visualize Pipecat session logs and dialogue streams.',
      'Implemented four-tier Role-Based Access Control (Master, Superadmin, Admin, User) ensuring strict privilege boundaries.',
      'Engineered operational monitoring interfaces displaying agent activity, dialogue transcripts, and session diagnostics.',
    ],
    architectureWorkflow: [
      'Pipecat audio session telemetry and structured logs are ingested into an Express.js backend.',
      'Log records are indexed in MongoDB with customer, session, and role tenant identifiers.',
      'React frontend authenticates via JWT and presents real-time session filters, conversation playback, and metrics.',
    ],
  },

  // ==========================================
  // FEATURED PROJECT 05: Road Safety Scoring System
  // ==========================================
  {
    id: 'road-safety-scoring-system',
    title: 'Road Safety Scoring System',
    tagline: 'Dashcam Computer Vision & Hazard Analytics',
    description:
      'Real-time road safety evaluation system developed during a research internship at CSIR-CRRI (Delhi) combining object detection, visual tracking, and ROI-based roadway anomaly analysis.',
    category: 'computer-vision',
    categoryLabel: 'COMPUTER VISION',
    technologies: ['Python', 'YOLOX', 'ByteTrack', 'OpenCV', 'Streamlit'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/CSRI_CRRI_ROAD_SAFETY_SCORE',
    deploymentStatus: 'prototype',
    isVerified: true,
    verificationNotes: 'Public research repository developed in collaboration with CSIR-CRRI scientists.',
    featured: true,
    problemStatement:
      'Assessing roadway danger, traffic conflict density, and driver risk from raw dashcam video feeds is traditionally subjective and manual, preventing scalable municipal road safety audits.',
    whatIBuilt: [
      'Researched and built an automated video analytics pipeline using YOLOX object detection and ByteTrack multi-object tracking.',
      'Implemented OpenCV Region-of-Interest (ROI) filtering algorithms to isolate active driving corridors and ignore irrelevant periphery.',
      'Constructed an interactive Streamlit application enabling researchers to upload dashcam recordings and visualize frame-by-frame hazard scores.',
      'Collaborated with senior scientists, IIT Delhi researchers, and industry mentors on problem definition and system evaluation.',
    ],
    architectureWorkflow: [
      'Dashcam video footage is uploaded and broken into sequenced frame buffers via OpenCV.',
      'YOLOX detects vehicles, obstacles, and vulnerable road users.',
      'ByteTrack correlates persistent bounding box trajectories across successive frames.',
      'Scoring engine computes spatial lane proximity metrics and outputs safety graphs via Streamlit.',
    ],
  },

  // ==========================================
  // FEATURED PROJECT 06: CheckMate – Automated Cheque Processing
  // ==========================================
  {
    id: 'checkmate',
    title: 'CheckMate – Automated Cheque Processing',
    tagline: 'Cheque Metadata Extraction & Validation Pipeline',
    description:
      'An AI-powered document processing tool using OCR and Gemini API prompting to extract and validate payee, account, bank, and financial details from scanned cheques and PDFs.',
    category: 'genai',
    categoryLabel: 'GEN AI & RAG',
    technologies: ['Python', 'Streamlit', 'Gemini API', 'Tesseract OCR', 'MongoDB'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/Check_Mate',
    deploymentStatus: 'live',
    liveDemoUrl: 'https://checkmate040.streamlit.app/Home',
    isVerified: true,
    verificationNotes: 'Verified repository and live Streamlit deployment.',
    featured: true,
    problemStatement:
      'Manual processing of financial cheques is slow and prone to human errors during handwriting recognition, account verification, and numerical mismatch reconciliation.',
    whatIBuilt: [
      'Engineered an automated document intelligence pipeline combining Tesseract OCR with Gemini API multimodal reasoning.',
      'Extracted and validated key banking fields including Payee Name, Account Number, Cheque Number, Bank Name, and Currency Amounts.',
      'Constructed an interactive Streamlit dashboard allowing users to upload cheques, review extracted tables, and export validated data to MongoDB.',
    ],
    architectureWorkflow: [
      'Cheque image or PDF is uploaded to the Streamlit processing gateway.',
      'Image pre-processing optimizes contrast and feeds frames to Tesseract OCR for initial text recognition.',
      'Structured Gemini API prompt analyzes complex handwritten fields and resolves OCR ambiguities.',
      'Validated records are displayed on a review dashboard and archived in MongoDB collections.',
    ],
  },

  // ==========================================
  // FEATURED PROJECT 07: Bike Rental Platform
  // ==========================================
  {
    id: 'bike-rental-platform',
    title: 'Bike Rental Platform',
    tagline: 'Full-Stack Fleet Reservation & Rental Management System',
    description:
      'An end-to-end multi-role bike rental platform managing customer discovery, booking, verification, vehicle handover, and settlement workflows with comprehensive API and E2E test coverage.',
    category: 'full-stack',
    categoryLabel: 'FULL-STACK',
    technologies: ['Next.js', 'NestJS', 'Prisma', 'PostgreSQL', 'TypeScript'],
    repositoryStatus: 'internal-production',
    deploymentStatus: 'local',
    isVerified: true,
    verificationNotes: 'Private repository rentals_bike. Features NestJS backend, Next.js frontend, Prisma ORM, and PostgreSQL database.',
    featured: true,
    problemStatement:
      'Bike rental operators often struggle with disconnected tools for inventory management, customer identity KYC verification, vehicle condition inspections, and security deposit settlements.',
    whatIBuilt: [
      'Built a modular, scalable backend service using NestJS, TypeScript, and Prisma ORM with PostgreSQL.',
      'Developed a modern user reservation interface and administrative fleet console using Next.js App Router.',
      'Implemented full rental lifecycle tracking: booking reservation, KYC upload, handover inspection, return condition check, and invoice settlement.',
      'Wrote comprehensive end-to-end test suites using Playwright to ensure critical booking flows remain resilient.',
    ],
    architectureWorkflow: [
      'Customer browses available fleet vehicles and books reservation via Next.js interface.',
      'NestJS API handles validation, reservation state machines, and authenticated KYC document uploads.',
      'Prisma ORM executes relational transactions in PostgreSQL for atomic booking updates.',
      'Pickup and return staff complete inspection checklists updating vehicle status in real time.',
    ],
  },

  // ==========================================
  // FEATURED PROJECT 08: College Counseling Forms
  // ==========================================
  {
    id: 'college-counseling-forms',
    title: 'College Counseling Forms',
    tagline: '100% Paperless Academic Evaluation System',
    description:
      'A complete digitizer for college student evaluation and faculty grade counseling with 3-level role-based access control (Super Admin, Admin, User) and automated database record retrieval.',
    category: 'full-stack',
    categoryLabel: 'FULL-STACK',
    technologies: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'RBAC'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/Counslling_forms',
    deploymentStatus: 'live',
    liveDemoUrl: 'https://counslling-forms.vercel.app',
    isVerified: true,
    verificationNotes: 'Fully verified public repository and deployed Vercel application.',
    featured: true,
    problemStatement:
      'University counseling reviews relied on thousands of paper forms passed between students and faculty advisors, creating delays, lost review documents, and a lack of auditability during academic review windows.',
    whatIBuilt: [
      'Engineered a 1:1 digital replica of the physical college counseling forms, completely eliminating physical paper usage.',
      'Implemented scalable three-tier role-based access control (Super Admin, Admin, User) for faculty-scheduled review windows.',
      'Automated student profile and grade management by fetching existing records from the database without requiring redundant student re-entry.',
    ],
    architectureWorkflow: [
      'React frontend renders responsive multi-section counseling forms mirroring university evaluation formats.',
      'Express.js backend verifies faculty role permissions and enforces access scheduling locks.',
      'MongoDB stores historical academic counseling logs, faculty remarks, and student review signatures.',
    ],
  },

  // ==========================================
  // SECONDARY / ARCHIVE PROJECTS
  // ==========================================

  // 09. Ask Me AI Chatbot
  {
    id: 'ask-me-ai-chatbot',
    title: 'Ask Me AI Chatbot (Ask To PDF)',
    tagline: 'Context-Aware Document Retrieval & QA Assistant',
    description:
      'A vector-search document assistant built with Streamlit and Gemini API, enabling users to upload multi-page PDF documents and execute grounded question-answering over local vector stores.',
    category: 'genai',
    categoryLabel: 'GEN AI & RAG',
    technologies: ['Python', 'Streamlit', 'FAISS', 'Gemini API', 'LangChain'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/The_Vikings_Ai',
    deploymentStatus: 'prototype',
    isVerified: true,
    verificationNotes: 'Verified repository murali127/The_Vikings_Ai (master branch contains Ask To PDF app with FAISS store).',
    featured: false,
    problemStatement:
      'Extracting answers from multi-page dense documentation requires reading through hundreds of paragraphs manually.',
    whatIBuilt: [
      'Built a PDF extraction and embedding pipeline using LangChain and FAISS vector index.',
      'Connected Gemini API to formulate natural answers grounded strictly in retrieved document context.',
    ],
  },

  // 10. Deepfake Detection System
  {
    id: 'deepfake-detection-system',
    title: 'Deepfake Detection System',
    tagline: 'Spatiotemporal AI Video Manipulation Classifier',
    description:
      'An AI security platform built for the Smart India Hackathon that analyzes video sequences, extracts face regions, and applies ResNeXt and LSTM models to detect manipulated media.',
    category: 'computer-vision',
    categoryLabel: 'COMPUTER VISION',
    technologies: ['ResNeXt', 'LSTM', 'Python', 'OpenCV', 'HTML5/CSS3'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/sih_hackathon',
    deploymentStatus: 'live',
    liveDemoUrl: 'https://murali127.github.io/sih_hackathon/',
    isVerified: true,
    verificationNotes: 'Verified repository murali127/sih_hackathon with live GitHub Pages interface.',
    featured: false,
    problemStatement:
      'Synthetic deepfake video manipulation threatens digital identity, security, and media veracity, demanding automated temporal frame analysis.',
    whatIBuilt: [
      'Designed a video decomposition and facial extraction pipeline with OpenCV.',
      'Trained ResNeXt CNN feature extractor combined with an LSTM sequence model for temporal artifact classification.',
    ],
  },

  // 11. Docxy – Personal Document Manager
  {
    id: 'docxy-personal-document-manager',
    title: 'Docxy – Personal Document Manager',
    tagline: 'Native Android Document Vault with Local Sandboxing',
    description:
      'An Android native mobile application designed for organized on-device document management, utilizing Android FileProvider architecture for secure local storage and isolation.',
    category: 'other',
    categoryLabel: 'MOBILE & UTILITIES',
    technologies: ['Kotlin', 'Android SDK', 'Jetpack Compose', 'FileProvider'],
    repositoryStatus: 'local-only',
    deploymentStatus: 'local',
    isVerified: true,
    verificationNotes: 'Local Android Studio project in AndroidStudioProjects/docxy. No public repository currently.',
    featured: false,
    problemStatement:
      'Managing sensitive personal documents on mobile requires sandboxed, privacy-first offline storage without forced cloud syncing.',
    whatIBuilt: [
      'Developed native Android application with Kotlin and Jetpack Compose.',
      'Implemented secure local file handling utilizing Android FileProvider and scoped storage.',
    ],
  },

  // 12. Event RSVP Platform
  {
    id: 'event-rsvp',
    title: 'Event RSVP Platform',
    tagline: 'Dual-Stack Event Registration & Token Auth Engine',
    description:
      'An event registration management system featuring token authentication, automated validation, and API testing coverage, built with both MERN stack and Java Servlets backends.',
    category: 'full-stack',
    categoryLabel: 'FULL-STACK',
    technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Java Servlets', 'JWT'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/event_rsvp',
    deploymentStatus: 'prototype',
    isVerified: true,
    verificationNotes: 'Verified repository murali127/event_rsvp.',
    featured: false,
    problemStatement:
      'Event organizers need dependable attendee reservation tracking with authenticated check-in tokens and comprehensive API test coverage.',
    whatIBuilt: [
      'Engineered event RSVP platform with JWT authentication and database indexing.',
      'Implemented dual architecture versions in Node.js and Java Servlets with Postman collection test suites.',
    ],
  },

  // 13. THE_MENTOR_CONNECT (Independent Project)
  {
    id: 'the-mentor-connect',
    title: 'THE_MENTOR_CONNECT',
    tagline: 'Mentorship Collaboration & Networking Network',
    description:
      'A platform connecting students with experienced industry mentors for career guidance, mock interviews, and technical development.',
    category: 'full-stack',
    categoryLabel: 'FULL-STACK',
    technologies: ['React.js', 'Node.js', 'MongoDB'],
    repositoryStatus: 'unmapped-pending-confirmation',
    deploymentStatus: 'none',
    isVerified: false,
    verificationNotes: 'Independent mentorship platform. Repository unmapped pending user link.',
    featured: false,
  },

  // 14. Lab Network Communication Website (Academic Project)
  {
    id: 'lab-network-communication-website',
    title: 'Lab Network Communication Website',
    tagline: 'Academic Network Communication Platform',
    description:
      'An academic web platform created to facilitate structured client-server communication and laboratory resource interaction.',
    category: 'other',
    categoryLabel: 'ACADEMIC / SYSTEMS',
    technologies: ['HTML5', 'CSS3', 'JavaScript'],
    repositoryStatus: 'unmapped-pending-confirmation',
    deploymentStatus: 'none',
    isVerified: true,
    verificationNotes: 'Academic networking project. Kept without repository link per user instruction.',
    featured: false,
  },

  // 15. SwapReads
  {
    id: 'swapreads',
    title: 'SwapReads Platform',
    tagline: 'Community Book Swapping & Reading Hub',
    description:
      'A peer-to-peer web application connecting readers to discover, exchange, and review books within local community circles, accepted into GirlScript Summer of Code Extended.',
    category: 'other',
    categoryLabel: 'COMMUNITY WEB',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Netlify'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/SwapReads',
    deploymentStatus: 'live',
    liveDemoUrl: 'https://swapreadsconnect.netlify.app/',
    isVerified: true,
    verificationNotes: 'Verified public repository and live Netlify application.',
    featured: false,
  },

  // 16. Django Blog
  {
    id: 'django-blog',
    title: 'Django Blog Platform',
    tagline: 'Dynamic Content Management & Publishing Engine',
    description:
      'A responsive full-stack blog engine created with Python and Django, featuring user authentication, post creation, comments, and relational database management.',
    category: 'full-stack',
    categoryLabel: 'FULL-STACK',
    technologies: ['Python', 'Django', 'SQLite', 'Bootstrap'],
    repositoryStatus: 'unmapped-pending-confirmation',
    deploymentStatus: 'none',
    isVerified: true,
    verificationNotes: 'Full-stack Django blog application. Listed without repository link per user instruction.',
    featured: false,
  },

  // 17. Travel Website
  {
    id: 'travel-website',
    title: 'Travel Tour Website',
    tagline: 'Modern Tourism Discovery & Exploration Platform',
    description:
      'A modern, responsive landing and package exploration platform built with standard web technologies, officially accepted into GSSoC Extended and Hacktoberfest.',
    category: 'other',
    categoryLabel: 'FRONTEND WEB',
    technologies: ['HTML5', 'CSS3', 'Responsive Design'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/Travel_Website',
    deploymentStatus: 'live',
    liveDemoUrl: 'https://apu52.github.io/Travel_Website/',
    isVerified: true,
    verificationNotes: 'Verified repository murali127/Travel_Website and live GitHub Pages demo.',
    featured: false,
  },

  // 18. APEX_QR-VAULT
  {
    id: 'apex-qr-vault',
    title: 'APEX QR Vault',
    tagline: 'High-Density Data Encoding & File Storage Gateway',
    description:
      'An interactive web utility designed to explore file storage optimization by encoding and decoding digital files via QR structures with multiple download quality options.',
    category: 'other',
    categoryLabel: 'UTILITIES',
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'Data Encoding Engine'],
    repositoryStatus: 'public',
    repositoryUrl: 'https://github.com/murali127/apx',
    deploymentStatus: 'live',
    liveDemoUrl: 'https://murali127.github.io/apx/',
    isVerified: true,
    verificationNotes: 'Verified repository murali127/apx and live GitHub Pages demo.',
    featured: false,
  },
];
