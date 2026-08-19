const tabs = document.querySelectorAll('.access-tab');
const panels = document.querySelectorAll('.panel-content');

function activatePanel(panelId) {
  tabs.forEach((tab) => {
    const active = tab.dataset.panel === panelId;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  panels.forEach((panel) => {
    const active = panel.id === panelId;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => activatePanel(tab.dataset.panel));
  tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const currentIndex = Array.from(tabs).indexOf(tab);
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    activatePanel(tabs[nextIndex].dataset.panel);
  });
});

document.querySelectorAll('[data-href]').forEach((button) => {
  button.addEventListener('click', () => {
    window.location.href = button.dataset.href;
  });
});
