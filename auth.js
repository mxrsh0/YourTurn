document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.querySelector("#sign-in-form");
  const createForm = document.querySelector("#create-account-form");
  const partnerForm = document.querySelector("#partner-application-form");
  const message = document.querySelector(".form-message");

  const setMessage = (text, type = "") => {
    if (!message) return;
    message.textContent = text;
    message.className = `form-message ${type}`;
  };

  const setBusy = (form, busy) => {
    const button = form?.querySelector(".auth-submit");
    if (!button) return;
    button.disabled = busy;
    button.textContent = busy ? "Please wait…" : button.dataset.defaultText;
  };

  if (signInForm) {
    const button = signInForm.querySelector(".auth-submit");
    button.dataset.defaultText = button.textContent;

    signInForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage("");
      setBusy(signInForm, true);

      const email = signInForm.email.value.trim();
      const password = signInForm.password.value;
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message || "We could not sign you in.", "error");
        setBusy(signInForm, false);
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next && /^[a-z0-9-]+\.html$/i.test(next) ? next : "jobs.html";
      window.location.href = safeNext;
    });
  }

  if (createForm) {
    const button = createForm.querySelector(".auth-submit");
    button.dataset.defaultText = button.textContent;

    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage("");

      const password = createForm.password.value;
      const confirmation = createForm.confirm_password.value;
      if (password !== confirmation) {
        setMessage("Your passwords do not match.", "error");
        return;
      }
      if (password.length < 8) {
        setMessage("Please use a password with at least 8 characters.", "error");
        return;
      }
      if (!createForm.terms.checked) {
        setMessage("Please accept the Terms of Service and Privacy Policy.", "error");
        return;
      }

      setBusy(createForm, true);
      const fullName = createForm.full_name.value.trim();
      const email = createForm.email.value.trim();
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        setMessage(error.message || "We could not create your account.", "error");
        setBusy(createForm, false);
        return;
      }

      setMessage("Account created. Check your email if verification is required, then sign in.", "success");
      createForm.reset();
      setBusy(createForm, false);
    });
  }

  if (partnerForm) {
    const button = partnerForm.querySelector(".auth-submit");
    button.dataset.defaultText = button.textContent;

    (async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (!data.session) {
        window.location.href = "partner-login.html?next=partner-apply.html";
      }
    })();

    partnerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage("");
      setBusy(partnerForm, true);

      const { data: sessionData } = await supabaseClient.auth.getSession();
      if (!sessionData.session) {
        window.location.href = "partner-login.html?next=partner-apply.html";
        return;
      }

      const payload = Object.fromEntries(new FormData(partnerForm).entries());
      const { data, error } = await supabaseClient.functions.invoke("partner-application", {
        body: payload,
      });

      if (error) {
        setMessage("We could not submit your application. Please try again.", "error");
        setBusy(partnerForm, false);
        return;
      }

      if (data?.emailSent === false) {
        setMessage("Your application was saved successfully. Our notification service is currently being configured, but your application is still in the review queue.", "success");
      } else {
        setMessage("Application submitted. Our team has been notified and will review your request.", "success");
      }

      partnerForm.reset();
      setBusy(partnerForm, false);
    });
  }
});
