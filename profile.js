document.addEventListener("DOMContentLoaded", async () => {
  const page = document.body.dataset.profilePage;
  const form = document.querySelector("form");
  const message = document.querySelector(".form-message");
  const setMessage = (text, type = "") => { if (message) { message.textContent = text; message.className = `form-message ${type}`; } };
  const sessionResult = await supabaseClient.auth.getSession();
  const session = sessionResult.data.session;
  if (!session) { window.location.href = "sign-in.html"; return; }
  const userId = session.user.id;

  const compressProfileImage = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const max = 512;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

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
      if (existing.profile_picture_url) { preview.src = existing.profile_picture_url; preview.classList.add("visible"); }
    }
    const updateAge = () => { if (!dob?.value || !age) return; const d = new Date(`${dob.value}T00:00:00`), now = new Date(); let years = now.getFullYear()-d.getFullYear(); if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) years--; age.value = years >= 0 ? years : ""; };
    dob?.addEventListener("change", updateAge); updateAge();
    picture?.addEventListener("change", () => { const file = picture.files?.[0]; if (!file) return; if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setMessage("Please choose a JPG, PNG or WebP image.", "error"); picture.value = ""; return; } if (file.size > 5*1024*1024) { setMessage("Please choose an image under 5MB.", "error"); picture.value = ""; return; } preview.src = URL.createObjectURL(file); preview.classList.add("visible"); });
    document.querySelector("#privacy-toggle")?.addEventListener("click", () => document.querySelector("#privacy-box")?.classList.toggle("open"));
    form.addEventListener("submit", async e => { e.preventDefault(); setMessage(""); const button = form.querySelector(".primary-btn"); button.disabled = true; button.textContent = "Saving…";
      const values = Object.fromEntries(new FormData(form).entries());
      let pictureData = existing?.profile_picture_url || null;
      const file = picture?.files?.[0];
      if (file) { try { pictureData = await compressProfileImage(file); } catch { setMessage("We couldn't process your profile picture. Please try another image.", "error"); button.disabled=false; button.textContent="Continue"; return; } }
      const payload = { id:userId, first_name:values.first_name, second_name:values.second_name, date_of_birth:values.date_of_birth, age:Number(values.age), ethnicity:values.ethnicity, gender:values.gender, location_text:values.location_text, right_to_work:values.right_to_work, lived_in_uk_years:values.lived_in_uk_years, can_prove_uk_residence:values.can_prove_uk_residence === "yes", profile_picture_url:pictureData, profile_completed:true };
      const saved = await supabaseClient.from("job_seeker_profiles").upsert(payload, { onConflict:"id" });
      if (saved.error) { setMessage(saved.error.message || "We couldn't save your profile.", "error"); button.disabled=false; button.textContent="Continue"; return; }
      await supabaseClient.from("profiles").update({ full_name:`${values.first_name} ${values.second_name}`.trim() }).eq("id", userId);
      window.location.href = "profile-preferences.html";
    });
  }

  if (page === "preferences") {
    const { data } = await supabaseClient.from("job_seeker_preferences").select("*").eq("user_id", userId).maybeSingle();
    if (data) for (const [key,value] of Object.entries(data)) { const el=form.elements[key]; if(el && value!==null){ el.value = value ? "1" : "0"; el.checked = value === true; } }
    document.querySelectorAll("input[type=range]").forEach(input => { const output=document.querySelector(`[data-output="${input.name}"]`); const labels={0:"No",1:"Maybe",2:"Yes"}; const render=()=>{if(output) output.textContent=labels[input.value] || input.value;}; input.addEventListener("input",render); render(); });
    form.addEventListener("submit",async e=>{e.preventDefault();setMessage("");const button=form.querySelector(".primary-btn");button.disabled=true;button.textContent="Saving…";const payload={user_id:userId};form.querySelectorAll("input[data-pref]").forEach(el=>payload[el.name]=el.value==="2"||el.value==="1");const saved=await supabaseClient.from("job_seeker_preferences").upsert(payload,{onConflict:"user_id"});if(saved.error){setMessage(saved.error.message,"error");button.disabled=false;button.textContent="Continue";return}window.location.href="profile-privacy.html";});
  }

  if (page === "privacy") {
    const { data } = await supabaseClient.from("job_seeker_privacy").select("*").eq("user_id", userId).maybeSingle();
    if (data) for (const [key,value] of Object.entries(data)) { const el=form.elements[key]; if(el && typeof value === "boolean") el.checked=value; }
    form.addEventListener("submit",async e=>{e.preventDefault();setMessage("");const button=form.querySelector(".primary-btn");button.disabled=true;button.textContent="Saving…";const payload={user_id:userId};form.querySelectorAll("input[type=checkbox][name]").forEach(el=>payload[el.name]=el.checked);const saved=await supabaseClient.from("job_seeker_privacy").upsert(payload,{onConflict:"user_id"});if(saved.error){setMessage(saved.error.message,"error");button.disabled=false;button.textContent="Finish";return}window.location.href="jobs.html";});
  }
});