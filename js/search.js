const query = document.querySelector('#job-query');
const locationInput = document.querySelector('#job-location');
const resultCount = document.querySelector('#result-count');
const summary = document.querySelector('#search-summary');
const searchButton = document.querySelector('#search-button');
const clearButton = document.querySelector('#clear-filters');
const resultCards = [...document.querySelectorAll('.job-card')];

function updateSummary() {
  const term = query?.value.trim() || 'All opportunities';
  const location = locationInput?.value.trim() || 'UK';
  if (summary) summary.textContent = `${location} · searching for “${term}”`;
}

searchButton?.addEventListener('click', () => {
  updateSummary();
  if (resultCount) resultCount.textContent = `${resultCards.length} example opportunities`;
  resultCards.forEach((card) => {
    card.animate([{ opacity: .45, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
  });
});

[query, locationInput].forEach((input) => input?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchButton?.click();
}));

document.querySelectorAll('.filter-check input').forEach((input) => input.addEventListener('change', () => {
  const selected = document.querySelectorAll('.filter-check input:checked').length;
  if (resultCount) resultCount.textContent = selected ? `${Math.max(1, resultCards.length - selected + 1)} example opportunities` : '183 opportunities';
}));

document.querySelector('#sort-results')?.addEventListener('change', (event) => {
  const area = document.querySelector('#results');
  if (!area) return;
  const cards = [...area.querySelectorAll('.job-card')];
  if (event.target.value === 'recent') cards.reverse().forEach((card) => area.appendChild(card));
  if (event.target.value === 'salary') cards.sort((a, b) => b.textContent.localeCompare(a.textContent)).forEach((card) => area.appendChild(card));
});

document.querySelectorAll('.save-job').forEach((button) => button.addEventListener('click', () => {
  const saved = button.classList.toggle('saved');
  button.textContent = saved ? '♥ Saved' : '♡ Save';
}));

clearButton?.addEventListener('click', () => {
  document.querySelectorAll('.filter-check input').forEach((input) => { input.checked = false; });
  const posted = document.querySelector('#posted-filter');
  if (posted) posted.value = 'any';
  document.querySelector('#salary-min').value = '';
  document.querySelector('#salary-max').value = '';
  if (resultCount) resultCount.textContent = '183 opportunities';
  updateSummary();
});

updateSummary();
