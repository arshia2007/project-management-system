export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export type ProjectStatus = 'Not Started' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  _count?: {
    tasks: number;
  };
  tasks?: Task[];
}

export interface Task {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
  breakdown: {
    projects: {
      notStarted: number;
      inProgress: number;
      completed: number;
    };
    tasks: {
      pending: number;
      inProgress: number;
      completed: number;
    };
  };
  recentProjects: Project[];
  upcomingTasks: Task[];
}
