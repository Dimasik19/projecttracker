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
  { id: 'task-3', projectId: 'project-alisekris', title: 'Настроить роли и права доступа', progress: 25 },
  { id: 'task-4', projectId: 'project-alisekris', title: 'Подготовить шаблоны писем для авторизации', progress: 100 },
  { id: 'task-5', projectId: 'project-alisekris', title: 'Сверстать страницу настроек профиля', progress: 75 },
  { id: 'task-6', projectId: 'project-alisekris', title: 'Добавить фильтры по публикациям', progress: 50 },
  { id: 'task-7', projectId: 'project-alisekris', title: 'Оптимизировать загрузку медиафайлов', progress: 25 },
  { id: 'task-8', projectId: 'project-alisekris', title: 'Покрыть API интеграционными тестами', progress: 0 },
  { id: 'task-9', projectId: 'project-alisekris', title: 'Согласовать карту админ-разделов', progress: 100 },
  { id: 'task-10', projectId: 'project-alisekris', title: 'Проверить адаптивность редактора', progress: 75 },

  { id: 'task-11', projectId: 'project-logistics', title: 'Подготовить dashboard автопарка', progress: 50 },
  { id: 'task-12', projectId: 'project-logistics', title: 'Настроить roadmap под backend', progress: 25 },
  { id: 'task-13', projectId: 'project-logistics', title: 'Собрать таблицу рейсов по регионам', progress: 75 },
  { id: 'task-14', projectId: 'project-logistics', title: 'Добавить карту отслеживания доставок', progress: 50 },
  { id: 'task-15', projectId: 'project-logistics', title: 'Проверить сценарии назначения водителей', progress: 100 },
  { id: 'task-16', projectId: 'project-logistics', title: 'Сверстать экран склада и остатков', progress: 25 },
  { id: 'task-17', projectId: 'project-logistics', title: 'Протянуть уведомления о задержках', progress: 75 },
  { id: 'task-18', projectId: 'project-logistics', title: 'Подключить экспорт отчётов в CSV', progress: 0 },
  { id: 'task-19', projectId: 'project-logistics', title: 'Настроить справочник типов транспорта', progress: 50 },
  { id: 'task-20', projectId: 'project-logistics', title: 'Обновить ключевые KPI в шапке', progress: 100 },

  { id: 'task-21', projectId: 'project-orgstructure', title: 'Проверить редактирование узлов', progress: 100 },
  { id: 'task-22', projectId: 'project-orgstructure', title: 'Протестировать импорт данных', progress: 75 },
  { id: 'task-23', projectId: 'project-orgstructure', title: 'Сделать поиск по сотрудникам', progress: 100 },
  { id: 'task-24', projectId: 'project-orgstructure', title: 'Добавить переключение режимов просмотра', progress: 75 },
  { id: 'task-25', projectId: 'project-orgstructure', title: 'Отрисовать связи между отделами', progress: 50 },
  { id: 'task-26', projectId: 'project-orgstructure', title: 'Проверить массовое обновление позиций', progress: 100 },
  { id: 'task-27', projectId: 'project-orgstructure', title: 'Улучшить экспорт оргструктуры в PNG', progress: 75 },
  { id: 'task-28', projectId: 'project-orgstructure', title: 'Сверить отображение скрытых узлов', progress: 50 },
  { id: 'task-29', projectId: 'project-orgstructure', title: 'Подготовить демо-данные для пресейла', progress: 100 },
  { id: 'task-30', projectId: 'project-orgstructure', title: 'Довести пустые состояния интерфейса', progress: 75 },

  { id: 'task-31', projectId: 'project-compben', title: 'Почистить маркетинговый копирайтинг', progress: 100 },
  { id: 'task-32', projectId: 'project-compben', title: 'Проверить форму демо-запроса', progress: 75 },
  { id: 'task-33', projectId: 'project-compben', title: 'Обновить блок с тарифами', progress: 100 },
  { id: 'task-34', projectId: 'project-compben', title: 'Собрать отзывы клиентов на лендинг', progress: 75 },
  { id: 'task-35', projectId: 'project-compben', title: 'Подготовить иллюстрации для hero-экрана', progress: 50 },
  { id: 'task-36', projectId: 'project-compben', title: 'Проверить SEO-мета теги страниц', progress: 100 },
  { id: 'task-37', projectId: 'project-compben', title: 'Настроить анимации секции преимуществ', progress: 75 },
  { id: 'task-38', projectId: 'project-compben', title: 'Сократить текст FAQ-блока', progress: 50 },
  { id: 'task-39', projectId: 'project-compben', title: 'Сверстать новый footer с CTA', progress: 100 },
  { id: 'task-40', projectId: 'project-compben', title: 'Протестировать отправку формы на мобильных', progress: 75 },

  { id: 'task-41', projectId: 'project-cerebro', title: 'Упростить игровой onboarding', progress: 25 },
  { id: 'task-42', projectId: 'project-cerebro', title: 'Добавить подсказки для первого уровня', progress: 50 },
  { id: 'task-43', projectId: 'project-cerebro', title: 'Пересобрать экономику стартовой кампании', progress: 75 },
  { id: 'task-44', projectId: 'project-cerebro', title: 'Обновить экран выбора фракции', progress: 25 },
  { id: 'task-45', projectId: 'project-cerebro', title: 'Починить прогресс сохранений', progress: 0 },
  { id: 'task-46', projectId: 'project-cerebro', title: 'Добавить звуки интерфейса', progress: 50 },
  { id: 'task-47', projectId: 'project-cerebro', title: 'Сверстать окно итогов миссии', progress: 75 },
  { id: 'task-48', projectId: 'project-cerebro', title: 'Проверить баланс ресурсов в midgame', progress: 25 },
  { id: 'task-49', projectId: 'project-cerebro', title: 'Настроить паузу во время туториала', progress: 50 },
  { id: 'task-50', projectId: 'project-cerebro', title: 'Подготовить экран достижений', progress: 100 },

  { id: 'task-51', projectId: 'project-bioage', title: 'Определить метрики для графиков', progress: 25 },
  { id: 'task-52', projectId: 'project-bioage', title: 'Собрать требования по новым виджетам', progress: 0 },
  { id: 'task-53', projectId: 'project-bioage', title: 'Протянуть фильтры по возрастным группам', progress: 50 },
  { id: 'task-54', projectId: 'project-bioage', title: 'Проверить формат экспорта отчётов', progress: 25 },
  { id: 'task-55', projectId: 'project-bioage', title: 'Уточнить легенду для сравнительных графиков', progress: 75 },
  { id: 'task-56', projectId: 'project-bioage', title: 'Подготовить API-контракт для аналитики', progress: 50 },
  { id: 'task-57', projectId: 'project-bioage', title: 'Доработать таблицу с биомаркерами', progress: 25 },
  { id: 'task-58', projectId: 'project-bioage', title: 'Сверить локализацию подписей', progress: 100 },
  { id: 'task-59', projectId: 'project-bioage', title: 'Сделать экран сравнения периодов', progress: 0 },
  { id: 'task-60', projectId: 'project-bioage', title: 'Проверить загрузку больших наборов данных', progress: 25 },

  { id: 'task-61', projectId: 'project-subscriptions', title: 'Собрать базовую модель подписок', progress: 0 },
  { id: 'task-62', projectId: 'project-subscriptions', title: 'Добавить категории регулярных платежей', progress: 25 },
  { id: 'task-63', projectId: 'project-subscriptions', title: 'Сделать форму повторяющихся списаний', progress: 50 },
  { id: 'task-64', projectId: 'project-subscriptions', title: 'Подготовить график расходов по месяцам', progress: 75 },
  { id: 'task-65', projectId: 'project-subscriptions', title: 'Настроить уведомления о списании', progress: 25 },
  { id: 'task-66', projectId: 'project-subscriptions', title: 'Добавить импорт банковской выписки', progress: 0 },
  { id: 'task-67', projectId: 'project-subscriptions', title: 'Сверстать карточки активных подписок', progress: 50 },
  { id: 'task-68', projectId: 'project-subscriptions', title: 'Показать прогноз расходов на квартал', progress: 75 },
  { id: 'task-69', projectId: 'project-subscriptions', title: 'Проверить пустые состояния дашборда', progress: 100 },
  { id: 'task-70', projectId: 'project-subscriptions', title: 'Собрать экран с архивом отменённых подписок', progress: 25 },
];

export const seedState: AppState = {
  projects,
  tasks,
};
