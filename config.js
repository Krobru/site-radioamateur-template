/* ============================================================
   CONFIGURATION DU SITE — le SEUL fichier à modifier.
   Remplacez les valeurs entre guillemets puis enregistrez (Commit).
   Modèle libre (MIT) — merci de garder la mention « modèle par ON5EE ».
   ============================================================ */
window.CFG = {
  CALL: "ON0XXX",                 // votre indicatif
  EXCALL: "ON0YYY",               // ancien indicatif (ou laissez tel quel et retirez la mention dans index.html)
  NAME: "Prénom",                 // votre prénom (mentions légales)
  LOCATOR: "JO20AA",              // votre locator Maidenhead (6 caractères)
  REGION_FR: "Belgique · Province",
  REGION_EN: "Belgium · Province",
  EMAIL: "vous@example.com",      // adresse qui reçoit les formulaires (FormSubmit)
  DOMAIN: "votre-pseudo.github.io/votre-depot",   // nom de domaine ou adresse GitHub Pages
  SITE_URL: "https://votre-pseudo.github.io/votre-depot/",  // avec / final
  PAYPAL: "https://www.paypal.me/VotreNom",

  /* Club / section */
  CLUB_FR: "Section UBA XXX",
  CLUB_EN: "UBA XXX section",
  CLUB_URL: "https://www.uba.be/fr",

  /* Relais (si vous n'en gérez pas, laissez des valeurs d'exemple ou retirez la section dans index.html) */
  REP_CALL: "ON0XXX",
  REP_OUT: "438.000",             // sortie (écoute) en MHz, avec un point
  REP_IN: "430.400",              // entrée (émission) en MHz
  CTCSS: "000.0",
  REP_LOCATOR: "JO20AA",
  REP_CITY: "VILLE",
  REP_SITE_FR: "salle du club de Ville",
  REP_SITE_EN: "club house in City",
  REP_ALT: "100 m / 20 m",
  REP_EQUIP: "Marque Modèle",
  REP_POWER: "10 W",

  /* Station : un bloc par appareil. cat = filtres : hf, vu, mobile, portable, num */
  STATION: [
    { cat: "hf",          fr: "HF · Station fixe", en: "HF · Base station", name: "Transceiver HF", tags: ["HF"] },
    { cat: "hf",          fr: "HF · Antenne",      en: "HF · Antenna",      name: "Dipôle 20 m",    tags: ["HF"] },
    { cat: "vu mobile",   fr: "VHF/UHF · Mobile",  en: "VHF/UHF · Mobile",  name: "Mobile bibande", tags: ["VHF", "UHF"] },
    { cat: "vu portable", fr: "VHF/UHF · Portatif", en: "VHF/UHF · Handheld", name: "Portatif bibande", tags: ["VHF", "UHF"] }
  ]
};

/* ---- Ne rien modifier en dessous ---- */
(function () {
  var C = window.CFG;
  C.REP_OUT_FR = C.REP_OUT.replace('.', ',');
  C.REP_IN_FR = C.REP_IN.replace('.', ',');
  C.CTCSS_FR = C.CTCSS.replace('.', ',');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var g = document.getElementById('gear');
  if (g && C.STATION) {
    g.innerHTML = C.STATION.map(function (it) {
      return '<div class="glass card reveal" data-t="' + esc(it.cat) + '"><svg class="gico" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><rect class="st" x="4" y="14" width="40" height="20" rx="3"/><circle class="st" cx="34" cy="24" r="5"/><rect x="9" y="19" width="14" height="7" fill="#0a1a33" stroke="#4da3ff"/></svg>' +
        '<span class="role" data-en="' + esc(it.en) + '">' + esc(it.fr) + '</span><span class="name">' + esc(it.name) + '</span><div class="tags">' +
        (it.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div></div>';
    }).join('');
  }
  var re = /\{\{(\w+)\}\}/g, rep = function (s) { return s.replace(re, function (m, k) { return k in C ? C[k] : m; }); };
  var w = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT), n;
  while ((n = w.nextNode())) if (n.nodeValue.indexOf('{{') > -1) n.nodeValue = rep(n.nodeValue);
  Array.prototype.forEach.call(document.querySelectorAll('*'), function (el) {
    Array.prototype.forEach.call(el.attributes, function (a) { if (a.value.indexOf('{{') > -1) el.setAttribute(a.name, rep(a.value)); });
  });
  if (document.title.indexOf('{{') > -1) document.title = rep(document.title);
})();
