// YourTurn sign-in flow
(function () {
  const form = document.getElementById('signin-form');
  const status = document.getElementById('signin-status');
  const button = document.getElementById('signin-submit');

  function setStatus(message, type) {
    status.textContent = message || '';
    status.className = 'auth-status' + (type ? ' ' + type : '');
  }

  if (!window.supabase || !window.YOURTURN_SUPABASE_URL || !window.YOURTURN_SUPABASE_ANON_KEY) {
    setStatus('YourTurn authentication is not ready yet. Please refresh and try again.', 'error');
    return;
  }

  const client = window.supabase.createClient(
    window.YOURTURN_SUPABASE_URL,
    window.YOURTURN_SUPABASE_ANON_KEY
  );

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    setStatus('', '');
    button.disabled = true;
    button.innerHTML = 'Signing in <span class="btn-arrow">…</span>';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      let message = error.message;
      if (/invalid login credentials/i.test(message)) {
        message = 'That email or password is incorrect. Check your details and try again.';
      }
      setStatus(message, 'error');
      button.disabled = false;
      button.innerHTML = 'Sign in <span class="btn-arrow">→</span>';
      return;
    }

    setStatus('Signed in. Taking you to your profile…', 'success');
    window.setTimeout(function () {
      window.location.href = 'profile.html';
    }, 350);
  });
})();
