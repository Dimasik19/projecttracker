export type ProjectStatus = 'Development' | 'Ready' | 'Hold';
export type TaskProgress = 0 | 25 | 50 | 75 | 100;

export interface Task {
  id: string;
  projectId: string;
  title: string;
  progress: TaskProgress;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  screenshot: string;
  link: string;
  status: ProjectStatus;
}

export interface AppState {
  projects: Project[];
  tasks: Task[];
}

export interface ProjectFormValues {
  title: string;
  description: string;
  screenshot: string;
  link: string;
  status: ProjectStatus;
}
