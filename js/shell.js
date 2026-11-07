(() => {
  "use strict";
  const KEY = "shabaka",
    root = document.documentElement;
  let S = {};
  try {
    S = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch (e) {}
  const EN = S.lang === "en";
  if (S.theme === "dark" || S.theme === "light")
    root.setAttribute("data-theme", S.theme);
  if (EN) {
    root.lang = "en";
    root.dir = "ltr";
  }
  window.LOC = () => (EN ? "en-US" : "ar-EG");

  const MAP = {
    "المجتمع | شبكة Shabaka": "Community | Shabaka",
    "الرسائل | شبكة Shabaka": "Messages | Shabaka",
    "التقييمات | شبكة Shabaka": "Reviews | Shabaka",
    "ملف مستقل | شبكة Shabaka": "Member profile | Shabaka",
    "ملفي المهني | شبكة Shabaka": "My profile | Shabaka",
    الرئيسية: "Home",
    المجتمع: "Community",
    التقييمات: "Reviews",
    الرسائل: "Messages",
    ملفي: "My profile",
    "مجتمع شبكة": "Shabaka Community",
    "خدمة تحتاجها ولا تجدها؟ اكتبها هنا، وصوّت على طلبات غيرك. نرتّب الأولويات بالتصويت ونحاول توفير مستقلين لأكثر الطلبات.":
      "Need a service you can't find? Post it here and vote on others' requests. We rank by votes and try to find freelancers for the most-wanted ones.",
    "سجّل الدخول للمشاركة": "Sign in to participate",
    "سجّل الدخول": "Sign in",
    "تسجيل الدخول": "Sign in",
    دخول: "Sign in",
    "القراءة متاحة للجميع. للكتابة أو التصويت سجّل الدخول أو أنشئ حسابًا جديدًا ببريدك وكلمة مرور.":
      "Reading is open to everyone. To post or vote, sign in or create an account with your email and a password.",
    "البريد الإلكتروني": "Email",
    "كلمة المرور": "Password",
    "إنشاء حساب جديد": "Create new account",
    "اكتب طلبك": "Write your request",
    "اسم العرض (يظهر للجميع)": "Display name (public)",
    "اسم العرض": "Display name",
    الفئة: "Category",
    "عنوان الطلب": "Request title",
    الميزانية: "Budget",
    "المدة المطلوبة": "Required duration",
    التفاصيل: "Details",
    "لا تكتب أرقام هواتف أو إيميلات أو بيانات شخصية. المشاركات تُراجع قبل النشر.":
      "Don't write phone numbers, emails or personal data. Posts are reviewed before publishing.",
    "لا تكتب أرقام هواتف أو إيميلات أو بيانات شخصية.":
      "Don't write phone numbers, emails or personal data.",
    "إرسال للمراجعة": "Submit for review",
    "تسجيل الخروج": "Sign out",
    "تصفية حسب الفئة": "Filter by category",
    "المحتوى من مشاركات الأعضاء ولا تتحمل شبكة مسؤوليته. بلّغنا عن أي مشاركة مسيئة من صفحة الرئيسية.":
      "Content is posted by members and Shabaka is not responsible for it. Report any abusive post from the home page contact section.",
    "محادثاتك الخاصة مع الطرف الآخر في مشروعك. لا يراها غيركما.":
      "Your private conversations with the other party on your project. Nobody else can see them.",
    "الرسائل قيد التجهيز وستكون متاحة قريبًا.":
      "Messages are being prepared and will be available soon.",
    "ادخل ببريدك وكلمة المرور اللذين زوّدناك بهما.":
      "Sign in with your email and password.",
    محادثاتك: "Your conversations",
    "← رجوع": "← Back",
    "اختر محادثة": "Choose a conversation",
    "اعتماد اكتمال المشروع": "Mark project as completed",
    "ملف المستقل": "Freelancer profile",
    إرسال: "Send",
    رسالتك: "Your message",
    "تقييم المستقل يكتبه صاحب المشروع بعد اكتمال مشروعه عبر شبكة، ويُنشر بعد مراجعة تقتصر على الإساءة والبيانات الشخصية. لا نحذف تقييمًا لأنه منخفض.":
      "A freelancer review is written by the project owner after completing the project through Shabaka. It is published after a review limited to abuse and personal data. We never remove a review for being low.",
    "تقييمات المستقلين": "Freelancer reviews",
    "تقييمات الموقع": "Site reviews",
    "قيّم تجربتك": "Rate your experience",
    "التقييم متاح لأصحاب المشاريع والمستقلين المسجلين عندنا. ادخل ببريدك وكلمة المرور.":
      "Reviews are open to registered project owners and freelancers. Sign in with your email and password.",
    "قيّم مستقلًا أتمّ مشروعك": "Rate a freelancer who completed your project",
    المشروع: "Project",
    التقييم: "Rating",
    رأيك: "Your opinion",
    "تقييم المستقل يتاح بعد اكتمال مشروعك واعتماده من شبكة.":
      "Freelancer reviews open once your project is completed.",
    "قيّم موقع شبكة": "Rate the Shabaka site",
    "التقييمات تعبّر عن آراء أصحابها ولا تتحمل شبكة مسؤوليتها.":
      "Reviews reflect their authors' opinions; Shabaka is not responsible for them.",
    مستقل: "Freelancer",
    نبذة: "About",
    "معرض الأعمال": "Portfolio",
    "ملفي المهني": "My professional profile",
    "للمستقلين: ملفك العام يظهر لأصحاب المشاريع بعد مراجعتنا له، ويجمع تقييماتك.":
      "For freelancers: your public profile is shown to project owners after our review, and collects your reviews.",
    "هذه الصفحة قيد التجهيز وستكون متاحة قريبًا.":
      "This page is being prepared and will be available soon.",
    أنا: "I am",
    "صاحب مشروع": "Project owner",
    "الاسم المعروض": "Display name",
    التخصص: "Specialty",
    "رابط معرض الأعمال (اختياري)": "Portfolio link (optional)",
    "نبذة عنك": "About you",
    "للمستقل: خبراتك وطريقة عملك (20 حرفًا على الأقل). لا تكتب أرقام هواتف أو إيميلات.":
      "For freelancers: your experience and way of working (at least 20 characters). No phone numbers or emails.",
    "حفظ وإرسال للمراجعة": "Save and submit for review",
    "أي تعديل لاحق يعيد ملفك للمراجعة قبل ظهوره.":
      "Any later edit sends your profile back for review before it shows.",
    "عرض ملفي العام": "View my public profile",
    "برمجة وتطوير مواقع": "Web development",
    تصميم: "Design",
    "تسويق رقمي": "Digital marketing",
    "مونتاج وفيديو": "Video & editing",
    "كتابة وترجمة": "Writing & translation",
    "خدمة أخرى": "Other service",
    "أقل من 25$": "Under $25",
    "25 – 50$": "$25 – $50",
    "50 – 100$": "$50 – $100",
    "100 – 250$": "$100 – $250",
    "أكثر من 250$": "Over $250",
    "تُحدد لاحقًا": "To be decided",
    "يوم واحد": "1 day",
    "حتى 3 أيام": "Up to 3 days",
    أسبوع: "1 week",
    أسبوعان: "2 weeks",
    "شهر أو أكثر": "1 month or more",
    مرنة: "Flexible",
    "الرابط انتهت صلاحيته أو استُخدم من قبل. اطلب رمز دخول جديد.":
      "This link has expired or was already used.",
    "لا توجد طلبات منشورة بعد. كن أول من يكتب.":
      "No published requests yet. Be the first to post.",
    "راسل صاحب الطلب": "Message the requester",
    "أحتاج هذه الخدمة أيضًا": "I need this service too",
    أحتاجها: "I need it",
    "سجّل الدخول أولًا للمراسلة.": "Sign in first to send a message.",
    "سجّل الدخول أولًا للتصويت.": "Sign in first to vote.",
    "للمراسلة أنشئ ملفك كمستقل أولًا. سننقلك لصفحة ملفك.":
      "To message, create your freelancer profile first. We'll take you to your profile.",
    "تعذّر بدء المحادثة. ربما هذا طلبك أنت، أو وصلت للحد اليومي.":
      "Couldn't start the conversation. It may be your own request, or you've hit the daily limit.",
    "تعذّر التصويت، حاول مرة أخرى.": "Couldn't vote, please try again.",
    "طلباتك قيد المراجعة": "Your requests under review",
    "قيد المراجعة": "Under review",
    مرفوض: "Rejected",
    "المجتمع قيد التجهيز وسيُفتح قريبًا.":
      "The community is being prepared and will open soon.",
    "تعذّر تحميل الطلبات.": "Couldn't load requests.",
    "كل الفئات": "All categories",
    اختر: "Choose",
    "الميزانية (اختياري)": "Budget (optional)",
    "المدة المطلوبة (اختياري)": "Required duration (optional)",
    "اكتب البريد وكلمة مرور من 8 أحرف على الأقل.":
      "Enter your email and a password of at least 8 characters.",
    "جارٍ التحقق...": "Checking...",
    "تحقق من بريدك لتأكيد الحساب ثم سجّل الدخول.":
      "Check your email to confirm your account, then sign in.",
    "تعذّر إنشاء الحساب. ربما الحساب موجود، جرّب الدخول.":
      "Couldn't create the account. It may already exist; try signing in.",
    "البريد أو كلمة المرور غير صحيحة. لو هذه أول مرة، اضغط «إنشاء حساب جديد».":
      "Wrong email or password. If this is your first time, press “Create new account”.",
    "البريد أو كلمة المرور غير صحيحة.": "Wrong email or password.",
    "وصلنا طلبك وسيظهر بعد المراجعة.":
      "We got your request; it will appear after review.",
    "تعذّر الإرسال. راجع الحقول، أو ربما وصلت للحد اليومي (3 طلبات).":
      "Couldn't submit. Check the fields, or you may have hit the daily limit (3 requests).",
    محادثة: "Conversation",
    "لا توجد محادثات بعد.": "No conversations yet.",
    "تعذّر الإرسال، حاول مرة أخرى.": "Couldn't send, please try again.",
    "هل اكتمل المشروع وتريد اعتماده؟ سيظهر لك تقييم المستقل بعدها.":
      "Is the project finished? Confirming will let you review the freelancer.",
    "تم. يمكنك الآن تقييم المستقل من صفحة التقييمات.":
      "Done. You can now review the freelancer from the Reviews page.",
    "تعذّر الاعتماد، حاول مرة أخرى.": "Couldn't confirm, please try again.",
    "مشروع مكتمل عبر شبكة": "Project completed via Shabaka",
    "المستقل:": "Freelancer:",
    "لا توجد تقييمات منشورة للموقع بعد.": "No published site reviews yet.",
    الكل: "All",
    "لا توجد تقييمات منشورة للمستقلين بعد.":
      "No published freelancer reviews yet.",
    "اختر المشروع": "Choose the project",
    مشروع: "Project",
    "التقييمات قيد التجهيز وستُفتح قريبًا.":
      "Reviews are being prepared and will open soon.",
    "تعذّر تحميل التقييمات.": "Couldn't load reviews.",
    ممتاز: "Excellent",
    "جيد جدًا": "Very good",
    جيد: "Good",
    ضعيف: "Poor",
    سيئ: "Bad",
    "تعذّر الإرسال. التقييم متاح لمن أتمّ مشروعًا عبر شبكة، ولمرة واحدة لكل مشروع.":
      "Couldn't submit. Reviews are for those who completed a project via Shabaka, once per project.",
    "وصلنا تقييمك وسيظهر بعد المراجعة.":
      "We got your review; it will appear after review.",
    "الملف غير متاح.": "Profile unavailable.",
    "لا يوجد ملف منشور لهذا العضو بعد.":
      "No published profile for this member yet.",
    "عضو منذ": "Member since",
    "مشاريع مكتملة عبر شبكة": "Projects completed via Shabaka",
    "لا توجد تقييمات منشورة بعد.": "No published reviews yet.",
    "لا توجد تقييمات بعد": "No reviews yet",
    "تعذّر تحميل الملف.": "Couldn't load the profile.",
    "ملفك قيد المراجعة وسيظهر للجميع بعد الموافقة.":
      "Your profile is under review and will be public once approved.",
    "ملفك منشور للجميع.": "Your profile is public.",
    "تعذّر نشر ملفك. عدّله وأعد الإرسال.":
      "Your profile wasn't approved. Edit it and resubmit.",
    "أهلًا بك! أكمل ملفك أولًا ليتمكن الآخرون من التعرف عليك.":
      "Welcome! Complete your profile first so others can get to know you.",
    "رابط المعرض لازم يبدأ بـ https://":
      "The portfolio link must start with https://",
    "النبذة 20 حرفًا على الأقل.": "The bio must be at least 20 characters.",
    "وصلنا ملفك وسيظهر بعد المراجعة. يمكنك الآن العودة للمجتمع.":
      "We got your profile; it will show after review. You can go back to the community now.",
    "تعذّر الحفظ. راجع الحقول وحاول مرة أخرى.":
      "Couldn't save. Check the fields and try again.",
    الإشعارات: "Notifications",
    "تحديد الكل كمقروء": "Mark all as read",
    "لا توجد إشعارات بعد.": "No notifications yet.",
    "تمت الموافقة على ملفك وهو الآن ظاهر للجميع":
      "Your profile was approved and is now public",
    "لم تتم الموافقة على ملفك. عدّله وأعد الإرسال":
      "Your profile wasn't approved. Edit and resubmit.",
    "تم نشر تقييمك": "Your review was published",
    "لم يتم نشر تقييمك": "Your review wasn't published",
  };
  const PAT = [
    [/^الميزانية: (.+)$/, (m) => "Budget: " + T(m[1])],
    [/^المدة: (.+)$/, (m) => "Duration: " + T(m[1])],
    [/^(★+) — (.+)$/, (m) => m[1] + " — " + T(m[2])],
    [/^(.*) — مكتمل$/, (m) => T(m[1]) + " — Completed"],
    [/^الإشعارات، (\d+) جديدة$/, (m) => "Notifications, " + m[1] + " new"],
    [/^الرسائل، (\d+) غير مقروءة$/, (m) => "Messages, " + m[1] + " unread"],
    [/^التقييم ([\d.]+) من 5$/, (m) => "Rating " + m[1] + " of 5"],
    [
      /^([\d.]+) \/ 5 · (\d+) تقييم$/,
      (m) => m[1] + " / 5 · " + m[2] + " reviews",
    ],
    [
      /^وصلنا تقييمك للموقع (.+)$/,
      (m) =>
        "We got your site review " +
        (m[1].startsWith("وهو")
          ? "and it is published."
          : "and it will appear after review."),
    ],
    [/^متوسط التقييم \((\d+)\)$/, (m) => "Average rating (" + m[1] + ")"],
    [
      /^تمت الموافقة على طلبك وهو ظاهر الآن في المجتمع: (.+)$/,
      (m) => "Your request was approved and is now in the community: " + m[1],
    ],
    [
      /^لم تتم الموافقة على طلبك: (.+)$/,
      (m) => "Your request wasn't approved: " + m[1],
    ],
    [
      /^تلقيت تقييمًا جديدًا (\d) من 5 من (.+)$/,
      (m) => "You received a new " + m[1] + "/5 review from " + m[2],
    ],
    [
      /^راسلك (.+) بخصوص طلبك: (.+)$/,
      (m) => m[1] + " messaged you about your request: " + m[2],
    ],
    [
      /^اعتمد صاحب المشروع اكتمال: (.+)$/,
      (m) => "The project owner marked as completed: " + m[1],
    ],
    [
      /^يمكنك الآن تقييم المستقل (.*)$/,
      (m) => "You can now review the freelancer " + m[1],
    ],
  ];
  function T(s) {
    if (!EN || typeof s !== "string") return s;
    const k = s.trim();
    if (!k) return s;
    if (MAP[k]) return s.replace(k, MAP[k]);
    for (const [re, fn] of PAT) {
      const m = re.exec(k);
      if (m) return s.replace(k, fn(m));
    }
    return s;
  }
  window.T = T;
  const ATTR = ["placeholder", "aria-label", "title"];
  const tx = (n) => {
    const v = T(n.nodeValue);
    if (v !== n.nodeValue) n.nodeValue = v;
  };
  const at = (e, a) => {
    const v = e.getAttribute(a);
    if (v) {
      const t = T(v);
      if (t !== v) e.setAttribute(a, t);
    }
  };
  function walk(n) {
    if (n.nodeType === 3) {
      tx(n);
      return;
    }
    if (n.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(n.nodeName))
      return;
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT),
      list = [];
    while (w.nextNode())
      if (!/^(SCRIPT|STYLE|TEXTAREA)$/.test(w.currentNode.parentNode.nodeName))
        list.push(w.currentNode);
    list.forEach(tx);
    [n, ...n.querySelectorAll("[placeholder],[aria-label],[title]")].forEach(
      (e) => ATTR.forEach((a) => at(e, a)),
    );
  }

  const E = (t, c, x) => {
    const e = document.createElement(t);
    if (c) e.className = c;
    if (x != null) e.textContent = x;
    return e;
  };
  const NS = "http://www.w3.org/2000/svg";
  const icon = (paths) => {
    const s = document.createElementNS(NS, "svg");
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
    ].forEach(([k, v]) => s.setAttribute(k, v));
    paths.forEach((d) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", d);
      s.append(p);
    });
    return s;
  };
  const SUN = [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  ];
  const MOON = ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"];
  const dark = () =>
    S.theme
      ? S.theme === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
  const save = () => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ lang: EN ? "en" : "ar", theme: S.theme || null }),
      );
    } catch (e) {}
  };

  const w = document.querySelector("header .w");
  if (w && !document.getElementById("lang")) {
    const ctl = E("div", "ctl"),
      lb = E("button", "ib", EN ? "عربي" : "EN"),
      tb = E("button", "ib");
    lb.type = tb.type = "button";
    lb.setAttribute("aria-label", EN ? "العربية" : "English");
    const paint = () => {
      tb.textContent = "";
      tb.append(icon(dark() ? SUN : MOON));
      const l = EN
        ? dark()
          ? "Light mode"
          : "Dark mode"
        : dark()
          ? "الوضع النهاري"
          : "الوضع الليلي";
      tb.setAttribute("aria-label", l);
      tb.title = l;
    };
    tb.onclick = () => {
      S.theme = dark() ? "light" : "dark";
      root.setAttribute("data-theme", S.theme);
      save();
      paint();
    };
    lb.onclick = () => {
      S.lang = EN ? "ar" : "en";
      try {
        localStorage.setItem(
          KEY,
          JSON.stringify({ lang: S.lang, theme: S.theme || null }),
        );
      } catch (e) {}
      location.reload();
    };
    paint();
    ctl.append(lb, tb);
    w.append(ctl);
  }
  if (EN) {
    document.title = T(document.title);
    walk(document.body);
    new MutationObserver((ms) =>
      ms.forEach((m) => {
        if (m.type === "attributes") at(m.target, m.attributeName);
        else if (m.type === "characterData") tx(m.target);
        else m.addedNodes.forEach(walk);
      }),
    ).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTR,
    });
  }
})();
