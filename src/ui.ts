import './styles.css';

import { createId, getStatusLabel } from './projects';
import { loadState, saveState } from './storage';
import { createTask, TASK_PROGRESS_VALUES } from './tasks';
import type {
  AppState,
  Project,
  ProjectFormValues,
  ProjectStatus,
  Task,
  TaskProgress,
} from './types';

interface TaskEditorState {
  taskId: string | null;
  title: string;
  progress: TaskProgress;
}

interface ProjectEditorState {
  mode: 'idle' | 'create' | 'edit';
  projectId: string | null;
}

const STATUS_OPTIONS: ProjectStatus[] = ['Development', 'Ready', 'Hold'];

export class ProjectTrackerApp {
  private state: AppState;
  private selectedProjectId: string | null;
  private taskEditor: TaskEditorState;
  private projectEditor: ProjectEditorState;
  private draggedProjectId: string | null;

  constructor(private readonly root: HTMLElement) {
    this.state = loadState();
    this.selectedProjectId = this.state.projects[0]?.id ?? null;
    this.taskEditor = { taskId: null, title: '', progress: 0 };
    this.projectEditor = { mode: 'idle', projectId: null };
    this.draggedProjectId = null;
  }

  render(): void {
    const projects = this.state.projects;
    const selectedProject = this.getSelectedProject();
    const selectedTasks = selectedProject
      ? this.state.tasks.filter((task) => task.projectId === selectedProject.id)
      : [];

    this.root.innerHTML = `
      <div class="shell">
        <header class="hero">
          <div>
            <p class="eyebrow">Personal Project Tracker</p>
            <p class="hero-copy">
              Данные сохраняются в localStorage, карточки сортируются по статусу, а прогресс считается по задачам автоматически.
            </p>
          </div>
          <button class="primary-button" data-action="open-create-project">+ Добавить проект</button>
        </header>

        <main class="workspace">
          <section class="projects-panel">
            ${
              projects.length === 0
                ? `
                  <div class="empty-state">
                    <div class="empty-illustration">+</div>
                    <h3>Нет проектов, создайте первый проект</h3>
                    <p>Добавьте карточку и начните вести задачи прямо в браузере.</p>
                  </div>
                `
                : `
                  <div class="project-grid">
                    ${projects.map((project) => this.renderProjectCard(project)).join('')}
                  </div>
                `
            }
          </section>

          <aside class="tasks-panel">
            ${
              this.projectEditor.mode === 'create'
                ? this.renderProjectCreatePanel()
                : selectedProject
                  ? this.renderTasksPanel(selectedProject, selectedTasks)
                  : `
                    <div class="placeholder-panel">
                      <h2>Задачи проекта</h2>
                      <p>Выберите карточку слева, чтобы открыть задачи проекта.</p>
                    </div>
                  `
            }
          </aside>
        </main>
      </div>
    `;

    this.bindEvents();
  }

  private renderProjectCard(project: Project): string {
    const isSelected = this.selectedProjectId === project.id;
    const screenshot = this.normalizeProjectScreenshot(project.screenshot, project.title);

    return `
      <article
        class="project-card ${isSelected ? 'selected' : ''}"
        data-action="select-project"
        data-project-id="${project.id}"
        draggable="true"
      >
        <div class="card-media">
          <img src="${screenshot}" alt="Скриншот проекта ${this.escapeHtml(project.title)}" />
        </div>
        <div class="card-body">
          <div class="card-topline">
            <span class="status-badge status-${project.status.toLowerCase()}">
              <span class="status-dot"></span>
              ${getStatusLabel(project.status)}
            </span>
            <div class="icon-actions">
              <button class="icon-button" type="button" data-action="edit-project" data-project-id="${project.id}" aria-label="Редактировать проект">✎</button>
              <button class="icon-button danger" type="button" data-action="delete-project" data-project-id="${project.id}" aria-label="Удалить проект">🗑</button>
            </div>
          </div>
          <h3>${this.escapeHtml(project.title)}</h3>
          <p class="card-description">${this.escapeHtml(project.description)}</p>
          <a class="project-link" href="${project.link}" target="_blank" rel="noreferrer">Открыть проект</a>
        </div>
      </article>
    `;
  }

  private renderTasksPanel(project: Project, tasks: Task[]): string {
    const isEditingTask = this.taskEditor.taskId !== null;
    const isEditingProject =
      this.projectEditor.mode === 'edit' && this.projectEditor.projectId === project.id;
    const screenshotValue = project.screenshot.startsWith('data:image') ? '' : project.screenshot;

    return `
        <div class="tasks-card">
          <div class="section-heading">
            <div>
              <p class="panel-overline">${getStatusLabel(project.status)}</p>
              <h2>${this.escapeHtml(project.title)}</h2>
            </div>
            <button
              class="text-button"
              type="button"
              data-action="${isEditingProject ? 'cancel-project-edit' : 'start-project-edit'}"
              data-project-id="${project.id}"
            >
              ${isEditingProject ? 'Скрыть редактор' : 'Редактировать проект'}
            </button>
          </div>

          <p class="tasks-description">${this.escapeHtml(project.description)}</p>
          ${
            isEditingProject
              ? `
                <form class="project-inline-editor" data-form="project-edit-inline" data-project-id="${project.id}">
                  <label>
                    <span>Название</span>
                    <input type="text" name="title" maxlength="120" value="${this.escapeAttribute(project.title)}" required />
                  </label>
                  <label>
                    <span>Описание</span>
                    <textarea name="description" rows="4" maxlength="320" required>${this.escapeHtml(project.description)}</textarea>
                  </label>
                  <label>
                    <span>Ссылка на проект</span>
                    <input type="url" name="link" placeholder="https://example.com" value="${this.escapeAttribute(project.link)}" />
                  </label>
                  <label>
                    <span>Скриншот по URL</span>
                    <input type="url" name="screenshot" placeholder="https://..." value="${this.escapeAttribute(screenshotValue)}" />
                  </label>
                  <label>
                    <span>Или загрузите изображение</span>
                    <input type="file" name="screenshotFile" accept="image/*" />
                  </label>
                  <fieldset class="status-fieldset">
                    <legend>Статус проекта</legend>
                    <div class="status-picker">
                      ${STATUS_OPTIONS.map((status) => `
                        <label class="status-option ${project.status === status ? 'active' : ''}">
                          <input type="radio" name="status" value="${status}" ${project.status === status ? 'checked' : ''} />
                          <span>${getStatusLabel(status)}</span>
                        </label>
                      `).join('')}
                    </div>
                  </fieldset>
                  <div class="editor-actions">
                    <button class="primary-button" type="submit">Сохранить проект</button>
                    <button class="text-button" type="button" data-action="cancel-project-edit" data-project-id="${project.id}">Отмена</button>
                  </div>
                </form>
              `
              : ''
          }

        <form class="task-composer" data-form="task-create">
          <input type="text" name="title" maxlength="120" placeholder="Новая задача" required />
          <button class="primary-button" type="submit">Добавить</button>
        </form>

        ${
          tasks.length === 0
            ? `
              <div class="tasks-empty">
                <h3>Пока без задач</h3>
                <p>Добавьте первую задачу для расчёта прогресса проекта.</p>
              </div>
            `
            : `
              <div class="task-list">
                ${tasks.map((task) => this.renderTaskItem(task)).join('')}
              </div>
            `
        }

        <form class="task-editor ${isEditingTask ? 'visible' : ''}" data-form="task-edit">
          <div class="editor-head">
            <h3>${isEditingTask ? 'Редактирование задачи' : 'Выберите задачу для редактирования'}</h3>
            ${
              isEditingTask
                ? '<button type="button" class="text-button" data-action="cancel-task-edit">Отмена</button>'
                : ''
            }
          </div>
          <input
            type="text"
            name="title"
            maxlength="120"
            placeholder="Название задачи"
            value="${this.escapeAttribute(this.taskEditor.title)}"
            ${isEditingTask ? '' : 'disabled'}
            required
          />
          <label>
            <span>Процент выполнения</span>
            <select name="progress" ${isEditingTask ? '' : 'disabled'}>
              ${TASK_PROGRESS_VALUES.map((value) => `
                <option value="${value}" ${this.taskEditor.progress === value ? 'selected' : ''}>${value}%</option>
              `).join('')}
            </select>
          </label>
          <button class="primary-button" type="submit" ${isEditingTask ? '' : 'disabled'}>Сохранить задачу</button>
        </form>
      </div>
    `;
  }

  private renderTaskItem(task: Task): string {
    return `
      <article class="task-item">
        <div class="task-content">
          <h3>${this.escapeHtml(task.title)} : ${task.progress}%</h3>
        </div>
        <div class="icon-actions">
          <button class="icon-button" type="button" data-action="edit-task" data-task-id="${task.id}" aria-label="Редактировать задачу">✎</button>
          <button class="icon-button danger" type="button" data-action="delete-task" data-task-id="${task.id}" aria-label="Удалить задачу">🗑</button>
        </div>
      </article>
    `;
  }

  private renderProjectCreatePanel(): string {
    const values: ProjectFormValues = {
      title: '',
      description: '',
      screenshot: '',
      link: '',
      status: 'Development',
    };

    return `
      <div class="tasks-card">
        <div class="section-heading">
          <div>
            <p class="panel-overline">New project</p>
            <h2>Создать проект</h2>
          </div>
          <button class="text-button" type="button" data-action="cancel-project-edit">Отмена</button>
        </div>

        <form class="project-form" data-form="project-create">
          <label>
            <span>Название</span>
            <input type="text" name="title" maxlength="120" value="${this.escapeAttribute(values.title)}" required />
          </label>
          <label>
            <span>Описание</span>
            <textarea name="description" rows="4" maxlength="320" required>${this.escapeHtml(values.description)}</textarea>
          </label>
          <label>
            <span>Ссылка на проект</span>
            <input type="url" name="link" placeholder="https://example.com" value="${this.escapeAttribute(values.link)}" />
          </label>
          <label>
            <span>Скриншот по URL</span>
            <input type="url" name="screenshot" placeholder="https://..." value="${this.escapeAttribute(values.screenshot)}" />
          </label>
          <label>
            <span>Или загрузите изображение</span>
            <input type="file" name="screenshotFile" accept="image/*" />
          </label>
          <fieldset class="status-fieldset">
            <legend>Статус проекта</legend>
            <div class="status-picker">
              ${STATUS_OPTIONS.map((status) => `
                <label class="status-option ${values.status === status ? 'active' : ''}">
                  <input type="radio" name="status" value="${status}" ${values.status === status ? 'checked' : ''} />
                  <span>${getStatusLabel(status)}</span>
                </label>
              `).join('')}
            </div>
          </fieldset>
          <button class="primary-button" type="submit">Создать проект</button>
        </form>
      </div>
    `;
  }

  private bindEvents(): void {
    this.root.querySelectorAll<HTMLElement>('[data-action]').forEach((element) => {
      element.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const action = target.dataset.action;
        if (!action) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        this.handleAction(action, target);
      });
    });

    this.root.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
      card.addEventListener('dragstart', (event) => {
        const projectId = card.dataset.projectId;
        if (!projectId || !(event.dataTransfer instanceof DataTransfer)) {
          return;
        }

        this.draggedProjectId = projectId;
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', projectId);
      });

      card.addEventListener('dragover', (event) => {
        if (!this.draggedProjectId) {
          return;
        }

        event.preventDefault();
        card.classList.add('drop-target');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('drop-target');
      });

      card.addEventListener('drop', (event) => {
        event.preventDefault();
        card.classList.remove('drop-target');

        const targetProjectId = card.dataset.projectId;
        if (!this.draggedProjectId || !targetProjectId || this.draggedProjectId === targetProjectId) {
          return;
        }

        this.moveProject(this.draggedProjectId, targetProjectId);
      });

      card.addEventListener('dragend', () => {
        this.draggedProjectId = null;
        this.root.querySelectorAll<HTMLElement>('.project-card').forEach((node) => {
          node.classList.remove('dragging', 'drop-target');
        });
      });
    });

    const projectCreateForm = this.root.querySelector<HTMLFormElement>('[data-form="project-create"]');
    projectCreateForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.handleProjectCreate(projectCreateForm);
    });
    projectCreateForm?.querySelectorAll<HTMLInputElement>('input[name="status"]').forEach((input) => {
      input.addEventListener('change', () => this.syncStatusOptionState(projectCreateForm));
    });
    projectCreateForm?.querySelectorAll<HTMLLabelElement>('.status-option').forEach((option) => {
      option.addEventListener('click', () => this.selectStatusOption(option, projectCreateForm));
    });

    const taskCreateForm = this.root.querySelector<HTMLFormElement>('[data-form="task-create"]');
    taskCreateForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const titleInput = taskCreateForm.elements.namedItem('title');
      if (!(titleInput instanceof HTMLInputElement) || !this.selectedProjectId) {
        return;
      }

      const title = titleInput.value.trim();
      if (!title) {
        return;
      }

      this.state.tasks.push(createTask(this.selectedProjectId, title));
      this.persist();
      this.render();
    });

    const taskEditForm = this.root.querySelector<HTMLFormElement>('[data-form="task-edit"]');
    taskEditForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!this.taskEditor.taskId) {
        return;
      }

      const titleInput = taskEditForm.elements.namedItem('title');
      const progressInput = taskEditForm.elements.namedItem('progress');
      if (!(titleInput instanceof HTMLInputElement) || !(progressInput instanceof HTMLSelectElement)) {
        return;
      }

      const task = this.state.tasks.find((item) => item.id === this.taskEditor.taskId);
      if (!task) {
        return;
      }

      task.title = titleInput.value.trim();
      task.progress = Number(progressInput.value) as TaskProgress;
      this.taskEditor = { taskId: null, title: '', progress: 0 };
      this.persist();
      this.render();
    });

    const projectInlineForm = this.root.querySelector<HTMLFormElement>('[data-form="project-edit-inline"]');
    projectInlineForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.handleInlineProjectSubmit(projectInlineForm);
    });
    projectInlineForm?.querySelectorAll<HTMLInputElement>('input[name="status"]').forEach((input) => {
      input.addEventListener('change', () => this.syncStatusOptionState(projectInlineForm));
    });
    projectInlineForm?.querySelectorAll<HTMLLabelElement>('.status-option').forEach((option) => {
      option.addEventListener('click', () => this.selectStatusOption(option, projectInlineForm));
    });
  }

  private handleAction(action: string, element: HTMLElement): void {
    switch (action) {
      case 'open-create-project':
        this.projectEditor = { mode: 'create', projectId: null };
        this.taskEditor = { taskId: null, title: '', progress: 0 };
        this.render();
        return;
      case 'select-project': {
        const projectId = element.dataset.projectId;
        if (projectId) {
          this.selectedProjectId = projectId;
          this.taskEditor = { taskId: null, title: '', progress: 0 };
          this.projectEditor = { mode: 'idle', projectId: null };
          this.render();
        }
        return;
      }
      case 'edit-project': {
        const projectId = element.dataset.projectId;
        if (projectId) {
          this.projectEditor = { mode: 'edit', projectId };
          this.selectedProjectId = projectId;
          this.taskEditor = { taskId: null, title: '', progress: 0 };
          this.render();
        }
        return;
      }
      case 'delete-project': {
        const projectId = element.dataset.projectId;
        if (!projectId) {
          return;
        }

        const project = this.state.projects.find((item) => item.id === projectId);
        if (!project || !window.confirm(`Удалить проект "${project.title}"?`)) {
          return;
        }

        this.state.projects = this.state.projects.filter((item) => item.id !== projectId);
        this.state.tasks = this.state.tasks.filter((item) => item.projectId !== projectId);
        if (this.selectedProjectId === projectId) {
          this.selectedProjectId = this.state.projects[0]?.id ?? null;
        }
        this.taskEditor = { taskId: null, title: '', progress: 0 };
        this.persist();
        this.render();
        return;
      }
      case 'start-project-edit': {
        const projectId = element.dataset.projectId;
        if (!projectId) {
          return;
        }

        this.projectEditor = { mode: 'edit', projectId };
        this.taskEditor = { taskId: null, title: '', progress: 0 };
        this.render();
        return;
      }
      case 'cancel-project-edit':
        this.projectEditor = { mode: 'idle', projectId: null };
        this.render();
        return;
      case 'edit-task': {
        const taskId = element.dataset.taskId;
        const task = this.state.tasks.find((item) => item.id === taskId);
        if (!task) {
          return;
        }

        this.taskEditor = {
          taskId: task.id,
          title: task.title,
          progress: task.progress,
        };
        this.render();
        return;
      }
      case 'delete-task': {
        const taskId = element.dataset.taskId;
        const task = this.state.tasks.find((item) => item.id === taskId);
        if (!task || !window.confirm(`Удалить задачу "${task.title}"?`)) {
          return;
        }

        this.state.tasks = this.state.tasks.filter((item) => item.id !== taskId);
        if (this.taskEditor.taskId === taskId) {
          this.taskEditor = { taskId: null, title: '', progress: 0 };
        }
        this.persist();
        this.render();
        return;
      }
      case 'cancel-task-edit':
        this.taskEditor = { taskId: null, title: '', progress: 0 };
        this.render();
        return;
      default:
        return;
    }
  }

  private async handleProjectCreate(form: HTMLFormElement): Promise<void> {
    const formData = new FormData(form);
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const link = String(formData.get('link') ?? '').trim();
    const screenshotUrl = String(formData.get('screenshot') ?? '').trim();
    const status = String(formData.get('status') ?? 'Development') as ProjectStatus;
    const screenshotFile = formData.get('screenshotFile');

    if (!title || !description) {
      return;
    }

    let screenshot = screenshotUrl;
    if (screenshotFile instanceof File && screenshotFile.size > 0) {
      screenshot = await this.readFileAsDataUrl(screenshotFile);
    }

    if (!screenshot) {
      screenshot = this.buildFallbackPlaceholder(title);
    }

    const project: Project = {
      id: createId('project'),
      title,
      description,
      screenshot,
      link,
      status,
    };
    this.state.projects.push(project);
    this.selectedProjectId = project.id;
    this.projectEditor = { mode: 'idle', projectId: null };
    this.persist();
    this.render();
  }

  private async handleInlineProjectSubmit(form: HTMLFormElement): Promise<void> {
    const projectId = form.dataset.projectId;
    if (!projectId) {
      return;
    }

    const project = this.state.projects.find((item) => item.id === projectId);
    if (!project) {
      return;
    }

    const formData = new FormData(form);
    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const link = String(formData.get('link') ?? '').trim();
    const screenshotUrl = String(formData.get('screenshot') ?? '').trim();
    const status = String(formData.get('status') ?? project.status) as ProjectStatus;
    const screenshotFile = formData.get('screenshotFile');

    if (!title || !description) {
      return;
    }

    let screenshot = screenshotUrl || project.screenshot;
    if (screenshotFile instanceof File && screenshotFile.size > 0) {
      screenshot = await this.readFileAsDataUrl(screenshotFile);
    }

    if (!screenshot) {
      screenshot = this.buildFallbackPlaceholder(title);
    }

    project.title = title;
    project.description = description;
    project.link = link;
    project.screenshot = screenshot;
    project.status = status;
    this.projectEditor = { mode: 'idle', projectId: null };
    this.persist();
    this.render();
  }

  private getSelectedProject(): Project | null {
    if (!this.selectedProjectId) {
      return null;
    }

    return this.state.projects.find((project) => project.id === this.selectedProjectId) ?? null;
  }

  private persist(): void {
    saveState(this.state);
  }

  private moveProject(sourceProjectId: string, targetProjectId: string): void {
    const sourceIndex = this.state.projects.findIndex((project) => project.id === sourceProjectId);
    const targetIndex = this.state.projects.findIndex((project) => project.id === targetProjectId);
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return;
    }

    const [project] = this.state.projects.splice(sourceIndex, 1);
    this.state.projects.splice(targetIndex, 0, project);
    this.persist();
    this.render();
  }

  private syncStatusOptionState(form: HTMLFormElement): void {
    const options = form.querySelectorAll<HTMLLabelElement>('.status-option');
    options.forEach((option) => {
      const input = option.querySelector<HTMLInputElement>('input[name="status"]');
      option.classList.toggle('active', Boolean(input?.checked));
    });
  }

  private selectStatusOption(option: HTMLLabelElement, form: HTMLFormElement): void {
    const input = option.querySelector<HTMLInputElement>('input[name="status"]');
    if (!input || input.checked) {
      return;
    }

    input.checked = true;
    this.syncStatusOptionState(form);
  }

  private async readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(new Error('Не удалось прочитать изображение.'));
      reader.readAsDataURL(file);
    });
  }

  private buildFallbackPlaceholder(title: string): string {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480">
        <rect width="800" height="480" rx="40" fill="#111827"/>
        <rect x="38" y="38" width="724" height="404" rx="28" fill="#1f2937" stroke="#334155"/>
        <text x="72" y="220" fill="#f8fafc" font-size="54" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${title}</text>
        <text x="72" y="276" fill="#86efac" font-size="28" font-family="Segoe UI, Arial, sans-serif">Project preview</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private normalizeProjectScreenshot(screenshot: string, title: string): string {
    if (!screenshot) {
      return this.buildFallbackPlaceholder(title);
    }

    // Replace older generated placeholders that still contain the green accent line.
    if (screenshot.startsWith('data:image/svg+xml') && screenshot.includes('4ade80')) {
      return this.buildFallbackPlaceholder(title);
    }

    return screenshot;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value);
  }
}
