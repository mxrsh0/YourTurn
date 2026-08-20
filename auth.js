document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.querySelector("#sign-in-form");
  const createForm = document.querySelector("#create-account-form");
  const partnerForm = document.querySelector("#partner-application-form");

  const PRODUCTION_CONFIRMATION_URL = "https://yourturn.org.uk/email-confirmed.html";

  const setMessage = (form, text, type = "") => {
    const message = form?.querySelector(".form-message");
    if (!message) return;
    message.textContent = text;
    message.className = `form-message ${type}`;
  };

  const setBusy = (form, busy) => {
    const button = form?.querySelector(".auth-submit");
    if (!button) return;
    if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
    button.disabled = busy;
    button.textContent = busy ? "Please wait…" : button.dataset.defaultText;
  };

  const getJobSeekerDestination = async () => {
    const { data: profile } = await supabaseClient.from("job_seeker_profiles").select("profile_completed").maybeSingle();
    return profile?.profile_completed ? "jobs.html" : "setup-profile.html";
  };

  if (signInForm) {
    signInForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(signInForm, "");
      setBusy(signInForm, true);

      const email = signInForm.email.value.trim();
      const password = signInForm.password.value;
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(signInForm, error.message || "We could not sign you in.", "error");
        setBusy(signInForm, false);
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      if (next && /^[a-z0-9-]+\.html$/i.test(next)) {
        window.location.href = next;
        return;
      }

      const destination = await getJobSeekerDestination();
      window.location.href = destination;
    });
  }

  if (createForm) {
    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(createForm, "");

      const password = createForm.password.value;
      const confirmation = createForm.confirm_password.value;
      if (password !== confirmation) {
        setMessage(createForm, "Your passwords do not match.", "error");
        return;
      }
      if (password.length < 8) {
        setMessage(createForm, "Please use a password with at least 8 characters.", "error");
        return;
      }
      if (!createForm.terms.checked) {
        setMessage(createForm, "Please accept the Terms of Service and Privacy Policy.", "error");
        return;
      }

      setBusy(createForm, true);
      const fullName = createForm.full_name.value.trim();
      const email = createForm.email.value.trim();
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: PRODUCTION_CONFIRMATION_URL,
        },
      });

      if (error) {
        setMessage(createForm, error.message || "We could not create your account.", "error");
        setBusy(createForm, false);
        return;
      }

      createForm.reset();
      setBusy(createForm, false);

      if (data?.session) {
        window.location.href = "setup-profile.html";
        return;
      }

      window.location.href = `email-sent.html?email=${encodeURIComponent(email)}`;
    });
  }

  if (partnerForm) {
    partnerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(partnerForm, "");
      setBusy(partnerForm, true);

      const { data: sessionData } = await supabaseClient.auth.getSession();
      if (!sessionData.session) {
        window.location.href = "sign-in.html?next=partner-apply.html";
        return;
      }

      const payload = Object.fromEntries(new FormData(partnerForm).entries());
      const { data, error } = await supabaseClient.functions.invoke("partner-application", { body: payload });

      if (error) {
        setMessage(partnerForm, "We could not submit your application. Please try again.", "error");
        setBusy(partnerForm, false);
        return;
      }

      if (data?.emailSent === false) {
        setMessage(partnerForm, "Your application was saved successfully. Our team will still be able to review it.", "success");
      } else {
        setMessage(partnerForm, "Application submitted. Our team has been notified and will review your request.", "success");
      }

      partnerForm.reset();
      setBusy(partnerForm, false);
    });
  }
});