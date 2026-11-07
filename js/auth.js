(() => {
  const post = async (C, path, body) => {
    const r = await fetch(C.url + path, {
      method: "POST",
      headers: { apikey: C.key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  };
  window.AUTH = {
    login: (C, email, password) =>
      post(C, "/auth/v1/token?grant_type=password", { email, password }),
    signup: (C, email, password) =>
      post(C, "/auth/v1/signup", { email, password }),
  };
})();
