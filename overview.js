import { initFluent2 } from './src/js/index.js';

const root = document.documentElement;
const themeButtons = document.querySelectorAll('[data-theme-choice]');
const densityToggle = document.querySelector('#comfortable-density');
const form = document.querySelector('#sample-form');
const fileInput = document.querySelector('.file-input');
const fileName = document.querySelector('.file-name');

themeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const theme = button.dataset.themeChoice;

    if (theme === 'system') {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = theme;
    }

    themeButtons.forEach((themeButton) => {
      themeButton.setAttribute('aria-pressed', String(themeButton === button));
    });
  });
});

densityToggle.addEventListener('change', () => {
  form.classList.toggle('is-comfortable', densityToggle.checked);
});

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0]?.name ?? 'No file selected';
});

form.addEventListener('submit', (event) => event.preventDefault());
initFluent2();
