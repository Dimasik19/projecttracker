import { ProjectTrackerApp } from './ui';

const root = document.querySelector<HTMLElement>('#app');

if (!root) {
  throw new Error('Root element #app not found.');
}

new ProjectTrackerApp(root).render();
