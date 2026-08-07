const startButton = document.querySelector('#start-analysis');
const intro = document.querySelector('#analysis-intro');
const working = document.querySelector('#analysis-working');
const results = document.querySelector('#analysis-results');
const progress = document.querySelector('#analysis-progress');
const title = document.querySelector('#working-title');
const detail = document.querySelector('#working-detail');
const scans = [...document.querySelectorAll('.scan-item')];

const stages = [
  ['Reading your experience...', 'We're looking for useful information, not judging your career.'],
  ['Finding your skills...', 'Some skills are explicit. Others can be inferred from the work you've described.'],
  ['Checking clarity & structure...', 'We're looking for places where your experience could be easier for an employer to understand.'],
  ['Thinking beyond one job title...', 'Your experience can often fit more roles than the exact title on your CV suggests.']
];

startButton?.addEventListener('click', () => {
  intro.classList.add('hidden');
  working.classList.remove('hidden');
  runAnalysis();
});

async function runAnalysis() {
  for (let i = 0; i < stages.length; i++) {
    scans.forEach((item, index) => item.classList.toggle('active', index === i));
    title.textContent = stages[i][0];
    detail.textContent = stages[i][1];
    progress.style.width = `${12 + (i * 20)}%`;
    await wait(900);
    scans[i].classList.remove('active');
    scans[i].classList.add('done');
    scans[i].querySelector('span').textContent = '✓';
  }
  progress.style.width = '100%';
  await wait(500);
  working.classList.add('hidden');
  results.classList.remove('hidden');
  results.classList.add('fade-in');
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const exampleButton = document.querySelector('.mini-action');
exampleButton?.addEventListener('click', () => {
  exampleButton.textContent = 'Example: “Built and shipped 3D assets used in...”';
});
