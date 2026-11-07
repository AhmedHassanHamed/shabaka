(() => {
  "use strict";
  const C = window.CHAT_CONFIG,
    $ = (i) => document.getElementById(i);
  const CAT = {
    web: "برمجة وتطوير مواقع",
    design: "تصميم",
    marketing: "تسويق رقمي",
    video: "مونتاج وفيديو",
    writing: "كتابة وترجمة",
    other: "خدمة أخرى",
  };
  const ROLE = { freelancer: "مستقل", client: "صاحب مشروع" };
  const E = (t, c, x) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (x != null) e.textContent = x;
    return e;
  };
  const id = new URLSearchParams(location.search).get("id") || "";
  const get = async (p, o = {}) => {
    const r = await fetch(C.url + p, {
      ...o,
      headers: { apikey: C.key, "Content-Type": "application/json" },
    });
    if (!r.ok) throw new Error(r.status);
    return r.json();
  };
  const stars = (n) => {
    const s = E(
      "span",
      "stars",
      "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n)),
    );
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", "التقييم " + +n.toFixed(1) + " من 5");
    return s;
  };
  const stat = (v, l) => {
    const c = E("div", "c");
    c.append(E("b", "big", v), E("p", "", l));
    return c;
  };
  async function load() {
    const m = $("fm");
    if (!C || /YOUR-/.test(C.url) || !/^[0-9a-f-]{36}$/.test(id)) {
      m.textContent = "الملف غير متاح.";
      return;
    }
    try {
      const [pr, rv, st] = await Promise.all([
        get(
          `/rest/v1/profiles?select=display_name,role,category,bio,portfolio_url,created_at&user_id=eq.${id}&status=eq.approved`,
        ),
        get(
          `/rest/v1/reviews?select=author_name,rating,comment,created_at,target_name&kind=eq.freelancer&freelancer_id=eq.${id}&status=eq.approved&order=created_at.desc&limit=100`,
        ),
        get("/rest/v1/rpc/public_stats", {
          method: "POST",
          body: JSON.stringify({ p_user: id }),
        }),
      ]);
      const p = pr[0],
        name = (p && p.display_name) || (rv[0] && rv[0].target_name);
      if (!name) {
        m.textContent = "لا يوجد ملف منشور لهذا العضو بعد.";
        return;
      }
      $("fn").textContent = name;
      document.title = name + " | شبكة Shabaka";
      m.append(E("span", "tag", p ? ROLE[p.role] : "مستقل"), " ");
      if (p && p.category)
        m.append(E("span", "tag", CAT[p.category] || p.category), " ");
      const avg = rv.length
        ? rv.reduce((s, x) => s + x.rating, 0) / rv.length
        : 0;
      if (rv.length) m.append(stars(avg), " " + avg.toFixed(1) + " / 5");
      const s0 = st[0] || {},
        since = s0.member_since || (p && p.created_at);
      const g = $("stats");
      g.append(
        stat(
          since
            ? new Date(since).toLocaleDateString(
                window.LOC ? window.LOC() : "ar-EG",
                { month: "long", year: "numeric" },
              )
            : "—",
          "عضو منذ",
        ),
      );
      g.append(stat(String(s0.completed || 0), "مشاريع مكتملة عبر شبكة"));
      g.append(
        stat(
          rv.length ? avg.toFixed(1) : "—",
          "متوسط التقييم (" + rv.length + ")",
        ),
      );
      if (p && (p.bio || p.portfolio_url)) {
        $("pb").hidden = false;
        $("bio").textContent = p.bio || "";
        $("bio").dir = "auto";
        if (p.portfolio_url && p.portfolio_url.startsWith("https://")) {
          $("pu").href = p.portfolio_url;
          $("pu").hidden = false;
        }
      }
      const fl = $("fl");
      if (!rv.length) fl.append(E("p", "tk", "لا توجد تقييمات منشورة بعد."));
      rv.forEach((r) => {
        const a = E("article", "c"),
          h = E("p", "meta"),
          t = E("p", "", r.comment);
        h.append(
          stars(r.rating),
          " " +
            r.author_name +
            " · " +
            new Date(r.created_at).toLocaleDateString(
              window.LOC ? window.LOC() : "ar-EG",
            ),
        );
        t.dir = "auto";
        a.append(h, t);
        fl.append(a);
      });
    } catch (e) {
      m.textContent = "تعذّر تحميل الملف.";
    }
  }
  load();
})();
