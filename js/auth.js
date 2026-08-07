(() => {
  const form = document.querySelector('#account-form');
  const status = document.querySelector('#auth-status');
  const submitButton = document.querySelector('#account-submit');

  if (!form || !status || !submitButton) return;

  function setStatus(message, type = '') {
    status.textContent = message;
    status.className = `auth-status ${type}`.trim();
  }

  function isConfigured() {
    return Boolean(
      window.YOURTURN_SUPABASE_URL &&
      window.YOURTURN_SUPABASE_ANON_KEY &&
      !window.YOURTURN_SUPABASE_URL.includes('PASTE_') &&
      !window.YOURTURN_SUPABASE_ANON_KEY.includes('PASTE_')
    );
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!isConfigured()) {
      setStatus('YourTurn is ready for Supabase, but the browser configuration still needs to be added. This is a setup step — no password has been sent anywhere.', 'error');
      return;
    }

    if (!window.supabase?.createClient) {
      setStatus('The Supabase client could not load. Please refresh and try again.', 'error');
      return;
    }

    const firstName = document.querySelector('#first-name')?.value.trim() || '';
    const email = document.querySelector('#email')?.value.trim() || '';
    const password = document.querySelector('#password')?.value || '';
    const goal = document.querySelector('#goal')?.value.trim() || '';

    if (!firstName || !email || !password) {
      setStatus('Please fill in your name, email and password to create your account.', 'error');
      return;
    }

    if (password.length < 8) {
      setStatus('Your password needs to be at least 8 characters.', 'error');
      return;
    }

    submitButton.disabled = true;
    submitButton.classList.add('loading');
    setStatus('Creating your secure YourTurn account…');

    try {
      const client = window.supabase.createClient(
        window.YOURTURN_SUPABASE_URL,
        window.YOURTURN_SUPABASE_ANON_KEY
      );

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            target_role: goal
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Your account could not be created.');

      // The database trigger creates the profile securely on auth.users insert.
      // This avoids requiring an authenticated browser session during signup.
      const destination = data.session ? 'tutorial.html' : 'account-confirmation.html';
      window.location.href = destination;
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Something went wrong while creating your account.', 'error');
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
    }
  });
})();
