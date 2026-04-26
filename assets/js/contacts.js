/* =========================================================
   MMTS – Contact form
   Hardened: no innerHTML, strict client-side validation,
   length caps, character whitelist, opens user's mail client
   via mailto: (no server endpoint to attack).
   ========================================================= */

(function () {
  const form = document.getElementById("cbForm");
  if (!form) return;
  const ok = document.getElementById("cbMsgOk");

  /* Strict allowed-character regexes (Cyrillic + Latin + common punct.) */
  const RE_NAME = /^[\p{L}\p{M}\s.\-']{2,80}$/u;
  const RE_EMAIL = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}$/;
  const RE_SAFE = /^[^<>]{0,2000}$/; /* reject angle-brackets entirely */

  function field(name) {
    return form.elements.namedItem(name);
  }

  function valid() {
    const name = (field("name").value || "").trim();
    const email = (field("email").value || "").trim();
    const subject = (field("subject").value || "").trim();
    const message = (field("message").value || "").trim();

    if (!RE_NAME.test(name)) return mark(field("name"), false), false;
    mark(field("name"), true);
    if (!RE_EMAIL.test(email) || email.length > 120) return mark(field("email"), false), false;
    mark(field("email"), true);
    if (!RE_SAFE.test(subject) || subject.length > 120) return mark(field("subject"), false), false;
    mark(field("subject"), true);
    if (!RE_SAFE.test(message) || message.length < 2 || message.length > 2000) return mark(field("message"), false), false;
    mark(field("message"), true);
    return { name, email, subject, message };
  }

  function mark(el, isOk) {
    if (!el) return;
    el.style.borderColor = isOk ? "" : "#ff6b6b";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = valid();
    if (!v) return;

    /* Build a sanitized mailto URL */
    const subj = v.subject || "MMTS – заявка с сайта";
    const body =
      "Имя: " + v.name + "\n" +
      "E-mail: " + v.email + "\n\n" +
      v.message + "\n\n" +
      "– отправлено с сайта mmts.su";

    const url = "mailto:sales@mmts.su" +
      "?subject=" + encodeURIComponent(subj) +
      "&body=" + encodeURIComponent(body);

    /* Use a temp anchor with rel/noopener to avoid window.opener leakage */
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener noreferrer";
    a.target = "_self";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    ok.classList.add("is-on");
    form.reset();
    setTimeout(() => ok.classList.remove("is-on"), 6000);
  });
})();
