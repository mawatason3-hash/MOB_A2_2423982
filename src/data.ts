export type Project = {
  id: string;
  title: string;
  problem: string;
  contribution: string;
  tech: string[];
  status: 'Live' | 'In progress' | 'Academic';
  online?: { label: string; url: string }[];
};

export type Skill = { name: string; level: number; levelLabel: string };
export type SkillGroup = { name: string; skills: Skill[] };

const label = (n: number) => (n >= 80 ? 'Advanced' : n >= 60 ? 'Intermediate' : 'Growing');
const sk = (name: string, level: number): Skill => ({ name, level, levelLabel: label(level) });

export const EDUCATION = [
  { period: '2023 - 2027/28', title: 'BSc Software Engineering', place: 'INES-Ruhengeri, Musanze, Rwanda' },
  { period: 'Ongoing', title: 'Freelance full-stack developer', place: 'Remote platforms and own products' },
];

export type LeadershipEntry = {
  id: string;
  period: string;
  role: string;
  organisation: string;
  description: string;
  current: boolean;
};

export const LEADERSHIP: LeadershipEntry[] = [
  {
    id: 'l0',
    period: '2025 - 2026',
    role: 'Founder and Secretary General',
    organisation: 'Association of Liberians in Musanze (ALM)',
    description: 'Founded the community association and brought its elections online with a transparent voting system.',
    current: false,
  },
  {
    id: 'l1',
    period: '2025 - Present',
    role: 'Secretary General',
    organisation: 'UNSEA Audit Committee',
    description: 'Combines member findings into one professional audit report.',
    current: true,
  },
  {
    id: 'l2',
    period: '2024 - Present',
    role: 'Secretary General',
    organisation: 'Buu Yao Student in East Africa chapter',
    description: 'Handles chapter communication, minutes and records for students across East Africa.',
    current: true,
  },
  {
    id: 'l3',
    period: '2023 - 2025',
    role: 'Class Representative, July intake (Year 1)',
    organisation: 'INES-Ruhengeri',
    description: "Represented the class to lecturers and administration and passed on classmates' concerns and updates.",
    current: false,
  },
  {
    id: 'l4',
    period: '2021 - 2022',
    role: 'Vice President',
    organisation: 'Odell Memorial School',
    description: 'Supported the president in leading student activities and represented students at school events.',
    current: false,
  },
  {
    id: 'l5',
    period: '2018 - 2020',
    role: 'President',
    organisation: 'Dayspring International Academy',
    description: 'Led the student body, chaired meetings and represented the school community.',
    current: false,
  },
];

export type LeadershipSkill = { name: string; level: string; percent: number };
export const LEADERSHIP_SKILLS: LeadershipSkill[] = [
  { name: 'Record keeping and minutes', level: 'Advanced', percent: 90 },
  { name: 'Team coordination', level: 'Advanced', percent: 85 },
  { name: 'Accountability and reporting', level: 'Advanced', percent: 85 },
  { name: 'Event organising', level: 'Intermediate', percent: 75 },
  { name: 'Conflict resolution', level: 'Intermediate', percent: 70 },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    name: 'Frontend',
    skills: [
      sk('Next.js 14', 85),
      sk('React Native', 80),
      sk('Expo', 75),
      sk('TypeScript', 70),
    ],
  },
  {
    name: 'Backend',
    skills: [
      sk('FastAPI', 85),
      sk('Python', 80),
    ],
  },
  {
    name: 'Data',
    skills: [
      sk('PostgreSQL', 70),
    ],
  },
  {
    name: 'Deploy',
    skills: [
      sk('Railway', 80),
      sk('Vercel', 80),
    ],
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'alm',
    title: 'ALM Voting System',
    problem: 'Community elections needed to be transparent, fast and easy to verify.',
    contribution: 'Designed, built and deployed the full-stack election platform, now running in production.', // TODO verify wording
    tech: ['Next.js', 'FastAPI', 'PostgreSQL', 'Railway', 'Vercel'],
    status: 'Live',
  },
  {
    id: 'boast',
    title: 'BOASTLIB',
    problem: 'Resellers and small businesses need an affordable, easy panel to sell social media growth services.',
    contribution: 'Built the reseller panel, integrated a wholesale provider API, set up pricing and monetisation, and registered it as a Rwandan Individual Enterprise.', // TODO verify wording
    tech: ['Next.js', 'FastAPI', 'PostgreSQL', 'Vercel', 'Railway'],
    status: 'Live',
    online: [{ label: 'boastlib.vercel.app', url: 'https://boastlib.vercel.app' }],
  },
  {
    id: 'wata',
    title: 'WATA LIVE',
    problem: 'Sports fans lack one place for live streaming and smart match predictions.',
    contribution: 'Working on the backend services and the payment flow for streaming and AI predictions.', // TODO verify wording
    tech: ['FastAPI', 'Python', 'PostgreSQL'],
    status: 'In progress',
  },
  {
    id: 'voip',
    title: 'VoIP reseller platform',
    problem: 'Resellers need a simple platform to sell VoIP services to their customers.',
    contribution: 'Early build modelled on the BOASTLIB reseller architecture.', // TODO verify wording
    tech: ['Next.js', 'FastAPI', 'PostgreSQL'],
    status: 'In progress',
  },
  {
    id: 'fyp',
    title: 'Love Liberia',
    problem: 'Liberians need a modern, friendly place to meet and connect.',
    contribution: 'Designed and deployed a dating web app with Discover, Matches, Messages and Profile screens.', // TODO verify wording
    tech: ['Web app', 'Vercel'],
    status: 'In progress',
  },
  {
    id: 'agri',
    title: 'AgriSoko Pocket',
    problem: 'Members of the Kinigi cooperative need a simple mobile app for their agricultural market.',
    contribution: 'Team Ibirayi group project; I worked on the splash and home screens.', // TODO verify wording
    tech: ['React Native', 'Expo'],
    status: 'Academic',
  },
  {
    id: 'safe',
    title: 'Musanze Safe Market',
    problem: 'Market inspectors need a faster, simpler way to record field inspections.',
    contribution: 'Group project at INES: contributed to the field inspection mobile app.', // TODO verify wording
    tech: ['React Native', 'Expo'],
    status: 'Academic',
  },
];
