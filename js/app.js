(function () {
  "use strict";
  const C = window.CONFIG || {},
    D = window.I18N;
  const $ = (s) => document.querySelector(s);
  function E(tag, cls, txt) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  const S = { lang: "ar", theme: null };
  try {
    const sv = JSON.parse(localStorage.getItem("shabaka") || "{}");
    if (sv.lang === "en") S.lang = "en";
    if (sv.theme === "dark" || sv.theme === "light") S.theme = sv.theme;
  } catch (e) {}
  const t = (k, l) => {
    l = l || S.lang;
    return (D[l] && D[l][k]) || D.ar[k] || k;
  };
  const CATS = ["web", "design", "marketing", "video", "writing"];
  const BANDS = [
    [5, 10],
    [10, 25],
    [25, 50],
    [50, 100],
    [100, 250],
    [250, 500],
    [500, 0],
  ];
  const bl = (b) => (b[1] ? "$" + b[0] + " – $" + b[1] : "$" + b[0] + "+");
  const half = (n) => "$" + +(n / 2).toFixed(2);
  const catO = CATS.map((c) => [c, "cat_" + c]),
    bandO = BANDS.map((b, i) => [String(i), null, bl(b)]);
  const F = {
    cat: { n: "cat", l: "f_cat", type: "select", o: catO, req: 1 },
    title: { n: "title", l: "f_title", type: "text", max: 80, req: 1 },
    details: {
      n: "details",
      l: "f_details",
      type: "textarea",
      max: 1500,
      min: 20,
      req: 1,
    },
    reflink: { n: "reflink", l: "f_reflink", type: "url", max: 200 },
    band: { n: "band", l: "f_band", type: "select", o: bandO, req: 1 },
    band2: { n: "band", l: "f_minband", type: "select", o: bandO, req: 1 },
    deadline: {
      n: "deadline",
      l: "f_deadline",
      type: "select",
      o: ["d3", "d7", "d14", "d30", "d30p", "flex"].map((x) => [x, x]),
      req: 1,
    },
    exp: {
      n: "exp",
      l: "f_exp",
      type: "select",
      o: ["e0", "e1", "e3", "e5"].map((x) => [x, x]),
      req: 1,
    },
    link: { n: "link", l: "f_link", type: "url", max: 200, req: 1 },
    about: {
      n: "about",
      l: "f_about",
      type: "textarea",
      max: 1500,
      min: 20,
      req: 1,
    },
    avail: {
      n: "avail",
      l: "f_avail",
      type: "select",
      o: ["a_now", "a_week", "a_month"].map((x) => [x, x]),
      req: 1,
    },
    name: { n: "name", l: "f_name", type: "text", max: 80, req: 1 },
    contact: {
      n: "contact",
      l: "f_contact",
      type: "contact",
      max: 120,
      req: 1,
      h: "f_contact_h",
    },
    agc: { n: "agree", l: "f_agc", type: "checkbox" },
    agf: { n: "agree", l: "f_agf", type: "checkbox" },
    stype: {
      n: "type",
      l: "f_type",
      type: "select",
      o: ["tp_inq", "tp_cmp", "tp_fraud", "tp_pay", "tp_sug"].map((x) => [
        x,
        x,
      ]),
      req: 1,
    },
    sref: { n: "ref", l: "f_sref", type: "text", max: 40 },
    msg: {
      n: "details",
      l: "f_msg",
      type: "textarea",
      max: 1500,
      min: 20,
      req: 1,
    },
  };
  const FLOWS = {
    client: [
      { t: "sc1", f: [F.cat, F.title] },
      { t: "sc2", f: [F.details, F.reflink] },
      { t: "sc3", f: [F.band, F.deadline], x: "pay" },
      { t: "sc4", f: [F.name, F.contact, F.agc], x: "review" },
    ],
    freelancer: [
      { t: "sf1", f: [F.cat, F.exp] },
      { t: "sf2", f: [F.link, F.about] },
      { t: "sf3", f: [F.band2, F.avail] },
      { t: "sc4", f: [F.name, F.contact, F.agf], x: "review" },
    ],
    support: [{ t: null, f: [F.stype, F.sref, F.name, F.contact, F.msg] }],
  };
  const V = { client: {}, freelancer: {}, support: {} };
  let role = null,
    last = 0;
  const clean = (v) =>
    String(v)
      .replace(/[\u0000-\u001f\u007f<>]/g, " ")
      .trim()
      .slice(0, 1500);
  const lab = (f, v, l) => {
    if (f.type !== "select") return v;
    const o = f.o.find((x) => x[0] === v);
    return o ? o[2] || t(o[1], l) : v;
  };
  function chk(f, v) {
    v = (v || "").trim();
    if (f.type === "checkbox") return v === "1" ? "" : "e_agree";
    if (f.req && !v) return "e_req";
    if (!v) return "";
    if (f.min && v.length < f.min) return "e_min";
    if (f.type === "url" && !/^https:\/\/[^\s.\/]+\.[^\s]{2,}$/i.test(v))
      return "e_url";
    if (
      f.type === "contact" &&
      !(
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ||
        /^\+?[0-9][0-9 ]{7,17}$/.test(v)
      )
    )
      return "e_contact";
    return "";
  }
  function opt(v, txt) {
    const o = E("option", "", txt);
    o.value = v;
    return o;
  }
  function fieldEl(k, f, v) {
    const w = E("div", "fld"),
      id = k + "-" + f.n;
    let c;
    if (f.type === "checkbox") {
      const lb = E("label", "chk");
      c = E("input");
      c.type = "checkbox";
      c.id = id;
      c.checked = v[f.n] === "1";
      c.onchange = () => {
        v[f.n] = c.checked ? "1" : "";
      };
      lb.append(c, E("span", "", t(f.l)));
      w.append(lb);
    } else {
      const lb = E("label", "", t(f.l) + (f.req ? " *" : ""));
      lb.htmlFor = id;
      w.append(lb);
      if (f.type === "select") {
        c = E("select");
        c.append(opt("", t("sel")));
        f.o.forEach((o) => c.append(opt(o[0], o[2] || t(o[1]))));
      } else if (f.type === "textarea") c = E("textarea");
      else {
        c = E("input");
        c.type = f.type === "url" ? "url" : "text";
        if (f.type === "contact" || f.type === "url") c.dir = "ltr";
        if (f.type === "contact") c.inputMode = "email";
      }
      c.id = id;
      c.name = f.n;
      if (f.max) c.maxLength = f.max;
      c.value = v[f.n] || "";
      c.oninput = c.onchange = () => {
        v[f.n] =
          f.type === "contact"
            ? c.value.replace(/[٠-٩]/g, (x) => "٠١٢٣٤٥٦٧٨٩".indexOf(x))
            : c.value;
        if (f.n === "band" && k === "client") fillPay();
      };
      w.append(c);
    }
    if (f.h) w.append(E("small", "tk", t(f.h)));
    const er = E("small", "err");
    er.id = "err-" + id;
    er.setAttribute("role", "alert");
    w.append(er);
    c.setAttribute("aria-describedby", er.id);
    return w;
  }
  function fillPay(d) {
    d = d || $("#paybox");
    if (!d) return;
    const v = V.client;
    d.textContent = "";
    d.append(E("strong", "", t("pay_h")), E("br"));
    if (v.band === "" || v.band == null) {
      d.append(t("pay_none"));
      return;
    }
    const b = BANDS[+v.band],
      r = b[1] ? half(b[0]) + " – " + half(b[1]) : half(b[0]) + "+";
    d.append(t("rv_dep") + ": " + r, E("br"), t("rv_bal") + ": " + r);
  }
  function review(k, v) {
    const d = E("div", "rv"),
      dl = E("dl");
    d.append(E("h4", "", t("rv_title")));
    FLOWS[k].forEach((s) =>
      s.f.forEach((f) => {
        if (
          f.type === "checkbox" ||
          f.n === "name" ||
          f.n === "contact" ||
          !v[f.n]
        )
          return;
        dl.append(E("dt", "", t(f.l)), E("dd", "", lab(f, v[f.n])));
      }),
    );
    d.append(dl);
    if (k === "client" && v.band) {
      const p = E("div", "note");
      fillPay(p);
      d.append(p, E("p", "tk", t("rv_nc")));
    } else if (k === "freelancer") d.append(E("p", "note", t("rv_nf")));
    return d;
  }
  function mkForm(root, getKey) {
    let step = 0,
      res = null;
    function draw() {
      root.textContent = "";
      const k = getKey();
      if (!k) {
        root.append(E("p", "tk", t("pick")));
        return;
      }
      if (res) return done(k);
      const fl = FLOWS[k],
        st = fl[step],
        v = V[k];
      if (fl.length > 1) {
        const ol = E("ol", "steps");
        fl.forEach((s, i) => {
          const li = E(
            "li",
            i === step ? "on" : i < step ? "ok" : "",
            i + 1 + ". " + t(s.t),
          );
          if (i === step) li.setAttribute("aria-current", "step");
          ol.append(li);
        });
        root.append(ol);
      }
      const fm = E("form");
      fm.noValidate = true;
      const hp = E("input", "hp");
      hp.name = "website";
      hp.tabIndex = -1;
      hp.autocomplete = "off";
      hp.setAttribute("aria-hidden", "true");
      fm.append(hp);
      st.f.forEach((f) => fm.append(fieldEl(k, f, v)));
      if (st.x === "pay") {
        const d = E("div", "note");
        d.id = "paybox";
        fillPay(d);
        fm.append(d);
      }
      if (st.x === "review") fm.append(review(k, v));
      const nav = E("div", "wnav"),
        last_ = step === fl.length - 1;
      if (step > 0) {
        const b = E("button", "btn o", t("back"));
        b.type = "button";
        b.onclick = () => {
          step--;
          draw();
        };
        nav.append(b);
      }
      const nx = E(
        "button",
        "btn",
        t(last_ ? (k === "support" ? "send" : "submit") : "next"),
      );
      nx.type = "submit";
      nav.append(nx);
      fm.append(nav);
      fm.onsubmit = (e) => {
        e.preventDefault();
        if (!validate(k, fm, st, v)) return;
        if (!last_) {
          step++;
          draw();
          root.scrollIntoView({ block: "start" });
          return;
        }
        if (hp.value) {
          res = { ref: "SH-0", mode: "manual", msg: "" };
          draw();
          return;
        }
        if (Date.now() - last < 30000) {
          const m = fm.querySelector(".wnav");
          fm.querySelectorAll(".e30").forEach((x) => x.remove());
          const w = E("p", "err e30", t("e_wait"));
          w.setAttribute("role", "alert");
          m.before(w);
          return;
        }
        res = send(k);
        last = Date.now();
        draw();
      };
      root.append(fm);
    }
    function done(k) {
      const d = E("div", "rv");
      d.append(
        E("h3", "", t("ok_title")),
        E("p", "", t("ok_ref") + ": " + res.ref),
        E(
          "p",
          "",
          t(k === "client" ? "ok_c" : k === "freelancer" ? "ok_f" : "ok_s"),
        ),
      );
      if (res.msg) {
        d.append(
          E(
            "p",
            "tk",
            t(
              res.mode === "wa"
                ? "ok_wa"
                : res.mode === "mail"
                  ? "ok_mail"
                  : "ok_manual",
            ),
          ),
          E("pre", "", res.msg),
        );
      }
      const b = E("button", "btn o", t("ok_new"));
      b.type = "button";
      b.onclick = () => {
        V[k] = {};
        res = null;
        step = 0;
        draw();
      };
      d.append(b);
      root.append(d);
    }
    draw.reset = () => {
      step = 0;
      res = null;
      draw();
    };
    return draw;
  }
  function validate(k, fm, st, v) {
    let first = null;
    st.f.forEach((f) => {
      const e = chk(f, v[f.n]),
        el = fm.querySelector("#err-" + k + "-" + f.n);
      el.textContent = e ? t(e) : "";
      if (e && !first) first = fm.querySelector("#" + k + "-" + f.n);
    });
    if (first) {
      first.focus();
      return false;
    }
    return true;
  }
  function send(k) {
    const ref =
      "SH-" +
      new Date().toISOString().slice(2, 10).replace(/-/g, "") +
      "-" +
      (1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));
    const L = [D.ar["msg_" + k], "المرجع: " + ref];
    FLOWS[k].forEach((s) =>
      s.f.forEach((f) => {
        const x = V[k][f.n];
        if (!x) return;
        L.push(
          D.ar[f.l] +
            ": " +
            (f.type === "checkbox" ? "نعم" : clean(lab(f, x, "ar"))),
        );
      }),
    );
    if (k === "client" && V.client.band !== "" && V.client.band != null) {
      const b = BANDS[+V.client.band];
      L.push(
        "الدفعة الأولى 50%: " +
          (b[1] ? half(b[0]) + " – " + half(b[1]) : half(b[0]) + "+"),
      );
    }
    const msg = L.join("\n");
    let mode = "manual";
    if (/^\d{8,15}$/.test(C.whatsapp || "")) {
      mode = "wa";
      window.open(
        "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg),
        "_blank",
        "noopener",
      );
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(C.email || "")) {
      mode = "mail";
      location.href =
        "mailto:" +
        C.email +
        "?subject=" +
        encodeURIComponent(D.ar["msg_" + k] + " " + ref) +
        "&body=" +
        encodeURIComponent(msg);
    }
    return { ref, msg, mode };
  }
  const wiz = mkForm($("#wz"), () => role),
    sup = mkForm($("#sp"), () => "support");
  function setRole(r, cat, scroll) {
    role = r;
    if (cat) V.client.cat = cat;
    ["client", "freelancer"].forEach((x) =>
      $("#t-" + x).setAttribute("aria-selected", String(x === r)),
    );
    wiz.reset();
    if (scroll) $("#start").scrollIntoView({ behavior: "smooth" });
  }
  document
    .querySelectorAll("[data-role]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        setRole(b.dataset.role, null, !b.closest("#start")),
      ),
    );
  function cats() {
    const g = $("#cats");
    g.textContent = "";
    CATS.forEach((c, i) => {
      const d = E("div", "c");
      d.append(
        E("span", "n", String(i + 1)),
        E("h3", "", t("cat_" + c)),
        E("p", "", t("cd_" + c)),
      );
      const b = E(
        "button",
        "link",
        t("order") + (S.lang === "ar" ? " ←" : " →"),
      );
      b.type = "button";
      b.onclick = () => setRole("client", c, true);
      d.append(b);
      g.append(d);
    });
    const bs = $("#bands");
    bs.textContent = "";
    BANDS.forEach((b) => bs.append(E("li", "", bl(b))));
  }
  const NS = "http://www.w3.org/2000/svg";
  function icon(paths) {
    const s = document.createElementNS(NS, "svg");
    const at = {
      viewBox: "0 0 24 24",
      width: "20",
      height: "20",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    };
    Object.keys(at).forEach((k) => s.setAttribute(k, at[k]));
    paths.forEach((d) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      s.append(p);
    });
    return s;
  }
  const SUN = [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  ];
  const MOON = ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"];
  const dark = () =>
    S.theme
      ? S.theme === "dark"
      : matchMedia("(prefers-color-scheme:dark)").matches;
  function apply() {
    const r = document.documentElement;
    r.lang = S.lang;
    r.dir = S.lang === "ar" ? "rtl" : "ltr";
    document.title =
      S.lang === "ar"
        ? "شبكة | Shabaka — مستقلون عرب بأعمال تمت مراجعتها"
        : "Shabaka — Arab freelancers with reviewed portfolios";
    if (S.theme) r.dataset.theme = S.theme;
    else r.removeAttribute("data-theme");
    document.querySelectorAll("[data-i18n]").forEach((n) => {
      n.textContent = t(n.dataset.i18n);
    });
    $("#lang").textContent = S.lang === "ar" ? "EN" : "عربي";
    const th = $("#theme"),
      lbl = t(dark() ? "to_light" : "to_dark");
    th.textContent = "";
    th.append(icon(dark() ? SUN : MOON));
    th.setAttribute("aria-label", lbl);
    th.title = lbl;
    const wa = /^\d{8,15}$/.test(C.whatsapp || ""),
      em = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(C.email || "");
    $("#cw").hidden = !wa;
    $("#ce").hidden = !em;
    if (wa) $("#cw").href = "https://wa.me/" + C.whatsapp;
    if (em) $("#ce").href = "mailto:" + C.email;
    cats();
    wiz();
    sup();
    try {
      localStorage.setItem("shabaka", JSON.stringify(S));
    } catch (e) {}
  }
  $("#lang").onclick = () => {
    S.lang = S.lang === "ar" ? "en" : "ar";
    apply();
  };
  $("#theme").onclick = () => {
    S.theme = dark() ? "light" : "dark";
    apply();
  };
  const nav = $("#nav"),
    mb = $("#mb");
  mb.onclick = () => {
    mb.setAttribute("aria-expanded", String(nav.classList.toggle("open")));
  };
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      mb.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      nav.classList.remove("open");
      mb.setAttribute("aria-expanded", "false");
    }
  });
  const spy = [...document.querySelectorAll("nav a[href^='#']")]
    .map((a) => [a, document.querySelector(a.getAttribute("href"))])
    .filter((x) => x[1]);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          spy.forEach(([a, s]) =>
            s === e.target
              ? a.setAttribute("aria-current", "true")
              : a.removeAttribute("aria-current"),
          );
        }),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    spy.forEach((x) => io.observe(x[1]));
  }
  const A = C.analytics || {};
  if (A.provider && A.id && navigator.doNotTrack !== "1") {
    const s = document.createElement("script");
    s.defer = true;
    let ok = false;
    if (A.provider === "goatcounter" && /^[a-z0-9-]+$/i.test(A.id)) {
      s.src = "https://gc.zgo.at/count.js";
      s.dataset.goatcounter = "https://" + A.id + ".goatcounter.com/count";
      ok = true;
    } else if (A.provider === "plausible" && /^[a-z0-9.-]+$/i.test(A.id)) {
      s.src = "https://plausible.io/js/script.js";
      s.dataset.domain = A.id;
      ok = true;
    }
    if (ok) document.head.append(s);
  }
  apply();
})();
