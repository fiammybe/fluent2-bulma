const root = document.documentElement;
const themeButtons = document.querySelectorAll('[data-theme-choice]');
const densityToggle = document.querySelector('#comfortable-density');
const form = document.querySelector('#sample-form');
const fileInput = document.querySelector('.file-input');
const fileName = document.querySelector('.file-name');
const navbarBurger = document.querySelector('.navbar-burger');
const navbarMenu = document.querySelector(`#${navbarBurger.dataset.target}`);
const dropdown = document.querySelector('.overview-dropdown');
const dropdownTrigger = dropdown.querySelector('.dropdown-trigger button');

const closeDropdown = () => {
  dropdown.classList.remove('is-active');
  dropdownTrigger.setAttribute('aria-expanded', 'false');
};

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

dropdownTrigger.addEventListener('click', () => {
  const expanded = dropdownTrigger.getAttribute('aria-expanded') === 'true';
  dropdown.classList.toggle('is-active', !expanded);
  dropdownTrigger.setAttribute('aria-expanded', String(!expanded));
});

dropdown.addEventListener('click', (event) => {
  if (event.target.closest('.dropdown-item')) {
    closeDropdown();
  }
});

document.addEventListener('click', (event) => {
  if (!dropdown.contains(event.target)) {
    closeDropdown();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dropdown.classList.contains('is-active')) {
    closeDropdown();
    dropdownTrigger.focus();
  }
});

densityToggle.addEventListener('change', () => {
  form.classList.toggle('is-comfortable', densityToggle.checked);
});

fileInput.addEventListener('change', () => {
  fileName.textContent = fileInput.files[0]?.name ?? 'No file selected';
});

form.addEventListener('submit', (event) => event.preventDefault());

navbarBurger.addEventListener('click', () => {
  const expanded = navbarBurger.getAttribute('aria-expanded') === 'true';
  navbarBurger.setAttribute('aria-expanded', String(!expanded));
  navbarBurger.classList.toggle('is-active', !expanded);
  navbarMenu.classList.toggle('is-active', !expanded);
});
