export type User = {
  id: number;
  username: string;
  email?: string;
  role?: string;
  createdAt?: string;
  isActive?: boolean;
  notificationSettings?: NotificationSettings;
};

export type NotificationSettings = {
  emailNotificationsEnabled: boolean;
  dueDateThreshold: number; // Days before due date to send notification
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
  privacy: boolean; // Required field for project visibility
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
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  // Legacy fields for backward compatibility
  createdAt?: string;
  user?: User;
  project?: Project & {
    user?: User; // Project owner information
  };
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
  role: 'owner' | 'participant' | 'viewer' | 'none';
};

export type UserRole = 'owner' | 'participant' | 'none';

export type ShoppingListItem = {
  id: number;
  stockId: number;
  userId: number;
  quantity: number;
  status: 'pending' | 'bought';
  createdAt: string;
  updatedAt: string;
  stockItem: Stock;
};

export type ShoppingListResponse = {
  items: ShoppingListItem[];
  total: number;
};
