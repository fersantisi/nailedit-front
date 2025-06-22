export type User = {
  id: number;
  username: string;
};

export type Goal = {
  id: number;
  name: string;
  description: string;
  dueDate: string;
  tasks?: Task[];
};

export type Task = {
  id: number;
  goalId: number;
  projectId: number;
  name: string;
  description: string;
  label: string;
  dueDate: string;
};

export type Resource = {
  id: number;
  name: string;
  project: string;
  amount: number;
  stock: number;
  category: string;
};
