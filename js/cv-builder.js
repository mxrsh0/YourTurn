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
let selectedTemplate = 'clean';

const fields = {
  name: document.querySelector('#builder-name'), location: document.querySelector('#builder-location'),
  email: document.querySelector('#builder-email'), phone: document.querySelector('#builder-phone'),
  role: document.querySelector('#builder-role'), summary: document.querySelector('#builder-summary')
};
const previews = {
  name: document.querySelector('#preview-name'), role: document.querySelector('#preview-role'), contact: document.querySelector('#preview-contact'),
  profile: document.querySelector('#preview-profile'), skills: document.querySelector('#preview-skills'), experience: document.querySelector('#preview-experience'), education: document.querySelector('#preview-education')
};
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function renderRepeatingLists() {
  const experienceList = document.querySelector('#experience-list'); const educationList = document.querySelector('#education-list');
  if (experienceList) experienceList.innerHTML = experiences.map((item,index)=>`<div class="entry-card"><div class="entry-card-head"><strong>Experience ${index+1}</strong><button type="button" class="remove-entry" data-remove-experience="${index}">Remove</button></div><div class="field-grid"><div><label class="field-label">Role / title</label><input data-exp-field="title" data-index="${index}" value="${escapeHtml(item.title)}" placeholder="e.g. Junior Developer"></div><div><label class="field-label">Company / project</label><input data-exp-field="company" data-index="${index}" value="${escapeHtml(item.company)}" placeholder="e.g. Example Studio"></div><div><label class="field-label">Dates</label><input data-exp-field="dates" data-index="${index}" value="${escapeHtml(item.dates)}" placeholder="e.g. 2024 — Present"></div><div class="full"><label class="field-label">What did you do?</label><textarea data-exp-field="description" data-index="${index}" rows="3" placeholder="Tell us in your own words...">${escapeHtml(item.description)}</textarea></div></div></div>`).join('');
  if (educationList) educationList.innerHTML = education.map((item,index)=>`<div class="entry-card"><div class="entry-card-head"><strong>Education ${index+1}</strong><button type="button" class="remove-entry" data-remove-education="${index}">Remove</button></div><div class="field-grid"><div><label class="field-label">Qualification</label><input data-edu-field="qualification" data-index="${index}" value="${escapeHtml(item.qualification)}" placeholder="e.g. BSc Computer Science"></div><div><label class="field-label">School / institution</label><input data-edu-field="institution" data-index="${index}" value="${escapeHtml(item.institution)}" placeholder="e.g. University of Sheffield"></div><div><label class="field-label">Dates</label><input data-edu-field="dates" data-index="${index}" value="${escapeHtml(item.dates)}" placeholder="e.g. 2022 — 2025"></div><div class="full"><label class="field-label">Anything worth highlighting?</label><input data-edu-field="details" data-index="${index}" value="${escapeHtml(item.details)}" placeholder="e.g. Relevant modules, grades, awards or projects"></div></div></div>`).join('');
  document.querySelectorAll('[data-remove-experience]').forEach(b=>b.addEventListener('click',()=>{experiences.splice(Number(b.dataset.removeExperience),1);renderRepeatingLists();updatePreview();}));
  document.querySelectorAll('[data-remove-education]').forEach(b=>b.addEventListener('click',()=>{education.splice(Number(b.dataset.removeEducation),1);renderRepeatingLists();updatePreview();}));
  document.querySelectorAll('[data-exp-field]').forEach(i=>i.addEventListener('input',()=>{experiences[Number(i.dataset.index)][i.dataset.expField]=i.value;updatePreview();}));
  document.querySelectorAll('[data-edu-field]').forEach(i=>i.addEventListener('input',()=>{education[Number(i.dataset.index)][i.dataset.eduField]=i.value;updatePreview();}));
}
function renderSkills(){const list=document.querySelector('#skill-list');if(!list)return;list.innerHTML=skills.map((skill,index)=>`<span class="skill-chip">${escapeHtml(skill)} <button type="button" data-remove-skill="${index}" aria-label="Remove ${escapeHtml(skill)}">×</button></span>`).join('');document.querySelectorAll('[data-remove-skill]').forEach(b=>b.addEventListener('click',()=>{skills.splice(Number(b.dataset.removeSkill),1);renderSkills();updatePreview();}));}
function addSkill(value){const clean=String(value||'').trim();if(!clean||skills.some(s=>s.toLowerCase()===clean.toLowerCase()))return;skills.push(clean);renderSkills();updatePreview();}
function updatePreview(){
  if(previews.name)previews.name.textContent=fields.name?.value.trim()||'Your Name'; if(previews.role)previews.role.textContent=fields.role?.value.trim()||'Your target role';
  const contact=[fields.email?.value.trim(),fields.phone?.value.trim(),fields.location?.value.trim()].filter(Boolean); if(previews.contact)previews.contact.textContent=contact.join(' · ')||'Your contact details';
  if(previews.profile)previews.profile.textContent=fields.summary?.value.trim()||'Your introduction will appear here.';
  if(previews.skills)previews.skills.innerHTML=skills.length?skills.map(s=>`<span>${escapeHtml(s)}</span>`).join(''):'<span>Your skills will appear here.</span>';
  if(previews.experience)previews.experience.innerHTML=experiences.length?experiences.map(i=>`<div class="preview-entry"><strong>${escapeHtml(i.title||'Role')}</strong><small>${escapeHtml([i.company,i.dates].filter(Boolean).join(' · '))}</small><p>${escapeHtml(i.description||'Experience details will appear here.')}</p></div>`).join(''):'<p>Your experience will appear here.</p>';
  if(previews.education)previews.education.innerHTML=education.length?education.map(i=>`<div class="preview-entry"><strong>${escapeHtml(i.qualification||'Qualification')}</strong><small>${escapeHtml([i.institution,i.dates].filter(Boolean).join(' · '))}</small><p>${escapeHtml(i.details||'')}</p></div>`).join(''):'<p>Your education will appear here.</p>';
}
Object.values(fields).forEach(f=>f?.addEventListener('input',updatePreview));
document.querySelectorAll('.template-card').forEach(card=>card.addEventListener('click',()=>{document.querySelectorAll('.template-card').forEach(x=>x.classList.remove('active'));card.classList.add('active');selectedTemplate=card.dataset.template||'clean';paper?.classList.remove('preview-modern','preview-creative');if(selectedTemplate!=='clean')paper?.classList.add(`preview-${selectedTemplate}`);}));
document.querySelector('#add-experience')?.addEventListener('click',()=>{experiences.push({title:'',company:'',dates:'',description:''});renderRepeatingLists();updatePreview();document.querySelector('#experience-list .entry-card:last-child input')?.focus();});
document.querySelector('#add-education')?.addEventListener('click',()=>{education.push({qualification:'',institution:'',dates:'',details:''});renderRepeatingLists();updatePreview();document.querySelector('#education-list .entry-card:last-child input')?.focus();});
document.querySelector('#add-skill')?.addEventListener('click',()=>{const i=document.querySelector('#skill-input');addSkill(i?.value);if(i){i.value='';i.focus();}});
document.querySelector('#skill-input')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();document.querySelector('#add-skill')?.click();}});document.querySelectorAll('[data-skill]').forEach(b=>b.addEventListener('click',()=>addSkill(b.dataset.skill)));
function renderStep(){steps.forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===currentStep));if(progress)progress.style.width=`${(currentStep/Math.max(steps.length,1))*100}%`;if(stepLabel)stepLabel.textContent=`${currentStep} of ${steps.length}`;if(nextButton)nextButton.innerHTML=currentStep===steps.length?'Finish my CV <span class="btn-arrow">✓</span>':'Next <span class="btn-arrow">→</span>';window.scrollTo({top:0,behavior:'smooth'});}
async function finishCV(){
  nextButton.disabled=true; nextButton.innerHTML='Saving your CV <span class="btn-arrow">…</span>';
  if(!window.supabase?.createClient){nextButton.disabled=false;return;}
  const client=window.supabase.createClient(window.YOURTURN_SUPABASE_URL,window.YOURTURN_SUPABASE_ANON_KEY);
  const {data:{user}}=await client.auth.getUser();
  if(!user){window.location.href='signin.html';return;}
  const employerContact=[...document.querySelectorAll('input[name="employer-contact"]:checked')].map(x=>x.value);
  const yourturnContact=[...document.querySelectorAll('input[name="yourturn-contact"]:checked')].map(x=>x.value);
  try{
    const cvId=await window.YourTurnCV.save(client,user.id,{title:'My CV',template:selectedTemplate,full_name:fields.name.value.trim(),professional_title:fields.role.value.trim(),email:fields.email.value.trim(),phone:fields.phone.value.trim(),location:fields.location.value.trim(),summary:fields.summary.value.trim(),skills,target_roles:fields.role.value.split(',').map(x=>x.trim()).filter(Boolean),experience,education,employer_contact:employerContact,yourturn_contact:yourturnContact});
    sessionStorage.setItem('yourturn_active_cv_id',cvId);nextButton.innerHTML='CV saved <span class="btn-arrow">✓</span>';window.setTimeout(()=>window.location.href='cv-analysis.html',350);
  }catch(error){console.error(error);alert(`We couldn't save your CV yet. ${error.message||'Please try again.'}`);nextButton.disabled=false;nextButton.innerHTML='Finish my CV <span class="btn-arrow">✓</span>';}
}
nextButton?.addEventListener('click',()=>{if(currentStep<steps.length){currentStep+=1;renderStep();return;}updatePreview();finishCV();});
backButton?.addEventListener('click',()=>{if(currentStep>1){currentStep-=1;renderStep();}else window.location.href='cv.html';});
renderRepeatingLists();renderSkills();renderStep();updatePreview();
