(() => {
  try {
    const t = JSON.parse(localStorage.getItem("shabaka") || "{}").theme;
    if (t === "light" || t === "dark")
      document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
  const C = window.CHAT_CONFIG;
  const header = document.querySelector("header");
  if (!C || /YOUR-/.test(C.url) || !header) return;
  const NS = "http://www.w3.org/2000/svg";
  const E = (t, c, x) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (x != null) e.textContent = x;
    return e;
  };
  const SES = () => {
    try {
      return JSON.parse(sessionStorage.getItem("sb") || "null");
    } catch (e) {
      return null;
    }
  };
  const base = document.title.replace(/^\(\d+\)\s*/, "");
  const link = document.querySelector('nav a[href="messages.html"]');
  const rtf = new Intl.RelativeTimeFormat(
    document.documentElement.lang === "en" ? "en" : "ar",
    { numeric: "auto" },
  );
  let items = [],
    msgs = 0;

  const bell = E("button", "bell");
  bell.type = "button";
  bell.hidden = true;
  bell.setAttribute("aria-label", "الإشعارات");
  bell.setAttribute("aria-expanded", "false");
  const svg = document.createElementNS(NS, "svg");
  [
    ["viewBox", "0 0 24 24"],
    ["width", "20"],
    ["height", "20"],
    ["fill", "none"],
    ["stroke", "currentColor"],
    ["stroke-width", "2"],
    ["stroke-linecap", "round"],
    ["stroke-linejoin", "round"],
    ["aria-hidden", "true"],
  ].forEach(([k, v]) => svg.setAttribute(k, v));
  [
    "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9",
    "M13.7 21a2 2 0 0 1-3.4 0",
  ].forEach((d) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    svg.append(p);
  });
  const badge = E("span", "bd");
  badge.hidden = true;
  bell.append(svg, badge);
  const panel = E("div", "npanel");
  panel.hidden = true;
  header.querySelector(".w").append(bell);
  header.append(panel);

  const call = (path, o = {}) =>
    fetch(C.url + path, {
      ...o,
      headers: {
        apikey: C.key,
        Authorization: "Bearer " + SES().a,
        "Content-Type": "application/json",
        ...(o.headers || {}),
      },
    });
  const safe = (l) => (l && /^[a-z]+\.html([?#][\w=&.-]*)?$/.test(l) ? l : "#");
  const ago = (d) => {
    const s = (new Date(d) - Date.now()) / 1000,
      a = Math.abs(s);
    return a < 3600
      ? rtf.format(Math.round(s / 60), "minute")
      : a < 86400
        ? rtf.format(Math.round(s / 3600), "hour")
        : rtf.format(Math.round(s / 86400), "day");
  };
  function markOne(id) {
    call("/rest/v1/notifications?id=eq." + id, {
      method: "PATCH",
      body: '{"read":true}',
      keepalive: true,
    }).catch(() => {});
  }
  async function markAll() {
    try {
      await call("/rest/v1/notifications?read=eq.false", {
        method: "PATCH",
        body: '{"read":true}',
      });
      items.forEach((n) => (n.read = true));
      paint();
      render();
    } catch (e) {}
  }
  function paint() {
    const c = items.filter((n) => !n.read).length;
    badge.textContent = c > 9 ? "9+" : String(c);
    badge.hidden = !c;
    bell.setAttribute(
      "aria-label",
      c ? "الإشعارات، " + c + " جديدة" : "الإشعارات",
    );
    if (link) {
      let b = link.querySelector(".bd");
      if (!b) {
        b = E("span", "bd");
        link.append(b);
      }
      b.textContent = msgs > 9 ? "9+" : String(msgs);
      b.hidden = !msgs;
    }
    const t = c + msgs;
    document.title = t ? "(" + t + ") " + base : base;
  }
  function render() {
    panel.textContent = "";
    const hd = E("div", "nhead"),
      all = E("button", "link", "تحديد الكل كمقروء");
    all.type = "button";
    all.onclick = markAll;
    hd.append(E("strong", "", "الإشعارات"), all);
    panel.append(hd);
    if (!items.length) panel.append(E("p", "tk npad", "لا توجد إشعارات بعد."));
    items.forEach((n) => {
      const a = E("a", "nitem" + (n.read ? "" : " new"));
      a.href = safe(n.link);
      a.append(E("span", "", n.title), E("small", "tk", ago(n.created_at)));
      a.onclick = () => {
        if (!n.read) markOne(n.id);
      };
      panel.append(a);
    });
  }
  async function tick() {
    const s = SES();
    bell.hidden = !s;
    if (!s || document.hidden) return;
    try {
      const [u, n] = await Promise.all([
        call("/rest/v1/rpc/unread_counts", { method: "POST", body: "{}" }),
        call(
          "/rest/v1/notifications?select=id,title,link,read,created_at&order=id.desc&limit=20",
        ),
      ]);
      if (u.ok) msgs = (await u.json()).reduce((a, x) => a + Number(x.n), 0);
      if (n.ok) items = await n.json();
      paint();
      if (!panel.hidden) render();
    } catch (e) {}
  }
  bell.onclick = () => {
    panel.hidden = !panel.hidden;
    bell.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) render();
  };
  document.addEventListener("click", (e) => {
    if (
      !panel.hidden &&
      !panel.contains(e.target) &&
      !bell.contains(e.target)
    ) {
      panel.hidden = true;
      bell.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      panel.hidden = true;
      bell.focus();
    }
  });
  tick();
  setInterval(tick, 20000);
  document.addEventListener("visibilitychange", tick);
})();
