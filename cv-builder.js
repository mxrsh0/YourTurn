document.addEventListener('DOMContentLoaded', async () => {
  const choice = document.querySelector('#cv-choice');
  const workspace = document.querySelector('#cv-workspace');
  const fileInput = document.querySelector('#cv-file');
  const analysisBox = document.querySelector('#upload-analysis');
  const analysisText = document.querySelector('#analysis-text');
  const preview = document.querySelector('#cv-preview');
  const state = document.querySelector('#save-state');
  const fields = ['full-name','target-role','cv-email','cv-phone','cv-location','summary','skills','achievements','interests','template','accent'];
  let data = JSON.parse(localStorage.getItem('yourturn_cv') || '{}');
  let experience = data.experience || [];
  let education = data.education || [];

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const get = id => document.getElementById(id)?.value || '';
  const save = () => {
    data = Object.fromEntries(fields.map(id => [id, get(id)]));
    data.experience = experience; data.education = education;
    localStorage.setItem('yourturn_cv', JSON.stringify(data));
    state.textContent = 'Saved in this browser';
  };
  const hydrate = () => fields.forEach(id => { if(document.getElementById(id) && data[id] != null) document.getElementById(id).value = data[id]; });

  const renderRepeats = () => {
    document.querySelector('#experience-list').innerHTML = experience.map((item,i) => `<div class="repeat-card"><div class="repeat-head"><strong>Experience ${i+1}</strong><button class="remove-btn" data-remove-exp="${i}" type="button">Remove</button></div><label>Job title<input data-exp="title" data-i="${i}" value="${esc(item.title)}"></label><div class="two-col"><label>Employer<input data-exp="employer" data-i="${i}" value="${esc(item.employer)}"></label><label>Dates<input data-exp="dates" data-i="${i}" placeholder="2024 – 2026" value="${esc(item.dates)}"></label></div><label>What did you do?<textarea data-exp="text" data-i="${i}" rows="3" placeholder="Responsibilities, results and useful skills.">${esc(item.text)}</textarea></label></div>`).join('');
    document.querySelector('#education-list').innerHTML = education.map((item,i) => `<div class="repeat-card"><div class="repeat-head"><strong>Qualification ${i+1}</strong><button class="remove-btn" data-remove-edu="${i}" type="button">Remove</button></div><label>Qualification<input data-edu="title" data-i="${i}" placeholder="GCSE English, Level 2, BTEC, degree…" value="${esc(item.title)}"></label><div class="two-col"><label>School / college / provider<input data-edu="provider" data-i="${i}" value="${esc(item.provider)}"></label><label>Dates<input data-edu="dates" data-i="${i}" value="${esc(item.dates)}"></label></div></div>`).join('');
  };

  const renderPreview = () => {
    const skills = get('skills').split(',').map(s => s.trim()).filter(Boolean);
    const expHtml = experience.filter(x=>x.title||x.employer||x.text).map(x => `<div class="cv-item"><div class="cv-item-head"><div><div class="cv-item-title">${esc(x.title)}</div><div class="cv-item-sub">${esc(x.employer)}</div></div><div class="cv-item-date">${esc(x.dates)}</div></div><p class="cv-item-text">${esc(x.text)}</p></div>`).join('');
    const eduHtml = education.filter(x=>x.title||x.provider).map(x => `<div class="cv-item"><div class="cv-item-head"><div><div class="cv-item-title">${esc(x.title)}</div><div class="cv-item-sub">${esc(x.provider)}</div></div><div class="cv-item-date">${esc(x.dates)}</div></div></div>`).join('');
    const contact = [get('cv-email'),get('cv-phone'),get('cv-location')].filter(Boolean).map(esc).join(' · ');
    preview.className = `cv-paper template-${get('template') || 'minimal'} accent-${get('accent') || 'navy'}`;
    preview.innerHTML = `<header class="cv-head"><h1>${esc(get('full-name') || 'Your Name')}</h1><p class="cv-role">${esc(get('target-role') || 'Target role')}</p><div class="cv-contact">${contact || 'email@example.com · 07xxx xxx xxx · UK'}</div></header>${get('summary') ? `<section class="cv-section"><h2>Profile</h2><p class="cv-summary">${esc(get('summary'))}</p></section>` : ''}${expHtml ? `<section class="cv-section"><h2>Experience</h2>${expHtml}</section>` : ''}${eduHtml ? `<section class="cv-section"><h2>Education & Qualifications</h2>${eduHtml}</section>` : ''}${skills.length ? `<section class="cv-section"><h2>Skills</h2><div class="cv-skills">${skills.map(s=>`<span class="cv-skill">${esc(s)}</span>`).join('')}</div></section>` : ''}${get('achievements') ? `<section class="cv-section"><h2>Achievements</h2><p class="cv-item-text">${esc(get('achievements'))}</p></section>` : ''}${get('interests') ? `<section class="cv-section"><h2>Interests</h2><p class="cv-item-text">${esc(get('interests'))}</p></section>` : ''}`;
    save();
  };

  const start = () => { choice.hidden = true; workspace.hidden = false; hydrate(); renderRepeats(); renderPreview(); window.scrollTo({top:0,behavior:'smooth'}); };
  document.querySelector('#start-new').addEventListener('click', () => { if(!data.fullName && !data['full-name']) data={}; start(); });
  document.querySelector('#upload-existing').addEventListener('click', () => fileInput.click());
  document.querySelector('#back-choice').addEventListener('click', () => { workspace.hidden = true; choice.hidden = false; });
  fileInput.addEventListener('change', async () => {
    const file=fileInput.files[0]; if(!file)return;
    start();
    analysisBox.hidden=false; analysisText.textContent='Reading your CV…';
    try {
      let text='';
      if(file.type==='text/plain' || file.name.toLowerCase().endsWith('.txt')) text=await file.text();
      else if(file.name.toLowerCase().endsWith('.docx') && window.mammoth) { const result=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()}); text=result.value; }
      else if(file.name.toLowerCase().endsWith('.pdf') && window.pdfjsLib) { const pdf=await window.pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise; for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p);const content=await page.getTextContent();text += content.items.map(x=>x.str).join(' ')+'\n';} }
      else { analysisText.textContent='Your file was uploaded, but this browser could not read its text. You can still build a fresh CV here, or save the file as PDF/text and upload it again for the improvement check.'; return; }
      const lower=text.toLowerCase(); const checks=[];
      if(!/education|qualification|gcse|college|university|btec/.test(lower)) checks.push('Add an Education & Qualifications section.');
      if(!/experience|employment|work history|volunteer/.test(lower)) checks.push('Add clear work experience, volunteering or project experience.');
      if(!/skills|competenc/.test(lower)) checks.push('Add a focused Skills section using job-relevant keywords.');
      if(!/email|@/.test(lower)) checks.push('Add a professional email address.');
      if(!/phone|07\d{3}|01\d{3}|02\d{3}/.test(lower)) checks.push('Consider adding a phone number.');
      if(/date of birth|dob|age[:\s]/.test(lower)) checks.push('Consider removing your date of birth or age; it is normally unnecessary on a UK CV.');
      if(text.trim().split(/\s+/).length < 180) checks.push('Your CV looks quite short. Add relevant achievements, responsibilities or projects where appropriate.');
      if(text.trim().split(/\s+/).length > 900) checks.push('Your CV is quite long. Consider tightening older or less relevant details.');
      analysisText.textContent=checks.length ? checks.join(' ') : 'Your CV has the core sections we look for. Tailor the profile and experience to each job and keep formatting clear and consistent.';
    } catch(e) { analysisText.textContent='We could not analyse this file in the browser. You can still use the builder to recreate or improve it manually.'; }
  });

  document.querySelector('#add-experience').addEventListener('click',()=>{experience.push({});renderRepeats();renderPreview();});
  document.querySelector('#add-education').addEventListener('click',()=>{education.push({});renderRepeats();renderPreview();});
  document.addEventListener('input', e => { if(e.target.matches('[data-exp]')) { experience[Number(e.target.dataset.i)][e.target.dataset.exp]=e.target.value; renderPreview(); } if(e.target.matches('[data-edu]')) { education[Number(e.target.dataset.i)][e.target.dataset.edu]=e.target.value; renderPreview(); } if(e.target.closest('.cv-form') && !e.target.matches('[data-exp],[data-edu]')) renderPreview(); });
  document.addEventListener('click', e => { if(e.target.dataset.removeExp){experience.splice(Number(e.target.dataset.removeExp),1);renderRepeats();renderPreview();} if(e.target.dataset.removeEdu){education.splice(Number(e.target.dataset.removeEdu),1);renderRepeats();renderPreview();} });
  document.querySelector('#print-cv').addEventListener('click',()=>{renderPreview();window.print();});
  document.querySelector('#close-analysis').addEventListener('click',()=>analysisBox.hidden=true);

  if(window.mammoth){} else { const s=document.createElement('script'); s.src='https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js'; document.head.appendChild(s); }
  if(window.pdfjsLib){} else { const s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'; s.onload=()=>{window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';}; document.head.appendChild(s); }
});