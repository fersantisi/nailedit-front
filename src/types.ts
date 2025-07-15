export type User = {
  id: number;
  username: string;
  email?: string;
  role?: string;
  createdAt?: string;
  isActive?: boolean;
};

export type Project = {
  id: number;
  name: string;
  description?: string;
  category?: string;
  image?: string;
  dueDate?: string;
  userId: number; // owner
  createdAt?: string;
  updatedAt?: string;
  goals?: Goal[];
  participants?: Participant[];
  participationRequests?: ParticipationRequest[];
  owner?: User;
};

export type Goal = {
  id: number;
  name: string;
  projectId: number;
  description?: string;
  dueDate?: string;
  tasks?: Task[];
  completed?: boolean;
};

export type Task = {
  id: number;
  goalId: number;
  projectId: number;
  name: string;
  description?: string;
  label?: string;
  dueDate?: string;
  completed?: boolean;
};

export type Resource = {
  id: number;
  name: string;
  project: string;
  amount: number;
  stock: number;
  category: string;
};

export type Stock = {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  reserved: number;
  userid: number;
};

export type ParticipationRequest = {
  id: number;
  projectId: number;
  userId: number;
  createdAt?: string;
  user?: User;
  project?: Project;
};

export type Participant = {
  id: number;
  projectId: number;
  userId: number;
  joinedAt?: string;
  user?: User;
  project?: Project;
};

export type CommunitySearchResponse = {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type RequestStatus =
  | 'none'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'member';

export type ProjectPermissions = {
  projectId: number;
  userId: number;
  hasAccess: boolean;
  role: 'owner' | 'participant' | 'none';
};

export type UserRole = 'owner' | 'participant' | 'none';
