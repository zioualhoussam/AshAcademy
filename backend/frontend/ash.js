// ── Page Navigation ──────────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav a[data-page]').forEach(a => a.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const nav = document.querySelector(`nav a[data-page="${id}"]`);
  if (nav) nav.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Sticky Header ────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 20);
});

// ── Mobile Menu ──────────────────────────────────────────────
function toggleMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}
document.addEventListener('click', (e) => {
  if (!e.target.closest('#mobile-menu') && !e.target.closest('.hamburger')) {
    document.getElementById('mobile-menu').classList.remove('open');
  }
});

// ── Enroll Modal ─────────────────────────────────────────────
function openEnroll() {
  document.getElementById('enroll-modal').classList.add('open');
}
function closeEnroll(e) {
  if (!e || e.target === document.getElementById('enroll-modal') || e.target.classList.contains('close-btn')) {
    document.getElementById('enroll-modal').classList.remove('open');
  }
}

// ── Toast Notification ───────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Enroll Form Submit ───────────────────────────────────────
function submitEnroll() {
  const name  = document.getElementById('e-name').value.trim();
  const phone = document.getElementById('e-phone').value.trim();
  if (!name || !phone) {
    showToast('⚠️ Please fill in your name and phone number.');
    return;
  }
  closeEnroll({});
  showToast('✅ Thank you ' + name + '! We\'ll contact you soon.');
  document.getElementById('e-name').value  = '';
  document.getElementById('e-phone').value = '';
}

// ── Contact Form Submit ──────────────────────────────────────
function submitContact() {
  const name  = document.getElementById('c-name').value.trim();
  const email = document.getElementById('c-email').value.trim();
  const msg   = document.getElementById('c-message').value.trim();
  if (!name || !email || !msg) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }
  showToast('✅ Message sent! We\'ll reply to ' + email + ' shortly.');
  document.getElementById('c-name').value    = '';
  document.getElementById('c-email').value   = '';
  document.getElementById('c-message').value = '';
}
