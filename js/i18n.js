/*
 * Spectroton — Übersetzungen
 *
 * Aufbau wie bei den Geschwister-Werkzeugen: ein Objekt je Sprache, `_name`
 * trägt den Namen, wie er im Sprachwähler steht. Bis auf Weiteres gibt es nur
 * Deutsch — die dreizehn übrigen Sprachen kommen im zweiten Schritt dazu.
 * Bis dahin zeigt der Wähler genau einen Eintrag, und das ist ehrlicher als
 * ein Wähler, der Sprachen verspricht, die es noch nicht gibt.
 *
 * Korrekturen sind sehr willkommen:
 * https://github.com/Dennismit2n/spectroton
 */
'use strict';

var I18N = {
  de: {
    _name: 'Deutsch',

    /* ---------- Kopfzeile ---------- */
    appName: 'Spectroton',
    docTitle: 'OKLCH-Farbrampen',
    tagline: 'Eine Farbe rein, elf abgestimmte Stufen raus. Rechnet in OKLCH, prüft nach WCAG 2.2, läuft offline.',
    themeLabel: 'Erscheinungsbild',
    themeSystem: 'System',
    themeLight: 'Hell',
    themeSoftDark: 'Helleres Dunkel',
    themeDark: 'Dunkel',
    langLabel: 'Sprache',

    /* ---------- Basisfarbe ---------- */
    baseTitle: 'Basisfarbe',
    basePickAria: 'Basisfarbe wählen',
    baseHexAria: 'Basisfarbe als HEX-Wert',

    /* ---------- Akzentfarben ---------- */
    accentTitle: 'Akzentfarben',
    accentNote: 'Optional — zusätzliche Farben, die zur Basis passen. Jede bekommt ihre eigene Rampe, gleiche Feinjustage.',
    harmComp: 'Komplementär',
    harmTriad: 'Triadisch',
    harmAnalog: 'Analog',
    harmSplit: 'Split-Komp.',
    labelPrimary: 'Primär',
    labelAccent: 'Akzent {n}',
    ariaAccentColor: 'Akzent {n}, Farbe ändern',
    ariaAccentRemove: 'Akzent {n} entfernen',

    /* ---------- Farbname ----------
     * Die Listennamen sind Namen fremder Datenbestände von api.color.pizza,
     * keine Oberflächensprache: „Deutsch“ meint hier die Liste deutscher
     * Farbnamen, nicht die Sprache der Bedienung. */
    nameTitle: 'Farbname',
    namePh: 'Königsblau, Verkehrsrot …',
    nameAria: 'Farbe über den Namen suchen',
    nameListAria: 'Namensliste',
    listGerman: 'Deutsch',
    listGermanPlus: 'Deutsch +',
    listRal: 'RAL',
    listAll: 'Alle 31 914',
    listWikipedia: 'Wikipedia',
    nameSearching: 'sucht Namen …',
    nameNone: 'Kein Name in dieser Liste.',
    nameExact: 'Heißt genau: {name}',
    nameNearest: 'Am nächsten: {name} ({hex})',
    nameOffline: 'Offline — Namen brauchen einmal Netz. Bereits geladene bleiben gespeichert.',
    nameNothingFound: 'Nichts gefunden. Andere Liste versuchen.',
    nameSearchOffline: 'Offline — Namenssuche braucht Netz.',
    noteNameTaken: '{name} übernommen',

    /* ---------- Kontrastmodus ---------- */
    hintWcag: 'Tippen kopiert den HEX-Wert, Schloss friert die Stufe ein. Zahlen: WCAG-2.2-Kontrast — ab 4.5 trägt Fließtext, ab 3.0 große Schrift und Bedienelemente.',
    hintApca: 'Lc-Werte nach APCA (Entwurf für WCAG 3, nicht normativ): ab 60 Fließtext, ab 45 große Schrift, ab 30 Bedienelemente. Verbindlich bleibt WCAG 2.2.',

    /* ---------- Rampe ----------
     * „Weiß“ und „Schwarz“ stehen in 48-px-Spalten. Wer übersetzt, prüft die
     * Breite gerendert nach — nicht gerechnet. */
    rampStep: 'Stufe',
    rampColor: 'Farbe',
    rampWhite: 'Weiß',
    rampBlack: 'Schwarz',
    ariaStepCopy: 'Stufe {step}, {hex} kopieren',
    /* Zwei vollstaendige Saetze statt Rahmen plus eingesetztem Verb:
       im Englischen und Japanischen steht das Verb woanders. */
    ariaStepLock: 'Stufe {step} sperren',
    ariaStepUnlock: 'Stufe {step} entsperren',
    baseReadout: '{oklch} · liegt bei Stufe {step}',
    noteStepFree: 'Stufe {step} freigegeben',
    noteStepLock: 'Stufe {step} gesperrt',
    noteHexCopied: '{hex} kopiert',

    /* ---------- Feinjustage ---------- */
    tuneTitle: 'Feinjustage',
    tuneLmax: 'Hellste Stufe',
    tuneLmin: 'Dunkelste Stufe',
    tuneCmax: 'Buntheit',
    tuneHshift: 'Farbdrift über die Rampe',

    /* ---------- Export ---------- */
    exportTitle: 'Export',
    exportPrefixLabel: 'Name',
    exportFileLabel: 'Datei',
    exportAria: 'Exportierter Code',
    btnSave: 'Datei speichern',
    btnCopy: 'Kopieren',
    btnShare: 'Teilen',
    shareTitle: 'Spectroton-Palette',
    btnShareLink: 'Link kopieren',
    noteExportCopied: 'Export kopiert',
    noteLinkCopied: 'Link kopiert',
    noteCopyBlocked: 'Kopieren blockiert — Text markieren und selbst kopieren',
    noteWrittenTo: 'In {file} geschrieben',
    noteDownloaded: 'Datei heruntergeladen',
    noteShareFailed: 'Teilen nicht möglich',

    /* ---------- Bibliothek ---------- */
    libTitle: 'Bibliothek',
    libNamePh: 'Name der Palette',
    libNameAria: 'Name für die gespeicherte Palette',
    btnLibSave: 'Speichern',
    btnLoad: 'Laden',
    libDefaultName: 'Palette {n}',
    libNote: 'Gespeicherte Paletten bleiben im Gerät — kein Konto, kein Server.',
    ariaDelete: '„{name}“ löschen',
    confirmDelete: '„{name}“ aus der Bibliothek löschen?',
    noteLoaded: '„{name}“ geladen',
    noteSaved: '„{name}“ gespeichert',
    noteEntryBroken: 'Eintrag ist beschädigt',
    noteStorageFull: 'Speicher voll — konnte nicht sichern',
    noteFromLink: 'Palette aus Link geladen',

    /* ---------- Zurücksetzen ---------- */
    btnReset: 'Alles zurücksetzen',
    confirmReset: 'Palette und Regler auf Standard zurücksetzen?',
    noteReset: 'Zurückgesetzt',

    /* ---------- Fusszeile: was diese Umgebung kann ----------
       Die Halbsaetze werden mit '. ' verbunden. Sprachen mit anderer
       Zeichensetzung brauchen dort spaeter eine eigene Regel. */
    envSaveYes: 'Direktes Speichern in einen Ordner: ja',
    envSaveNo: 'Direktes Speichern in einen Ordner: nein, Datei landet in den Downloads',
    envGamutP3: 'Bildschirm zeigt Display-P3',
    envGamutSrgb: 'Bildschirm zeigt sRGB'
  }
};

var i18n = (function () {
  var STORAGE_KEY = 'spectroton.lang.v1';
  var current = 'de';

  function detect() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && I18N[saved]) { return saved; }
    } catch (e) { /* Speicher kann gesperrt sein */ }
    var candidates = navigator.languages || [navigator.language || 'de'];
    for (var i = 0; i < candidates.length; i++) {
      var code = String(candidates[i]).toLowerCase().split('-')[0];
      if (I18N[code]) { return code; }
    }
    return 'de';
  }

  /* Rückfall über Englisch nach Deutsch. Englisch gibt es noch nicht; die
   * Kette ist schon so geschrieben, damit sie im zweiten Schritt ohne
   * Änderung dem Hausmuster entspricht. */
  function t(key) {
    var table = I18N[current] || I18N.en || I18N.de;
    return table[key] || (I18N.en && I18N.en[key]) || I18N.de[key] || key;
  }

  function fmt(key, params) {
    var s = t(key);
    for (var k in params) {
      s = s.replace('{' + k + '}', params[k]);
    }
    return s;
  }

  function apply(lang) {
    if (I18N[lang]) { current = lang; }
    try { localStorage.setItem(STORAGE_KEY, current); } catch (e) { /* ignorieren */ }
    document.documentElement.lang = current;
    document.title = t('appName') + ' — ' + t('docTitle');
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var phNodes = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < phNodes.length; j++) {
      phNodes[j].setAttribute('placeholder', t(phNodes[j].getAttribute('data-i18n-ph')));
    }
    var ariaNodes = document.querySelectorAll('[data-i18n-aria]');
    for (var k = 0; k < ariaNodes.length; k++) {
      ariaNodes[k].setAttribute('aria-label', t(ariaNodes[k].getAttribute('data-i18n-aria')));
    }
  }

  return { detect: detect, apply: apply, t: t, fmt: fmt, get lang() { return current; } };
})();
