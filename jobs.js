document.addEventListener("DOMContentLoaded", async () => {
  const list = document.querySelector("#job-list");
  const count = document.querySelector("#results-count");
  const locationInput = document.querySelector("#job-location");
  const distance = document.querySelector("#job-distance");
  const distanceValue = document.querySelector("#distance-value");
  const locationStatus = document.querySelector("#location-status");
  const sourceChecks = [...document.querySelectorAll("input[name=source]")];
  const contract = document.querySelector("#contract-type");
  const search = document.querySelector("#job-keywords");
  const sort = document.querySelector("#job-sort");
  let jobs = [];
  let userCoordinates = null;
  let typedCoordinates = null;

  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[char]));
  const milesBetween = (a,b) => { const r=3958.7613, toRad=n=>n*Math.PI/180, dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon); const x=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2; return r*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); };
  const sourceName = job => job.partner_id ? "YourTurn Partner" : (job.source_name || "Employer / Agency");
  const matchesSource = job => { const selected=sourceChecks.filter(x=>x.checked).map(x=>x.value); if(!selected.length)return true; const source=sourceName(job).toLowerCase(); return selected.some(x=>x==="partner" ? !!job.partner_id : source.includes(x)); };
  const matchesLocation = job => { const term=locationInput.value.trim().toLowerCase(); if(term && !(job.location_text||"").toLowerCase().includes(term)) return false; const centre=userCoordinates||typedCoordinates; const radius=Number(distance.value); if(centre && job.latitude!=null && job.longitude!=null && radius < 100) return milesBetween(centre,{lat:Number(job.latitude),lon:Number(job.longitude)}) <= radius; return true; };
  const render = () => {
    const term=search.value.trim().toLowerCase();
    let filtered=jobs.filter(job => job.is_active!==false && matchesSource(job) && matchesLocation(job) && (!contract.value || (job.employment_type||"").toLowerCase()===contract.value) && (!term || `${job.title} ${job.employer_name} ${job.description} ${job.location_text}`.toLowerCase().includes(term)));
    if(sort.value==="salary") filtered.sort((a,b)=>(Number(b.salary_max||b.salary_min||0)-Number(a.salary_max||a.salary_min||0))); else if(sort.value==="newest") filtered.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    count.textContent=`${filtered.length} ${filtered.length===1?"job":"jobs"}`;
    if(!filtered.length){list.innerHTML='<div class="empty-state"><h2>No matching jobs yet</h2><p>Try widening your distance, changing the contract type, or clearing a filter.</p></div>';return;}
    list.innerHTML=filtered.map(job=>{const salary=job.salary_min||job.salary_max?`£${Number(job.salary_min||job.salary_max).toLocaleString()}${job.salary_max&&job.salary_max!==job.salary_min?`–£${Number(job.salary_max).toLocaleString()}`:""}${job.salary_period?` / ${escapeHtml(job.salary_period)}`:""}`:"Salary not specified";const dist=(userCoordinates||typedCoordinates)&&job.latitude!=null?` · ${milesBetween(userCoordinates||typedCoordinates,{lat:Number(job.latitude),lon:Number(job.longitude)}).toFixed(1)} mi`:"";return `<article class="job-card"><div class="job-top"><div><h2 class="job-title">${escapeHtml(job.title)}</h2><p class="job-employer">${escapeHtml(job.employer_name)}</p></div></div><div class="job-meta"><span class="job-chip">${escapeHtml(job.employment_type||"Contract type not specified")}</span><span class="job-chip">${escapeHtml(job.location_text||"Location not specified")}${dist}</span><span class="job-chip">${escapeHtml(salary)}</span></div><p class="job-description">${escapeHtml(job.description||"No description provided.")}</p><div class="job-footer"><span class="job-source">Source: ${escapeHtml(sourceName(job))}</span><a class="job-apply" href="${escapeHtml(job.application_url||job.source_url||"#")}" target="_blank" rel="noopener noreferrer">View & apply</a></div></article>`}).join("");
  };
  const geocode = async query => { const response=await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=gb&limit=1&q=${encodeURIComponent(query)}`,{headers:{Accept:"application/json"}}); if(!response.ok)throw new Error("Geocoding failed"); const data=await response.json(); if(!data[0])throw new Error("Location not found"); return {lat:Number(data[0].lat),lon:Number(data[0].lon),label:data[0].display_name}; };

  const { data: sessionData } = await supabaseClient.auth.getSession();
  if(!sessionData.session){window.location.href="sign-in.html";return;}
  const { data: profile } = await supabaseClient.from("job_seeker_profiles").select("profile_completed,location_text").eq("id",sessionData.session.user.id).maybeSingle();
  if(!profile?.profile_completed){window.location.href="setup-profile.html";return;}
  if(profile.location_text && !locationInput.value) locationInput.value=profile.location_text;

  const { data, error } = await supabaseClient.from("jobs").select("*").eq("is_active",true).order("created_at",{ascending:false});
  if(error){list.innerHTML='<div class="empty-state"><h2>Jobs could not be loaded</h2><p>Please refresh the page and try again.</p></div>';return;}
  jobs=data||[]; render();

  document.querySelector("#use-location")?.addEventListener("click",()=>{
    if(!navigator.geolocation){locationStatus.textContent="Location services are not supported by this browser.";return;}
    locationStatus.textContent="Requesting your location…";
    navigator.geolocation.getCurrentPosition(position=>{userCoordinates={lat:position.coords.latitude,lon:position.coords.longitude};typedCoordinates=null;locationStatus.textContent="Using your current location. Your browser controls the permission request.";render();},error=>{const messages={1:"Location permission was denied. You can allow it in your browser settings and try again.",2:"Your location could not be determined. Please try again or enter a town, village or postcode.",3:"Location request timed out. Please try again."};locationStatus.textContent=messages[error.code]||"We couldn't access your location.";},{enableHighAccuracy:true,timeout:10000,maximumAge:300000});
  });
  document.querySelector("#use-search-location")?.addEventListener("click",async()=>{const value=locationInput.value.trim();if(!value){locationStatus.textContent="Enter a postcode, town or village first.";return;}locationStatus.textContent="Finding that location…";try{typedCoordinates=await geocode(value);userCoordinates=null;locationStatus.textContent=`Using ${typedCoordinates.label}.`;render();}catch{locationStatus.textContent="We couldn't find that location. Try a more specific postcode, town or village.";}});
  const controls=[search,contract,...sourceChecks,sort];controls.forEach(control=>control?.addEventListener("input",render));
  distance.addEventListener("input",()=>{distanceValue.textContent=`${distance.value} miles`;render();});
  document.querySelector("#reset-filters")?.addEventListener("click",()=>{search.value="";contract.value="";sourceChecks.forEach(x=>x.checked=false);distance.value=25;distanceValue.textContent="25 miles";locationInput.value=profile.location_text||"";typedCoordinates=null;userCoordinates=null;locationStatus.textContent="No location selected.";sort.value="newest";render();});
});