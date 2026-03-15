import projectsData from './projects.json';

import type { AppState, Project, Task } from './types';

function makePlaceholder(title: string, subtitle: string, accent: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#101826"/>
          <stop offset="100%" stop-color="${accent}"/>
        </linearGradient>
      </defs>
      <rect width="800" height="480" rx="40" fill="url(#g)"/>
      <circle cx="685" cy="110" r="84" fill="rgba(255,255,255,0.08)"/>
      <circle cx="120" cy="392" r="112" fill="rgba(255,255,255,0.06)"/>
      <text x="72" y="182" fill="#f8fafc" font-size="60" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${title}</text>
      <text x="72" y="236" fill="#dbe7ff" font-size="28" font-family="Segoe UI, Arial, sans-serif">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

interface SeedProject {
  id: string;
  title: string;
  description: string;
  subtitle: string;
  accent: string;
  link: string;
  status: Project['status'];
}

const projects: Project[] = (projectsData as SeedProject[]).map((project) => ({
  id: project.id,
  title: project.title,
  description: project.description,
  screenshot: makePlaceholder(project.title, project.subtitle, project.accent),
  link: project.link,
  status: project.status,
}));

const tasks: Task[] = [
  { id: 'task-1', projectId: 'project-alisekris', title: 'Собрать структуру данных Prisma', progress: 75 },
  { id: 'task-2', projectId: 'project-alisekris', title: 'Доделать редактор контента', progress: 50 },
  { id: 'task-3', projectId: 'project-logistics', title: 'Подготовить dashboard автопарка', progress: 50 },
  { id: 'task-4', projectId: 'project-logistics', title: 'Настроить roadmap под backend', progress: 25 },
  { id: 'task-5', projectId: 'project-orgstructure', title: 'Проверить редактирование узлов', progress: 100 },
  { id: 'task-6', projectId: 'project-orgstructure', title: 'Протестировать импорт данных', progress: 75 },
  { id: 'task-7', projectId: 'project-compben', title: 'Почистить маркетинговый копирайтинг', progress: 100 },
  { id: 'task-8', projectId: 'project-compben', title: 'Проверить форму демо-запроса', progress: 75 },
  { id: 'task-9', projectId: 'project-cerebro', title: 'Упростить игровой onboarding', progress: 25 },
  { id: 'task-10', projectId: 'project-bioage', title: 'Определить метрики для графиков', progress: 25 },
  { id: 'task-11', projectId: 'project-subscriptions', title: 'Собрать базовую модель подписок', progress: 0 },
];

export const seedState: AppState = {
  projects,
  tasks,
};
