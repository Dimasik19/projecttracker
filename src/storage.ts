import { seedState } from './seed';
import type { AppState } from './types';

export const STORAGE_KEY = 'project-tracker';

function isValidState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<AppState>;
  return Array.isArray(candidate.projects) && Array.isArray(candidate.tasks);
}

export function loadState(): AppState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return structuredClone(seedState);
  }

  try {
    const parsed = JSON.parse(saved) as unknown;
    if (isValidState(parsed)) {
      const existingTaskIds = new Set(parsed.tasks.map((task) => task.id));
      const missingSeedTasks = seedState.tasks.filter((task) => !existingTaskIds.has(task.id));

      return {
        projects: parsed.projects,
        tasks: [...parsed.tasks, ...missingSeedTasks],
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  return structuredClone(seedState);
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
