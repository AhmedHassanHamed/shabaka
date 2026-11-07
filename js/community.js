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
  const BUD = {
    lt25: "أقل من 25$",
    "25-50": "25 – 50$",
    "50-100": "50 – 100$",
    "100-250": "100 – 250$",
    gt250: "أكثر من 250$",
    tbd: "تُحدد لاحقًا",
  };
  const DUR = {
    "1d": "يوم واحد",
    "3d": "حتى 3 أيام",
    "1w": "أسبوع",
    "2w": "أسبوعان",
    "1m": "شهر أو أكثر",
    flex: "مرنة",
  };
  let ses = null,
    mine = new Set(),
    posts = [];
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
    $("pf-box").hidden = !ses;
  };

  function render() {
    const f = $("flt").value,
      box = $("ls");
    box.textContent = "";
    const list = posts.filter((p) => !f || p.category === f);
    if (!list.length) {
      box.append(E("p", "tk", "لا توجد طلبات منشورة بعد. كن أول من يكتب."));
      return;
    }
    list.forEach((p) => {
      const a = E("article", "c post"),
        b = E("div");
      const h = E("h3", "", p.title),
        d = E("p", "", p.details),
        m = E("p", "meta");
      h.dir = d.dir = "auto";
      m.append(
        E("span", "tag", CAT[p.category] || p.category),
        " " +
          p.author_name +
          " · " +
          new Date(p.created_at).toLocaleDateString(
            window.LOC ? window.LOC() : "ar-EG",
          ),
      );
      const mb = E("button", "pill", "راسل صاحب الطلب");
      mb.type = "button";
      mb.onclick = () => chat(p);
      if (p.budget)
        m.append(" ", E("span", "tag", "الميزانية: " + BUD[p.budget]));
      if (p.duration)
        m.append(" ", E("span", "tag", "المدة: " + DUR[p.duration]));
      b.append(h, d, m, mb);
      const v = E("button", "vote");
      v.type = "button";
      v.setAttribute("aria-pressed", String(mine.has(p.id)));
      v.setAttribute("aria-label", "أحتاج هذه الخدمة أيضًا");
      v.append(E("strong", "", String(p.votes)), E("span", "", "أحتاجها"));
      v.onclick = () => vote(p);
      a.append(b, v);
      box.append(a);
    });
  }
  async function chat(p) {
    if (!ses) {
      $("lm").textContent = "سجّل الدخول أولًا للمراسلة.";
      $("lg").scrollIntoView({ block: "center" });
      return;
    }
    try {
      const me = (await api("/auth/v1/user")).id;
      const pr = await api(`/rest/v1/profiles?select=role&user_id=eq.${me}`);
      if (!pr[0] || pr[0].role !== "freelancer") {
        alert("للمراسلة أنشئ ملفك كمستقل أولًا. سننقلك لصفحة ملفك.");
        location.href = "profile.html";
        return;
      }
      const id = await api("/rest/v1/rpc/start_chat", {
        method: "POST",
        body: JSON.stringify({ p_post: p.id }),
      });
      location.href = "messages.html#c=" + id;
    } catch (e) {
      alert("تعذّر بدء المحادثة. ربما هذا طلبك أنت، أو وصلت للحد اليومي.");
    }
  }
  async function vote(p) {
    if (!ses) {
      $("lm").textContent = "سجّل الدخول أولًا للتصويت.";
      $("lg").scrollIntoView({ block: "center" });
      return;
    }
    const on = mine.has(p.id);
    try {
      if (on)
        await api(`/rest/v1/community_votes?post_id=eq.${p.id}`, {
          method: "DELETE",
        });
      else
        await api("/rest/v1/community_votes", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ post_id: p.id }),
        });
      if (on) {
        mine.delete(p.id);
        p.votes = Math.max(0, p.votes - 1);
      } else {
        mine.add(p.id);
        p.votes++;
      }
      render();
    } catch (e) {
      alert("تعذّر التصويت، حاول مرة أخرى.");
    }
  }
  async function loadMine() {
    const box = $("mine");
    box.textContent = "";
    if (!ses) return;
    try {
      const rows = await api(
        "/rest/v1/community_posts?select=id,title,status&status=in.(pending,rejected)&order=created_at.desc&limit=10",
      );
      if (!rows.length) return;
      box.append(E("h4", "", "طلباتك قيد المراجعة"));
      const ul = E("ul");
      rows.forEach((r) => {
        const li = E(
          "li",
          "",
          r.title + " — " + (r.status === "pending" ? "قيد المراجعة" : "مرفوض"),
        );
        li.dir = "auto";
        ul.append(li);
      });
      box.append(ul);
    } catch (e) {}
  }
  async function load() {
    if (!C || /YOUR-/.test(C.url)) {
      $("lg").hidden = $("pf-box").hidden = true;
      $("ls").textContent = "المجتمع قيد التجهيز وسيُفتح قريبًا.";
      return;
    }
    ui();
    try {
      posts = await api(
        "/rest/v1/community_posts?select=id,author_name,category,title,details,votes,created_at,budget,duration&status=eq.approved&order=votes.desc,created_at.desc&limit=100",
      );
      if (ses) {
        mine = new Set(
          (await api("/rest/v1/community_votes?select=post_id")).map(
            (x) => x.post_id,
          ),
        );
        loadMine();
      }
    } catch (e) {
      $("ls").textContent = "تعذّر تحميل الطلبات.";
      return;
    }
    render();
  }

  const flt = $("flt"),
    pc = $("pc");
  flt.append(opt("", "كل الفئات"));
  pc.append(opt("", "اختر"));
  Object.keys(CAT).forEach((k) => {
    flt.append(opt(k, CAT[k]));
    pc.append(opt(k, CAT[k]));
  });
  flt.onchange = render;
  [
    ["pbud", BUD, "الميزانية (اختياري)"],
    ["pdur", DUR, "المدة المطلوبة (اختياري)"],
  ].forEach(([id, M, ph]) => {
    const s = $(id);
    s.append(opt("", ph));
    Object.keys(M).forEach((k) => s.append(opt(k, M[k])));
  });

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
      if (kind === "signup") {
        location.href = "profile.html";
        return;
      }
      load();
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
    const b = $("pb");
    b.disabled = true;
    const d = {
      author_name: $("pn").value.trim(),
      category: $("pc").value,
      title: $("pt").value.trim(),
      details: $("pd").value.trim(),
    };
    if ($("pbud").value) d.budget = $("pbud").value;
    if ($("pdur").value) d.duration = $("pdur").value;
    try {
      await api("/rest/v1/community_posts", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(d),
      });
      e.target.reset();
      $("pm").textContent = "وصلنا طلبك وسيظهر بعد المراجعة.";
      loadMine();
    } catch (x) {
      $("pm").textContent =
        "تعذّر الإرسال. راجع الحقول، أو ربما وصلت للحد اليومي (3 طلبات).";
    }
    b.disabled = false;
  };
  $("out").onclick = () => {
    save(null);
    mine = new Set();
    ui();
    loadMine();
    render();
  };
  load();
})();
