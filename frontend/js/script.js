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

// ── LOGIN PADRE backend real
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
    localStorage.setItem('usuarioId',data.usuarioId);
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
let mesnajes = [];
let aseoData = [];
let dashboard = [];
let resumenAsistencia = [];
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
  await Promise.all([ cargarAlumnos(), cargarCalificaciones(), cargarAvisos(), cargarCitas(), cargarChatsDocente(), cargarCitas(), cargarObservaciones(), cargarResumenAsistencia(), ]);
  setFechaHoy();
  renderCal();
  shuffleAseo();
  cargarDashboardDocente();
  enriquecerAlumnos();
}

async function cargarResumenAsistencia() {
  try {
    resumenAsistencia = await apiFetch('/asistencia/resumen');
  } catch (err) {
    console.log(err);
  }
}

function enriquecerAlumnos() {
  alumnos = alumnos.map(a => {
    const cals = califData
      .filter(c => c.alumno === a.nombre)
      .map(c => parseFloat(c.calificacion || 0));

    const prom = cals.length
      ? (cals.reduce((s, v) => s + v, 0) / cals.length).toFixed(1)
      : null;

    const asist = resumenAsistencia.find(r => r.alumnoId === a.id);
    const pctAsist = asist && asist.total > 0
      ? Math.round((asist.presentes / asist.total) * 100) + '%'
      : '—';

    return {
      ...a,
      promedio: prom,
      porcentajeAsistencia: pctAsist,
      estado: prom >= 9 ? 'Excelente' : prom >= 7 ? 'Regular' : 'Atención'
    };
  });

  renderAlumnos(alumnos);
  renderDashAlumnos();
}


async function cargarDashboardDocente() {
  const kc1 = document.querySelector('.kpi-card.kc1 .kpi-num');
  if (kc1) kc1.textContent = alumnos.length;

  const porAlumno = {};
  califData.forEach(c => {
    if (!porAlumno[c.alumnoId]) porAlumno[c.alumnoId] = [];
    porAlumno[c.alumnoId].push(parseFloat(c.calificacion || 0));
  });
  const proms = Object.values(porAlumno)
    .map(arr => arr.reduce((a, b) => a + b, 0) / arr.length);
  const promGrupal = proms.length
    ? (proms.reduce((a, b) => a + b, 0) / proms.length).toFixed(1)
    : '—';
  const kc3 = document.querySelector('.kpi-card.kc3 .kpi-num');
  if (kc3) kc3.textContent = promGrupal;

  try {
    const convs = await apiFetch('/mensajes/conversaciones');
    const noLeidos = convs.reduce((sum, c) => sum + (c.noLeidos || 0), 0);
    const kc4 = document.querySelector('.kpi-card.kc4 .kpi-num');
    if (kc4) kc4.textContent = noLeidos;
  } catch (err) {
    console.log('Error mensajes no leídos:', err);
  }
}

// ═══════════════════════════════════════════════════════
//  ALUMNOS
// ═══════════════════════════════════════════════════════
async function cargarAlumnos() {
  try {
    alumnos = await apiFetch('/alumnos');
    renderAlumnos(alumnos);
    poblarSelectAlumnos();
    cargarAsistenciaHoy();
  } catch { mostrarToast('⚠ Error al cargar alumnos'); }
}

function renderAlumnos(list) {
  const tb = document.getElementById('alumnos-tbody');
  if (!tb) return;

  tb.innerHTML = list.map((a, i) => {
    const fecha = a.fechaNac
      ? new Date(a.fechaNac).toLocaleDateString('es-MX', { day:'2-digit', month:'long', year:'numeric' })
      : '—';

    const prom  = a.promedio ?? '—';
    const sc    = a.estado === 'Excelente' ? 'sp-green' : a.estado === 'Atención' ? 'sp-rose' : 'sp-amber';
    const asist = resumenAsistencia.find(r => r.alumnoId === a.id);

    return `<tr>
      <td style="color:var(--muted);font-size:.8rem;">${String(i+1).padStart(2,'0')}</td>
      <td><div style="display:flex;align-items:center;gap:.6rem;">
        <div class="alumno-av">${a.nombre[0]}</div>
        <div>
          <div class="alumno-name">${a.nombre}</div>
          <div class="alumno-sub">${fecha}</div>
        </div>
      </div></td>
      <td style="color:var(--muted);font-size:.83rem;">${fecha}</td>
      <td><span class="grade-badge ${prom>=9?'gb-a':prom>=7?'gb-b':'gb-c'}">${prom}</span></td>
      <td>
        <span style="font-size:.84rem;font-weight:700;color:var(--mint-d);">✅ ${asist ? asist.presentes : '—'}</span>
        <span style="font-size:.75rem;color:var(--muted);"> / ${asist ? asist.total : '—'} días</span>
      </td>
      <td><span class="status-pill ${sc}">${a.estado || 'Regular'}</span></td>
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
    // Agrega esto temporalmente en cargarCalificaciones
console.log('califData[0]:', califData[0]);
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

function actualizarKpiAsistencia() {
  const total = alumnos.length;
  if (!total) return;
  const presentes = alumnos.filter(a => asistData[a.id]?.['Hoy'] === 'P').length;
  const pct = Math.round((presentes / total) * 100);
  document.querySelector('.kpi-card.kc2 .kpi-num').textContent = pct + '%';
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
    </tr>`;
  }).join('');
  actualizarKpiAsistencia();
}

function actualizarKpiAsistencia() {
  const total = alumnos.length;
  if (!total) return;
  const presentes = alumnos.filter(a => asistData[a.id]?.['Hoy'] === 'P').length;
  const pct = Math.round((presentes / total) * 100);
  const kc2 = document.querySelector('.kpi-card.kc2 .kpi-num');
  if (kc2) kc2.textContent = pct + '%';
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
  console.log('Cargando avisos...');
  try {
    avisos = await apiFetch('/avisos');
    renderAvisos();
  } catch { mostrarToast('⚠ Error al cargar avisos'); }
}

async function cargarAvisosAlumno() {
  try {
    avisos = await apiFetch('/avisos');
    console.log('Avisos cargados:', avisos);
    renderAvisosAlumno();
  } catch(err) { console.log(err) ;}
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

function renderAvisosAlumno() {
  console.log('Renderizando avisos');
  const el =
    document.getElementById(
      'avisos-container'
    );

  if (!el) return;

  const avisoIcons = {
    '📅 Evento':'📅',
    '💰 Cooperación':'💰',
    '📋 Información':'📋',
    '⚠ Urgente':'⚠'
  };

  const avisoColors = {
    '📅 Evento':'abi-purple',
    '💰 Cooperación':'abi-amber',
    '📋 Información':'abi-blue',
    '⚠ Urgente':'abi-rose'
  };

  el.innerHTML = avisos.map(av => `

    <div class="aviso-full-card">

      <div class="
        aviso-badge-icon
        ${avisoColors[av.categoria] || 'abi-blue'}
      ">

        ${avisoIcons[av.categoria] || '📋'}

      </div>

      <div class="aviso-full-body">

        <div class="aviso-full-title">
          ${av.titulo}
        </div>

        <div class="aviso-full-text">
          ${av.contenido}
        </div>

        <div class="aviso-full-meta">

          <span class="aviso-date-txt">

            📅
            ${new Date(av.fecha)
              .toLocaleDateString(
                'es-MX',
                {
                  day:'numeric',
                  month:'short',
                  year:'numeric'
                }
              )
            }

          </span>

          <span class="aviso-chip">
            ${av.categoria}
          </span>

        </div>

      </div>

    </div>

  `).join('');

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
  
  // Busca ambos posibles IDs (para panel docente y alumno)
  const lbl = document.getElementById('cal-month-label') || document.getElementById('c-month-lbl');
  if (lbl) lbl.textContent = `${names[calMonth]} ${calYear}`;
  
  const g = document.getElementById('cal-grid') || document.getElementById('c-cal-grid');
  if (!g) return;
  
  g.innerHTML = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d=>`<div class="cal-dname">${d}</div>`).join('');
  const first = new Date(calYear, calMonth, 1).getDay();
  const days  = new Date(calYear, calMonth+1, 0).getDate();
  
  // Crea un mapa de citas por día para el mes actual
  const citasPorDia = {};
  citas.forEach(c => {
      const fechaCita = new Date(c.fecha+'T12:00');
      if (fechaCita.getFullYear() === calYear && fechaCita.getMonth() === calMonth) {
        const dia = fechaCita.getDate();
        if (!citasPorDia[dia]) citasPorDia[dia] = [];
        citasPorDia[dia].push(c);
      }
    });
  
  for (let i=0; i<first; i++) g.innerHTML += `<div class="cal-d empty"></div>`;
  const today = new Date();
  for (let d=1; d<=days; d++) {
    const isToday = d===today.getDate() && calMonth===today.getMonth() && calYear===today.getFullYear();
    const citasDia = citasPorDia[d] || [];

    let claseEstado = '';
    let textoMotivo = '';

    if (citasDia.length > 0) {

      const cita = citasDia[0];

      textoMotivo =
        (cita.motivo || '')
          .substring(0, 18);

      if (cita.estado === 'confirmada') {
        claseEstado = ' cita-confirmada';
      }
      else {
        claseEstado = ' cita-pendiente';
      }

    }

    g.innerHTML += `

      <div class="
        cal-d
        ${isToday ? 'today' : ''}
        ${claseEstado}
      ">

        <div class="cal-num">
          ${d}
        </div>

        ${
          textoMotivo
          ? `<div class="cal-mini-msg">
              ${textoMotivo}
            </div>`
          : ''
        }

      </div>

    `;
  }
}

function changeMonth(dir) {
  calMonth += dir;
  if (calMonth > 11) { calMonth=0; calYear++; }
  if (calMonth < 0)  { calMonth=11; calYear--; }
  renderCal();
}

// Alias para el HTML del alumno que usa chMes
function chMes(dir) {
  changeMonth(dir);
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
async function shuffleAseo() {

  const shuffled =
    [...alumnos]
    .sort(() => Math.random() - .5);

  const data = [];

  diasSemana.forEach((d, i) => {

    aseoActividades.forEach((act, j) => {

      data.push({

        dia: d,

        actividad: act,

        alumno:
          shuffled[
            (i * 5 + j)
            % shuffled.length
          ]?.nombre || '—',

        numero: j + 1

      });

    });

  });

  try {

    await apiFetch('/aseo', {

      method:'POST',

      body: JSON.stringify(data)

    });

    cargarAseo();

    mostrarToast(
      '🧹 Rol actualizado'
    );

  } catch (err) {

    console.log(err);
  }
}

async function cargarAseo() {

  try {

    aseoData =
      await apiFetch('/aseo');

    renderAseo();

    renderAseoAlumno();

  } catch (err) {

    console.log(err);
  }
}

function renderAseo() {

  const el =
    document.getElementById('aseo-grid');

  if (!el) return;

  const dias =
    [...new Set(
      aseoData.map(a => a.dia)
    )];

  el.innerHTML = dias.map(d => `

    <div class="aseo-day-card">

      <div class="aseo-day-title">
        📅 ${d}
      </div>

      ${
        aseoData
        .filter(a => a.dia === d)
        .map(r => `

          <div class="aseo-student-row">

            <div class="aseo-dot"></div>

            <div>

              <div style="
                font-size:.82rem;
                font-weight:800;
              ">
                ${r.alumno}
              </div>

              <div style="
                font-size:.72rem;
                color:var(--muted);
              ">
                ${r.actividad}
              </div>

            </div>

            <span class="aseo-num">
              ${r.numero}
            </span>

          </div>

        `).join('')
      }

    </div>

  `).join('');
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
    cargarAvisosAlumno(),
    cargarMensajes(),
    cargarAseo(),
  ]);
  
  // Renderizar el home con todos los datos dinámicos
  renderHomeAlumno();
  renderCalificacionesPanel();
  renderAvisosAlumno();
  setFechaHoy();
}

function renderHomeAlumno() {
  // Nombre del alumno
  const wn = document.getElementById('welcome-nombre');
  if (wn) wn.textContent = alumnoActual.nombre.split(' ')[0]; // Solo primer nombre
  
  // Promedio general
  const promedio = calificacionesAlumno.length > 0 
    ? (calificacionesAlumno.reduce((sum, c) => sum + parseFloat(c.calificacion || 0), 0) / calificacionesAlumno.length).toFixed(1)
    : '0.0';
  const pg = document.getElementById('promedio-general');
  if (pg) pg.textContent = promedio;
  const msgProm = document.getElementById('msg-promedio');

  if (msgProm) {

    if (promedio >= 10) {
      msgProm.textContent = '🏆 ¡Perfecto!';
    }
    else if (promedio >= 9) {
      msgProm.textContent = '🌟 ¡Excelente trabajo!';
    }
    else if (promedio >= 8) {
      msgProm.textContent = '👏 ¡Muy bien!';
    }
    else if (promedio >= 7) {
      msgProm.textContent = '👍 Buen desempeño';
    }
    else if (promedio >= 6) {
      msgProm.textContent = '⚠ Necesita mejorar';
    }
    else {
      msgProm.textContent = '🚨 Riesgo académico';
    }

  }
  // Asistencia general
  const presentes = asistenciaAlumno.filter(a => a.estado === 'P').length;
  const total = asistenciaAlumno.length || 1;
  const porcentajeAsistencia = Math.round((presentes / total) * 100);
  const ag = document.getElementById('asistencia-general');
  if (ag) ag.textContent = porcentajeAsistencia + '%';
  const msgAsistencia = document.getElementById('msg-asistencia');

  if (msgAsistencia) {

    if (porcentajeAsistencia === 100) {
      msgAsistencia.textContent = '🏅 Asistencia perfecta';
    }
    else if (porcentajeAsistencia >= 90) {
      msgAsistencia.textContent = '✅ Excelente asistencia';
    }
    else if (porcentajeAsistencia >= 80) {
      msgAsistencia.textContent = '👍 Buena asistencia';
    }
    else if (porcentajeAsistencia >= 70) {
      msgAsistencia.textContent = '⚠ Atención requerida';
    }
    else {
      msgAsistencia.textContent = '🚨 Riesgo de inasistencias';
    }

  }
  
  // Tareas entregadas
  const tareasEntregadas = calificacionesAlumno.filter(c => c.calificacion).length;
  const tareasPendientes = calificacionesAlumno.filter(c => !c.calificacion).length;
  const te = document.getElementById('tareas_entregadas');
  if (te) te.textContent = tareasEntregadas;
  
  const tp = document.getElementById('tareas_pendientes');
  if (tp) {

    const totalTareas = tareasEntregadas + tareasPendientes;

    if (tareasPendientes === 0) {
      tp.textContent = '🎉 Todas entregadas';
    }
    else if (tareasEntregadas >= totalTareas * 0.9) {
      tp.textContent = '👏 Excelente cumplimiento';
    }
    else if (tareasEntregadas >= totalTareas * 0.7) {
      tp.textContent = tareasPendientes + ' pendientes ⏳';
    }
    else {
      tp.textContent = '⚠ Muchas tareas pendientes';
    }

  }
  // Mensajes nuevos
  const mn = document.getElementById('mensajes-nuevos');
  if (mn) mn.textContent = '0'; // Placeholder, puedes actualizar con data real
  
  // Renderizar materias
  renderMateriasHome();
  
  // Renderizar avisos recientes
  renderAvisosRecientes();
  
  // Renderizar asistencia de la semana
  renderAsistenciaSemana();
}

function renderMateriasHome() {
  // Agrupar calificaciones por materia
  const materiaMap = {};
  calificacionesAlumno.forEach(c => {
    if (!materiaMap[c.materia]) {
      materiaMap[c.materia] = [];
    }
    materiaMap[c.materia].push(parseFloat(c.calificacion || 0));
  });
  
  const materias = [
    { nombre: 'Español', icon: '📖', bg: 'mint' },
    { nombre: 'Matemáticas', icon: '🔢', bg: 'rose' },
    { nombre: 'Ciencias', icon: '🔬', bg: 'sky' },
    { nombre: 'Historia', icon: '📜', bg: 'butter' },
    { nombre: 'Ed. Física', icon: '⚽', bg: 'peach' }
  ];
  
  const filas = document.querySelectorAll('#p-home .materia-row');
  filas.forEach((fila, i) => {
    const materia = materias[i];
    if (materia) {
      const calificaciones = materiaMap[materia.nombre] || [];
      const promedio = calificaciones.length > 0 
        ? (calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length).toFixed(1)
        : '—';
      
      const nombreEl = fila.querySelector('.materia-name');
      const calEl = fila.querySelector('.materia-cal');
      
      if (nombreEl) nombreEl.textContent = materia.nombre;
      if (calEl) {
        calEl.textContent = promedio;
        // Limpiar clases previas
        calEl.classList.remove('mc-a', 'mc-b', 'mc-c');
        // Aplicar clase según la calificación
        if (promedio !== '—') {
          const num = parseFloat(promedio);
          if (num >= 9) {
            calEl.classList.add('mc-a');
          } else if (num >= 7) {
            calEl.classList.add('mc-b');
          } else {
            calEl.classList.add('mc-c');
          }
        }
      }
    }
  });
}

function renderAvisosRecientes() {

  const avisosMinis =
    document.querySelectorAll(
      '#p-home .aviso-mini'
    );

  const avisosRecientes = avisos.slice(0, 3);

  const iconos = {
    '📅 Evento': '📅',
    '💰 Cooperación': '💰',
    '📋 Información': '📋',
    '⚠ Urgente': '⚠'
  };

  const colores = {
    '📅 Evento': 'var(--lav-l)',
    '💰 Cooperación': 'var(--butter-l)',
    '📋 Información': 'var(--mint-l)',
    '⚠ Urgente': 'var(--rose-l)'
  };

  avisosMinis.forEach((mini, i) => {

    const av = avisosRecientes[i];

    const icon =
      mini.querySelector('.aviso-mini-icon');

    const titulo =
      mini.querySelector('.aviso-mini-text');

    const fecha =
      mini.querySelector('.aviso-mini-date');

    if (!av) {

      if (titulo) titulo.textContent = 'Sin avisos';
      if (fecha) fecha.textContent = '';

      return;
    }

    // ICONO
    if (icon) {

      icon.textContent =
        iconos[av.categoria] || '📋';

      icon.style.background =
        colores[av.categoria] || 'var(--lav-l)';
    }

    // TITULO
    if (titulo) {
      titulo.textContent = av.titulo;
    }

    // FECHA
    if (fecha) {

      fecha.textContent =
        new Date(av.fecha)
          .toLocaleDateString(
            'es-MX',
            {
              day:'numeric',
              month:'short'
            }
          );
    }

  });

}

function renderAsistenciaSemana() {
  // Obtener los últimos 5 días de asistencia (semana)
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
  const container = document.querySelector('#p-home .card:last-child');
  
  if (!container) return;
  
  // Buscar los divs que contienen los días
  const diasDivs = container.querySelectorAll('[style*="text-align:center;flex:1;"]');
  
  // Tomar los últimos 5 registros de asistencia
  const asistenciaSemana = asistenciaAlumno.slice(-5);
  
  diasDivs.forEach((dia, i) => {
    if (i >= diasSemana.length) return;
    
    const estado = asistenciaSemana[i]?.estado || 'P';
    const badge = dia.querySelector('div:first-child');
    const label = dia.querySelector('div:nth-child(2)');
    
    if (badge) {
      // Aplicar estilos según el estado
      if (estado === 'P') {
        badge.style.background = 'var(--mint-l)';
        badge.style.color = 'var(--mint-d)';
        badge.textContent = 'P';
      } else if (estado === 'F') {
        badge.style.background = 'var(--rose-l)';
        badge.style.color = 'var(--rose-d)';
        badge.textContent = 'F';
      } else if (estado === 'J') {
        badge.style.background = 'var(--butter-l)';
        badge.style.color = '#a07000';
        badge.textContent = 'J';
      }
    }
    if (label) label.textContent = diasSemana[i];
  });
}

async function cargarCalificacionesAlumno() {
  try {
    calificacionesAlumno = await apiFetch(`/calificaciones/${alumnoActual.id}`);
    console.log(calificacionesAlumno[0]);
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
    const estado = c.calificacion ? 'ec-ok' : 'ec-pend';
    const notaText = c.calificacion ? parseFloat(c.calificacion).toFixed(1) : '—';
    return `<tr>
      <td style="font-weight:700;color:var(--text);">${c.actividad || 'Actividad'}</td>
      <td style="color:var(--muted);font-size:.88rem;">${c.materia || '—'}</td>
      <td style="color:var(--muted);font-size:.88rem;">
        ${
          c.fecha
            ? new Date(c.fecha).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })
            : '—'
        }
      </td>
      <td><span style="background:var(--mint-l);color:var(--mint-d);padding:.25rem .7rem;border-radius:10px;font-weight:700;font-size:.8rem;">${notaText}</span></td>
      <td><span class="entrega-chip ${estado}">${c.calificacion ? '✓ Calificado' : '⏳ Pendiente'}</span></td>
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

let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
function cambiarMes(valor) {

  mesActual += valor;

  if (mesActual > 11) {
    mesActual = 0;
    anioActual++;
  }

  if (mesActual < 0) {
    mesActual = 11;
    anioActual--;
  }

  renderAsistenciaAlumno();
}

function renderAsistenciaAlumno() {

  const grid = document.getElementById('mes-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Título
  const titulo = document.querySelector('#p-asistencia .card-heading');

  if (titulo) {
    titulo.textContent = `📅 ${meses[mesActual]} ${anioActual}`;
  }

  // Encabezados
  const days = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'];

  days.forEach(d => {
    const div = document.createElement('div');
    div.className = 'mes-day-name';
    div.textContent = d;
    grid.appendChild(div);
  });

  // Primer día del mes
  const firstDay = new Date(anioActual, mesActual, 1);

  // Total de días
  const daysInMonth = new Date(anioActual, mesActual + 1, 0).getDate();

  // Día de inicio
  let inicio = firstDay.getDay();

  // Convertir domingo
  inicio = inicio === 0 ? 7 : inicio;

  // Ajustar para lunes=0
  inicio = inicio - 1;

  // Si cae sábado o domingo
  if (inicio > 4) inicio = 0;

  // Espacios vacíos
  for (let i = 0; i < inicio; i++) {
    const div = document.createElement('div');
    div.className = 'mes-day md-e';
    grid.appendChild(div);
  }

  // Mapear asistencia
  const estadoMap = {};

  asistenciaAlumno.forEach(a => {

    const fecha = new Date(a.fecha);

    if (
      fecha.getMonth() === mesActual &&
      fecha.getFullYear() === anioActual
    ) {
      estadoMap[fecha.getDate()] = a.estado.toLowerCase();
    }
  });

  let presentes = 0;
  let faltas = 0;
  let justificadas = 0;

  // CONTAR TODOS LOS REGISTROS
  asistenciaAlumno.forEach(a => {

    const estado = (a.estado || '').toLowerCase();

    if (estado === 'p') {
      presentes++;
    }
    else if (estado === 'f') {
      faltas++;
    }
    else if (estado === 'j') {
      justificadas++;
    }

  });

  const total = presentes + faltas + justificadas;

  const porcentaje =
    total > 0
      ? Math.round((presentes / total) * 100)
      : 0;

  document.getElementById('total-presentes').textContent = presentes;
  document.getElementById('total-faltas').textContent = faltas;
  document.getElementById('total-justificadas').textContent = justificadas;
  document.getElementById('porcentaje-asistencia').textContent = `${porcentaje}%`;

  // Renderizar días
  for (let dia = 1; dia <= daysInMonth; dia++) {

    const fecha = new Date(anioActual, mesActual, dia);

    const diaSemana = fecha.getDay();

    // Saltar sábado y domingo
    if (diaSemana === 0 || diaSemana === 6) {
      continue;
    }

    const div = document.createElement('div');

    let className = 'mes-day';

    const estado = estadoMap[dia] || '';

    let label = dia;

    if (estado === 'p') {
      className += ' md-p';
      label = `✓ ${dia}`;
    }
    else if (estado === 'f') {
      className += ' md-f';
      label = `✗ ${dia}`;
    }
    else if (estado === 'j') {
      className += ' md-j';
      label = `J ${dia}`;
    }
    else {
      className += ' md-e';
    }

    div.className = className;
    div.textContent = label;

    grid.appendChild(div);
  }
}

function renderAsistenciaSemana() {

  const container = document.getElementById('week-attendance');

  if (!container) return;

  container.innerHTML = '';

  const nombres = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

  const hoy = new Date();

  // Obtener lunes
  const lunes = new Date(hoy);

  const dia = hoy.getDay();

  const diff = dia === 0 ? -6 : 1 - dia;

  lunes.setDate(hoy.getDate() + diff);

  // Renderizar lunes-viernes
  for (let i = 0; i < 5; i++) {

    const fecha = new Date(lunes);

    fecha.setDate(lunes.getDate() + i);

    const fechaStr = fecha.toISOString().split('T')[0];

    // Buscar asistencia
    const registro = asistenciaAlumno.find(a => {

      const f = new Date(a.fecha).toISOString().split('T')[0];

      return f === fechaStr;

    });

    let estado = '';
    let letra = '—';
    let clase = 'ws-e';

    if (registro) {

      estado = (registro.estado || '').toLowerCase();

      if (estado === 'p') {
        letra = 'P';
        clase = 'ws-p';
      }
      else if (estado === 'f') {
        letra = 'F';
        clase = 'ws-f';
      }
      else if (estado === 'j') {
        letra = 'J';
        clase = 'ws-j';
      }
    }

    container.innerHTML += `
      <div class="week-day">

        <div class="week-status ${clase}">
          ${letra}
        </div>

        <div class="week-label">
          ${nombres[fecha.getDay()]}
        </div>

      </div>
    `;
  }
}

function setFechaHoy() {
  const d = new Date();
  const str = d.toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const td = document.getElementById('today-date');
  if (td) td.textContent = str;
  
  // También actualizar en el home
  const wbd = document.getElementById('wb-date');
  if (wbd) wbd.textContent = str;
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
      calificaciones: 'Grupo ' + alumnoActual.grupo + ' · Mtro. Hector',
      asistencia: 'Grupo ' + alumnoActual.grupo + ' · Mtro. Hector',
      avisos: 'Grupo ' + alumnoActual.grupo + ' · Mtro. Hector',
      chat: 'Grupo ' + alumnoActual.grupo + ' · Mtro. Hector',
      citas: 'Grupo ' + alumnoActual.grupo + ' · Mtro. Hector',
      aseo: 'Grupo ' + alumnoActual.grupo + ' · Mtro. Hector'
    };
    subEl.textContent = subs[page] || '';
  }
  
  // Si es aseo, renderizar el contenido
  if (page === 'aseo') {
    renderAseoAlumno();
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

// Rol de Aseo para Alumno (solo lectura)
function renderAseoAlumno() {

  const el =
    document.getElementById(
      'aseo-grid-alumno'
    );

  if (!el) return;

  const dias =
    [...new Set(
      aseoData.map(a => a.dia)
    )];

  el.innerHTML = dias.map(d => `

    <div class="aseo-day-card">

      <div class="aseo-day-title">
        📅 ${d}
      </div>

      ${
        aseoData
        .filter(a => a.dia === d)
        .map((r, i) => `

          <div class="
            aseo-student-row
            ${
              r.alumno === alumnoActual.nombre
              ? 'aseo-mio'
              : ''
            }
          ">

            <div
              class="aseo-dot"
              style="
                background:
                ${
                  [
                    '#5cbf99',
                    '#f5965a',
                    '#f07090',
                    '#9b7ee8',
                    '#60b8f0'
                  ][i % 5]
                };
              "
            ></div>

            <div>

              <div style="
                font-size:.82rem;
                font-weight:800;
              ">
                ${r.alumno}
              </div>

              <div style="
                font-size:.72rem;
                color:var(--muted);
                font-weight:700;
              ">
                ${r.actividad}
              </div>

            </div>

            <span class="aseo-num">
              ${r.numero}
            </span>

          </div>

        `).join('')
      }

    </div>

  `).join('');

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

function renderCalificacionesPanel() {

  const materias = {
    "Español": "esp",
    "Matemáticas": "mat",
    "Ciencias": "cie",
    "Historia": "his",
    "Ed. Física": "edf"
  };

  let suma = 0;
  let total = 0;

  Object.entries(materias).forEach(([materia, key]) => {

    const registros = calificacionesAlumno.filter(
      c => c.materia === materia
    );

    if (registros.length > 0) {

      const promedio = (
        registros.reduce(
          (acc, r) => acc + parseFloat(r.calificacion),
          0
        ) / registros.length
      ).toFixed(1);

      document.getElementById(`cal-${key}`).textContent = promedio;

      document.getElementById(`status-${key}`).textContent =
        obtenerMensajeCalificacion(promedio);

      suma += parseFloat(promedio);
      total++;
    }
  });

  const promedioGeneral =
    total > 0 ? (suma / total).toFixed(1) : "0";

  document.getElementById("prom-general").textContent =
    promedioGeneral;

  document.getElementById("prom-status").textContent =
    obtenerMensajeCalificacion(promedioGeneral);
}

function obtenerMensajeCalificacion(cal) {

  cal = parseFloat(cal);

  if (cal >= 10)
    return "🏆 Excelente";

  if (cal >= 9)
    return "🌟 Muy bien";

  if (cal >= 8)
    return "👍 Buen trabajo";

  if (cal >= 7)
    return "⚠️ Puede mejorar";

  return "❌ Requiere apoyo";
}

async function cargarMensajes() {

  try {

    mensajes = await apiFetch(
      `/mensajes/${localStorage.getItem('usuarioId')}`
    );

    renderMensajes();

  } catch (err) {

    console.log(err);
  }
}

function renderMensajes() {

  const area =
    document.getElementById('msgs-area');

  if (!area) return;

  area.innerHTML = mensajes.map(m => {

    const esMio =
      m.remitenteId === parseInt(
        localStorage.getItem('usuarioId')
      );

    return `

      <div class="
        ${esMio ? 'msg-me' : 'msg-other'}
      ">

        <div class="msg-bubble">

          ${m.contenido}

          <div class="msg-time">

            ${
              new Date(m.fecha)
              .toLocaleTimeString(
                'es-MX',
                {
                  hour:'2-digit',
                  minute:'2-digit'
                }
              )
            }

          </div>

        </div>

      </div>
    `;
  }).join('');

  area.scrollTop =
    area.scrollHeight;
}

async function sendMsg() {

  const input =
    document.getElementById('chat-in');

  const texto =
    input.value.trim();

  if (!texto) return;

  try {

    await apiFetch('/mensajes', {

      method:'POST',

      body: JSON.stringify({

        remitenteId:
        parseInt(
          localStorage.getItem('usuarioId')
        ),

        receptorId: 1,

        contenido: texto

      })
    });

    input.value = '';

    await cargarMensajes();

  } catch (err) {

    console.log(err);

    mostrarToast(
      '❌ Error enviando mensaje'
    );
  }
}