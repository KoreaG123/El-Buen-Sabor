/* ════════════════════════════════════════════════════
   EL BUEN SABOR – app.js
   ─ Productos vienen de Firebase (menu-firebase.js)
   ─ Carrito 100% intacto en localStorage "ebs_carrito"
   ─ Fallback al catálogo local si Firebase falla
════════════════════════════════════════════════════ */
'use strict';

const WA = '51918263264';

/* ── CATÁLOGO LOCAL DE RESPALDO ──
   Se usa si Firebase tarda o falla            */
const CATALOGO_FALLBACK = [
  { id:'local-1',  nombre:'Pollo a la Olla',     precio:7, imagen:'img/pollo-olla.jpg',      categoria:'menu',    popular:true,  disponible:true },
  { id:'local-2',  nombre:'Seco de Res',          precio:7, imagen:'img/seco-res.jpg',        categoria:'menu',    popular:false, disponible:true },
  { id:'local-3',  nombre:'Tallarines Rojos',     precio:7, imagen:'img/tallarines.jpg',      categoria:'menu',    popular:true,  disponible:true },
  { id:'local-4',  nombre:'Pabita Mechada',       precio:7, imagen:'img/pabita-mechada.jpg',  categoria:'menu',    popular:false, disponible:true },
  { id:'local-5',  nombre:'Pescado Frito',        precio:8, imagen:'img/pescado-frito.jpg',   categoria:'menu',    popular:false, disponible:true },
  { id:'local-6',  nombre:'Pollo Frito',          precio:7, imagen:'img/pollo-frito.jpg',     categoria:'menu',    popular:true,  disponible:true },
  { id:'local-7',  nombre:'Cecina',               precio:8, imagen:'img/cecina.jpg',          categoria:'menu',    popular:true,  disponible:true },
  { id:'local-8',  nombre:'Pollo al Horno',       precio:7, imagen:'img/pollo-horno.jpg',     categoria:'menu',    popular:false, disponible:true },
  { id:'local-9',  nombre:'Ají de Gallina',       precio:7, imagen:'img/aji-gallina.jpg',     categoria:'menu',    popular:true,  disponible:true },
  { id:'local-10', nombre:'Mechado de Res',       precio:7, imagen:'img/mechado-res.jpg',     categoria:'menu',    popular:false, disponible:true },
  { id:'local-11', nombre:'Pollo a la Plancha',   precio:7, imagen:'img/pollo-plancha.jpg',   categoria:'menu',    popular:false, disponible:true },
  { id:'local-12', nombre:'Milanesa',             precio:7, imagen:'img/milanesa.jpg',        categoria:'menu',    popular:false, disponible:true },
  { id:'local-13', nombre:'Estofado de Pollo',    precio:7, imagen:'img/estofado-pollo.jpg',  categoria:'menu',    popular:false, disponible:true },
  { id:'local-14', nombre:'Mechado de Pollo',     precio:7, imagen:'img/mechado-pollo.jpg',   categoria:'menu',    popular:false, disponible:true },
  { id:'local-15', nombre:'Adobo de Chancho',     precio:8, imagen:'img/adobo-chancho.jpg',   categoria:'menu',    popular:false, disponible:true },
  { id:'local-16', nombre:'Chuleta de Res',       precio:8, imagen:'img/chuleta-res.jpg',     categoria:'menu',    popular:false, disponible:true },
  { id:'local-17', nombre:'Tilapia Frita',        precio:8, imagen:'img/tilapia-frita.jpg',   categoria:'menu',    popular:true,  disponible:true },
  { id:'local-18', nombre:'🔥 Lomo Saltado',      precio:8, imagen:'img/lomo-saltado.jpg',    categoria:'menu',    popular:true,  disponible:true },
  { id:'local-19', nombre:'Chicharrón de Cerdo',  precio:8, imagen:'img/chicharron.jpg',      categoria:'menu',    popular:false, disponible:true },
  { id:'local-20', nombre:'Juane de Arroz',       precio:7, imagen:'img/juane.jpg',           categoria:'menu',    popular:true,  disponible:true },
  { id:'local-21', nombre:'Caldo de Gallina',     precio:7, imagen:'img/caldo-gallina.jpg',   categoria:'menu',    popular:false, disponible:true },
  { id:'local-22', nombre:'Arroz con Pollo',      precio:7, imagen:'img/arroz-pollo.jpg',     categoria:'menu',    popular:false, disponible:true },
  { id:'local-23', nombre:'Gelatina',             precio:2, imagen:'img/gelatina.jpg',        categoria:'postre',  popular:false, disponible:true },
  { id:'local-24', nombre:'Jugo de Papaya',       precio:3, imagen:'img/jugo-papaya.jpg',     categoria:'jugos',   popular:false, disponible:true },
  { id:'local-25', nombre:'Jugo Surtido',         precio:3, imagen:'img/jugo-surtido.jpg',    categoria:'jugos',   popular:true,  disponible:true },
  { id:'local-26', nombre:'Jugo Fresa con Leche', precio:4, imagen:'img/jugo-fresa.jpg',      categoria:'jugos',   popular:false, disponible:true },
  { id:'local-27', nombre:'Salchipapa Combinado', precio:8, imagen:'img/salchipapa.jpg',      categoria:'broaster',popular:true,  disponible:true },
];

/* ── ESTADO ── */
let productos = [];
let carrito   = cargarCarrito();
let gpsLink   = '';
let catActiva = 'all';

/* ════════════════════════════════════════
   CARRITO – 100% igual que antes
════════════════════════════════════════ */
function cargarCarrito() {
  try {
    const raw = localStorage.getItem('ebs_carrito');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function guardarCarrito() {
  localStorage.setItem('ebs_carrito', JSON.stringify(carrito));
}

/* ════════════════════════════════════════
   RENDER PRODUCTOS
   Acepta datos de Firebase O del fallback
════════════════════════════════════════ */
function visibles(cat) {
  return cat === 'all'
    ? productos
    : productos.filter(p => (p.categoria || p.cat) === cat);
}

function renderProductos(cat) {
  catActiva = cat;
  const grid = document.getElementById('grid');
  if (!grid) return;
  const lista = visibles(cat);
  grid.innerHTML = '';

  const esMenu = cat === 'menu' || cat === 'all';
  grid.classList.toggle('wide', !esMenu);

  if (lista.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;
      padding:40px;color:#b89880;">
      <p style="font-size:1.5rem;">🍽️</p>
      <p style="margin-top:8px;font-weight:600;">No hay platos disponibles</p>
    </div>`;
    return;
  }

  lista.forEach(p => {
    const out   = !p.disponible;
    // Firebase usa "imagen", fallback usa "img"
    const imgSrc = p.imagen || p.img || 'img/placeholder.jpg';
    const card  = document.createElement('div');
    card.className = 'card' + (out ? ' agotado' : '');

    const badge = out
      ? '<span class="badge badge-out">Agotado</span>'
      : p.popular
        ? '<span class="badge badge-pop">⭐ Popular</span>'
        : '';

    card.innerHTML = `
      <div class="card-img">
        <img src="${imgSrc}" alt="${p.nombre}" loading="lazy"
             onerror="this.src='img/placeholder.jpg'"/>
        ${badge}
      </div>
      <div class="card-info">
        <span class="card-name">${p.nombre}</span>
        <span class="card-price">S/ ${Number(p.precio).toFixed(2)}</span>
      </div>
      <button class="btn-add" data-id="${p.id}" ${out ? 'disabled' : ''}>
        ${out ? 'Agotado' : '<i class="fa-solid fa-plus"></i> Agregar'}
      </button>`;
    grid.appendChild(card);
  });
}

/* ════════════════════════════════════════
   CARRITO – LÓGICA (sin cambios)
════════════════════════════════════════ */
function agregar(id) {
  const p = productos.find(x => x.id === id);
  if (!p || !p.disponible) return;
  const imgSrc = p.imagen || p.img || 'img/placeholder.jpg';
  const ex = carrito.find(x => x.id === id);
  if (ex) {
    ex.qty += 1;
  } else {
    carrito.push({ id: p.id, nombre: p.nombre, precio: Number(p.precio), img: imgSrc, qty: 1 });
  }
  guardarCarrito();
  renderCarrito();
  toast(`✅ ${p.nombre} agregado`);
}

function cambiarQty(id, delta) {
  const idx = carrito.findIndex(x => x.id === id);
  if (idx === -1) return;
  carrito[idx].qty += delta;
  if (carrito[idx].qty <= 0) carrito.splice(idx, 1);
  guardarCarrito();
  renderCarrito();
}

function eliminar(id) {
  carrito = carrito.filter(x => x.id !== id);
  guardarCarrito();
  renderCarrito();
}

function totalItems()  { return carrito.reduce((s, i) => s + i.qty, 0); }
function totalPrecio() { return carrito.reduce((s, i) => s + i.precio * i.qty, 0); }

/* ════════════════════════════════════════
   RENDER CARRITO (sin cambios)
════════════════════════════════════════ */
function renderCarrito() {
  document.getElementById('fabBadge').textContent = totalItems();

  const body  = document.getElementById('drawerBody');
  const empty = document.getElementById('emptyState');
  const foot  = document.getElementById('drawerFoot');

  Array.from(body.children).forEach(el => { if (el.id !== 'emptyState') el.remove(); });

  if (carrito.length === 0) {
    empty.style.display = '';
    foot.style.display  = 'none';
    return;
  }
  empty.style.display = 'none';
  foot.style.display  = '';
  document.getElementById('totalLabel').textContent = `S/ ${totalPrecio().toFixed(2)}`;

  carrito.forEach(item => {
    const row = document.createElement('div');
    row.className = 'ci';
    row.innerHTML = `
      <img class="ci-img" src="${item.img}" alt="${item.nombre}"
           onerror="this.src='img/placeholder.jpg'"/>
      <div class="ci-info">
        <div class="ci-name">${item.nombre}</div>
        <div class="ci-sub">S/ ${(item.precio * item.qty).toFixed(2)}</div>
      </div>
      <div class="ci-ctrl">
        <button class="ci-qbtn" data-action="dec" data-id="${item.id}">−</button>
        <span class="ci-qty">${item.qty}</span>
        <button class="ci-qbtn" data-action="inc" data-id="${item.id}">+</button>
      </div>
      <button class="ci-del" data-id="${item.id}" title="Eliminar">
        <i class="fa-solid fa-trash-can"></i>
      </button>`;
    body.appendChild(row);
  });
}

/* ════════════════════════════════════════
   DRAWER / MODAL / GPS / WA (sin cambios)
════════════════════════════════════════ */
function abrirDrawer() {
  document.getElementById('drawer').classList.add('open');
  document.getElementById('scrim').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function cerrarDrawer() {
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('scrim').classList.remove('open');
  document.body.style.overflow = '';
}
function abrirModal() {
  if (!carrito.length) { toast('⚠️ Tu carrito está vacío'); return; }
  const prev = document.getElementById('orderPreview');
  prev.innerHTML =
    carrito.map(i =>
      `<div class="op-row"><span>${i.nombre} ×${i.qty}</span><span>S/ ${(i.precio*i.qty).toFixed(2)}</span></div>`
    ).join('') +
    `<div class="op-total"><span>Total</span><span>S/ ${totalPrecio().toFixed(2)}</span></div>`;
  gpsLink = '';
  const gpsBox = document.getElementById('gpsBox');
  gpsBox.classList.remove('show');
  gpsBox.innerHTML = '';
  const gpsBtn = document.getElementById('btnGps');
  gpsBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Compartir ubicación GPS';
  gpsBtn.style.background = '';
  gpsBtn.disabled = false;
  document.getElementById('modalBg').classList.remove('hidden');
  cerrarDrawer();
}
function cerrarModal() {
  document.getElementById('modalBg').classList.add('hidden');
}
function pedirGPS() {
  const btn = document.getElementById('btnGps');
  if (!navigator.geolocation) { toast('GPS no disponible'); return; }
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Obteniendo...';
  btn.disabled = true;
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      gpsLink = `https://maps.google.com/?q=${lat},${lng}`;
      const box = document.getElementById('gpsBox');
      box.innerHTML = `📍 <strong>Ubicación capturada.</strong> <a href="${gpsLink}" target="_blank">Ver en Google Maps</a>`;
      box.classList.add('show');
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Ubicación capturada';
      btn.style.background = '#1a7a30';
      btn.disabled = false;
    },
    () => {
      toast('No se pudo obtener la ubicación');
      btn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Compartir ubicación GPS';
      btn.disabled = false;
    }
  );
}
function enviarWA() {
  const nombre   = document.getElementById('fName').value.trim();
  const telefono = document.getElementById('fPhone').value.trim();
  const dir      = document.getElementById('fAddr').value.trim();
  const pago     = document.querySelector('input[name="pago"]:checked').value;
  if (!nombre) { toast('⚠️ Ingresa tu nombre'); return; }
  if (!dir)    { toast('⚠️ Ingresa tu dirección'); return; }
  if (!carrito.length) { toast('⚠️ Carrito vacío'); return; }
  const items = carrito.map(i => `  • ${i.nombre} ×${i.qty} → S/ ${(i.precio*i.qty).toFixed(2)}`).join('\n');
  const total = totalPrecio().toFixed(2);
  const gps   = gpsLink  ? `\n📍 GPS: ${gpsLink}` : '';
  const tel   = telefono ? `\n📱 Teléfono: ${telefono}` : '';
  const msg =
    `🍽️ *PEDIDO – El Buen Sabor*\n\n` +
    `👤 *Cliente:* ${nombre}${tel}\n` +
    `📦 *Dirección:* ${dir}${gps}\n` +
    `💳 *Pago:* ${pago}\n\n` +
    `🛒 *Pedido:*\n${items}\n\n` +
    `💰 *TOTAL: S/ ${total}*\n\n` +
    `¡Gracias por su pedido! 🌿`;
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, '_blank');
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderCarrito();

  // ── Escuchar datos de Firebase (menu-firebase.js los envía) ──
  window.addEventListener('productosActualizados', e => {
    productos = e.detail;
    renderProductos(catActiva);
  });

  // ── Fallback: si en 4 segundos no llegan datos de Firebase
  //    usar catálogo local ──
  setTimeout(() => {
    if (productos.length === 0) {
      console.warn('Firebase no respondió → usando catálogo local');
      productos = CATALOGO_FALLBACK;
      renderProductos('all');
    }
  }, 4000);

  // Tabs
  document.getElementById('tabs').addEventListener('click', e => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProductos(btn.dataset.cat);
  });

  // Agregar al carrito
  document.getElementById('grid').addEventListener('click', e => {
    const btn = e.target.closest('.btn-add');
    if (!btn || btn.disabled) return;
    agregar(btn.dataset.id);          // id es string (Firebase)
    btn.classList.add('popping');
    setTimeout(() => btn.classList.remove('popping'), 300);
  });

  // FAB
  document.getElementById('fab').addEventListener('click', abrirDrawer);
  document.getElementById('btnCloseDrawer').addEventListener('click', cerrarDrawer);
  document.getElementById('scrim').addEventListener('click', cerrarDrawer);

  // Qty / eliminar
  document.getElementById('drawerBody').addEventListener('click', e => {
    const q = e.target.closest('.ci-qbtn');
    const d = e.target.closest('.ci-del');
    if (q) cambiarQty(q.dataset.id, q.dataset.action === 'inc' ? 1 : -1);
    if (d) eliminar(d.dataset.id);
  });

  // Modal checkout
  document.getElementById('btnCheckout').addEventListener('click', abrirModal);
  document.getElementById('btnCloseModal').addEventListener('click', cerrarModal);
  document.getElementById('modalBg').addEventListener('click', e => {
    if (e.target === document.getElementById('modalBg')) cerrarModal();
  });

  // GPS
  document.getElementById('btnGps').addEventListener('click', pedirGPS);

  // WhatsApp
  document.getElementById('btnWaSend').addEventListener('click', enviarWA);
});
