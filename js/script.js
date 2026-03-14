// ── Header sombra al hacer scroll
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 30);
});

// ── Scroll reveal con IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Abrir modal
function openModal(role = 'padre') {
  document.getElementById('modal').classList.add('open');
  switchTab(role);
  document.getElementById('login-error').style.display = 'none';
}

// ── Cerrar modal
function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

// ── Cerrar modal al hacer clic fuera
function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}

// ── Cerrar modal con tecla Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ── Cambiar pestaña Padre / Docente
function switchTab(role) {
  document.getElementById('form-padre').style.display   = role === 'padre'   ? 'block' : 'none';
  document.getElementById('form-docente').style.display = role === 'docente' ? 'block' : 'none';
  document.getElementById('tab-padre').classList.toggle('active',   role === 'padre');
  document.getElementById('tab-docente').classList.toggle('active', role === 'docente');
  document.getElementById('login-error').style.display = 'none';
}

// ── Mostrar error en modal
function showError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = 'block';
}

// ── Login padre de familia
function loginPadre() {
  const nombre = document.getElementById('alumno-nombre').value.trim();
  const fecha  = document.getElementById('alumno-fecha').value;
  if (!nombre) return showError('⚠ Por favor ingresa el nombre del alumno.');
  if (!fecha)  return showError('⚠ Por favor ingresa la fecha de nacimiento.');
  closeModal();
  alert(`✅ Bienvenido/a. Ingresando como padre de familia de ${nombre}...`);
}

// ── Login docente
function loginDocente() {
  const user = document.getElementById('doc-user').value.trim();
  const pass = document.getElementById('doc-pass').value;
  if (!user) return showError('⚠ Ingresa tu usuario.');
  if (!pass) return showError('⚠ Ingresa tu contraseña.');
  closeModal();
  alert(`✅ Bienvenido/a, ${user}. Cargando panel del docente...`);
}