(() => {
  "use strict";
  const C = window.CHAT_CONFIG,
    $ = (i) => document.getElementById(i),
    S = sessionStorage;
  let ses = null,
    me = null,
    rows = [],
    ff = "";
  try {
    ses = JSON.parse(S.getItem("sb") || "null");
  } catch (e) {}
  const save = (s) => {
    ses = s;
    s ? S.setItem("sb", JSON.stringify(s)) : S.removeItem("sb");
  };
  const setSes = (d) => save({ a: d.access_token, r: d.refresh_token });
  const E = (t, c, x) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (x != null) e.textContent = x;
    return e;
  };
  const opt = (v, t) => {
    const o = E("option", "", t);
    o.value = v;
    return o;
  };

  if (location.hash.includes("access_token")) {
    const p = new URLSearchParams(location.hash.slice(1));
    if (p.get("access_token"))
      setSes({
        access_token: p.get("access_token"),
        refresh_token: p.get("refresh_token"),
      });
    history.replaceState(null, "", location.pathname);
  }
  if (location.hash.includes("error_code")) {
    history.replaceState(null, "", location.pathname);
    $("lm").textContent =
      "الرابط انتهت صلاحيته أو استُخدم من قبل. اطلب رمز دخول جديد.";
  }
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
      ui();
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

  const avg = (a) => a.reduce((s, x) => s + x.rating, 0) / (a.length || 1);
  function starEl(n) {
    const s = E(
      "span",
      "stars",
      "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n)),
    );
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", "التقييم " + +n.toFixed(1) + " من 5");
    return s;
  }
  function card(r) {
    const a = E("article", "c"),
      h = E("p", "meta");
    h.append(
      starEl(r.rating),
      " " +
        r.author_name +
        " · " +
        new Date(r.created_at).toLocaleDateString(
          window.LOC ? window.LOC() : "ar-EG",
        ),
    );
    a.append(h);
    if (r.kind === "freelancer") {
      const t = E("p", "meta");
      const l = E("a", "flink", r.target_name);
      if (r.freelancer_id)
        l.href = "freelancer.html?id=" + encodeURIComponent(r.freelancer_id);
      t.append(E("span", "tag", "مشروع مكتمل عبر شبكة"), " المستقل: ", l);
      a.append(t);
    }
    const p = E("p", "", r.comment);
    p.dir = "auto";
    a.append(p);
    return a;
  }
  function render() {
    const site = rows.filter((r) => r.kind === "site"),
      fr = rows.filter((r) => r.kind === "freelancer");
    const ss = $("ss");
    ss.textContent = "";
    if (site.length)
      ss.append(
        starEl(avg(site)),
        " " + avg(site).toFixed(1) + " / 5 · " + site.length + " تقييم",
      );
    else ss.textContent = "لا توجد تقييمات منشورة للموقع بعد.";
    const sl = $("sl");
    sl.textContent = "";
    site.forEach((r) => sl.append(card(r)));
    const g = {};
    fr.forEach((r) =>
      (g[r.freelancer_id || r.target_name] =
        g[r.freelancer_id || r.target_name] || []).push(r),
    );
    const names = Object.keys(g).sort((a, b) => avg(g[b]) - avg(g[a]));
    const ch = $("chips");
    ch.textContent = "";
    if (names.length)
      [""].concat(names).forEach((n) => {
        const b = E(
          "button",
          "pill",
          n
            ? g[n][0].target_name +
                " ★" +
                avg(g[n]).toFixed(1) +
                " (" +
                g[n].length +
                ")"
            : "الكل",
        );
        b.type = "button";
        b.setAttribute("aria-pressed", String(ff === n));
        b.onclick = () => {
          ff = n;
          render();
        };
        ch.append(b);
      });
    const fl = $("fl");
    fl.textContent = "";
    const list = fr.filter(
      (r) => !ff || (r.freelancer_id || r.target_name) === ff,
    );
    if (!list.length)
      fl.append(E("p", "tk", "لا توجد تقييمات منشورة للمستقلين بعد."));
    list.forEach((r) => fl.append(card(r)));
  }

  async function loadMine() {
    if (!ses) return;
    try {
      me = (await api("/auth/v1/user")).id;
      const [cs, mine] = await Promise.all([
        api(
          "/rest/v1/conversations?select=id,ref,freelancer_name,client_id&status=eq.completed",
        ),
        api(
          `/rest/v1/reviews?select=kind,conversation_id,status&author_id=eq.${me}`,
        ),
      ]);
      const done = new Set(
        mine
          .filter((m) => m.kind === "freelancer")
          .map((m) => m.conversation_id),
      );
      const el = cs.filter(
        (c) => c.client_id === me && c.freelancer_name && !done.has(c.id),
      );
      const sel = $("fc");
      sel.textContent = "";
      sel.append(opt("", "اختر المشروع"));
      el.forEach((c) =>
        sel.append(opt(c.id, (c.ref || "مشروع") + " — " + c.freelancer_name)),
      );
      $("ff-box").hidden = !el.length;
      $("ff-none").hidden = !!el.length;
      const s = mine.find((m) => m.kind === "site");
      $("sf-box").hidden = !!s;
      $("sf-done").hidden = !s;
      if (s)
        $("sf-done").textContent =
          "وصلنا تقييمك للموقع " +
          (s.status === "approved" ? "وهو منشور." : "وسيظهر بعد المراجعة.");
    } catch (e) {
      save(null);
      ui();
    }
  }
  async function load() {
    if (!C || /YOUR-/.test(C.url)) {
      $("lg").hidden = $("fm").hidden = true;
      $("ss").textContent = "التقييمات قيد التجهيز وستُفتح قريبًا.";
      return;
    }
    ui();
    try {
      rows = await api(
        "/rest/v1/reviews?select=kind,freelancer_id,author_name,target_name,rating,comment,created_at&status=eq.approved&order=created_at.desc&limit=200",
      );
    } catch (e) {
      $("ss").textContent = "تعذّر تحميل التقييمات.";
      return;
    }
    render();
    loadMine();
  }

  [["fr"], ["sr"]].forEach(([id]) => {
    const s = $(id);
    s.append(opt("", "اختر"));
    [
      [5, "ممتاز"],
      [4, "جيد جدًا"],
      [3, "جيد"],
      [2, "ضعيف"],
      [1, "سيئ"],
    ].forEach(([n, t]) => s.append(opt(String(n), "★".repeat(n) + " — " + t)));
  });
  async function send(e, body, ok, msg) {
    e.preventDefault();
    const f = e.target,
      b = f.querySelector("button[type=submit]");
    b.disabled = true;
    try {
      await api("/rest/v1/reviews", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(body),
      });
      f.reset();
      msg.textContent = ok;
      await loadMine();
    } catch (x) {
      msg.textContent =
        "تعذّر الإرسال. التقييم متاح لمن أتمّ مشروعًا عبر شبكة، ولمرة واحدة لكل مشروع.";
    }
    b.disabled = false;
  }
  $("ff").onsubmit = (e) =>
    send(
      e,
      {
        kind: "freelancer",
        conversation_id: $("fc").value,
        author_name: $("fn").value.trim(),
        rating: +$("fr").value,
        comment: $("fx").value.trim(),
      },
      "وصلنا تقييمك وسيظهر بعد المراجعة.",
      $("fm1"),
    );
  $("sf").onsubmit = (e) =>
    send(
      e,
      {
        kind: "site",
        author_name: $("sn").value.trim(),
        rating: +$("sr").value,
        comment: $("sx").value.trim(),
      },
      "وصلنا تقييمك وسيظهر بعد المراجعة.",
      $("fm2"),
    );
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
      const d = await window.AUTH[kind](C, email, pw);
      if (!d.access_token) {
        msg.textContent = "تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.";
        return;
      }
      setSes(d);
      $("pw").value = "";
      msg.textContent = "";
      load();
    } catch (x) {
      msg.textContent =
        kind === "signup"
          ? "تعذّر إنشاء الحساب. ربما الحساب موجود، جرّب الدخول."
          : "البريد أو كلمة المرور غير صحيحة.";
    }
  };
  $("lf").onsubmit = (e) => {
    e.preventDefault();
    doAuth("login");
  };
  $("out").onclick = () => {
    save(null);
    me = null;
    ui();
  };
  load();
})();
