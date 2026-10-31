(function () {
  'use strict';

  // Paste the Apps Script web-app URL here (see README.md).
  var RSVP_URL = 'https://script.google.com/macros/s/AKfycbw-lqzfMBiCMnHDChbEHCRxTUk34k_gNaEK4trpe5g1u_y5ZK9dahbyALRbzl6zGJtV/exec';

  // Event: 25 Dec 2026, 17:00 Almaty (UTC+5). RSVP closes end of 26 Dec 2026, Almaty.
  var EVENT_START = new Date('2026-12-25T17:00:00+05:00');
  var EVENT_END = new Date('2026-12-26T00:00:00+05:00');
  var DEADLINE = new Date('2026-12-26T23:59:59+05:00');
  var MAX_COMPANIONS = 9;

  var T = {
    kk: {
      inv1: 'Құрметті қонақтар!',
      inv2: 'Ардақты ағайын-туыс, құда-жекжат, дос-жаран!',
      inv3: 'Сіздерді аяулы қызымыз',
      inv4: 'Наргизаның',
      inv5: 'ақ босаға аттап, жаңа өмірге қадам басар',
      inv6: 'Ұзату тойына',
      inv7: 'арналған ақ дастарханымызға қадірлі қонағы болуға шақырамыз!',
      hostsLabel: 'Құрметпен той иелері:',
      hosts: 'Мұхтар мен Майра',
      dateTitle: 'Той күні:',
      dateLine: 'Желтоқсан 2026 жылы',
      timeLine: 'Сағат 17:00-де',
      cdD: 'күн', cdH: 'сағат', cdM: 'минут', cdS: 'секунд',
      addGoogle: 'Google Calendar',
      addIcs: 'Apple / Outlook (.ics)',
      venueLabel: 'Мекен-жайымыз:',
      venueAddr: 'Бесағаш ауылы, Райымбек батыр көшесі, 143-үй',
      venueName: '“Diana-1” тойханасы',
      open2gis: '2GIS-те ашу',
      rsvpTitle: 'Келесіз бе?',
      yes: 'Иә, келемін',
      no: 'Келе алмаймын',
      yourName: 'Есіміңіз:',
      partyQ: 'Жалғыз келесіз бе?',
      alone: 'Жалғызбын',
      group: 'Бірге келеміз',
      companionsLbl: 'Бірге келетіндердің есімдері:',
      addPerson: '+ Тағы біреу қосу',
      send: 'Жіберу',
      sending: 'Жіберілуде…',
      again: 'Жауапты қайта жіберу',
      closed: 'Жауап қабылдау аяқталды.',
      thanksYes: 'Рақмет!',
      thanksYesText: 'Сізді тойымызда күтеміз!',
      thanksNo: 'Рақмет!',
      thanksNoText: 'Жауабыңыз үшін алғыс айтамыз.',
      errAttend: 'Келетініңізді таңдаңыз.',
      errName: 'Есіміңізді жазыңыз.',
      errParty: 'Жалғыз немесе бірге келетініңізді таңдаңыз.',
      errCompanion: 'Бірге келетін адамның есімін жазыңыз.',
      errNet: 'Жіберу мүмкін болмады. Интернетті тексеріп, қайталап көріңіз.',
      errConfig: 'Форма әлі қосылмаған.',
      placeholderCompanion: 'Есімі',
      remove: 'Жою'
    },
    en: {
      inv1: 'Dear guests!',
      inv2: 'Dear relatives, in-laws and friends!',
      inv3: 'We invite you to be our honored guest at the',
      inv4: 'Uzatu Toi',
      inv5: 'of our beloved daughter',
      inv6: 'Nargiza',
      inv7: 'as she steps across the white threshold into a new life!',
      hostsLabel: 'With respect, the hosts:',
      hosts: 'Mukhtar and Maira',
      dateTitle: 'Date:',
      dateLine: '25 December 2026',
      timeLine: 'At 5:00 PM (Almaty time)',
      cdD: 'days', cdH: 'hours', cdM: 'min', cdS: 'sec',
      addGoogle: 'Google Calendar',
      addIcs: 'Apple / Outlook (.ics)',
      venueLabel: 'Our address:',
      venueAddr: '143 Raiymbek Batyr St., Besagash village',
      venueName: '“Diana-1” banquet hall',
      open2gis: 'Open in 2GIS',
      rsvpTitle: 'Will you come?',
      yes: 'Yes, I’ll come',
      no: 'I can’t come',
      yourName: 'Your name:',
      partyQ: 'Are you coming alone?',
      alone: 'Alone',
      group: 'With others',
      companionsLbl: 'Names of the people coming with you:',
      addPerson: '+ Add another person',
      send: 'Send',
      sending: 'Sending…',
      again: 'Send the answer again',
      closed: 'RSVPs are now closed.',
      thanksYes: 'Thank you!',
      thanksYesText: 'We look forward to seeing you at our celebration!',
      thanksNo: 'Thank you!',
      thanksNoText: 'Thank you for letting us know.',
      errAttend: 'Please tell us whether you are coming.',
      errName: 'Please enter your name.',
      errParty: 'Please choose whether you come alone or with others.',
      errCompanion: 'Please enter the name of at least one person coming with you.',
      errNet: 'Could not send. Please check your connection and try again.',
      errConfig: 'The form is not connected yet.',
      placeholderCompanion: 'Name',
      remove: 'Remove'
    }
  };

  var lang = 'kk';
  try { if (localStorage.getItem('lang') === 'en') lang = 'en'; } catch (e) {}

  var $ = function (id) { return document.getElementById(id); };
  var form = $('rsvp');
  var nameInput = $('name');
  var companionsEl = $('companions');
  var msg = $('msg');
  var sendBtn = $('send');
  var lastAnswer = null; // 'yes' | 'no' of the last successful submission

  function t(key) { return T[lang][key]; }

  function applyLang() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'kk';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('.lang button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === lang);
    });
    companionsEl.querySelectorAll('input').forEach(function (i) { i.placeholder = t('placeholderCompanion'); });
    companionsEl.querySelectorAll('.rm').forEach(function (b) { b.setAttribute('aria-label', t('remove')); });
    if (lastAnswer) showDone(lastAnswer);
    msg.textContent = '';
  }

  document.querySelector('.lang').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-lang]');
    if (!b) return;
    lang = b.getAttribute('data-lang');
    try { localStorage.setItem('lang', lang); } catch (err) {}
    applyLang();
  });

  /* ---------- calendar ---------- */
  function gcalStamp(d) { return d.toISOString().replace(/[-:]|\.\d{3}/g, ''); }
  $('gcal').href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('Qyz Uzatu — Nargiza') +
    '&dates=' + gcalStamp(EVENT_START) + '/' + gcalStamp(EVENT_END) +
    '&location=' + encodeURIComponent('“Diana-1” тойханасы, Бесағаш ауылы, Райымбек батыр көшесі, 143') +
    '&details=' + encodeURIComponent('Қыз ұзату тойы. Той иелері: Мұхтар мен Майра.\nhttps://2gis.kz/almaty/firm/70000001023578560');

  /* ---------- countdown ---------- */
  var cd = $('countdown');
  function tick() {
    var ms = EVENT_START - new Date();
    if (ms <= 0) { cd.hidden = true; return; }
    cd.hidden = false;
    var s = Math.floor(ms / 1000);
    $('cd-d').textContent = Math.floor(s / 86400);
    $('cd-h').textContent = Math.floor(s % 86400 / 3600);
    $('cd-m').textContent = Math.floor(s % 3600 / 60);
    $('cd-s').textContent = s % 60;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- RSVP form ---------- */
  function val(name) {
    var el = form.querySelector('input[name=' + name + ']:checked');
    return el ? el.value : '';
  }

  function addCompanion() {
    if (companionsEl.children.length >= MAX_COMPANIONS) return;
    var wrap = document.createElement('div');
    wrap.className = 'comp';
    var inp = document.createElement('input');
    inp.type = 'text';
    inp.maxLength = 100;
    inp.placeholder = t('placeholderCompanion');
    wrap.appendChild(inp);
    var rm = document.createElement('button');
    rm.type = 'button';
    rm.className = 'rm';
    rm.textContent = '×';
    rm.setAttribute('aria-label', t('remove'));
    rm.addEventListener('click', function () {
      wrap.remove();
      if (!companionsEl.children.length) addCompanion();
      $('addCompanion').hidden = false;
    });
    wrap.appendChild(rm);
    companionsEl.appendChild(wrap);
    $('addCompanion').hidden = companionsEl.children.length >= MAX_COMPANIONS;
  }

  function syncForm() {
    var a = val('attending');
    var p = val('party');
    $('nameBlock').hidden = !a;
    $('partyBlock').hidden = a !== 'yes';
    var group = a === 'yes' && p === 'group';
    $('companionsBlock').hidden = !group;
    if (group && !companionsEl.children.length) addCompanion();
    sendBtn.hidden = !a || (a === 'yes' && !p);
    msg.textContent = '';
  }
  form.addEventListener('change', syncForm);
  $('addCompanion').addEventListener('click', addCompanion);

  function showDone(answer) {
    form.hidden = true;
    $('done').hidden = false;
    $('doneTitle').textContent = t(answer === 'yes' ? 'thanksYes' : 'thanksNo');
    $('doneText').textContent = t(answer === 'yes' ? 'thanksYesText' : 'thanksNoText');
  }

  function showClosed() {
    form.hidden = true;
    $('done').hidden = true;
    $('closed').hidden = false;
  }

  $('again').addEventListener('click', function () {
    lastAnswer = null;
    try { localStorage.removeItem('rsvp'); } catch (e) {}
    $('done').hidden = true;
    form.hidden = false;
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var a = val('attending');
    var p = val('party');
    var name = nameInput.value.trim();
    var companions = [];
    if (a === 'yes' && p === 'group') {
      companionsEl.querySelectorAll('input').forEach(function (i) {
        if (i.value.trim()) companions.push(i.value.trim());
      });
    }

    var err = !a ? 'errAttend' : !name ? 'errName' :
      (a === 'yes' && !p) ? 'errParty' :
      (a === 'yes' && p === 'group' && !companions.length) ? 'errCompanion' : '';
    if (err) { msg.textContent = t(err); return; }
    if (!RSVP_URL) { msg.textContent = t('errConfig'); return; }
    if (new Date() > DEADLINE) { showClosed(); return; }

    sendBtn.disabled = true;
    sendBtn.textContent = t('sending');
    msg.textContent = '';

    // text/plain keeps this a "simple" request, so the browser skips the CORS preflight Apps Script can't answer.
    fetch(RSVP_URL, {
      method: 'POST',
      body: JSON.stringify({ name: name, attending: a === 'yes', companions: companions, lang: lang })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          lastAnswer = a;
          try { localStorage.setItem('rsvp', a); } catch (e) {}
          showDone(a);
        } else if (res.error === 'closed') {
          showClosed();
        } else {
          msg.textContent = t('errNet');
        }
      })
      .catch(function () { msg.textContent = t('errNet'); })
      .then(function () {
        sendBtn.disabled = false;
        sendBtn.textContent = t('send');
      });
  });

  /* ---------- init ---------- */
  if (new Date() > DEADLINE) {
    showClosed();
  } else {
    try {
      var saved = localStorage.getItem('rsvp');
      if (saved === 'yes' || saved === 'no') { lastAnswer = saved; }
    } catch (e) {}
  }
  applyLang();

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }
})();
