import { initFluent2 } from '../src/js/index.js';

initFluent2();

document.querySelector('[data-demo-login]')?.addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#login-status').textContent =
    'This demonstration does not connect to an account.';
});
