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

//DOCENTE----------------------------------------------------------------------------------------------------------------------------
// ═══════════════════════════════════
//  DATOS
// ═══════════════════════════════════
const alumnos = [
  {id:1,nombre:'Sofía García López',      fecha:'2016-03-14',prom:9.2,asist:96,estado:'Excelente'},
  {id:2,nombre:'Carlos Martínez Ruiz',    fecha:'2016-07-22',prom:7.8,asist:88,estado:'Regular'},
  {id:3,nombre:'Valentina Torres Pérez',  fecha:'2016-01-05',prom:9.5,asist:99,estado:'Excelente'},
  {id:4,nombre:'Luis Ramírez Vega',       fecha:'2016-05-30',prom:6.4,asist:72,estado:'Atención'},
  {id:5,nombre:'Isabella López Mora',     fecha:'2016-11-18',prom:8.7,asist:93,estado:'Bien'},
  {id:6,nombre:'Diego Hernández Silva',   fecha:'2016-09-03',prom:8.1,asist:90,estado:'Bien'},
  {id:7,nombre:'Mariana Castro Ríos',     fecha:'2016-04-12',prom:9.0,asist:97,estado:'Excelente'},
  {id:8,nombre:'Emilio Gómez Fuentes',    fecha:'2016-06-25',prom:7.2,asist:85,estado:'Regular'},
  {id:9,nombre:'Camila Vargas Delgado',   fecha:'2016-08-08',prom:8.9,asist:94,estado:'Bien'},
  {id:10,nombre:'Sebastián Cruz Morales', fecha:'2016-02-19',prom:5.9,asist:68,estado:'Atención'},
];
 
const califData = alumnos.map(a=>({
  id:a.id, nombre:a.nombre,
  Español: (Math.random()*3+7).toFixed(1),
  Matemáticas: (Math.random()*3+7).toFixed(1),
  Ciencias: (Math.random()*3+7).toFixed(1),
  Historia: (Math.random()*3+7).toFixed(1),
  'Ed. Física': (Math.random()*3+7).toFixed(1),
}));
 
let observaciones = [
  {alumno:'Sofía García',fecha:'2026-03-14',tags:['sel-pos','sel-pos'],tagLabels:['⭐ Esfuerzo','🌟 Destacado'],texto:'Sofía demostró un excelente desempeño en la exposición de ciencias. Participó de manera voluntaria y explicó con claridad.',color:'oc-green'},
  {alumno:'Carlos Martínez',fecha:'2026-03-13',tags:['sel-neg'],tagLabels:['⚠ Conducta'],texto:'Carlos interrumpió la clase en dos ocasiones. Se habló con él de manera privada sobre la importancia del respeto.',color:'oc-rose'},
  {alumno:'Luis Ramírez',fecha:'2026-03-12',tags:['sel-neg'],tagLabels:['😔 Tarea pendiente'],texto:'Luis no entregó las tareas de la semana. Se enviará comunicado a sus padres.',color:'oc-amber'},
  {alumno:'Valentina Torres',fecha:'2026-03-11',tags:['sel-pos'],tagLabels:['✅ Participación'],texto:'Valentina participa activamente en todas las materias. Es un ejemplo positivo para el grupo.',color:'oc-green'},
];
 
let avisos = [
  {titulo:'Junta mensual de padres',cat:'📅 Evento',cuerpo:'Se les cita el próximo viernes 20 de marzo a las 5:00 PM en el aula de 3°B para tratar temas del bimestre.',fecha:'14 mar 2026',chip:'ac-p'},
  {titulo:'Cooperación material didáctico',cat:'💰 Cooperación',cuerpo:'Se solicita una cooperación voluntaria de $50 para material de manualidades del proyecto de arte.',fecha:'12 mar 2026',chip:'ac-a'},
];
 
const chatConversaciones = [
  {id:1,av:'av2',initials:'SC',nombre:'Mamá de Sofía García',preview:'¿Podría agendar una cita?',hora:'09:05',unread:1,online:true,
    msgs:[
      {mine:false,text:'Buenos días maestra, ¿podría agendar una cita para hablar sobre las calificaciones de Sofía?',hora:'09:05'},
      {mine:true, text:'Buenos días, claro que sí. ¿Le viene bien el viernes a las 4 PM?',hora:'09:12'},
      {mine:false,text:'Sí, perfecto. Muchas gracias 😊',hora:'09:13'},
    ]
  },
  {id:2,av:'av3',initials:'CR',nombre:'Papá de Carlos Ramírez',preview:'Gracias por el aviso',hora:'08:45',unread:0,online:false,
    msgs:[
      {mine:false,text:'Maestra, vi el aviso de la cooperación. Voy a llevarla mañana.',hora:'08:40'},
      {mine:true, text:'Muchas gracias, se lo hago saber.',hora:'08:45'},
    ]
  },
  {id:3,av:'av1',initials:'LR',nombre:'Mamá de Luis Ramírez',preview:'¿Qué pasó con Luis?',hora:'Ayer',unread:2,online:false,
    msgs:[
      {mine:false,text:'Buenas tardes, ¿puede contarme más sobre lo que pasó con Luis esta semana?',hora:'Ayer'},
    ]
  },
];
let currentChat = 0;
 
let citas = [
  {hora:'10:00',ampm:'AM',nombre:'Mamá de Sofía G.',alumno:'Sofía García',motivo:'Revisión de calificaciones del bimestre',status:'Confirmada'},
  {hora:'12:30',ampm:'PM',nombre:'Papá de Diego H.',alumno:'Diego Hernández',motivo:'Seguimiento conducta',status:'Pendiente'},
];
 
const aseoActividades = ['Barrer','Trapear','Limpiar pizarrón','Organizar pupitres','Recoger basura'];
const diasSemana = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
let aseoRol = {};
 
// ═══════════════════════════════════
//  NAV
// ═══════════════════════════════════
const titles = {
  dashboard:'Inicio', alumnos:'Alumnos', calificaciones:'Calificaciones',
  observaciones:'Observaciones', asistencia:'Asistencia', avisos:'Avisos',
  chat:'Mensajes', citas:'Citas', aseo:'Rol de Aseo',
};
function goTo(page, el) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('p-'+page).classList.add('active');
  if(el) el.classList.add('active');
  document.getElementById('page-title').textContent = titles[page];
}
 
// ═══════════════════════════════════
//  FECHA HOY
// ═══════════════════════════════════
(function(){
  const d=new Date();
  const opts={weekday:'long',year:'numeric',month:'long',day:'numeric'};
  document.getElementById('today-date').textContent = d.toLocaleDateString('es-MX',opts);
  document.getElementById('asist-date').value = d.toISOString().split('T')[0];
  document.getElementById('obs-fecha').value = d.toISOString().split('T')[0];
})();
 
// ═══════════════════════════════════
//  ALUMNOS TABLE
// ═══════════════════════════════════
function renderAlumnos(list){
  const tb=document.getElementById('alumnos-tbody');
  tb.innerHTML = list.map((a,i)=>{
    const sc = a.estado==='Excelente'?'sp-green':a.estado==='Atención'?'sp-rose':'sp-amber';
    return `<tr>
      <td style="color:var(--muted);font-size:.8rem;">${String(i+1).padStart(2,'0')}</td>
      <td><div style="display:flex;align-items:center;gap:.6rem;">
        <div class="alumno-av">${a.nombre[0]}</div>
        <div><div class="alumno-name">${a.nombre}</div><div class="alumno-sub">${a.fecha}</div></div>
      </div></td>
      <td style="color:var(--muted);font-size:.83rem;">${a.fecha}</td>
      <td><span class="grade-badge ${a.prom>=9?'gb-a':a.prom>=7?'gb-b':'gb-c'}">${a.prom}</span></td>
      <td style="font-size:.84rem;font-weight:600;color:${a.asist>=90?'var(--teal)':a.asist>=80?'#b07500':'var(--rose)'};">${a.asist}%</td>
      <td><span class="status-pill ${sc}">${a.estado}</span></td>
      <td>
        <button class="btn-icon" title="Ver perfil">👁️</button>
        <button class="btn-icon" title="Observación" onclick="goTo('observaciones',document.querySelectorAll('.nav-item')[3])">📝</button>
        <button class="btn-icon" title="Chat" onclick="goTo('chat',document.querySelectorAll('.nav-item')[6])">💬</button>
      </td>
    </tr>`;
  }).join('');
}
renderAlumnos(alumnos);
function filterAlumnos(v){renderAlumnos(alumnos.filter(a=>a.nombre.toLowerCase().includes(v.toLowerCase())));}
 
// DASH alumnos
const dashList = document.getElementById('dash-alumnos-list');
alumnos.slice(0,5).forEach(a=>{
  const sc = a.estado==='Excelente'?'sp-green':a.estado==='Atención'?'sp-rose':'sp-amber';
  dashList.innerHTML += `<div class="alumno-row">
    <div class="alumno-av">${a.nombre[0]}</div>
    <div style="flex:1;"><div class="alumno-name">${a.nombre}</div><div class="alumno-sub">Prom: ${a.prom}</div></div>
    <span class="status-pill ${sc}">${a.estado}</span>
  </div>`;
});
 
// ═══════════════════════════════════
//  CALIFICACIONES
// ═══════════════════════════════════
function renderCalif(list){
  const materias=['Español','Matemáticas','Ciencias','Historia','Ed. Física'];
  document.getElementById('calif-tbody').innerHTML = list.map(a=>{
    const grades = materias.map(m=>`<td><input class="grade-input" type="number" min="0" max="10" step="0.1" value="${a[m]}"></td>`).join('');
    const prom = (materias.reduce((s,m)=>s+parseFloat(a[m]),0)/materias.length).toFixed(1);
    return `<tr>
      <td><div style="display:flex;align-items:center;gap:.55rem;">
        <div class="alumno-av" style="width:28px;height:28px;font-size:.75rem;">${a.nombre[0]}</div>
        <span style="font-size:.85rem;font-weight:600;">${a.nombre}</span>
      </div></td>
      ${grades}
      <td><span class="grade-badge ${prom>=9?'gb-a':prom>=7?'gb-b':'gb-c'}">${prom}</span></td>
      <td><button class="btn-icon" title="Guardar" onclick="this.textContent='✅';setTimeout(()=>this.textContent='💾',1500)">💾</button></td>
    </tr>`;
  }).join('');
}
renderCalif(califData);
function filterCalif(v){renderCalif(califData.filter(a=>a.nombre.toLowerCase().includes(v.toLowerCase())));}
function filterByMateria(){}
 
// ═══════════════════════════════════
//  OBSERVACIONES
// ═══════════════════════════════════
const obsSelect = document.getElementById('obs-select-alumno');
alumnos.forEach(a=>obsSelect.innerHTML+=`<option>${a.nombre}</option>`);
 
function renderObs(){
  document.getElementById('obs-list').innerHTML = observaciones.map(o=>`
    <div class="obs-card ${o.color}">
      <div class="obs-header">
        <div class="obs-av">${o.alumno[0]}</div>
        <div><div class="obs-name">${o.alumno}</div><div class="obs-date">${o.fecha}</div></div>
      </div>
      <div class="obs-tags">${o.tagLabels.map(t=>{
        const cl = t.includes('✅')||t.includes('⭐')||t.includes('🌟')?'ot-pos':t.includes('⚠')||t.includes('😔')?'ot-neg':'ot-neu';
        return `<span class="obs-tag ${cl}">${t}</span>`;
      }).join('')}</div>
      <div class="obs-text">${o.texto}</div>
      <div class="obs-footer">
        <span style="font-size:.73rem;color:var(--muted);">📎 Ver completo</span>
        <button class="btn-icon" onclick="deleteObs(this)">🗑️</button>
      </div>
    </div>`).join('');
}
renderObs();
 
let selectedTags=[];
function toggleTag(btn,type,cls){
  const classes=['sel-pos','sel-neg','sel-neu'];
  const isActive = classes.some(c=>btn.classList.contains(c));
  if(isActive){btn.classList.remove(...classes);selectedTags=selectedTags.filter(t=>t!==btn.textContent.trim());}
  else{btn.classList.remove(...classes);btn.classList.add(cls);selectedTags.push(btn.textContent.trim());}
}
function addObservacion(){
  const alumno=document.getElementById('obs-select-alumno').value;
  const fecha=document.getElementById('obs-fecha').value;
  const texto=document.getElementById('obs-desc').value.trim();
  if(!texto)return alert('Escribe una descripción.');
  const hasNeg = selectedTags.some(t=>t.includes('⚠')||t.includes('😔'));
  const color = hasNeg?'oc-rose':selectedTags.length?'oc-green':'oc-amber';
  observaciones.unshift({alumno:alumno.split(' ').slice(0,2).join(' '),fecha,tags:[],tagLabels:selectedTags.slice(),texto,color});
  document.getElementById('obs-desc').value='';
  selectedTags=[];
  document.querySelectorAll('.tag-toggle').forEach(b=>b.classList.remove('sel-pos','sel-neg','sel-neu'));
  renderObs();
}
function deleteObs(btn){
  const card=btn.closest('.obs-card');
  card.style.opacity='0';card.style.transform='scale(.95)';card.style.transition='.3s';
  setTimeout(()=>{observaciones.splice(card.parentElement?Array.from(card.parentElement.children).indexOf(card):0,1);renderObs();},300);
}
 
// ═══════════════════════════════════
//  ASISTENCIA
// ═══════════════════════════════════
const diasCortos=['Lun','Mar','Mié','Jue','Vie'];
let asistData = {};
alumnos.forEach(a=>{
  asistData[a.id]={};
  diasCortos.forEach(d=>asistData[a.id][d]=Math.random()>.15?'P':Math.random()>.5?'J':'F');
  asistData[a.id]['Hoy']='';
});
 
function renderAsistencia(){
  document.getElementById('asist-tbody').innerHTML = alumnos.map((a,i)=>{
    const semDias = diasCortos.slice(0,4).map(d=>{
      const v=asistData[a.id][d];
      return `<td><button class="asist-btn ${v==='P'?'ab-p sel':v==='F'?'ab-f sel':v==='J'?'ab-j sel':'ab-p'}" onclick="cycleAsist(${a.id},'${d}',this)">${v||'—'}</button></td>`;
    }).join('');
    const hoy = asistData[a.id]['Hoy'];
    const hoyBtn = `<td><div style="display:flex;gap:.3rem;justify-content:center;">
      <button class="asist-btn ${hoy==='P'?'ab-p sel':'ab-p'}" onclick="setAsist(${a.id},'Hoy','P',this)">P</button>
      <button class="asist-btn ${hoy==='F'?'ab-f sel':'ab-f'}" onclick="setAsist(${a.id},'Hoy','F',this)">F</button>
      <button class="asist-btn ${hoy==='J'?'ab-j sel':'ab-j'}" onclick="setAsist(${a.id},'Hoy','J',this)">J</button>
    </div></td>`;
    const presentes = Object.values(asistData[a.id]).filter(v=>v==='P').length;
    const faltas = Object.values(asistData[a.id]).filter(v=>v==='F').length;
    return `<tr>
      <td style="color:var(--muted);font-size:.78rem;">${String(i+1).padStart(2,'0')}</td>
      <td style="font-size:.84rem;font-weight:600;">${a.nombre}</td>
      ${semDias}
      ${hoyBtn}
      <td><span class="resumen-pill" style="background:rgba(44,168,160,0.1);color:var(--teal);">✓ ${presentes}</span>
          <span class="resumen-pill" style="background:rgba(232,99,122,0.1);color:var(--rose);margin-left:.3rem;">✗ ${faltas}</span></td>
    </tr>`;
  }).join('');
}
renderAsistencia();
function cycleAsist(id,dia,btn){
  const ciclo=['P','F','J',''];
  const cur = asistData[id][dia];
  const ni = (ciclo.indexOf(cur)+1)%ciclo.length;
  asistData[id][dia]=ciclo[ni];
  renderAsistencia();
}
function setAsist(id,dia,val,btn){
  asistData[id][dia]=val;
  renderAsistencia();
}
function markAll(v){alumnos.forEach(a=>asistData[a.id]['Hoy']=v);renderAsistencia();}
function saveAsistencia(){
  const btn=document.querySelector('#p-asistencia .btn-action');
  const orig=btn.textContent;btn.textContent='✅ Guardado';
  setTimeout(()=>btn.textContent=orig,2000);
}
 
// ═══════════════════════════════════
//  AVISOS
// ═══════════════════════════════════
const avisoIcons=['📅','💰','📋','⚠'];
const avisoWrap=['av-purple','av-amber','av-blue','av-blue'];
function renderAvisos(){
  document.getElementById('avisos-list').innerHTML = avisos.map((av,i)=>`
    <div class="aviso-card">
      <div class="aviso-icon-wrap ${avisoWrap[i%4]}">${avisoIcons[i%4]}</div>
      <div class="aviso-content">
        <div class="aviso-title">${av.titulo}</div>
        <div class="aviso-body">${av.cuerpo}</div>
        <div class="aviso-meta">
          <span class="aviso-date">📅 ${av.fecha}</span>
          <span class="aviso-chip ${av.chip}">${av.cat}</span>
        </div>
      </div>
      <button class="btn-icon" style="align-self:flex-start;" onclick="this.closest('.aviso-card').remove()">🗑️</button>
    </div>`).join('');
}
renderAvisos();
function publishAviso(){
  const titulo=document.getElementById('aviso-titulo').value.trim();
  const cuerpo=document.getElementById('aviso-body').value.trim();
  const cat=document.getElementById('aviso-cat').value;
  if(!titulo||!cuerpo)return alert('Completa título y contenido.');
  avisos.unshift({titulo,cuerpo,cat,fecha:new Date().toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'}),chip:'ac-g'});
  document.getElementById('aviso-titulo').value='';
  document.getElementById('aviso-body').value='';
  renderAvisos();
}
 
// ═══════════════════════════════════
//  CHAT
// ═══════════════════════════════════
function renderContacts(){
  document.getElementById('chat-contacts').innerHTML = chatConversaciones.map((c,i)=>`
    <div class="contact-item ${i===currentChat?'active':''}" onclick="selectChat(${i})">
      <div class="contact-av ${c.av}">${c.initials}${c.online?'<div class="online-dot"></div>':''}</div>
      <div class="contact-info">
        <div class="contact-name">${c.nombre}</div>
        <div class="contact-preview">${c.preview}</div>
      </div>
      <div class="contact-meta">
        <div class="contact-time">${c.hora}</div>
        ${c.unread?`<div class="unread-badge">${c.unread}</div>`:''}
      </div>
    </div>`).join('');
}
function renderMessages(){
  const conv = chatConversaciones[currentChat];
  document.getElementById('chat-messages').innerHTML = conv.msgs.map(m=>`
    <div class="msg ${m.mine?'mine':''}">
      <div class="msg-av ${m.mine?'mine-av':conv.av}">${m.mine?'ML':conv.initials}</div>
      <div>
        <div class="bubble">${m.text}</div>
        <div class="msg-time">${m.hora}</div>
      </div>
    </div>`).join('');
  const ms=document.getElementById('chat-messages');
  ms.scrollTop=ms.scrollHeight;
}
function selectChat(i){
  currentChat=i;
  chatConversaciones[i].unread=0;
  const c=chatConversaciones[i];
  document.getElementById('chat-header').innerHTML=`
    <div class="contact-av ${c.av}">${c.initials}</div>
    <div class="chat-header-info">
      <div class="chat-header-name">${c.nombre}</div>
      <div class="chat-header-sub">Alumno/a de 3°B</div>
    </div>`;
  renderContacts();renderMessages();
}
function sendMsg(){
  const inp=document.getElementById('chat-input');
  const txt=inp.value.trim();
  if(!txt)return;
  const now=new Date();
  const hora=now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');
  chatConversaciones[currentChat].msgs.push({mine:true,text:txt,hora});
  chatConversaciones[currentChat].preview=txt;
  inp.value='';
  renderMessages();renderContacts();
}
renderContacts();renderMessages();
 
// ═══════════════════════════════════
//  CITAS
// ═══════════════════════════════════
function renderCitas(){
  document.getElementById('citas-list').innerHTML = citas.length
    ? citas.map(c=>`
      <div class="cita-item">
        <div class="cita-time-block"><div class="cita-hour">${c.hora}</div><div class="cita-ampm">${c.ampm}</div></div>
        <div class="cita-info">
          <div class="cita-name">${c.nombre}</div>
          <div class="cita-reason">👤 ${c.alumno} — ${c.motivo}</div>
          <span class="cita-status ${c.status==='Confirmada'?'cs-conf':'cs-pend'}">${c.status}</span>
        </div>
        <button class="btn-icon" onclick="this.closest('.cita-item').remove()">🗑️</button>
      </div>`).join('')
    : '<p style="color:var(--muted);font-size:.86rem;text-align:center;padding:2rem;">Sin citas programadas hoy</p>';
}
renderCitas();
 
// Calendario
let calYear=2026, calMonth=2; // marzo
function renderCal(){
  const monthNames=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  document.getElementById('cal-month-label').textContent=`${monthNames[calMonth]} ${calYear}`;
  const g=document.getElementById('cal-grid');
  g.innerHTML=['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d=>`<div class="cal-day-name">${d}</div>`).join('');
  const first=new Date(calYear,calMonth,1).getDay();
  const days=new Date(calYear,calMonth+1,0).getDate();
  for(let i=0;i<first;i++) g.innerHTML+=`<div class="cal-day empty"></div>`;
  for(let d=1;d<=days;d++){
    const isToday=d===15&&calMonth===2&&calYear===2026;
    const hasCita=d===15||d===20;
    g.innerHTML+=`<div class="cal-day${isToday?' today':''}${hasCita?' has-cita':''}">${d}</div>`;
  }
}
renderCal();
function changeMonth(dir){calMonth+=dir;if(calMonth>11){calMonth=0;calYear++;}if(calMonth<0){calMonth=11;calYear--;}renderCal();}
function addSlot(){
  const f=document.getElementById('new-cita-fecha').value;
  const h=document.getElementById('new-cita-hora').value;
  if(!f||!h)return alert('Selecciona fecha y hora.');
  alert(`✅ Horario ${h} del ${new Date(f+'T12:00').toLocaleDateString('es-MX')} habilitado.`);
}
function saveCita(){
  const padre=document.getElementById('nc-padre').value.trim();
  const alumno=document.getElementById('nc-alumno-select').value;
  const hora=document.getElementById('nc-hora').value;
  const motivo=document.getElementById('nc-motivo').value.trim();
  if(!padre||!hora)return alert('Completa los campos requeridos.');
  const [h,m]=hora.split(':');
  const ampm=parseInt(h)>=12?'PM':'AM';
  const h12=String(parseInt(h)%12||12)+':'+m;
  citas.push({hora:h12,ampm,nombre:padre,alumno,motivo:motivo||'Sin especificar',status:'Confirmada'});
  closeOverlay('modal-cita');
  renderCitas();
}
 
// ═══════════════════════════════════
//  ASEO
// ═══════════════════════════════════
function shuffleAseo(){
  const shuffled=[...alumnos].sort(()=>Math.random()-.5);
  aseoRol={};
  diasSemana.forEach((d,i)=>{
    aseoRol[d]=aseoActividades.map((act,j)=>({act,alumno:shuffled[(i*5+j)%shuffled.length].nombre}));
  });
  renderAseo();
}
function renderAseo(){
  document.getElementById('aseo-grid').innerHTML=diasSemana.map(d=>`
    <div class="aseo-day-card">
      <div class="aseo-day-title">${d}</div>
      ${(aseoRol[d]||[]).map((r,i)=>`
        <div class="aseo-student-row">
          <div class="aseo-dot" style="background:${['var(--teal)','var(--accent)','var(--rose)','#7b61ff','var(--deep)'][i]};"></div>
          <div><div style="font-size:.82rem;font-weight:600;">${r.alumno.split(' ')[0]}</div><div style="font-size:.72rem;color:var(--muted);">${r.act}</div></div>
          <span class="aseo-num">${i+1}</span>
        </div>`).join('')}
    </div>`).join('');
}
shuffleAseo();
 
// ═══════════════════════════════════
//  MODALS / OVERLAYS
// ═══════════════════════════════════
function openAddAlumno(){document.getElementById('modal-alumno').classList.add('open');}
function openAddTarea(){document.getElementById('modal-tarea').classList.add('open');}
function openAddCita(){
  // populate select
  const s=document.getElementById('nc-alumno-select');
  s.innerHTML=alumnos.map(a=>`<option>${a.nombre}</option>`).join('');
  document.getElementById('modal-cita').classList.add('open');
}
function closeOverlay(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.overlay.open').forEach(o=>o.classList.remove('open'));});
 
function saveAlumno(){
  const nombre=document.getElementById('new-alumno-nombre').value.trim();
  const fecha=document.getElementById('new-alumno-fecha').value;
  if(!nombre||!fecha)return alert('Completa nombre y fecha.');
  alumnos.push({id:alumnos.length+1,nombre,fecha,prom:0,asist:0,estado:'Nuevo'});
  renderAlumnos(alumnos);
  closeOverlay('modal-alumno');
}
