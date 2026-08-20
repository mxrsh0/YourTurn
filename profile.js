document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.profilePage;
  const form = document.querySelector("form");
  const message = document.querySelector(".form-message");
  const setMessage = (text, type = "") => { if (message) { message.textContent = text; message.className = `form-message ${type}`; } };
  const sessionResult = await supabaseClient.auth.getSession();
  const session = sessionResult.data.session;
  if (!session) { window.location.href = "sign-in.html"; return; }
  const userId = session.user.id;

  if (page === "profile") {
    const { data: existing } = await supabaseClient.from("job_seeker_profiles").select("*").eq("id", userId).maybeSingle();
    if (existing?.profile_completed) { window.location.href = "profile-preferences.html"; return; }
    const dob = document.querySelector("#date_of_birth");
    const age = document.querySelector("#age");
    const picture = document.querySelector("#profile_picture");
    const preview = document.querySelector("#picture-preview");
    if (existing) {
      for (const [key, value] of Object.entries(existing)) { const el = form.elements[key]; if (el && value !== null && key !== "profile_picture_url") el.value = value; }
      if (dob?.value) { dob.readOnly = true; dob.setAttribute("aria-readonly", "true"); }
      if (existing.profile_picture_url) { const signed = await supabaseClient.storage.from("job-seeker-profiles").createSignedUrl(existing.profile_picture_url, 3600); if (!signed.error) { preview.src = signed.data.signedUrl; preview.classList.add("visible"); } }
    }
    const updateAge = () => { if (!dob?.value || !age) return; const d = new Date(`${dob.value}T00:00:00`), now = new Date(); let years = now.getFullYear()-d.getFullYear(); if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) years--; age.value = years >= 0 ? years : ""; };
    dob?.addEventListener("change", updateAge); updateAge();
    picture?.addEventListener("change", () => { const file = picture.files?.[0]; if (!file) return; if (file.size > 5*1024*1024) { setMessage("Please choose an image under 5MB.", "error"); picture.value = ""; return; } preview.src = URL.createObjectURL(file); preview.classList.add("visible"); });
    document.querySelector("#privacy-toggle")?.addEventListener("click", () => document.querySelector("#privacy-box")?.classList.toggle("open"));
    form.addEventListener("submit", async e => { e.preventDefault(); setMessage(""); const button = form.querySelector(".primary-btn"); button.disabled = true; button.textContent = "Saving…";
      const values = Object.fromEntries(new FormData(form).entries());
      let picturePath = existing?.profile_picture_url || null;
      const file = picture?.files?.[0];
      if (file) { const ext = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"; picturePath = `${userId}/profile-${Date.now()}.${ext}`; const upload = await supabaseClient.storage.from("job-seeker-profiles").upload(picturePath, file, { upsert: true, contentType: file.type }); if (upload.error) { setMessage("We couldn't save your profile picture. Please try again.", "error"); button.disabled=false; button.textContent="Continue"; return; } }
      const payload = { id:userId, first_name:values.first_name, second_name:values.second_name, date_of_birth:values.date_of_birth, age:Number(values.age), ethnicity:values.ethnicity, gender:values.gender, location_text:values.location_text, right_to_work:values.right_to_work, lived_in_uk_years:values.lived_in_uk_years, can_prove_uk_residence:values.can_prove_uk_residence === "yes", profile_picture_url:picturePath, profile_completed:true };
      const saved = await supabaseClient.from("job_seeker_profiles").upsert(payload, { onConflict:"id" });
      if (saved.error) { setMessage(saved.error.message || "We couldn't save your profile.", "error"); button.disabled=false; button.textContent="Continue"; return; }
      await supabaseClient.from("profiles").update({ full_name:`${values.first_name} ${values.second_name}`.trim() }).eq("id", userId);
      window.location.href = "profile-preferences.html";
    });
  }

  if (page === "preferences") {
    const { data } = await supabaseClient.from("job_seeker_preferences").select("*").eq("user_id", userId).maybeSingle();
    if (data) for (const [key,value] of Object.entries(data)) { const el=form.elements[key]; if(el && value!==null){ el.value = value ? "1" : "0"; el.checked = value === true; } }
    document.querySelectorAll("input[type=range]").forEach(input => { const output=document.querySelector(`[data-output="${input.name}"]`); const labels={0:"No",1:"Maybe",2:"Yes"}; const render=()=>{input.value=input.value; if(output) output.textContent=labels[input.value] || input.value;}; input.addEventListener("input",render); render(); });
    form.addEventListener("submit",async e=>{e.preventDefault();setMessage("");const button=form.querySelector(".primary-btn");button.disabled=true;button.textContent="Saving…";const payload={user_id:userId};form.querySelectorAll("input[data-pref]").forEach(el=>payload[el.name]=el.value==="2"||el.value==="1");const saved=await supabaseClient.from("job_seeker_preferences").upsert(payload,{onConflict:"user_id"});if(saved.error){setMessage(saved.error.message,"error");button.disabled=false;button.textContent="Continue";return}window.location.href="profile-privacy.html";});
  }

  if (page === "privacy") {
    const { data } = await supabaseClient.from("job_seeker_privacy").select("*").eq("user_id", userId).maybeSingle();
    if (data) for (const [key,value] of Object.entries(data)) { const el=form.elements[key]; if(el && typeof value === "boolean") el.checked=value; }
    form.addEventListener("submit",async e=>{e.preventDefault();setMessage("");const button=form.querySelector(".primary-btn");button.disabled=true;button.textContent="Saving…";const payload={user_id:userId};form.querySelectorAll("input[type=checkbox][name]").forEach(el=>payload[el.name]=el.checked);const saved=await supabaseClient.from("job_seeker_privacy").upsert(payload,{onConflict:"user_id"});if(saved.error){setMessage(saved.error.message,"error");button.disabled=false;button.textContent="Finish";return}window.location.href="jobs.html";});
  }
});