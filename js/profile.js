(() => {
  "use strict";
  const C = window.CHAT_CONFIG,
    $ = (i) => document.getElementById(i),
    S = sessionStorage;
  const CAT = {
    web: "برمجة وتطوير مواقع",
    design: "تصميم",
    marketing: "تسويق رقمي",
    video: "مونتاج وفيديو",
    writing: "كتابة وترجمة",
    other: "خدمة أخرى",
  };
  const ST = {
    pending: "ملفك قيد المراجعة وسيظهر للجميع بعد الموافقة.",
    approved: "ملفك منشور للجميع.",
    rejected: "تعذّر نشر ملفك. عدّله وأعد الإرسال.",
  };
  let ses = null,
    me = null;
  try {
    ses = JSON.parse(S.getItem("sb") || "null");
  } catch (e) {}
  const save = (s) => {
    ses = s;
    s ? S.setItem("sb", JSON.stringify(s)) : S.removeItem("sb");
  };
  const setSes = (d) => save({ a: d.access_token, r: d.refresh_token });
  const opt = (v, t) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    return o;
  };

  async function refresh() {
    if (!ses || !ses.r) {
      save(null);
      return;
    }
    try {
      const r = await fetch(C.url + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { apikey: C.key, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: ses.r }),
      });
      if (!r.ok) throw 0;
      setSes(await r.json());
    } catch (e) {
      save(null);
    }
  }
  async function api(path, o = {}, retry = true) {
    const h = {
      apikey: C.key,
      "Content-Type": "application/json",
      ...(o.headers || {}),
    };
    if (ses) h.Authorization = "Bearer " + ses.a;
    const r = await fetch(C.url + path, { ...o, headers: h });
    if (r.status === 401 && retry) {
      await refresh();
      return api(path, o, false);
    }
    if (!r.ok) throw new Error(r.status);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }
  const ui = () => {
    $("lg").hidden = !!ses;
    $("fm").hidden = !ses;
  };
  const sync = () => {
    const f = $("rl").value === "freelancer";
    $("frf").hidden = !f;
    $("pc").required = f;
    $("bio").required = f;
  };

  async function init() {
    if (!C || /YOUR-/.test(C.url)) {
      $("lg").hidden = $("fm").hidden = true;
      $("nc").hidden = false;
      return;
    }
    ui();
    if (!ses) return;
    try {
      me = (await api("/auth/v1/user")).id;
      const r = await api(
        `/rest/v1/profiles?select=display_name,role,category,bio,portfolio_url,status&user_id=eq.${me}`,
      );
      const p = r[0];
      $("st").textContent = p
        ? ST[p.status]
        : "أهلًا بك! أكمل ملفك أولًا ليتمكن الآخرون من التعرف عليك.";
      if (p) {
        $("pn").value = p.display_name;
        $("rl").value = p.role;
        $("pc").value = p.category || "";
        $("bio").value = p.bio || "";
        $("pu").value = p.portfolio_url || "";
      }
      sync();
      $("pub").hidden = !(p && p.status === "approved");
      if (p && p.status === "approved")
        $("pub").href = "freelancer.html?id=" + me;
    } catch (e) {
      save(null);
      ui();
    }
  }

  $("pc").append(opt("", "اختر"));
  Object.keys(CAT).forEach((k) => $("pc").append(opt(k, CAT[k])));
  $("rl").onchange = sync;

  const doAuth = async (kind) => {
    const msg = $("lm"),
      email = $("em").value.trim(),
      pw = $("pw").value;
    if (!email || pw.length < 8) {
      msg.textContent = "اكتب البريد وكلمة مرور من 8 أحرف على الأقل.";
      return;
    }
    msg.textContent = "جارٍ التحقق...";
    try {
      let d = await window.AUTH[kind](C, email, pw);
      if (!d.access_token && kind === "signup") {
        try {
          d = await window.AUTH.login(C, email, pw);
        } catch (x2) {}
      }
      if (!d.access_token) {
        msg.textContent = "تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.";
        return;
      }
      setSes(d);
      $("pw").value = "";
      msg.textContent = "";
      init();
    } catch (x) {
      msg.textContent =
        kind === "signup"
          ? "تعذّر إنشاء الحساب. ربما الحساب موجود، جرّب الدخول."
          : "البريد أو كلمة المرور غير صحيحة. لو هذه أول مرة، اضغط «إنشاء حساب جديد».";
    }
  };
  $("lf").onsubmit = (e) => {
    e.preventDefault();
    doAuth("login");
  };
  $("su").onclick = () => doAuth("signup");

  $("pf").onsubmit = async (e) => {
    e.preventDefault();
    const b = e.target.querySelector("button[type=submit]"),
      m = $("pm"),
      f = $("rl").value === "freelancer";
    const u = $("pu").value.trim(),
      bio = $("bio").value.trim();
    if (f && u && !/^https:\/\/\S{4,200}$/.test(u)) {
      m.textContent = "رابط المعرض لازم يبدأ بـ https://";
      return;
    }
    if (bio && bio.length < 20) {
      m.textContent = "النبذة 20 حرفًا على الأقل.";
      return;
    }
    b.disabled = true;
    const body = {
      user_id: me,
      display_name: $("pn").value.trim(),
      role: $("rl").value,
      category: f ? $("pc").value : null,
      bio: bio || null,
      portfolio_url: f && u ? u : null,
      status: "pending",
    };
    try {
      await api("/rest/v1/profiles?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify(body),
      });
      m.textContent =
        "وصلنا ملفك وسيظهر بعد المراجعة. يمكنك الآن العودة للمجتمع.";
      await init();
    } catch (x) {
      m.textContent = "تعذّر الحفظ. راجع الحقول وحاول مرة أخرى.";
    }
    b.disabled = false;
  };
  $("out").onclick = () => {
    save(null);
    me = null;
    ui();
  };
  init();
})();
