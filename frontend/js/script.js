// ═══════════════════════════════════════════════════════
//  CONFIGURACIÓN GLOBAL
// ═══════════════════════════════════════════════════════
const API = 'http://localhost:3000/api';

const token   = () => localStorage.getItem('token');
const hdrs    = () => ({ 
  'Content-Type': 'application/json', 
  'Authorization': `Bearer ${token()}` 
});

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(API + url, { headers: hdrs(), ...options });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error en el servidor');
    return data;
  } catch (err) {
    console.error(`[API] ${url}`, err.message);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════
//  LANDING — scroll / reveal
// ═══════════════════════════════════════════════════════
const headerEl = document.getElementById('header');
if (headerEl) {
  window.addEventListener('scroll', () => {
    headerEl.classList.toggle('scrolled', window.scrollY > 30);
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ═══════════════════════════════════════════════════════
//  MODAL DE LOGIN
// ═══════════════════════════════════════════════════════
function openModal(role = 'padre') {
  document.getElementById('modal').classList.add('open');
  switchTab(role);
  document.getElementById('login-error').style.display = 'none';
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }
function handleOverlayClick(e) { if (e.target === document.getElementById('modal')) closeModal(); }
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function switchTab(role) {
  document.getElementById('form-padre').style.display   = role === 'padre'   ? 'block' : 'none';
  document.getElementById('form-docente').style.display = role === 'docente' ? 'block' : 'none';
  document.getElementById('tab-padre').classList.toggle('active',   role === 'padre');
  document.getElementById('tab-docente').classList.toggle('active', role === 'docente');
  document.getElementById('login-error').style.display = 'none';
}
function showError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg; el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {

  const pagina = window.location.pathname;

  // PANEL ALUMNO
  if (pagina.includes('alumno.html')) {

    const rol = localStorage.getItem('rol');

    if (!rol || rol !== 'padre') {
      window.location.href = 'index.html';
      return;
    }

    iniciarPanelAlumno();
  }

  // PANEL DOCENTE
  if (pagina.includes('docente.html')) {

    const rol = localStorage.getItem('rol');

    if (!rol || rol !== 'docente') {
      window.location.href = 'index.html';
      return;
    }

    iniciarPanelDocente();
  }

});

// ── LOGIN DOCENTE → backend real
async function loginDocente() {
  const nombreUsuario = document.getElementById('doc-user').value.trim();
  const contrasena    = document.getElementById('doc-pass').value;
  if (!nombreUsuario) return showError('⚠ Ingresa tu usuario.');
  if (!contrasena)    return showError('⚠ Ingresa tu contraseña.');
  try {
    const res  = await fetch(`${API}/auth/login/docente`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombreUsuario, contrasena }),
    });
    const data = await res.json();
    if (!res.ok) return showError(data.mensaje);
    localStorage.setItem('token',  data.token);
    localStorage.setItem('nombre', data.nombre);
    localStorage.setItem('rol',    'docente');
    closeModal();
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `${data.nombre} ha iniciado sesión correctamente`,
      confirmButtonColor: '#5cbf99',
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = 'docente.html';
    }, 2000);
  } catch { showError('⚠ No se pudo conectar con el servidor.'); }
}

// ── LOGIN PADRE → backend real
async function loginPadre() {
  const nombre   = document.getElementById('alumno-nombre').value.trim();
  const fechaNac = document.getElementById('alumno-fecha').value;
  if (!nombre)   return showError('⚠ Ingresa el nombre del alumno.');
  if (!fechaNac) return showError('⚠ Ingresa la fecha de nacimiento.');
  try {
    const res  = await fetch(`${API}/auth/login/padre`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, fechaNac }),
    });
    const data = await res.json();
    if (!res.ok) return showError(data.mensaje);
    localStorage.setItem('token',    data.token);
    localStorage.setItem('alumno',   data.alumno);
    localStorage.setItem('alumnoId', data.alumnoId);
    localStorage.setItem('tutor',    data.tutor);
    localStorage.setItem('rol',      'padre');
    closeModal();
    Swal.fire({
      icon: 'success',
      title: '¡Bienvenido!',
      text: `${data.tutor} ha iniciado sesión correctamente`,
      confirmButtonColor: '#5cbf99',
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => {
      window.location.href = 'alumno.html';
    }, 2000);
  } catch { showError('⚠ No se pudo conectar con el servidor.'); }
}

// ── Guard de autenticación
function requireAuth(rolEsperado) {
  if (!token() || localStorage.getItem('rol') !== rolEsperado)
    window.location.href = 'index.html';
}

// ═══════════════════════════════════════════════════════
//  NAV — panel docente
// ═══════════════════════════════════════════════════════
const pageTitles = {
  Inicio:'Inicio', alumnos:'Alumnos', calificaciones:'Calificaciones',
  observaciones:'Observaciones', asistencia:'Asistencia', avisos:'Avisos',
  chat:'Mensajes', citas:'Citas', aseo:'Rol de Aseo',
};
function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('p-' + page).classList.add('active');
  if (el) el.classList.add('active');
  const t = document.getElementById('page-title');
  if (t) t.textContent = pageTitles[page] || page;
}

// ── Fecha de hoy
function setFechaHoy() {
  const d   = new Date();
  const str = d.toLocaleDateString('es-MX', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const iso = d.toISOString().split('T')[0];
  const el  = document.getElementById('today-date');   if (el) el.textContent = str;
  const a   = document.getElementById('asist-date');   if (a)  a.value = iso;
  const o   = document.getElementById('obs-fecha');    if (o)  o.value = iso;
}
setFechaHoy();

// ═══════════════════════════════════════════════════════
//  ESTADO LOCAL (caché en memoria)
// ═══════════════════════════════════════════════════════
let alumnos   = [];
let califData = [];
let observaciones = [];
let avisos    = [];
let citas     = [];
let asistData = {};
let aseoRol   = {};
let chatConversaciones = [];
let currentChat = 0;

const aseoActividades = ['Barrer','Trapear','Limpiar pizarrón','Organizar pupitres','Recoger basura'];
const diasSemana      = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const diasCortos      = ['Lun','Mar','Mié','Jue','Vie'];


// ═══════════════════════════════════════════════════════
//  INICIO PANEL DOCENTE
// ═══════════════════════════════════════════════════════
async function iniciarPanelDocente() {
  requireAuth('docente');
  const nb = document.querySelector('.teacher-name');
  if (nb) nb.textContent = localStorage.getItem('nombre') || 'Docente';
  await Promise.all([ cargarAlumnos(), cargarCalificaciones(), cargarAvisos(), cargarCitas(), cargarChatsDocente(), cargarCitas() ]);
  setFechaHoy();
  renderCal();
  shuffleAseo();
}

// ═══════════════════════════════════════════════════════
//  ALUMNOS
// ═══════════════════════════════════════════════════════
async function cargarAlumnos() {
  try {
    alumnos = await apiFetch('/alumnos');
    renderAlumnos(alumnos);
    renderDashAlumnos();
    poblarSelectAlumnos();
    cargarAsistenciaHoy();
  } catch { mostrarToast('⚠ Error al cargar alumnos'); }
}

function renderAlumnos(list) {
  const tb = document.getElementById('alumnos-tbody');
  if (!tb) return;
  tb.innerHTML = list.map((a, i) => {
    const prom  = a.promedio ?? '—';
    const asist = a.porcentajeAsistencia ?? '—';
    const sc    = a.estado === 'Excelente' ? 'sp-green' : a.estado === 'Atención' ? 'sp-rose' : 'sp-amber';
    return `<tr>
      <td style="color:var(--muted);font-size:.8rem;">${String(i+1).padStart(2,'0')}</td>
      <td><div style="display:flex;align-items:center;gap:.6rem;">
        <div class="alumno-av">${a.nombre[0]}</div>
        <div><div class="alumno-name">${a.nombre}</div><div class="alumno-sub">${a.fechaNac||''}</div></div>
      </div></td>
      <td style="color:var(--muted);font-size:.83rem;">${a.fechaNac||'—'}</td>
      <td><span class="grade-badge ${prom>=9?'gb-a':prom>=7?'gb-b':'gb-c'}">${prom}</span></td>
      <td style="font-size:.84rem;font-weight:600;">${asist}%</td>
      <td><span class="status-pill ${sc}">${a.estado||'Regular'}</span></td>
      <td>
        <button class="btn-icon" title="Observación"
          onclick="goTo('observaciones',document.querySelectorAll('.nav-item')[3])">📝</button>
        <button class="btn-icon" title="Chat"
          onclick="goTo('chat',document.querySelectorAll('.nav-item')[6])">💬</button>
      </td>
    </tr>`;
  }).join('');
}

function renderDashAlumnos() {
  const el = document.getElementById('dash-alumnos-list');
  if (!el) return;
  el.innerHTML = alumnos.slice(0, 5).map(a => {
    const sc = a.estado === 'Excelente' ? 'sp-green' : a.estado === 'Atención' ? 'sp-rose' : 'sp-amber';
    return `<div class="alumno-row">
      <div class="alumno-av">${a.nombre[0]}</div>
      <div style="flex:1;"><div class="alumno-name">${a.nombre}</div><div class="alumno-sub">Prom: ${a.promedio??'—'}</div></div>
      <span class="status-pill ${sc}">${a.estado||'Regular'}</span>
    </div>`;
  }).join('');
}

function poblarSelectAlumnos() {
  ['obs-select-alumno','nc-alumno-select'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = alumnos.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('');
  });
}

function filterAlumnos(v) {
  renderAlumnos(alumnos.filter(a => a.nombre.toLowerCase().includes(v.toLowerCase())));
}

async function saveAlumno() {
  const nombre   = document.getElementById('new-alumno-nombre').value.trim();
  const fechaNac = document.getElementById('new-alumno-fecha').value;
  const curp     = document.getElementById('new-alumno-curp').value.trim();
  if (!nombre || !fechaNac) return alert('Completa nombre y fecha.');
  try {
    await apiFetch('/alumnos', { method:'POST', body: JSON.stringify({ nombre, fechaNac, curp }) });
    mostrarToast('✅ Alumno registrado');
    closeOverlay('modal-alumno');
    await cargarAlumnos();
  } catch (err) { mostrarToast('❌ ' + err.message); }
}

// ═══════════════════════════════════════════════════════
//  CALIFICACIONES
// ═══════════════════════════════════════════════════════
async function cargarCalificaciones(bimestre = 1) {
  try {
    califData = await apiFetch(`/calificaciones?bimestre=${bimestre}`);
    renderCalif(califData);
  } catch { mostrarToast('⚠ Error al cargar calificaciones'); }
}

function renderCalif(list) {
  const materias = ['Español','Matemáticas','Ciencias','Historia','Ed. Física'];
  const tb = document.getElementById('calif-tbody');
  if (!tb) return;

  // Agrupar calificaciones por alumno (la BD regresa una fila por materia)
  const porAlumno = {};
  list.forEach(c => {
    if (!porAlumno[c.alumnoId])
      porAlumno[c.alumnoId] = { nombre: c.alumno, notas: {} };
    porAlumno[c.alumnoId].notas[c.materia] = c.calificacion;
  });

  tb.innerHTML = Object.entries(porAlumno).map(([alumnoId, data]) => {
    const grades = materias.map(m =>
      `<td><input class="grade-input" type="number" min="0" max="10" step="0.1"
        value="${data.notas[m] ?? ''}"
        onchange="guardarCalif(${alumnoId},'${m}',this.value)"></td>`
    ).join('');
    const vals = materias.map(m => parseFloat(data.notas[m] || 0));
    const prom = (vals.reduce((s,v) => s+v, 0) / vals.length).toFixed(1);
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:.55rem;">
        <div class="alumno-av" style="width:28px;height:28px;font-size:.75rem;">${data.nombre[0]}</div>
        <span style="font-size:.85rem;font-weight:600;">${data.nombre}</span>
      </div></td>
      ${grades}
      <td><span class="grade-badge ${prom>=9?'gb-a':prom>=7?'gb-b':'gb-c'}">${prom}</span></td>
      <td><span id="sv-${alumnoId}">💾</span></td>
    </tr>`;
  }).join('');
}

// Se llama automáticamente al cambiar cualquier input de calificación
async function guardarCalif(alumnoId, materia, calificacion) {
  const el = document.getElementById(`sv-${alumnoId}`);
  try {
    await apiFetch('/calificaciones', {
      method: 'POST',
      body:   JSON.stringify({ alumnoId, materia, calificacion: parseFloat(calificacion), bimestre: 1 }),
    });
    if (el) { el.textContent = '✅'; setTimeout(() => el.textContent = '💾', 1500); }
  } catch { if (el) el.textContent = '❌'; }
}

function filterCalif(v) {
  renderCalif(califData.filter(c => c.alumno?.toLowerCase().includes(v.toLowerCase())));
}
function filterByMateria() {}

// ═══════════════════════════════════════════════════════
//  ASISTENCIA
// ═══════════════════════════════════════════════════════
async function cargarAsistenciaHoy() {
  const fecha = document.getElementById('asist-date')?.value || new Date().toISOString().split('T')[0];
  try {
    const data = await apiFetch(`/asistencia?fecha=${fecha}`);
    asistData  = {};
    data.forEach(r => {
      asistData[r.alumnoId] = asistData[r.alumnoId] || {};
      asistData[r.alumnoId]['Hoy'] = r.estado || 'P';
    });
    // Rellenar alumnos sin registro
    alumnos.forEach(a => {
      if (!asistData[a.id]) asistData[a.id] = {};
      diasCortos.forEach(d => { if (!asistData[a.id][d]) asistData[a.id][d] = 'P'; });
      if (!asistData[a.id]['Hoy']) asistData[a.id]['Hoy'] = '';
    });
  } catch {
    alumnos.forEach(a => {
      asistData[a.id] = {};
      diasCortos.forEach(d => asistData[a.id][d] = 'P');
      asistData[a.id]['Hoy'] = '';
    });
  }
  renderAsistencia();
}

function renderAsistencia() {
  const tb = document.getElementById('asist-tbody');
  if (!tb) return;
  tb.innerHTML = alumnos.map((a, i) => {
    const semDias = diasCortos.slice(0,4).map(d => {
      const v = asistData[a.id]?.[d] || 'P';
      return `<td><button class="asist-btn ${v==='P'?'ab-p sel':v==='F'?'ab-f sel':v==='J'?'ab-j sel':'ab-p'}"
        onclick="cycleAsist(${a.id},'${d}')">${v||'—'}</button></td>`;
    }).join('');
    const hoy    = asistData[a.id]?.['Hoy'] || '';
    const hoyBtn = `<td><div style="display:flex;gap:.3rem;justify-content:center;">
      <button class="asist-btn ${hoy==='P'?'ab-p sel':'ab-p'}" onclick="setAsist(${a.id},'Hoy','P')">P</button>
      <button class="asist-btn ${hoy==='F'?'ab-f sel':'ab-f'}" onclick="setAsist(${a.id},'Hoy','F')">F</button>
      <button class="asist-btn ${hoy==='J'?'ab-j sel':'ab-j'}" onclick="setAsist(${a.id},'Hoy','J')">J</button>
    </div></td>`;
    const vals      = Object.values(asistData[a.id] || {});
    const presentes = vals.filter(v => v === 'P').length;
    const faltas    = vals.filter(v => v === 'F').length;
    return `<tr>
      <td style="color:var(--muted);font-size:.78rem;">${String(i+1).padStart(2,'0')}</td>
      <td style="font-size:.84rem;font-weight:600;">${a.nombre}</td>
      ${semDias}${hoyBtn}
      <td>
        <span class="resumen-pill" style="background:rgba(92,191,153,0.15);color:#5cbf99;">✓ ${presentes}</span>
        <span class="resumen-pill" style="background:rgba(240,112,144,0.12);color:#f07090;margin-left:.3rem;">✗ ${faltas}</span>
      </td>
    </tr>`;
  }).join('');
}

function cycleAsist(id, dia) {
  const ciclo = ['P','F','J',''];
  if (!asistData[id]) asistData[id] = {};
  const cur = asistData[id][dia] || '';
  asistData[id][dia] = ciclo[(ciclo.indexOf(cur)+1) % ciclo.length];
  renderAsistencia();
}
function setAsist(id, dia, val) {
  if (!asistData[id]) asistData[id] = {};
  asistData[id][dia] = val;
  renderAsistencia();
}
function markAll(v) {
  alumnos.forEach(a => { if (!asistData[a.id]) asistData[a.id] = {}; asistData[a.id]['Hoy'] = v; });
  renderAsistencia();
}

async function saveAsistencia() {
  const fecha    = document.getElementById('asist-date')?.value;
  const registros = alumnos.map(a => ({ alumnoId: a.id, estado: asistData[a.id]?.['Hoy'] || 'P' }));
  const btn      = document.querySelector('#p-asistencia .btn-action');
  try {
    await apiFetch('/asistencia', { method:'POST', body: JSON.stringify({ fecha, registros }) });
    if (btn) { const t = btn.textContent; btn.textContent='✅ Guardado'; setTimeout(()=>btn.textContent=t,2000); }
    mostrarToast('✅ Asistencia guardada correctamente');
  } catch (err) { mostrarToast('❌ Error: ' + err.message); }
}

// ═══════════════════════════════════════════════════════
//  OBSERVACIONES
// ═══════════════════════════════════════════════════════
async function cargarObservaciones() {
  try {
    observaciones = await apiFetch('/observaciones');
    renderObs();
  } catch { mostrarToast('⚠ Error al cargar observaciones'); }
}

function renderObs() {
  const el = document.getElementById('obs-list');
  if (!el) return;
  el.innerHTML = observaciones.map(o => {
    const color = o.tipo === 'positiva' ? 'oc-green' : o.tipo === 'negativa' ? 'oc-rose' : 'oc-amber';
    const tags  = o.etiquetas ? o.etiquetas.split(',') : [];
    return `<div class="obs-card ${color}">
      <div class="obs-header">
        <div class="obs-av">${(o.alumnoNombre||'?')[0]}</div>
        <div><div class="obs-name">${o.alumnoNombre||'—'}</div><div class="obs-date">${o.fecha}</div></div>
      </div>
      <div class="obs-tags">${tags.map(t => {
        const cl = t.includes('✅')||t.includes('⭐')||t.includes('🌟')?'ot-pos':t.includes('⚠')||t.includes('😔')?'ot-neg':'ot-neu';
        return `<span class="obs-tag ${cl}">${t.trim()}</span>`;
      }).join('')}</div>
      <div class="obs-text">${o.descripcion}</div>
      <div class="obs-footer">
        <span style="font-size:.73rem;color:var(--muted);">📅 ${o.fecha}</span>
        <button class="btn-icon" onclick="deleteObs(${o.id},this)">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

let selectedTags = [];
function toggleTag(btn, type, cls) {
  const classes = ['sel-pos','sel-neg','sel-neu'];
  const active  = classes.some(c => btn.classList.contains(c));
  if (active) { btn.classList.remove(...classes); selectedTags = selectedTags.filter(t => t !== btn.textContent.trim()); }
  else        { btn.classList.remove(...classes); btn.classList.add(cls); selectedTags.push(btn.textContent.trim()); }
}

async function addObservacion() {
  const alumnoId    = document.getElementById('obs-select-alumno').value;
  const fecha       = document.getElementById('obs-fecha').value;
  const descripcion = document.getElementById('obs-desc').value.trim();
  if (!descripcion) return alert('Escribe una descripción.');
  const hasNeg = selectedTags.some(t => t.includes('⚠')||t.includes('😔'));
  const tipo   = hasNeg ? 'negativa' : selectedTags.length ? 'positiva' : 'neutral';
  try {
    await apiFetch('/observaciones', {
      method: 'POST',
      body:   JSON.stringify({ alumnoId, fecha, descripcion, tipo, etiquetas: selectedTags.join(',') }),
    });
    document.getElementById('obs-desc').value = '';
    selectedTags = [];
    document.querySelectorAll('.tag-toggle').forEach(b => b.classList.remove('sel-pos','sel-neg','sel-neu'));
    mostrarToast('✅ Observación guardada');
    await cargarObservaciones();
  } catch (err) { mostrarToast('❌ ' + err.message); }
}

async function deleteObs(id, btn) {
  const card = btn.closest('.obs-card');
  card.style.transition='.3s'; card.style.opacity='0'; card.style.transform='scale(.95)';
  try {
    await apiFetch(`/observaciones/${id}`, { method:'DELETE' });
    setTimeout(() => card.remove(), 300);
    mostrarToast('🗑️ Eliminada');
  } catch (err) { card.style.opacity='1'; card.style.transform=''; mostrarToast('❌ '+err.message); }
}

// ═══════════════════════════════════════════════════════
//  AVISOS
// ═══════════════════════════════════════════════════════
async function cargarAvisos() {
  try {
    avisos = await apiFetch('/avisos');
    renderAvisos();
  } catch { mostrarToast('⚠ Error al cargar avisos'); }
}

const avisoIcons = ['📅','💰','📋','⚠'];
const avisoWrap  = ['av-purple','av-amber','av-blue','av-blue'];

function renderAvisos() {
  const el = document.getElementById('avisos-list');
  if (!el) return;
  el.innerHTML = avisos.map((av, i) => `
    <div class="aviso-card">
      <div class="aviso-icon-wrap ${avisoWrap[i%4]}">${avisoIcons[i%4]}</div>
      <div class="aviso-content">
        <div class="aviso-title">${av.titulo}</div>
        <div class="aviso-body">${av.contenido}</div>
        <div class="aviso-meta">
          <span class="aviso-date">📅 ${new Date(av.fecha).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'})}</span>
          <span class="aviso-chip ac-g">${av.categoria||''}</span>
        </div>
      </div>
      <button class="btn-icon" style="align-self:flex-start;" onclick="deleteAviso(${av.id},this)">🗑️</button>
    </div>`).join('');
}

async function publishAviso() {
  const titulo    = document.getElementById('aviso-titulo').value.trim();
  const contenido = document.getElementById('aviso-body').value.trim();
  const categoria = document.getElementById('aviso-cat').value;
  if (!titulo||!contenido) return alert('Completa título y contenido.');
  try {
    await apiFetch('/avisos', { method:'POST', body: JSON.stringify({ titulo, contenido, categoria }) });
    document.getElementById('aviso-titulo').value='';
    document.getElementById('aviso-body').value='';
    mostrarToast('📢 Aviso publicado');
    await cargarAvisos();
  } catch (err) { mostrarToast('❌ '+err.message); }
}

async function deleteAviso(id, btn) {
  try {
    await apiFetch(`/avisos/${id}`, { method:'DELETE' });
    btn.closest('.aviso-card').remove();
    mostrarToast('🗑️ Aviso eliminado');
  } catch (err) { mostrarToast('❌ '+err.message); }
}

// ═══════════════════════════════════════════════════════
//  CHAT
// ═══════════════════════════════════════════════════════
async function cargarChatsDocente() {
  try {
    chatConversaciones = await apiFetch('/mensajes/conversaciones');
    renderContacts();
    if (chatConversaciones.length) await selectChat(0);
  } catch { chatConversaciones = []; renderContacts(); }
}

function renderContacts() {
  const el = document.getElementById('chat-contacts');
  if (!el) return;
  el.innerHTML = chatConversaciones.map((c,i) => `
    <div class="contact-item ${i===currentChat?'active':''}" onclick="selectChat(${i})">
      <div class="contact-av ${c.av||'av2'}">${c.initials||c.nombre?.[0]||'?'}</div>
      <div class="contact-info">
        <div class="contact-name">${c.nombre}</div>
        <div class="contact-preview">${c.ultimoMensaje||''}</div>
      </div>
      <div class="contact-meta">
        <div class="contact-time">${c.hora||''}</div>
        ${c.noLeidos?`<div class="unread-badge">${c.noLeidos}</div>`:''}
      </div>
    </div>`).join('');
}

async function selectChat(i) {
  currentChat = i;
  const c = chatConversaciones[i];
  const hdr = document.getElementById('chat-header');
  if (hdr) hdr.innerHTML = `
    <div class="contact-av ${c.av||'av2'}">${c.initials||c.nombre?.[0]}</div>
    <div class="chat-header-info">
      <div class="chat-header-name">${c.nombre}</div>
      <div class="chat-header-sub">Padre/Tutor · 3°B</div>
    </div>`;
  try {
    c.msgs = await apiFetch(`/mensajes/${c.usuarioId}`);
  } catch { c.msgs = []; }
  renderMessages(); renderContacts();
}

function renderMessages() {
  const conv = chatConversaciones[currentChat];
  if (!conv) return;
  const el = document.getElementById('chat-messages');
  if (!el) return;
  el.innerHTML = (conv.msgs||[]).map(m => {
    const isMine = m.mine || false;
    return `<div class="msg ${isMine?'mine':''}">
      <div class="msg-av ${isMine?'mine-av':conv.av||'av2'}">${isMine?'ML':conv.initials||'?'}</div>
      <div>
        <div class="bubble">${m.contenido||m.text||''}</div>
        <div class="msg-time">${m.hora||''}</div>
      </div>
    </div>`;
  }).join('');
  el.scrollTop = el.scrollHeight;
}

async function sendMsg() {
  const inp  = document.getElementById('chat-input');
  const txt  = inp?.value.trim();
  if (!txt) return;
  const conv = chatConversaciones[currentChat];
  if (!conv) return;
  try {
    await apiFetch('/mensajes', {
      method: 'POST',
      body:   JSON.stringify({ receptorId: conv.usuarioId, contenido: txt }),
    });
    const hora = new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});
    if (!conv.msgs) conv.msgs = [];
    conv.msgs.push({ mine:true, contenido:txt, hora });
    conv.ultimoMensaje = txt;
    inp.value = '';
    renderMessages(); renderContacts();
  } catch (err) { mostrarToast('❌ '+err.message); }
}

// ═══════════════════════════════════════════════════════
//  CITAS
// ═══════════════════════════════════════════════════════
async function cargarCitas() {
  try {
    citas = await apiFetch('/citas');
    renderCitas(); renderMisCitas(); renderCal();
  } catch { mostrarToast('⚠ Error al cargar citas'); }
}

function renderCitas() {
  const el = document.getElementById('citas-list');
  if (!el) return;
  el.innerHTML = citas.length
    ? citas.map(c => `
      <div class="cita-item">
        <div class="cita-time-block">
          <div class="cita-hour">${String(c.hora||'').substring(0,5)}</div>
          <div class="cita-ampm">—</div>
        </div>
        <div class="cita-info">
          <div class="cita-name">${c.tutorNombre||'Tutor'}</div>
          <div class="cita-reason">🧒 ${c.alumnoNombre||''} — ${c.motivo||''}</div>
          <span class="cita-status ${c.estado==='confirmada'?'cs-conf':'cs-pend'}">
            ${c.estado==='confirmada'?'✅ Confirmada':'⏳ Pendiente'}
          </span>
        </div>
        <button class="btn-icon" onclick="confirmarCita(${c.id},this)" title="Confirmar">✅</button>
        <button class="btn-icon" onclick="eliminarCita(${c.id},this)" title="Eliminar">🗑️</button>
      </div>`).join('')
    : '<p style="color:var(--muted);font-size:.86rem;text-align:center;padding:2rem;">Sin citas hoy</p>';
}

function renderMisCitas() {
  const el = document.getElementById('mis-citas');
  if (!el) return;
  el.innerHTML = citas.length
    ? citas.map(c => `
      <div class="cita-item">
        <div class="cita-time-block">
          <div class="cita-hour">
            ${String(c.hora || '').substring(0,5)}
          </div>
        </div>
        <div class="cita-info">
          <div class="cita-name">
            ${c.alumnoNombre || 'Alumno'}
          </div>
          <div class="cita-reason">
            ${c.motivo || ''}
          </div>
          <span class="cita-status ${c.estado === 'confirmada' ? 'cs-conf':'cs-pend'}">
            ${c.estado === 'confirmada'
              ? '✅ Confirmada'
              : '⏳ Pendiente'}
          </span>
        </div>
      </div>
    `).join('')

    : `
      <p style="color:var(--muted);font-size:.86rem;">
        No tienes citas agendadas
      </p>
    `;
}

async function confirmarCita(id) {
  try { await apiFetch(`/citas/${id}/confirmar`, { method:'PUT' }); mostrarToast('✅ Cita confirmada'); await cargarCitas(); }
  catch (err) { mostrarToast('❌ '+err.message); }
}
async function eliminarCita(id, btn) {
  try { await apiFetch(`/citas/${id}`, { method:'DELETE' }); btn.closest('.cita-item').remove(); mostrarToast('🗑️ Eliminada'); }
  catch (err) { mostrarToast('❌ '+err.message); }
}

async function solicitarCita() {

  const alumnoId = localStorage.getItem('alumnoId');

  const fecha  = document.getElementById('cita-fecha').value;
  const hora   = document.getElementById('cita-hora').value;
  const motivo = document.getElementById('cita-motivo').value.trim();

  if (!fecha || !hora || !motivo) {
    return Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Completa todos los campos'
    });
  }

  try {

    await apiFetch('/citas', {
      method: 'POST',
      body: JSON.stringify({
        alumnoId,
        fecha,
        hora,
        motivo
      })
    });

    Swal.fire({
      icon: 'success',
      title: 'Cita solicitada',
      text: 'El maestro recibirá tu solicitud'
    });

    cargarCitas();

  } catch (err) {

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message
    });

  }
}

async function saveCita() {

  const alumnoId = document.getElementById('nc-alumno-select').value;
  const fecha    = document.getElementById('nc-fecha').value;
  const hora     = document.getElementById('nc-hora').value;
  const motivo   = document.getElementById('nc-motivo').value.trim();

  if (!fecha || !hora)
    return alert('Completa los campos.');

  try {

    const alumno = alumnos.find(a => a.id == alumnoId);

    await apiFetch('/citas', {
      method:'POST',
      body: JSON.stringify({
        alumnoId,
        padreId: alumno.tutorId,
        fecha,
        hora,
        motivo
      })
    });

    closeOverlay('modal-cita');

    mostrarToast('📅 Cita agendada');

    await cargarCitas();

  } catch (err) {

    mostrarToast('❌ ' + err.message);

  }
}

// ── Calendario
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();

function renderCal() {
  const names = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const lbl = document.getElementById('cal-month-label');
  if (lbl) lbl.textContent = `${names[calMonth]} ${calYear}`;
  const g = document.getElementById('cal-grid');
  if (!g) return;
  g.innerHTML = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d=>`<div class="cal-day-name">${d}</div>`).join('');
  const first = new Date(calYear, calMonth, 1).getDay();
  const days  = new Date(calYear, calMonth+1, 0).getDate();
  const citasDias = citas.map(c => new Date(c.fecha+'T12:00').getDate());
  for (let i=0; i<first; i++) g.innerHTML += `<div class="cal-day empty"></div>`;
  const today = new Date();
  for (let d=1; d<=days; d++) {
    const isToday = d===today.getDate() && calMonth===today.getMonth() && calYear===today.getFullYear();
    const hasCita = citasDias.includes(d);
    g.innerHTML += `<div class="cal-day${isToday?' today':''}${hasCita?' has-cita':''}">${d}</div>`;
  }
}
function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth=0; calYear++; }
  if (calMonth < 0)  { calMonth=11; calYear--; }
  renderCal();
}
function addSlot() {
  const f = document.getElementById('new-cita-fecha')?.value;
  const h = document.getElementById('new-cita-hora')?.value;
  if (!f||!h) return alert('Selecciona fecha y hora.');
  mostrarToast(`✅ Horario ${h} habilitado`);
}

// ═══════════════════════════════════════════════════════
//  ASEO — solo frontend
// ═══════════════════════════════════════════════════════
function shuffleAseo() {
  const shuffled = [...alumnos].sort(() => Math.random()-.5);
  aseoRol = {};
  diasSemana.forEach((d,i) => {
    aseoRol[d] = aseoActividades.map((act,j) => ({
      act, alumno: shuffled[(i*5+j) % (shuffled.length||1)]?.nombre || '—'
    }));
  });
  renderAseo();
}
function renderAseo() {
  const el = document.getElementById('aseo-grid');
  if (!el) return;
  el.innerHTML = diasSemana.map(d => `
    <div class="aseo-day-card">
      <div class="aseo-day-title">📅 ${d}</div>
      ${(aseoRol[d]||[]).map((r,i) => `
        <div class="aseo-student-row">
          <div class="aseo-dot" style="background:${['#5cbf99','#f5965a','#f07090','#9b7ee8','#60b8f0'][i]};"></div>
          <div>
            <div style="font-size:.82rem;font-weight:800;">${r.alumno.split(' ')[0]}</div>
            <div style="font-size:.72rem;color:var(--muted);font-weight:700;">${r.act}</div>
          </div>
          <span class="aseo-num">${i+1}</span>
        </div>`).join('')}
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════
//  MODALS / OVERLAYS
// ═══════════════════════════════════════════════════════
function openAddAlumno() { document.getElementById('modal-alumno')?.classList.add('open'); }
function openAddTarea()   { document.getElementById('modal-tarea')?.classList.add('open'); }
function openAddCita()    { poblarSelectAlumnos(); document.getElementById('modal-cita')?.classList.add('open'); }
function closeOverlay(id) { document.getElementById(id)?.classList.remove('open'); }

document.querySelectorAll('.overlay').forEach(o =>
  o.addEventListener('click', e => { if (e.target===o) o.classList.remove('open'); })
);
document.addEventListener('keydown', e => {
  if (e.key==='Escape')
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
});

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
function mostrarToast(msg) {
  let t = document.getElementById('app-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'app-toast';
    t.style.cssText = [
      'position:fixed','bottom:2rem','right:2rem','z-index:9999',
      'background:linear-gradient(135deg,#5cbf99,#9b7ee8)',
      'color:white','font-family:Nunito,sans-serif','font-size:.88rem','font-weight:800',
      'padding:.75rem 1.4rem','border-radius:99px',
      'box-shadow:0 8px 28px rgba(155,127,232,.3)',
      'transition:opacity .3s,transform .3s',
    ].join(';');
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity='1'; t.style.transform='translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(10px)'; }, 3000);
}

//ALUMNO
// Inicialización del panel de alumno
document.addEventListener('DOMContentLoaded', () => {

  const pagina = window.location.pathname;

  // SOLO ejecutar en alumno.html
  if (pagina.includes('alumno.html')) {

    const rol = localStorage.getItem('rol');

    if (!rol || rol !== 'padre') {
      window.location.href = 'index.html';
      return;
    }

    iniciarPanelAlumno();
  }

});

// Datos del alumno (desde login)
let alumnoActual = {
  id: parseInt(localStorage.getItem('alumnoId')) || 0,
  nombre: localStorage.getItem('alumno') || 'Alumno',
  tutor: localStorage.getItem('tutor') || 'Tutor',
  grupo: '3°B'
};

let calificacionesAlumno = [];
let asistenciaAlumno = [];

async function iniciarPanelAlumno() {
  const nb = document.querySelector('.student-name-sb');
  if (nb) nb.textContent = alumnoActual.nombre;
  
  const gb = document.querySelector('.student-group-sb');
  if (gb) gb.textContent = 'Grupo ' + alumnoActual.grupo;
  
  const fb = document.querySelector('.footer-text');
  if (fb) fb.textContent = alumnoActual.tutor;
  
  // Cargar datos dinámicamente
  await Promise.all([
    cargarCalificacionesAlumno(),
    cargarAsistenciaAlumno(),
    cargarCitas(),
  ]);
  
  setFechaHoy();
}

async function cargarCalificacionesAlumno() {
  try {
    calificacionesAlumno = await apiFetch(`/calificaciones/${alumnoActual.id}`);
    renderCalificacionesAlumno();
  } catch (err) {
    console.error('Error cargando calificaciones:', err);
    calificacionesAlumno = [];
  }
}

function renderCalificacionesAlumno() {
  const tbody = document.getElementById('tareas-tbody');
  if (!tbody) return;
  
  if (!calificacionesAlumno || calificacionesAlumno.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:1.5rem;">No hay calificaciones registradas</td></tr>';
    return;
  }
  
  tbody.innerHTML = calificacionesAlumno.map(c => {
    const estado = c.nota ? 'ec-ok' : 'ec-pend';
    const notaText = c.nota ? parseFloat(c.nota).toFixed(1) : '—';
    return `<tr>
      <td style="font-weight:700;color:var(--text);">${c.actividad || 'Actividad'}</td>
      <td style="color:var(--muted);font-size:.88rem;">${c.materia || '—'}</td>
      <td style="color:var(--muted);font-size:.88rem;">${c.fecha || '—'}</td>
      <td><span style="background:var(--mint-l);color:var(--mint-d);padding:.25rem .7rem;border-radius:10px;font-weight:700;font-size:.8rem;">${notaText}</span></td>
      <td><span class="entrega-chip ${estado}">${c.nota ? '✓ Calificado' : '⏳ Pendiente'}</span></td>
    </tr>`;
  }).join('');
}

async function cargarAsistenciaAlumno() {
  try {
    asistenciaAlumno = await apiFetch(`/asistencia/${alumnoActual.id}`);
    renderAsistenciaAlumno();
  } catch (err) {
    console.error('Error cargando asistencia:', err);
    asistenciaAlumno = [];
  }
}

function renderAsistenciaAlumno() {
  const grid = document.getElementById('mes-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  const days = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  
  // Headers de días
  days.forEach(d => {
    const div = document.createElement('div');
    div.className = 'mes-day-name';
    div.textContent = d;
    grid.appendChild(div);
  });
  
  // Días del mes (marzo)
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  
  for (let i = 0; i < first; i++) {
    const div = document.createElement('div');
    div.className = 'mes-day md-e';
    grid.appendChild(div);
  }
  
  // Búsqueda de estado en asistencia
  const estadoMap = {};
  asistenciaAlumno.forEach(a => {
    const fecha = new Date(a.fecha);
    const día = fecha.getDate();
    estadoMap[día] = a.estado;
  });
  
  for (let día = 1; día <= daysInMonth; día++) {
    const div = document.createElement('div');
    const estado = (estadoMap[día] || 'p').toLowerCase();
    let className = 'mes-day';
    let label = día;
    
    if (estado === 'p') {
      className += ' md-p';
      label = 'P';
    } else if (estado === 'f') {
      className += ' md-f';
      label = 'F';
    } else if (estado === 'j') {
      className += ' md-j';
      label = 'J';
    } else {
      className += ' md-e';
    }
    
    div.className = className;
    div.textContent = label;
    grid.appendChild(div);
  }
}

function setFechaHoy() {
  const d = new Date();
  const str = d.toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const td = document.getElementById('today-date');
  if (td) td.textContent = str;
}

function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const pageEl = document.getElementById('p-' + page);
  if (pageEl) pageEl.classList.add('active');
  if (el) el.classList.add('active');
  
  const titles = {
    home: '¡Hola, ' + (alumnoActual.nombre.split(' ')[0] || 'Alumn@') + '! 👋',
    alumnos: 'Gestión de Alumnos 🎒',
    calificaciones: 'Mis Calificaciones ⭐',
    observaciones: 'Observaciones 📋',
    asistencia: 'Mi Asistencia ✅',
    avisos: 'Avisos 📢',
    chat: 'Mensajes 💬',
    citas: 'Agenda de Citas 🗓️',
    aseo: 'Rol de Aseo 🧹'
  };
  
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[page] || page;
  
  const subEl = document.getElementById('page-sub');
  if (subEl) {
    const subs = {
      home: 'Bienvenid@ a tu espacio escolar',
      calificaciones: 'Ciclo escolar 2025-2026',
      asistencia: 'Ciclo escolar 2025-2026',
      avisos: 'Comunicados del grupo ' + alumnoActual.grupo,
      chat: 'Conversación con tu maestro',
      citas: 'Grupo ' + alumnoActual.grupo + ' · Mtro. Hector'
    };
    subEl.textContent = subs[page] || '';
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

// Logout
function logout() {
  Swal.fire({
    title: '¿Cerrar sesión?',
    text: '¿Seguro que deseas salir de tu cuenta?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#5cbf99',
    cancelButtonColor: '#f07090',
    confirmButtonText: 'Sí, salir',
    cancelButtonText: 'Cancelar',
    background: '#fff',
    backdrop: true
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      Swal.fire({
        title: '¡Hasta luego!',
        text: 'Sesión cerrada correctamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  });
}

