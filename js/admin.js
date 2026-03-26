/* ════════════════════════════════════════
   EL BUEN SABOR – admin.js
   localStorage:
     "ebs_productos" → lo lee el cliente
   NO toca "ebs_carrito"
════════════════════════════════════════ */
'use strict';

const CLAVE_ADMIN = '1234';   // ← Cambiar por una clave segura

const CATALOGO = [
  { id: 1,  nombre: 'Pollo a la Olla',     precio: 7.00, img: 'img/pollo-olla.jpg',      cat: 'menu'     },
  { id: 2,  nombre: 'Seco de Res',          precio: 7.00, img: 'img/seco-res.jpg',        cat: 'menu'     },
  { id: 3,  nombre: 'Tallarines Rojos',     precio: 7.00, img: 'img/tallarines.jpg',      cat: 'menu'     },
  { id: 4,  nombre: 'Pabita Mechada',       precio: 7.00, img: 'img/pabita-mechada.jpg',  cat: 'menu'     },
  { id: 5,  nombre: 'Pescado Frito',        precio: 8.00, img: 'img/pescado-frito.jpg',   cat: 'menu'     },
  { id: 6,  nombre: 'Pollo Frito',          precio: 7.00, img: 'img/pollo-frito.jpg',     cat: 'menu'     },
  { id: 7,  nombre: 'Cecina',               precio: 8.00, img: 'img/cecina.jpg',          cat: 'menu'     },
  { id: 8,  nombre: 'Pollo al Horno',       precio: 7.00, img: 'img/pollo-horno.jpg',     cat: 'menu'     },
  { id: 9,  nombre: 'Ají de Gallina',       precio: 7.00, img: 'img/aji-gallina.jpg',     cat: 'menu'     },
  { id: 10, nombre: 'Mechado de Res',       precio: 7.00, img: 'img/mechado-res.jpg',     cat: 'menu'     },
  { id: 11, nombre: 'Pollo a la Plancha',   precio: 7.00, img: 'img/pollo-plancha.jpg',   cat: 'menu'     },
  { id: 12, nombre: 'Milanesa',             precio: 7.00, img: 'img/milanesa.jpg',        cat: 'menu'     },
  { id: 13, nombre: 'Estofado de Pollo',    precio: 7.00, img: 'img/estofado-pollo.jpg',  cat: 'menu'     },
  { id: 14, nombre: 'Mechado de Pollo',     precio: 7.00, img: 'img/mechado-pollo.jpg',   cat: 'menu'     },
  { id: 15, nombre: 'Adobo de Chancho',     precio: 8.00, img: 'img/adobo-chancho.jpg',   cat: 'menu'     },
  { id: 16, nombre: 'Chuleta de Res',       precio: 8.00, img: 'img/chuleta-res.jpg',     cat: 'menu'     },
  { id: 17, nombre: 'Tilapia Frita',        precio: 8.00, img: 'img/tilapia-frita.jpg',   cat: 'menu'     },
  { id: 18, nombre: '🔥 Lomo Saltado',      precio: 8.00, img: 'img/lomo-saltado.jpg',    cat: 'menu'     },
  { id: 19, nombre: 'Chicharrón de Cerdo',  precio: 8.00, img: 'img/chicharron.jpg',      cat: 'menu'     },
  { id: 20, nombre: 'Juane de Arroz',       precio: 7.00, img: 'img/juane.jpg',           cat: 'menu'     },
  { id: 21, nombre: 'Caldo de Gallina',     precio: 7.00, img: 'img/caldo-gallina.jpg',   cat: 'menu'     },
  { id: 22, nombre: 'Arroz con Pollo',      precio: 7.00, img: 'img/arroz-pollo.jpg',     cat: 'menu'     },
  { id: 23, nombre: 'Gelatina',             precio: 2.00, img: 'img/gelatina.jpg',        cat: 'postre'   },
  { id: 24, nombre: 'Jugo de Papaya',       precio: 3.00, img: 'img/jugo-papaya.jpg',     cat: 'jugos'    },
  { id: 25, nombre: 'Jugo Surtido',         precio: 3.00, img: 'img/jugo-surtido.jpg',    cat: 'jugos'    },
  { id: 26, nombre: 'Jugo Fresa con Leche', precio: 4.00, img: 'img/jugo-fresa.jpg',      cat: 'jugos'    },
  { id: 27, nombre: 'Salchipapa Combinado', precio: 8.00, img: 'img/salchipapa.jpg',      cat: 'broaster' },
];

const CAT_LABEL = { menu:'Menú del Día', postre:'Postres', jugos:'Jugos', broaster:'Broaster' };

let productos  = [];
let catAdmin   = 'all';
let sesionOK   = false;

/* ── PERSISTENCIA ── */
function cargarProductos() {
  try {
    const raw = localStorage.getItem('ebs_productos');
    if (!raw) return CATALOGO.map(p => ({ ...p, disponible: true }));
    const g = JSON.parse(raw);
    return CATALOGO.map(p => {
      const s = g.find(x => x.id === p.id);
      return s ? { ...p, precio: s.precio, disponible: s.disponible } : { ...p, disponible: true };
    });
  } catch { return CATALOGO.map(p => ({ ...p, disponible: true })); }
}

function guardarProductos() {
  // SOLO guardamos id, precio y disponible → no mezclamos con carrito
  localStorage.setItem('ebs_productos', JSON.stringify(
    productos.map(p => ({ id: p.id, precio: p.precio, disponible: p.disponible }))
  ));
}

/* ── LOGIN ── */
function intentarLogin() {
  const input = document.getElementById('loginInput');
  const err   = document.getElementById('loginErr');
  if (input.value === CLAVE_ADMIN) {
    sesionOK = true;
    sessionStorage.setItem('ebs_admin', '1');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminLayout').classList.remove('hidden');
    renderGrid('all');
  } else {
    err.classList.remove('hidden');
    input.value = '';
    input.focus();
    setTimeout(() => err.classList.add('hidden'), 3000);
  }
}

function cerrarSesion() {
  sesionOK = false;
  sessionStorage.removeItem('ebs_admin');
  document.getElementById('adminLayout').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginInput').value = '';
}

/* ── RENDER GRID ADMIN ── */
function visible(cat) {
  return cat === 'all' ? productos : productos.filter(p => p.cat === cat);
}

function renderGrid(cat) {
  catAdmin = cat;
  const grid = document.getElementById('adminGrid');
  const lista = visible(cat);
  grid.innerHTML = '';

  lista.forEach(p => {
    const card = document.createElement('div');
    card.className = 'acard' + (!p.disponible ? ' off-card' : '');

    card.innerHTML = `
      <div class="acard-img-wrap">
        <img class="acard-img" src="${p.img}" alt="${p.nombre}"
             onerror="this.src='img/placeholder.jpg'"/>
        <span class="acard-status ${p.disponible ? 'on' : 'off'}">
          ${p.disponible ? '✓ Disponible' : '✗ Agotado'}
        </span>
      </div>
      <div class="acard-body">
        <div class="acard-name">${p.nombre}</div>
        <div class="acard-row">
          <label>Precio S/</label>
          <input class="price-inp" type="number" step="0.5" min="0"
                 value="${p.precio.toFixed(2)}" data-id="${p.id}"/>
        </div>
        <div class="acard-row">
          <label>${p.disponible ? 'Disponible' : 'Agotado'}</label>
          <label class="tog">
            <input type="checkbox" ${p.disponible ? 'checked' : ''} data-id="${p.id}"/>
            <span class="tog-track"></span>
          </label>
        </div>
        <span class="acard-cat">${CAT_LABEL[p.cat] || p.cat}</span>
      </div>`;
    grid.appendChild(card);
  });

  actualizarStats();
}

/* ── STATS SIDEBAR ── */
function actualizarStats() {
  const total   = productos.length;
  const activos = productos.filter(p => p.disponible).length;
  const agotados = total - activos;
  document.getElementById('sbStats').innerHTML = `
    <div class="stat-pill"><strong>${total}</strong>Productos</div>
    <div class="stat-pill"><strong style="color:#4adb6a">${activos}</strong>Disponibles</div>
    <div class="stat-pill"><strong style="color:#e74c3c">${agotados}</strong>Agotados</div>`;
}

/* ── GUARDAR TODO ── */
function guardarTodo() {
  // Leer precios del DOM antes de guardar
  document.querySelectorAll('.price-inp').forEach(inp => {
    const id  = parseInt(inp.dataset.id);
    const val = parseFloat(inp.value);
    const p   = productos.find(x => x.id === id);
    if (p && !isNaN(val) && val >= 0) p.precio = val;
  });
  guardarProductos();
  toast('💾 Cambios guardados');
  renderGrid(catAdmin);
}

/* ── TOAST ── */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── EVENTOS ── */
document.addEventListener('DOMContentLoaded', () => {

  // Comprobar sesión activa
  if (sessionStorage.getItem('ebs_admin') === '1') {
    sesionOK = true;
    productos = cargarProductos();
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminLayout').classList.remove('hidden');
    renderGrid('all');
  }

  // Login
  document.getElementById('btnLogin').addEventListener('click', () => {
    productos = cargarProductos();
    intentarLogin();
  });
  document.getElementById('loginInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      productos = cargarProductos();
      intentarLogin();
    }
  });

  // Mostrar/ocultar contraseña
  document.getElementById('eyeBtn').addEventListener('click', () => {
    const inp  = document.getElementById('loginInput');
    const icon = document.getElementById('eyeIcon');
    if (inp.type === 'password') {
      inp.type = 'text';
      icon.className = 'fa-solid fa-eye-slash';
    } else {
      inp.type = 'password';
      icon.className = 'fa-solid fa-eye';
    }
  });

  // Filtros admin
  document.getElementById('adminFilters').addEventListener('click', e => {
    const btn = e.target.closest('.af-btn');
    if (!btn) return;
    document.querySelectorAll('.af-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(btn.dataset.acat);
  });

  // Toggle disponible + cambio de precio (delegado en grid)
  document.getElementById('adminGrid').addEventListener('change', e => {
    const tog = e.target.closest('input[type="checkbox"]');
    const pri = e.target.closest('.price-inp');

    if (tog) {
      const id = parseInt(tog.dataset.id);
      const p  = productos.find(x => x.id === id);
      if (!p) return;
      p.disponible = tog.checked;

      // Actualizar card visualmente sin re-renderizar todo
      const card   = tog.closest('.acard');
      const badge  = card.querySelector('.acard-status');
      const rowLbl = card.querySelector('.acard-row:last-of-type label');

      badge.textContent  = p.disponible ? '✓ Disponible' : '✗ Agotado';
      badge.className    = `acard-status ${p.disponible ? 'on' : 'off'}`;
      if (rowLbl) rowLbl.textContent = p.disponible ? 'Disponible' : 'Agotado';
      card.classList.toggle('off-card', !p.disponible);

      guardarProductos(); // guardar inmediatamente al cambiar toggle
      actualizarStats();
      toast(p.disponible ? `✅ ${p.nombre} activado` : `❌ ${p.nombre} marcado como agotado`);
    }

    if (pri) {
      const id  = parseInt(pri.dataset.id);
      const val = parseFloat(pri.value);
      const p   = productos.find(x => x.id === id);
      if (p && !isNaN(val) && val >= 0) {
        p.precio = val;
        guardarProductos(); // guardar también al cambiar precio
      }
    }
  });

  // Guardar todo
  document.getElementById('btnSave').addEventListener('click', guardarTodo);

  // Logout
  document.getElementById('btnLogout').addEventListener('click', cerrarSesion);
});
