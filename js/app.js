const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const toast = document.querySelector('#beta-toast');
let toastTimer;

function showBetaToast() {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 4200);
}

document.querySelectorAll('[data-action="get-started"]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    button.classList.add('is-pressed');
    window.setTimeout(() => button.classList.remove('is-pressed'), 180);
    showBetaToast();
  });
});
