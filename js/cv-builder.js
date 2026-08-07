const steps = [...document.querySelectorAll('.builder-step')];
const nextButton = document.querySelector('#builder-next');
const backButton = document.querySelector('#builder-back');
const progress = document.querySelector('#builder-progress');
const stepLabel = document.querySelector('#builder-step-label');
const paper = document.querySelector('#cv-paper');
let currentStep = 1;
let experiences = [];
let education = [];
let skills = [];

const fields = {
  name: document.querySelector('#builder-name'), location: document.querySelector('#builder-location'),
  email: document.querySelector('#builder-email'), phone: document.querySelector('#builder-phone'),
  role: document.querySelector('#builder-role'), summary: document.querySelector('#builder-summary')
};
const previews = {
  name: document.querySelector('#preview-name'), role: document.querySelector('#preview-role'), contact: document.querySelector('#preview-contact'),
  profile: document.querySelector('#preview-profile'), skills: document.querySelector('#preview-skills'), experience: document.querySelector('#preview-experience'), education: document.querySelector('#preview-education')
};

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[character])); }

function renderRepeatingLists() {
  const experienceList = document.querySelector('#experience-list');
  const educationList = document.querySelector('#education-list');
  experienceList.innerHTML = experiences.map((item,index)=>`<div class="entry-card"><div class="entry-card-head"><strong>Experience ${index+1}</strong><button type="button" class="remove-entry" data-remove-experience="${index}">Remove</button></div><div class="field-grid"><div><label class="field-label">Role / title</label><input data-exp-field="title" data-index="${index}" value="${escapeHtml(item.title)}" placeholder="e.g. Junior Developer"></div><div><label class="field-label">Company / project</label><input data-exp-field="company" data-index="${index}" value="${escapeHtml(item.company)}" placeholder="e.g. Example Studio"></div><div><label class="field-label">Dates</label><input data-exp-field="dates" data-index="${index}" value="${escapeHtml(item.dates)}" placeholder="e.g. 2024 — Present"></div><div class="full"><label class="field-label">What did you do?</label><textarea data-exp-field="description" data-index="${index}" rows="3" placeholder="Tell us in your own words...">${escapeHtml(item.description)}</textarea></div></div></div>`).join('');
  educationList.innerHTML = education.map((item,index)=>`<div class="entry-card"><div class="entry-card-head"><strong>Education ${index+1}</strong><button type="button" class="remove-entry" data-remove-education="${index}">Remove</button></div><div class="field-grid"><div><label class="field-label">Qualification</label><input data-edu-field="qualification" data-index="${index}" value="${escapeHtml(item.qualification)}" placeholder="e.g. BSc Computer Science"></div><div><label class="field-label">School / institution</label><input data-edu-field="institution" data-index="${index}" value="${escapeHtml(item.institution)}" placeholder="e.g. University of Sheffield"></div><div><label class="field-label">Dates</label><input data-edu-field="dates" data-index="${index}" value="${escapeHtml(item.dates)}" placeholder="e.g. 2022 — 2025"></div><div class="full"><label class="field-label">Anything worth highlighting?</label><input data-edu-field="details" data-index="${index}" value="${escapeHtml(item.details)}" placeholder="e.g. Relevant modules, grades, awards or projects"></div></div></div>`).join('');
  document.querySelectorAll('[data-remove-experience]').forEach(button=>button.addEventListener('click',()=>{experiences.splice(Number(button.dataset.removeExperience),1);renderRepeatingLists();updatePreview();}));
  document.querySelectorAll('[data-remove-education]').forEach(button=>button.addEventListener('click',()=>{education.splice(Number(button.dataset.removeEducation),1);renderRepeatingLists();updatePreview();}));
  document.querySelectorAll('[data-exp-field]').forEach(input=>input.addEventListener('input',()=>{experiences[Number(input.dataset.index)][input.dataset.expField]=input.value;updatePreview();}));
  document.querySelectorAll('[data-edu-field]').forEach(input=>input.addEventListener('input',()=>{education[Number(input.dataset.index)][input.dataset.eduField]=input.value;updatePreview();}));
}
function renderSkills(){const list=document.querySelector('#skill-list');list.innerHTML=skills.map((skill,index)=>`<span class="skill-chip">${escapeHtml(skill)} <button type="button" data-remove-skill="${index}" aria-label="Remove ${escapeHtml(skill)}">×</button></span>`).join('');document.querySelectorAll('[data-remove-skill]').forEach(button=>button.addEventListener('click',()=>{skills.splice(Number(button.dataset.removeSkill),1);renderSkills();updatePreview();}));}
function addSkill(value){const clean=value.trim();if(!clean||skills.some(skill=>skill.toLowerCase()===clean.toLowerCase()))return;skills.push(clean);renderSkills();updatePreview();}
function updatePreview(){previews.name.textContent=fields.name.value.trim()||'Your Name';previews.role.textContent=fields.role.value.trim()||'Your target role';const contact=[fields.email.value.trim(),fields.phone.value.trim(),fields.location.value.trim()].filter(Boolean);previews.contact.textContent=contact.join(' · ')||'Your contact details';previews.profile.textContent=fields.summary.value.trim()||'Your introduction will appear here.';previews.skills.innerHTML=skills.length?skills.map(skill=>`<span>${escapeHtml(skill)}</span>`).join(''):'<span>Your skills will appear here.</span>';previews.experience.innerHTML=experiences.length?experiences.map(item=>`<div class="preview-entry"><strong>${escapeHtml(item.title||'Role')}</strong><small>${escapeHtml([item.company,item.dates].filter(Boolean).join(' · '))}</small><p>${escapeHtml(item.description||'Experience details will appear here.')}</p></div>`).join(''):'<p>Your experience will appear here.</p>';previews.education.innerHTML=education.length?education.map(item=>`<div class="preview-entry"><strong>${escapeHtml(item.qualification||'Qualification')}</strong><small>${escapeHtml([item.institution,item.dates].filter(Boolean).join(' · '))}</small><p>${escapeHtml(item.details||'')}</p></div>`).join(''):'<p>Your education will appear here.</p>';}
Object.values(fields).forEach(field=>field.addEventListener('input',updatePreview));
document.querySelectorAll('.template-card').forEach(card=>card.addEventListener('click',()=>{document.querySelectorAll('.template-card').forEach(item=>item.classList.remove('active'));card.classList.add('active');paper.classList.remove('preview-modern','preview-creative');if(card.dataset.template!=='clean')paper.classList.add(`preview-${card.dataset.template}`);}));
document.querySelector('#add-experience').addEventListener('click',()=>{experiences.push({title:'',company:'',dates:'',description:''});renderRepeatingLists();updatePreview();document.querySelector('#experience-list .entry-card:last-child input')?.focus();});
document.querySelector('#add-education').addEventListener('click',()=>{education.push({qualification:'',institution:'',dates:'',details:''});renderRepeatingLists();updatePreview();document.querySelector('#education-list .entry-card:last-child input')?.focus();});
document.querySelector('#add-skill').addEventListener('click',()=>{const input=document.querySelector('#skill-input');addSkill(input.value);input.value='';input.focus();});
document.querySelector('#skill-input').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();document.querySelector('#add-skill').click();}});
document.querySelectorAll('[data-skill]').forEach(button=>button.addEventListener('click',()=>addSkill(button.dataset.skill)));
function renderStep(){steps.forEach(step=>step.classList.toggle('active',Number(step.dataset.step)===currentStep));progress.style.width=`${(currentStep/steps.length)*100}%`;stepLabel.textContent=`${currentStep} of ${steps.length}`;nextButton.innerHTML=currentStep===steps.length?'Review my CV <span class="btn-arrow">✓</span>':'Next <span class="btn-arrow">→</span>';window.scrollTo({top:0,behavior:'smooth'});}
nextButton.addEventListener('click',()=>{if(currentStep<steps.length){currentStep+=1;renderStep();}else{updatePreview();window.location.href='cv-analysis.html';}});
backButton.addEventListener('click',()=>{if(currentStep>1){currentStep-=1;renderStep();}else window.location.href='cv.html';});
renderRepeatingLists();renderSkills();renderStep();updatePreview();
