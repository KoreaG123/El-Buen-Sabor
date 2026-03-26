/* ════════════════════════════════════════
   EL BUEN SABOR – app.js (CLIENTE)
   localStorage:
     "ebs_productos" → escrito por admin, leído aquí
     "ebs_carrito"   → solo cliente
════════════════════════════════════════ */
'use strict';

/* ── CATÁLOGO BASE ── */
const CATALOGO = [
  // ── MENÚ DEL DÍA ──
  { id: 1,  nombre: 'Pollo a la Olla',     precio: 7.00, img: 'img/pollo-olla.jpg',      cat: 'menu',    popular: true  },
  { id: 2,  nombre: 'Seco de Res',          precio: 7.00, img: 'img/seco-res.jpg',        cat: 'menu',    popular: false },
  { id: 3,  nombre: 'Tallarines Rojos',     precio: 7.00, img: 'img/tallarines.jpg',      cat: 'menu',    popular: true  },
  { id: 4,  nombre: 'Pabita Mechada',       precio: 7.00, img: 'img/pabita-mechada.jpg',  cat: 'menu',    popular: false },
  { id: 5,  nombre: 'Pescado Frito',        precio: 8.00, img: 'img/pescado-frito.jpg',   cat: 'menu',    popular: false },
  { id: 6,  nombre: 'Pollo Frito',          precio: 7.00, img: 'img/pollo-frito.jpg',     cat: 'menu',    popular: true  },
  { id: 7,  nombre: 'Cecina',               precio: 8.00, img: 'img/cecina.jpg',          cat: 'menu',    popular: true  },
  { id: 8,  nombre: 'Pollo al Horno',       precio: 7.00, img: 'img/pollo-horno.jpg',     cat: 'menu',    popular: false },
  { id: 9,  nombre: 'Ají de Gallina',       precio: 7.00, img: 'img/aji-gallina.jpg',     cat: 'menu',    popular: true  },
  { id: 10, nombre: 'Mechado de Res',       precio: 7.00, img: 'img/mechado-res.jpg',     cat: 'menu',    popular: false },
  { id: 11, nombre: 'Pollo a la Plancha',   precio: 7.00, img: 'img/pollo-plancha.jpg',   cat: 'menu',    popular: false },
  { id: 12, nombre: 'Milanesa',             precio: 7.00, img: 'img/milanesa.jpg',        cat: 'menu',    popular: false },
  { id: 13, nombre: 'Estofado de Pollo',    precio: 7.00, img: 'img/estofado-pollo.jpg',  cat: 'menu',    popular: false },
  { id: 14, nombre: 'Mechado de Pollo',     precio: 7.00, img: 'img/mechado-pollo.jpg',   cat: 'menu',    popular: false },
  { id: 15, nombre: 'Adobo de Chancho',     precio: 8.00, img: 'img/adobo-chancho.jpg',   cat: 'menu',    popular: false },
  { id: 16, nombre: 'Chuleta de Res',       precio: 8.00, img: 'img/chuleta-res.jpg',     cat: 'menu',    popular: false },
  { id: 17, nombre: 'Tilapia Frita',        precio: 8.00, img: 'img/tilapia-frita.jpg',   cat: 'menu',    popular: true  },
  { id: 18, nombre: '🔥 Lomo Saltado',      precio: 8.00, img: 'img/lomo-saltado.jpg',    cat: 'menu',    popular: true  },
  { id: 19, nombre: 'Chicharrón de Cerdo',  precio: 8.00, img: 'img/chicharron.jpg',      cat: 'menu',    popular: false },
  { id: 20, nombre: 'Juane de Arroz',       precio: 7.00, img: 'img/juane.jpg',           cat: 'menu',    popular: true  },
  { id: 21, nombre: 'Caldo de Gallina',     precio: 7.00, img: 'img/caldo-gallina.jpg',   cat: 'menu',    popular: false },
  { id: 22, nombre: 'Arroz con Pollo',      precio: 7.00, img: 'img/arroz-pollo.jpg',     cat: 'menu',    popular: false },
  // ── POSTRES ──
  { id: 23, nombre: 'Gelatina',             precio: 2.00, img: 'img/gelatina.jpg',        cat: 'postre',  popular: false },
  // ── JUGOS ──
  { id: 24, nombre: 'Jugo de Papaya',       precio: 3.00, img: 'img/jugo-papaya.jpg',     cat: 'jugos',   popular: false },
  { id: 25, nombre: 'Jugo Surtido',         precio: 3.00, img: 'img/jugo-surtido.jpg',    cat: 'jugos',   popular: true  },
  { id: 26, nombre: 'Jugo Fresa con Leche', precio: 4.00, img: 'img/jugo-fresa.jpg',      cat: 'jugos',   popular: false },
  // ── POLLO BROASTER ──
  { id: 27, nombre: 'Salchipapa Combinado', precio: 8.00, img: 'img/salchipapa.jpg',      cat: 'broaster',popular: true  },
];

const WA = '51920857471';

/* ── ESTADO ── */
let productos  = cargarProductos();
let carrito    = cargarCarrito();
let gpsLink    = '';
let catActiva  = 'all';

/* ── PERSISTENCIA ── */
function cargarProductos() {
  try {
    const raw = localStorage.getItem('ebs_productos');
    if (!raw) return CATALOGO.map(p => ({ ...p, disponible: true }));
    const guardados = JSON.parse(raw);
    return CATALOGO.map(p => {
      const g = guardados.find(x => x.id === p.id);
      return g ? { ...p, precio: g.precio, disponible: g.disponible } : { ...p, disponible: true };
    });
  } catch { return CATALOGO.map(p => ({ ...p, disponible: true })); }
}

function cargarCarrito() {
  try {
    const raw = localStorage.getItem('ebs_carrito');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function guardarCarrito() {
  localStorage.setItem('ebs_carrito', JSON.stringify(carrito));
}

/* ── RENDER PRODUCTOS ── */
function visibles(cat) {
  return cat === 'all' ? productos : productos.filter(p => p.cat === cat);
}

function renderProductos(cat) {
  catActiva = cat;
  const grid = document.getElementById('grid');
  const lista = visibles(cat);
  grid.innerHTML = '';

  // 2 col para menú del día, wide para el resto
  const esMenu = cat === 'menu' || cat === 'all';
  grid.classList.toggle('wide', !esMenu);

  lista.forEach(p => {
    const out = !p.disponible;
    const card = document.createElement('div');
    card.className = 'card' + (out ? ' agotado' : '');

    const badge = out
      ? '<span class="badge badge-out">Agotado</span>'
      : p.popular
        ? '<span class="badge badge-pop">⭐ Popular</span>'
        : '';

    card.innerHTML = `
      <div class="card-img">
        <img src="${p.img}" alt="${p.nombre}" loading="lazy"
             onerror="this.src='img/placeholder.jpg'"/>
        ${badge}
      </div>
      <div class="card-info">
        <span class="card-name">${p.nombre}</span>
        <span class="card-price">S/ ${p.precio.toFixed(2)}</span>
      </div>
      <button class="btn-add" data-id="${p.id}" ${out ? 'disabled' : ''}>
        ${out ? 'Agotado' : '<i class="fa-solid fa-plus"></i> Agregar'}
      </button>`;
    grid.appendChild(card);
  });
}

/* ── CARRITO – LÓGICA ── */
function agregar(id) {
  const p = productos.find(x => x.id === id);
  if (!p || !p.disponible) return;
  const ex = carrito.find(x => x.id === id);
  if (ex) ex.qty += 1;
  else carrito.push({ id: p.id, nombre: p.nombre, precio: p.precio, img: p.img, qty: 1 });
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

/* ── RENDER CARRITO ── */
function renderCarrito() {
  const count = totalItems();
  const total = totalPrecio();

  document.getElementById('fabBadge').textContent = count;

  const body  = document.getElementById('drawerBody');
  const empty = document.getElementById('emptyState');
  const foot  = document.getElementById('drawerFoot');

  // Limpiar items (preservar empty state)
  Array.from(body.children).forEach(el => {
    if (el.id !== 'emptyState') el.remove();
  });

  if (carrito.length === 0) {
    empty.style.display = '';
    foot.style.display  = 'none';
    return;
  }

  empty.style.display = 'none';
  foot.style.display  = '';
  document.getElementById('totalLabel').textContent = `S/ ${total.toFixed(2)}`;

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

/* ── DRAWER ── */
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

/* ── MODAL ── */
function abrirModal() {
  if (!carrito.length) { toast('⚠️ Tu carrito está vacío'); return; }

  const prev = document.getElementById('orderPreview');
  prev.innerHTML =
    carrito.map(i =>
      `<div class="op-row"><span>${i.nombre} ×${i.qty}</span><span>S/ ${(i.precio*i.qty).toFixed(2)}</span></div>`
    ).join('') +
    `<div class="op-total"><span>Total</span><span>S/ ${totalPrecio().toFixed(2)}</span></div>`;

  // Reset GPS
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

/* ── GPS ── */
function pedirGPS() {
  const btn = document.getElementById('btnGps');
  if (!navigator.geolocation) { toast('GPS no disponible en este dispositivo'); return; }
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

/* ── ENVIAR A WHATSAPP ── */
function enviarWA() {
  const nombre  = document.getElementById('fName').value.trim();
  const telefono = document.getElementById('fPhone').value.trim();
  const dir     = document.getElementById('fAddr').value.trim();
  const pago    = document.querySelector('input[name="pago"]:checked').value;

  if (!nombre) { toast('⚠️ Ingresa tu nombre'); return; }
  if (!dir)    { toast('⚠️ Ingresa tu dirección'); return; }
  if (!carrito.length) { toast('⚠️ Carrito vacío'); return; }

  const items = carrito.map(i => `  • ${i.nombre} ×${i.qty} → S/ ${(i.precio*i.qty).toFixed(2)}`).join('\n');
  const total = totalPrecio().toFixed(2);
  const gps   = gpsLink    ? `\n📍 GPS: ${gpsLink}` : '';
  const tel   = telefono   ? `\n📱 Teléfono: ${telefono}` : '';

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

/* ── TOAST ── */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── EVENTOS ── */
document.addEventListener('DOMContentLoaded', () => {
  renderProductos('all');
  renderCarrito();

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
    agregar(parseInt(btn.dataset.id));
    btn.classList.add('popping');
    setTimeout(() => btn.classList.remove('popping'), 300);
  });

  // FAB
  document.getElementById('fab').addEventListener('click', abrirDrawer);
  document.getElementById('btnCloseDrawer').addEventListener('click', cerrarDrawer);
  document.getElementById('scrim').addEventListener('click', cerrarDrawer);

  // Qty / eliminar (delegado)
  document.getElementById('drawerBody').addEventListener('click', e => {
    const q = e.target.closest('.ci-qbtn');
    const d = e.target.closest('.ci-del');
    if (q) cambiarQty(parseInt(q.dataset.id), q.dataset.action === 'inc' ? 1 : -1);
    if (d) eliminar(parseInt(d.dataset.id));
  });

  // Abrir modal checkout
  document.getElementById('btnCheckout').addEventListener('click', abrirModal);
  document.getElementById('btnCloseModal').addEventListener('click', cerrarModal);
  document.getElementById('modalBg').addEventListener('click', e => {
    if (e.target === document.getElementById('modalBg')) cerrarModal();
  });

  // GPS
  document.getElementById('btnGps').addEventListener('click', pedirGPS);

  // Enviar WhatsApp
  document.getElementById('btnWaSend').addEventListener('click', enviarWA);
});
