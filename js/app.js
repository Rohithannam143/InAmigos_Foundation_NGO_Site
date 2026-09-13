(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const header = $('#siteHeader');
  const menu = $('.menu-btn');
  const nav = $('#mainNav');
  const toast = $('#toast');

  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 12), { passive: true });

  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  $$('#mainNav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false');
  }));

  const counters = $$('[data-count]');
  let counted = false;
  const animateCounters = () => {
    if (counted) return;
    const box = $('#impact'); if (!box) return;
    const top = box.getBoundingClientRect().top;
    if (top > window.innerHeight * .85) return;
    counted = true;
    counters.forEach(el => {
      const target = Number(el.dataset.count);
      const duration = 1100;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-IN') + (target >= 28 ? '+' : '');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };
  window.addEventListener('scroll', animateCounters, { passive: true }); animateCounters();

  const openDialog = id => { const d = document.getElementById(id); if (d && typeof d.showModal === 'function') d.showModal(); };
  const closeDialog = id => document.getElementById(id)?.close();
  $$('.js-donate').forEach(b => b.addEventListener('click', () => openDialog('donateModal')));
  $$('.js-volunteer').forEach(b => b.addEventListener('click', () => openDialog('volunteerModal')));
  $$('[data-close]').forEach(b => b.addEventListener('click', () => closeDialog(b.dataset.close)));
  $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

  let selectedAmount = 1000;
  const amountButtons = $$('.amounts button');
  amountButtons.forEach(b => b.addEventListener('click', () => {
    amountButtons.forEach(x => x.classList.remove('active'));
    b.classList.add('active'); selectedAmount = Number(b.dataset.amount); $('#customAmount').value = '';
  }));
  $('#customAmount')?.addEventListener('input', e => {
    if (e.target.value) { selectedAmount = Number(e.target.value); amountButtons.forEach(x => x.classList.remove('active')); }
  });

  const save = (key, payload) => {
    const old = JSON.parse(localStorage.getItem(key) || '[]');
    old.push({ ...payload, savedAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(old));
  };
  const setStatus = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  const flash = text => { toast.textContent = text; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2800); };

  $('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    save('inamigos_contact_messages', data);
    e.currentTarget.reset(); setStatus('contactStatus', 'Message saved successfully. Thank you.'); flash('Your message has been saved.');
  });
  $('#volunteerForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    save('inamigos_volunteer_applications', data);
    e.currentTarget.reset(); setStatus('volunteerStatus', 'Application saved. We’ll be in touch.'); flash('Volunteer application saved.');
  });
  $('#donateForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#donorEmail').value.trim();
    const custom = Number($('#customAmount').value);
    const amount = custom || selectedAmount;
    if (!Number.isFinite(amount) || amount < 100) { setStatus('donateStatus', 'Please choose an amount of at least ₹100.'); return; }
    save('inamigos_donation_intents', { email, amount });
    setStatus('donateStatus', `Donation intent saved for ₹${amount.toLocaleString('en-IN')}. This demo does not process payment.`);
    flash('Donation intent saved.');
  });

  $('#year').textContent = new Date().getFullYear();
})();
