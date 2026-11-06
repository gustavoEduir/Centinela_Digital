/* Centinela Digital · script global
   Cambia API_URL cuando tengas listo el backend (Node.js + Express). */
const API_URL = 'http://localhost:3000/api';

/* ---------- Utilidades ---------- */
async function api(ruta, opciones = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(opciones.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const configuracion = {
    ...opciones,
    headers
  };

  if (opciones.body !== undefined) {
    configuracion.body = JSON.stringify(opciones.body);
  }

  const res = await fetch(API_URL + ruta, configuracion);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || 'Ocurrió un error. Inténtalo de nuevo.');
  }

  return data;
}
function mostrarMensaje(el, texto, tipo) {
  if (!el) return;
  el.textContent = texto;
  el.className = 'msg ' + (tipo || '');
}
const sinConexion = 'No pudimos conectar con el servidor. Revisa que el backend esté encendido.';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Menú (se genera una sola vez para todas las pantallas) ---------- */
const PAGINAS = [
  ['informacion.html', 'Qué es la violencia'],
  ['cuestionario.html', 'Cuestionario de riesgo'],
  ['instituciones.html', 'Instituciones de canalización'],
  ['centros.html', 'Centros de ayuda cerca de ti'],
  ['reportes.html', 'Reportes'],
  ['seguimiento.html', 'Seguimiento de casos'],
];
function iniciarMenu() {
  const btn = $('.menu-btn'), menu = $('#menu');
  if (!btn || !menu) return;
  const actual = location.pathname.split('/').pop();
  menu.innerHTML = '<h2>Menú</h2>' + PAGINAS.map(([href, t]) =>
    `<a href="${href}"${href === actual ? ' aria-current="page"' : ''}>${t}</a>`).join('') +
    '<a href="index.html" id="salir">Cerrar sesión</a>';
  const scrim = document.createElement('div');
  scrim.id = 'scrim';
  document.body.append(scrim);
  const alternar = (abrir) => {
    menu.classList.toggle('open', abrir);
    scrim.classList.toggle('show', abrir);
    btn.setAttribute('aria-expanded', abrir);
  };
  btn.addEventListener('click', () => alternar(!menu.classList.contains('open')));
  scrim.addEventListener('click', () => alternar(false));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && alternar(false));
  $('#salir').addEventListener('click', () => localStorage.removeItem('token'));
}

/* ---------- Mostrar / ocultar contraseña ---------- */
function iniciarPassword() {
  $$('.pw button').forEach((b) => b.addEventListener('click', () => {
    const input = b.previousElementSibling;
    const ver = input.type === 'password';
    input.type = ver ? 'text' : 'password';
    b.textContent = ver ? 'Ocultar' : 'Mostrar';
  }));
}

/* ---------- 1. Inicio de sesión ---------- */
function paginaLogin() {
  const f = $('#form-login'); if (!f) return;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('.msg', f);
    mostrarMensaje(msg, 'Verificando...', '');
    try {
      const d = await api('/auth/login', { method: 'POST', body: { correo: f.correo.value.trim(), password: f.password.value } });
      localStorage.setItem('token', d.token);
      location.href = 'informacion.html';
    } catch (err) {
      mostrarMensaje(msg, err instanceof TypeError ? sinConexion : err.message, 'error');
    }
  });
}

/* ---------- 2. Registro ---------- */
function paginaRegistro() {
  const f = $('#form-registro'); if (!f) return;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('.msg', f);
    if (f.password.value.length < 8) return mostrarMensaje(msg, 'La contraseña debe tener al menos 8 caracteres.', 'error');
    try {
      await api('/auth/registro', { method: 'POST', body: {
        correo: f.correo.value.trim(), password: f.password.value, telefono: f.telefono.value.trim(),
        nombres: f.nombres.value.trim(), apellidos: f.apellidos.value.trim() } });
      mostrarMensaje(msg, 'Cuenta creada. Te llevamos al inicio de sesión.', 'ok');
      setTimeout(() => (location.href = 'index.html'), 1200);
    } catch (err) {
      mostrarMensaje(msg, err instanceof TypeError ? sinConexion : err.message, 'error');
    }
  });
}

/* ---------- 4. Cuestionario de riesgo ---------- */
const NIVELES = [
  [1, 'Bajo', 'No detectamos señales fuertes, pero si algo te preocupa, puedes pedir orientación.'],
  [2, 'Medio', 'Hay algunas señales. Habla con alguien de confianza y revisa las instituciones de apoyo.'],
  [3, 'Riesgo', 'Hay señales importantes. Te recomendamos contactar una institución de apoyo.'],
  [4, 'Alto', 'La situación es seria. Busca ayuda pronto y avisa a una persona de confianza.'],
  [5, 'Alto riesgo', 'Tu seguridad puede estar en peligro. Busca ayuda ahora.'],
];
function nivelPorPuntos(p) { return p <= 1 ? 1 : p <= 4 ? 2 : p <= 7 ? 3 : p <= 10 ? 4 : 5; }
function paginaCuestionario() {
  const f = $('#form-cuestionario'); if (!f) return;
  const escala = $('.thermo-scale');
  escala.innerHTML = NIVELES.map(([n, t]) => `<div class="lvl" data-n="${n}">${t}</div>`).join('');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const respuestas = $$('input[type=radio]:checked', f);
    const total = $$('.q', f).length;
    const res = $('.result');
    if (respuestas.length < total) return mostrarMensaje(res, `Faltan ${total - respuestas.length} preguntas por responder.`, 'error');
    const puntos = respuestas.filter((r) => r.value === 'si').length;
    const [n, nombre, texto] = NIVELES[nivelPorPuntos(puntos) - 1];
    $$('.lvl').forEach((l) => l.classList.toggle('on', +l.dataset.n === n));
    res.className = 'result';
    res.innerHTML = `<strong>Nivel: ${nombre}</strong><br>${texto}`;
    $('#alerta').hidden = n < 4;
    try { await api('/cuestionarios', { method: 'POST', body: { puntos, nivel: nombre } }); } catch (_) { /* opcional hasta tener backend */ }
  });
}

/* ---------- 5. Instituciones ---------- */
function paginaInstituciones() {
  $$('.inst-item .btn').forEach((b) => b.addEventListener('click', () => {
    const item = b.closest('.inst-item');
    const abierto = item.classList.toggle('open');
    b.textContent = abierto ? 'Cerrar' : 'Continuar';
    b.setAttribute('aria-expanded', abierto);
  }));
}

/* ---------- 6. Centros de ayuda cercanos ---------- */
function paginaCentros() {
  const cont = $('#map'); if (!cont) return;
  const lista = $('#lista-centros'), estado = $('#estado-ubicacion');
  const mapa = L.map(cont).setView([19.4326, -99.1332], 11);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapa);
  async function cargar(lat, lng) {
    try {
      const centros = await api(`/centros?lat=${lat}&lng=${lng}`);
      lista.innerHTML = centros.length ? centros.map((c) => `<li><strong>${c.nombre}</strong><br>${c.direccion}</li>`).join('')
        : '<li>No encontramos centros registrados cerca de ti.</li>';
      centros.forEach((c) => L.marker([c.lat, c.lng]).addTo(mapa).bindPopup(c.nombre));
    } catch (_) {
      lista.innerHTML = '<li>Aquí aparecerán los centros cuando el backend esté conectado.</li>';
    }
  }
  if (!navigator.geolocation) { estado.textContent = 'Tu navegador no permite obtener la ubicación.'; return cargar(19.4326, -99.1332); }
  navigator.geolocation.getCurrentPosition(
    (p) => { const { latitude: la, longitude: lo } = p.coords; mapa.setView([la, lo], 14); L.circleMarker([la, lo], { color: '#50068C' }).addTo(mapa).bindPopup('Estás aquí'); estado.textContent = 'Mostrando centros cerca de tu ubicación.'; cargar(la, lo); },
    () => { estado.textContent = 'No pudimos obtener tu ubicación. Permite el acceso en el navegador para ver centros cercanos.'; cargar(19.4326, -99.1332); }
  );
}

/* ---------- 7. Reportes ---------- */
function paginaReportes() {
  const f = $('#form-reporte');
  if (!f) return;

  f.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msg = $('.msg', f);
    const tipo = f.tipo.value;

    if (!tipo) {
      return mostrarMensaje(msg, 'Selecciona el tipo de violencia.', 'error');
    }

    try {
      const d = await api('/reportes', {
        method: 'POST',
        body: {
          nombre: f.nombre.value.trim(),
          correo: f.correo.value.trim(),
          ubicacion: f.ubicacion.value.trim(),
          descripcion: f.descripcion.value.trim(),
          tipo
        }
      });

      mostrarMensaje(
        msg,
        `Reporte enviado. Tu folio es ${d.reporte.folio}. Guárdalo para dar seguimiento.`,
        'ok'
      );

      f.reset();

    } catch (err) {
      mostrarMensaje(
        msg,
        err instanceof TypeError ? sinConexion : err.message,
        'error'
      );
    }
  });
}
/* ---------- 8. Seguimiento de casos ---------- */
const ETAPAS = [
  'Recibido',
  'En revisión',
  'En atención',
  'Resuelto',
  'Concluido'
];

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

function pintarCaso(caso) {
  const idx = Math.max(0, ETAPAS.indexOf(caso.estado));

  return `
    <article class="card case">
      <h3>${caso.nombre || 'Caso'}</h3>
      <p>Folio: ${caso.folio || '—'}</p>
      <p>Tipo: ${caso.tipo || 'No especificado'}</p>
      <p>Estado: ${caso.estado || 'Recibido'}</p>

      <ol class="steps">
        ${ETAPAS.map((e, i) => `
          <li class="step ${i < idx ? 'done' : i === idx ? 'current' : ''}">
            <span class="dot">${CHECK}</span>
            <strong>${e}</strong>
          </li>
        `).join('')}
      </ol>
    </article>
  `;
}

function paginaSeguimiento() {
  const cont = $('#casos');
  if (!cont) return;

  cont.innerHTML = '<p>Consultando tus reportes...</p>';

  api('/reportes/mios')
    .then((data) => {
      const casos = data.reportes || [];

      cont.innerHTML = casos.length
        ? casos.map(pintarCaso).join('')
        : '<p>Aún no tienes casos registrados.</p>';
    })
    .catch((err) => {
      cont.innerHTML = `<p>${err.message}</p>`;
    });
}
/* ---------- Inicializar funciones al cargar cada página ---------- */
document.addEventListener('DOMContentLoaded', () => {
  iniciarMenu();
  iniciarPassword();

  paginaLogin();
  paginaRegistro();
  paginaCuestionario();
  paginaInstituciones();
  paginaCentros();
  paginaReportes();
  paginaSeguimiento();
});