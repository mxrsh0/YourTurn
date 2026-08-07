// YourTurn profile onboarding
(function () {
  const form = document.getElementById('profile-form');
  const status = document.getElementById('profile-status');
  const submit = document.getElementById('profile-submit');
  const signout = document.getElementById('signout');

  if (!form || !window.supabase?.createClient) return;

  const client = window.supabase.createClient(
    window.YOURTURN_SUPABASE_URL,
    window.YOURTURN_SUPABASE_ANON_KEY
  );

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.className = `auth-status ${type}`.trim();
  };

  async function loadProfile() {
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      window.location.href = 'signin.html';
      return;
    }

    const { data, error } = await client
      .from('profiles')
      .select('full_name,location,phone,preferred_contact_method,target_roles,career_summary')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      setStatus(error.message, 'error');
      return;
    }

    if (!data) return;
    document.getElementById('full-name').value = data.full_name || '';
    document.getElementById('location').value = data.location || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('roles').value = (data.target_roles || []).join(', ');
    document.getElementById('summary').value = data.career_summary || '';
    document.getElementById('contact').value = data.preferred_contact_method || 'email';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    submit.disabled = true;
    setStatus('Saving your profile…');

    const roles = document.getElementById('roles').value
      .split(',').map(v => v.trim()).filter(Boolean);

    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      window.location.href = 'signin.html';
      return;
    }

    const { error } = await client.from('profiles').update({
      full_name: document.getElementById('full-name').value.trim(),
      location: document.getElementById('location').value.trim(),
      phone: document.getElementById('phone').value.trim() || null,
      preferred_contact_method: document.getElementById('contact').value,
      target_roles: roles,
      career_summary: document.getElementById('summary').value.trim() || null
    }).eq('id', user.id);

    if (error) {
      setStatus(error.message, 'error');
      submit.disabled = false;
      return;
    }

    await client.from('profiles').update({ onboarding_completed: true }).eq('id', user.id);
    setStatus('Saved. Next, we'll build your CV profile.', 'success');
    setTimeout(() => { window.location.href = 'cv.html'; }, 500);
  });

  if (signout) signout.addEventListener('click', async () => {
    await client.auth.signOut();
    window.location.href = 'index.html';
  });

  loadProfile();
})();
