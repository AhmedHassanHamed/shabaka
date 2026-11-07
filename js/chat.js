(() => {
  "use strict";
  const C = window.CHAT_CONFIG,
    $ = (i) => document.getElementById(i),
    S = sessionStorage;
  let ses = null,
    me = null,
    cur = null,
    last = 0,
    timer = null,
    btns = [];
  try {
    ses = JSON.parse(S.getItem("sb") || "null");
  } catch (e) {}
  const save = (s) => {
    ses = s;
    s ? S.setItem("sb", JSON.stringify(s)) : S.removeItem("sb");
  };
  const setSes = (d) => save({ a: d.access_token, r: d.refresh_token });

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
    if (!ses || !ses.r) return false;
    try {
      const r = await fetch(C.url + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { apikey: C.key, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: ses.r }),
      });
      if (!r.ok) throw 0;
      setSes(await r.json());
      return true;
    } catch (e) {
      save(null);
      return false;
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
    if (r.status === 401 && retry && (await refresh()))
      return api(path, o, false);
    if (!r.ok) throw new Error(r.status);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  }

  const fmt = (d) =>
    new Date(d).toLocaleString(window.LOC ? window.LOC() : "ar-EG", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  function bubble(m) {
    const d = document.createElement("div");
    d.className = "m" + (m.sender_id === me ? " me" : "");
    const t = document.createElement("span");
    t.dir = "auto";
    t.textContent = m.body;
    const tm = document.createElement("time");
    tm.textContent = fmt(m.created_at);
    d.append(t, tm);
    return d;
  }

  async function poll() {
    if (!cur || document.hidden) return;
    const id = cur.id;
    try {
      const rows = await api(
        `/rest/v1/messages?conversation_id=eq.${id}&id=gt.${last}&select=id,sender_id,body,created_at&order=id.asc&limit=200`,
      );
      if (!cur || cur.id !== id || !rows.length) return;
      const box = $("msgs"),
        atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 80,
        first = last === 0;
      rows.forEach((m) => {
        box.append(bubble(m));
        last = Math.max(last, m.id);
      });
      if (atEnd || first) box.scrollTop = box.scrollHeight;
      markRead(id, last);
    } catch (e) {
      if (!ses) start();
    }
  }

  function open(c, btn) {
    cur = c;
    last = 0;
    $("msgs").textContent = "";
    $("ttl").textContent =
      (c.ref || "محادثة") + (c.status === "completed" ? " — مكتمل" : "");
    $("sf").hidden = false;
    $("done").hidden = !(c.client_id === me && c.status === "active");
    $("pf").hidden = c.client_id !== me;
    $("pf").href = "freelancer.html?id=" + c.freelancer_id;
    document
      .querySelectorAll(".cv")
      .forEach((b) => b.setAttribute("aria-current", String(b === btn)));
    $("app").classList.add("open");
    poll();
    clearInterval(timer);
    timer = setInterval(poll, 4000);
  }

  async function start() {
    if (!C || /YOUR-/.test(C.url)) {
      $("login").hidden = $("app").hidden = true;
      $("nc").hidden = false;
      return;
    }
    $("login").hidden = !!ses;
    $("app").hidden = !ses;
    if (!ses) return;
    try {
      me = (await api("/auth/v1/user")).id;
      const cs = await api(
        "/rest/v1/conversations?select=id,ref,created_at,client_id,freelancer_id,status&order=created_at.desc",
      );
      const list = $("list");
      list.textContent = "";
      if (!cs.length) {
        const p = document.createElement("p");
        p.className = "mut";
        p.style.padding = "16px";
        p.textContent = "لا توجد محادثات بعد.";
        list.append(p);
      }
      btns = [];
      cs.forEach((c) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "cv";
        b.textContent = c.ref || "محادثة " + fmt(c.created_at);
        const bd = document.createElement("span");
        bd.className = "bd";
        bd.hidden = true;
        b.append(bd);
        b.onclick = () => open(c, b);
        list.append(b);
        btns.push([c, b, bd]);
      });
      const hm = /^#c=([0-9a-f-]{36})$/.exec(location.hash);
      if (hm) {
        const f = btns.find((x) => x[0].id === hm[1]);
        if (f) open(f[0], f[1]);
      }
      if (cur) {
        const f = btns.find((x) => x[0].id === cur.id);
        if (f) f[1].setAttribute("aria-current", "true");
      }
      applyUnread();
    } catch (e) {
      save(null);
      start();
    }
  }

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
      start();
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
  $("sf").onsubmit = async (e) => {
    e.preventDefault();
    const body = $("tx").value.trim();
    if (!body || !cur) return;
    $("sb").disabled = true;
    try {
      await api("/rest/v1/messages", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ conversation_id: cur.id, body }),
      });
      $("tx").value = "";
      await poll();
    } catch (x) {
      alert("تعذّر الإرسال، حاول مرة أخرى.");
    }
    $("sb").disabled = false;
    $("tx").focus();
  };
  async function applyUnread() {
    try {
      const rows = await api("/rest/v1/rpc/unread_counts", {
        method: "POST",
        body: "{}",
      });
      const m = {};
      rows.forEach((x) => (m[x.conversation_id] = Number(x.n)));
      btns.forEach(([c, b, bd]) => {
        const n = cur && cur.id === c.id ? 0 : m[c.id] || 0;
        bd.textContent = String(n);
        bd.hidden = !n;
      });
    } catch (e) {}
  }
  function markRead(id, upTo) {
    api("/rest/v1/rpc/mark_read", {
      method: "POST",
      body: JSON.stringify({ p_conv: id, p_last: upTo }),
    })
      .then(applyUnread)
      .catch(() => {});
  }
  async function refreshList() {
    try {
      const cs = await api("/rest/v1/conversations?select=id");
      if (cs.length !== btns.length) return start();
      applyUnread();
    } catch (e) {}
  }
  setInterval(() => {
    if (ses && !document.hidden) refreshList();
  }, 10000);
  $("done").onclick = async () => {
    if (
      !cur ||
      !confirm("هل اكتمل المشروع وتريد اعتماده؟ سيظهر لك تقييم المستقل بعدها.")
    )
      return;
    try {
      await api("/rest/v1/rpc/complete_chat", {
        method: "POST",
        body: JSON.stringify({ p_conv: cur.id }),
      });
      cur.status = "completed";
      $("done").hidden = true;
      $("ttl").textContent += " — مكتمل";
      alert("تم. يمكنك الآن تقييم المستقل من صفحة التقييمات.");
    } catch (e) {
      alert("تعذّر الاعتماد، حاول مرة أخرى.");
    }
  };
  $("bk").onclick = () => $("app").classList.remove("open");
  $("out").onclick = () => {
    save(null);
    cur = null;
    clearInterval(timer);
    me = null;
    start();
  };
  document.addEventListener("visibilitychange", poll);
  start();
})();
