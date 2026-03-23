// Mock data for BICS

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  salary?: string;
  description: string;
  requirements: string[];
  skills: string[];
  matchScore?: number;
  postedDate: string;
  deadline: string;
  status: 'active' | 'closed' | 'draft';
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
  appliedDate: string;
  matchScore: number;
  autoApplied: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  fieldOfStudy: string;
  university: string;
  skills: string[];
  location: string;
  availability: string;
  matchScore?: number;
  placementStatus: 'seeking' | 'interviewing' | 'placed';
}

export interface Employer {
  id: string;
  companyName: string;
  email: string;
  logo?: string;
  industry: string;
  location: string;
  size: string;
  verified: boolean;
  jobsPosted: number;
  hiredCount: number;
}

export interface Notification {
  id: string;
  type: 'match' | 'status' | 'application' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Software Engineering Intern',
    company: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    type: 'internship',
    salary: '$25-35/hr',
    description: 'Join our engineering team to build scalable web applications.',
    requirements: ['Currently pursuing CS degree', 'Knowledge of React/Node.js', 'Strong problem-solving skills'],
    skills: ['React', 'Node.js', 'TypeScript', 'Git'],
    matchScore: 92,
    postedDate: '2024-01-15',
    deadline: '2024-02-28',
    status: 'active',
  },
  {
    id: '2',
    title: 'Data Analyst Internship',
    company: 'Analytics Pro',
    location: 'New York, NY',
    type: 'internship',
    salary: '$22-30/hr',
    description: 'Analyze data to drive business decisions and create insightful reports.',
    requirements: ['Statistics or Math background', 'Python proficiency', 'SQL experience'],
    skills: ['Python', 'SQL', 'Tableau', 'Excel'],
    matchScore: 78,
    postedDate: '2024-01-18',
    deadline: '2024-03-01',
    status: 'active',
  },
  {
    id: '3',
    title: 'UX Design Intern',
    company: 'Creative Studios',
    location: 'Austin, TX',
    type: 'internship',
    salary: '$20-28/hr',
    description: 'Design user-centered experiences for mobile and web applications.',
    requirements: ['Portfolio required', 'Figma proficiency', 'Understanding of design principles'],
    skills: ['Figma', 'UI/UX', 'Prototyping', 'User Research'],
    matchScore: 65,
    postedDate: '2024-01-20',
    deadline: '2024-02-25',
    status: 'active',
  },
  {
    id: '4',
    title: 'Marketing Coordinator',
    company: 'Growth Dynamics',
    location: 'Remote',
    type: 'full-time',
    salary: '$45,000-55,000/yr',
    description: 'Coordinate marketing campaigns and social media presence.',
    requirements: ['Marketing degree', 'Social media experience', 'Content creation skills'],
    skills: ['Social Media', 'Content Marketing', 'Analytics', 'Copywriting'],
    matchScore: 45,
    postedDate: '2024-01-22',
    deadline: '2024-03-15',
    status: 'active',
  },
];

export const mockApplications: Application[] = [
  {
    id: '1',
    jobId: '1',
    jobTitle: 'Software Engineering Intern',
    company: 'TechCorp Solutions',
    status: 'submitted',
    appliedDate: '2024-01-16',
    matchScore: 92,
    autoApplied: true,
  },
  {
    id: '2',
    jobId: '2',
    jobTitle: 'Data Analyst Internship',
    company: 'Analytics Pro',
    status: 'pending',
    appliedDate: '2024-01-19',
    matchScore: 78,
    autoApplied: true,
  },
  {
    id: '3',
    jobId: '3',
    jobTitle: 'UX Design Intern',
    company: 'Creative Studios',
    status: 'accepted',
    appliedDate: '2024-01-21',
    matchScore: 65,
    autoApplied: false,
  },
];

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@university.edu',
    fieldOfStudy: 'Computer Science',
    university: 'State University',
    skills: ['React', 'Python', 'Machine Learning'],
    location: 'San Francisco, CA',
    availability: 'Summer 2024',
    matchScore: 92,
    placementStatus: 'interviewing',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.c@university.edu',
    fieldOfStudy: 'Data Science',
    university: 'State University',
    skills: ['Python', 'SQL', 'Tableau'],
    location: 'New York, NY',
    availability: 'Spring 2024',
    matchScore: 85,
    placementStatus: 'placed',
  },
  {
    id: '3',
    name: 'Mike Williams',
    email: 'mike.w@university.edu',
    fieldOfStudy: 'Business Analytics',
    university: 'State University',
    skills: ['Excel', 'SQL', 'Power BI'],
    location: 'Austin, TX',
    availability: 'Fall 2024',
    matchScore: 78,
    placementStatus: 'seeking',
  },
];

export const mockEmployers: Employer[] = [
  {
    id: '1',
    companyName: 'TechCorp Solutions',
    email: 'hr@techcorp.com',
    industry: 'Technology',
    location: 'San Francisco, CA',
    size: '500-1000',
    verified: true,
    jobsPosted: 12,
    hiredCount: 8,
  },
  {
    id: '2',
    companyName: 'Analytics Pro',
    email: 'careers@analyticspro.com',
    industry: 'Data Analytics',
    location: 'New York, NY',
    size: '100-500',
    verified: true,
    jobsPosted: 5,
    hiredCount: 3,
  },
  {
    id: '3',
    companyName: 'StartupHub',
    email: 'team@startuphub.io',
    industry: 'Technology',
    location: 'Austin, TX',
    size: '10-50',
    verified: false,
    jobsPosted: 2,
    hiredCount: 0,
  },
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match Found!',
    message: 'You have a 92% match with Software Engineering Intern at TechCorp',
    timestamp: '2024-01-22T10:30:00',
    read: false,
  },
  {
    id: '2',
    type: 'status',
    title: 'Application Update',
    message: 'Your application to Creative Studios has been accepted!',
    timestamp: '2024-01-21T15:45:00',
    read: false,
  },
  {
    id: '3',
    type: 'application',
    title: 'Auto-Application Submitted',
    message: 'We auto-applied you to Data Analyst Internship at Analytics Pro',
    timestamp: '2024-01-19T09:00:00',
    read: true,
  },
];

export const mockAnalytics = {
  totalStudents: 1250,
  placedStudents: 420,
  activeEmployers: 85,
  totalJobs: 324,
  placementRate: 33.6,
  industries: [
    { name: 'Technology', count: 145, percentage: 45 },
    { name: 'Finance', count: 65, percentage: 20 },
    { name: 'Healthcare', count: 48, percentage: 15 },
    { name: 'Marketing', count: 32, percentage: 10 },
    { name: 'Other', count: 34, percentage: 10 },
  ],
  topSkills: [
    { skill: 'Python', demand: 85 },
    { skill: 'JavaScript', demand: 78 },
    { skill: 'SQL', demand: 72 },
    { skill: 'React', demand: 68 },
    { skill: 'Data Analysis', demand: 65 },
  ],
  monthlyPlacements: [
    { month: 'Sep', count: 45 },
    { month: 'Oct', count: 62 },
    { month: 'Nov', count: 78 },
    { month: 'Dec', count: 55 },
    { month: 'Jan', count: 89 },
  ],
};
