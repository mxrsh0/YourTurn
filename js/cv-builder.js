const steps = [...document.querySelectorAll('.builder-step')];
const nextButton = document.querySelector('#builder-next');
const backButton = document.querySelector('#builder-back');
const progress = document.querySelector('#builder-progress');
const stepLabel = document.querySelector('#builder-step-label');
const paper = document.querySelector('#cv-paper');
let currentStep = 1;

const fields = {
  name: document.querySelector('#builder-name'),
  role: document.querySelector('#builder-role'),
  experience: document.querySelector('#builder-experience'),
  skills: document.querySelector('#builder-skills')
};
const previews = {
  name: document.querySelector('#preview-name'),
  role: document.querySelector('#preview-role'),
  profile: document.querySelector('#preview-profile'),
  skills: document.querySelector('#preview-skills'),
  experience: document.querySelector('#preview-experience')
};

function updatePreview() {
  previews.name.textContent = fields.name.value.trim() || 'Your Name';
  previews.role.textContent = fields.role.value.trim() || 'Your target role';
  previews.profile.textContent = fields.experience.value.trim() || 'Your experience will appear here as you build your CV.';
  previews.skills.textContent = fields.skills.value.trim() || 'Your skills will appear here.';
  previews.experience.textContent = fields.experience.value.trim() || 'Your experience details will appear here.';
}

Object.values(fields).forEach((field) => field.addEventListener('input', updatePreview));

document.querySelectorAll('.template-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.template-card').forEach((item) => item.classList.remove('active'));
    card.classList.add('active');
    paper.classList.remove('preview-modern', 'preview-creative');
    if (card.dataset.template !== 'clean') paper.classList.add(`preview-${card.dataset.template}`);
  });
});

function renderStep() {
  steps.forEach((step) => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  progress.style.width = `${(currentStep / steps.length) * 100}%`;
  stepLabel.textContent = `${currentStep} of ${steps.length}`;
  nextButton.innerHTML = currentStep === steps.length ? 'Build my CV <span class="btn-arrow">✓</span>' : 'Next <span class="btn-arrow">→</span>';
}

nextButton.addEventListener('click', () => {
  if (currentStep < steps.length) {
    currentStep += 1;
    renderStep();
  } else {
    updatePreview();
    nextButton.innerHTML = 'CV preview ready <span class="btn-arrow">✓</span>';
    nextButton.classList.add('complete');
  }
});

backButton.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep -= 1;
    renderStep();
  } else {
    window.location.href = 'cv.html';
  }
});

renderStep();
updatePreview();
