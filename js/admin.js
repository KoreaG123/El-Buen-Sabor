/* ════════════════════════════════════════════════
   admin.js  –  El Buen Sabor  (Panel Admin)
   ─ Login con contraseña (igual que antes)
   ─ CRUD completo con Firebase
   ─ Subida de imágenes a Firebase Storage
════════════════════════════════════════════════ */
'use strict';

/* ── CONFIG ── */
const CLAVE_ADMIN = '1234'; // ← cambia por tu clave
const CAT_LABEL   = { menu:'Menú del Día', postre:'Postres', jugos:'Jugos', broaster:'Broaster' };

/* ── ESTADO ── */
let productosCache = [];
let catAdmin       = 'all';
let editandoId     = null;
let editandoImgUrl = null;

/* ════════════════════════════════════════
   IMPORTS FIREBASE (dinámicos para evitar
   errores si se carga sin module)
════════════════════════════════════════ */
let db, storage;
let fbCollection, fbDoc, fbAddDoc, fbUpdateDoc, fbDeleteDoc, fbOnSnapshot, fbQuery, fbOrderBy, fbServerTimestamp;
let fbRef, fbUploadBytesResumable, fbGetDownloadURL, fbDeleteObject;

async function cargarFirebase() {
  const { db: _db, storage: _st } = await import('./firebase.js');
  db = _db; storage = _st;

  const fs = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  fbCollection       = fs.collection;
  fbDoc              = fs.doc;
  fbAddDoc           = fs.addDoc;
  fbUpdateDoc        = fs.updateDoc;
  fbDeleteDoc        = fs.deleteDoc;
  fbOnSnapshot       = fs.onSnapshot;
  fbQuery            = fs.query;
  fbOrderBy          = fs.orderBy;
  fbServerTimestamp  = fs.serverTimestamp;

  const st = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js');
  fbRef                  = st.ref;
  fbUploadBytesResumable = st.uploadBytesResumable;
  fbGetDownloadURL       = st.getDownloadURL;
  fbDeleteObject         = st.deleteObject;
}

/* ════════════════════════════════════════
   LOGIN
════════════════════════════════════════ */
function intentarLogin() {
  const input = document.getElementById('loginInput');
  const err   = document.getElementById('loginErr');
  if (input.value === CLAVE_ADMIN) {
    sessionStorage.setItem('ebs_admin_ok', '1');
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminLayout').classList.remove('hidden');
    iniciarPanel();
  } else {
    err.classList.remove('hidden');
    input.value = '';
    input.focus();
    setTimeout(() => err.classList.add('hidden'), 3000);
  }
}

function cerrarSesion() {
  sessionStorage.removeItem('ebs_admin_ok');
  document.getElementById('adminLayout').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('loginInput').value = '';
}

/* ════════════════════════════════════════
   INICIAR PANEL
════════════════════════════════════════ */
async function iniciarPanel() {
  await cargarFirebase();
  inyectarBotonNuevo();
  inyectarModal();
  escucharProductos();
}

/* ════════════════════════════════════════
   BOTÓN "NUEVO PLATO"
════════════════════════════════════════ */
function inyectarBotonNuevo() {
  if (document.getElementById('btnNuevoPlato')) return;
  const bar = document.querySelector('.admin-bar');
  if (!bar) return;
  const div = bar.querySelector('div:last-child') || bar;
  const btn = document.createElement('button');
  btn.id        = 'btnNuevoPlato';
  btn.className = 'btn-save';
  btn.style.cssText = 'background:#1a7a30;box-shadow:0 3px 10px rgba(26,122,48,.3);';
  btn.innerHTML = '<i class="fa-solid fa-plus"></i> Nuevo plato';
  btn.addEventListener('click', () => abrirModal());
  div.appendChild(btn);

  // Ocultar botón "Guardar todo" (Firebase guarda automático)
  const btnSave = document.getElementById('btnSave');
  if (btnSave) btnSave.style.display = 'none';
}

/* ════════════════════════════════════════
   MODAL AGREGAR / EDITAR
════════════════════════════════════════ */
function inyectarModal() {
  if (document.getElementById('fbModal')) return;
  document.body.insertAdjacentHTML('beforeend', `
  <div id="fbModal" style="display:none;position:fixed;inset:0;z-index:2000;
    background:rgba(20,8,2,.65);align-items:flex-end;justify-content:center;">
    <div style="background:#fdf6ed;width:100%;max-width:500px;
      max-height:92vh;overflow-y:auto;border-radius:22px 22px 0 0;">

      <div style="display:flex;align-items:center;justify-content:space-between;
        padding:16px 18px;background:#b5460f;color:#fff;
        border-radius:22px 22px 0 0;position:sticky;top:0;z-index:2;">
        <h3 id="fbModalTitle" style="font-family:'Bebas Neue',sans-serif;
          font-size:1.15rem;letter-spacing:.06em;
          display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-bowl-food"></i> Nuevo plato
        </h3>
        <button id="fbModalClose" style="width:32px;height:32px;border-radius:50%;
          background:rgba(255,255,255,.2);color:#fff;border:none;cursor:pointer;
          font-size:.9rem;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div style="padding:18px 18px 32px;">

        <!-- Preview imagen -->
        <div id="fbImgPreview" style="width:100%;height:160px;border-radius:12px;
          background:#f2e8d8;display:flex;align-items:center;justify-content:center;
          margin-bottom:14px;overflow:hidden;position:relative;">
          <span id="fbImgIcon" style="font-size:2.5rem;">🍽️</span>
          <img id="fbImgImg" src="" alt="" style="display:none;width:100%;height:100%;
            object-fit:cover;position:absolute;inset:0;"/>
        </div>

        <!-- Subir imagen -->
        <div style="margin-bottom:14px;">
          <label style="display:block;font-weight:700;font-size:.76rem;color:#5c2e10;
            margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;">
            Foto del plato (desde celular o PC)
          </label>
          <input id="fbImgFile" type="file" accept="image/*" capture="environment" style="
            width:100%;padding:9px 12px;border:2px solid #ddd0c0;border-radius:9px;
            font-size:.88rem;background:#fdf6ed;cursor:pointer;
            font-family:'Outfit',sans-serif;"/>
          <div id="fbProgWrap" style="display:none;margin-top:8px;">
            <div style="height:6px;background:#f2e8d8;border-radius:3px;overflow:hidden;">
              <div id="fbProgBar" style="height:100%;width:0%;background:#b5460f;transition:width .3s;"></div>
            </div>
            <p id="fbProgPct" style="font-size:.74rem;color:#6b3a1f;margin-top:4px;text-align:center;">
              Subiendo... 0%
            </p>
          </div>
        </div>

        <!-- Nombre -->
        <div style="margin-bottom:14px;">
          <label style="display:block;font-weight:700;font-size:.76rem;color:#5c2e10;
            margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;">
            Nombre del plato <span style="color:#b5460f;">*</span>
          </label>
          <input id="fbNombre" type="text" placeholder="Ej: Pollo a la Olla" style="
            width:100%;padding:11px 13px;border:2px solid #ddd0c0;border-radius:9px;
            font-size:.9rem;background:#fdf6ed;font-family:'Outfit',sans-serif;"/>
        </div>

        <!-- Precio -->
        <div style="margin-bottom:14px;">
          <label style="display:block;font-weight:700;font-size:.76rem;color:#5c2e10;
            margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;">
            Precio S/ <span style="color:#b5460f;">*</span>
          </label>
          <input id="fbPrecio" type="number" step="0.5" min="0" placeholder="7.00" style="
            width:100%;padding:11px 13px;border:2px solid #ddd0c0;border-radius:9px;
            font-size:.9rem;background:#fdf6ed;font-family:'Outfit',sans-serif;"/>
        </div>

        <!-- Categoría -->
        <div style="margin-bottom:14px;">
          <label style="display:block;font-weight:700;font-size:.76rem;color:#5c2e10;
            margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;">
            Categoría <span style="color:#b5460f;">*</span>
          </label>
          <select id="fbCategoria" style="width:100%;padding:11px 13px;
            border:2px solid #ddd0c0;border-radius:9px;font-size:.9rem;
            background:#fdf6ed;font-family:'Outfit',sans-serif;cursor:pointer;">
            <option value="">— Selecciona —</option>
            <option value="menu">Menú del Día</option>
            <option value="postre">Postres</option>
            <option value="jugos">Jugos</option>
            <option value="broaster">Broaster</option>
          </select>
        </div>

        <!-- Disponible -->
        <div style="display:flex;align-items:center;justify-content:space-between;
          padding:12px 14px;background:#f2e8d8;border-radius:9px;margin-bottom:18px;">
          <span style="font-weight:700;font-size:.88rem;color:#3a1a08;">
            ¿Disponible ahora?
          </span>
          <label class="tog">
            <input type="checkbox" id="fbDisponible" checked/>
            <span class="tog-track"></span>
          </label>
        </div>

        <!-- Error -->
        <p id="fbError" style="display:none;color:#e02020;font-size:.82rem;
          font-weight:700;margin-bottom:12px;padding:9px 12px;
          background:#fff0f0;border-radius:8px;border:1px solid #ffaaaa;"></p>

        <!-- Botón guardar -->
        <button id="fbBtnGuardar" style="width:100%;padding:13px;background:#b5460f;
          color:#fff;border:none;border-radius:9px;font-weight:800;font-size:.96rem;
          font-family:'Outfit',sans-serif;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:background .2s;">
          <i class="fa-solid fa-floppy-disk"></i> Guardar plato
        </button>

      </div>
    </div>
  </div>`);

  document.getElementById('fbModalClose').addEventListener('click', cerrarModal);
  document.getElementById('fbModal').addEventListener('click', e => {
    if (e.target === document.getElementById('fbModal')) cerrarModal();
  });
  document.getElementById('fbImgFile').addEventListener('change', previewImg);
  document.getElementById('fbBtnGuardar').addEventListener('click', guardarPlato);
}

function abrirModal(plato = null) {
  editandoId = null; editandoImgUrl = null;
  document.getElementById('fbNombre').value     = '';
  document.getElementById('fbPrecio').value     = '';
  document.getElementById('fbCategoria').value  = '';
  document.getElementById('fbDisponible').checked = true;
  document.getElementById('fbImgFile').value    = '';
  document.getElementById('fbImgImg').style.display = 'none';
  document.getElementById('fbImgIcon').style.display = '';
  document.getElementById('fbError').style.display   = 'none';
  document.getElementById('fbProgWrap').style.display = 'none';

  if (plato) {
    editandoId     = plato.id;
    editandoImgUrl = plato.imagen || '';
    document.getElementById('fbModalTitle').innerHTML =
      '<i class="fa-solid fa-pen"></i> Editar plato';
    document.getElementById('fbBtnGuardar').innerHTML =
      '<i class="fa-solid fa-floppy-disk"></i> Actualizar plato';
    document.getElementById('fbNombre').value    = plato.nombre    || '';
    document.getElementById('fbPrecio').value    = plato.precio    || '';
    document.getElementById('fbCategoria').value = plato.categoria || '';
    document.getElementById('fbDisponible').checked = plato.disponible !== false;
    if (plato.imagen) {
      document.getElementById('fbImgImg').src = plato.imagen;
      document.getElementById('fbImgImg').style.display = 'block';
      document.getElementById('fbImgIcon').style.display = 'none';
    }
  } else {
    document.getElementById('fbModalTitle').innerHTML =
      '<i class="fa-solid fa-bowl-food"></i> Nuevo plato';
    document.getElementById('fbBtnGuardar').innerHTML =
      '<i class="fa-solid fa-floppy-disk"></i> Guardar plato';
  }
  document.getElementById('fbModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function cerrarModal() {
  document.getElementById('fbModal').style.display = 'none';
  document.body.style.overflow = '';
}

/* ── Preview imagen local ── */
function previewImg(e) {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = ev => {
    document.getElementById('fbImgImg').src = ev.target.result;
    document.getElementById('fbImgImg').style.display  = 'block';
    document.getElementById('fbImgIcon').style.display = 'none';
  };
  r.readAsDataURL(file);
}

/* ── Subir imagen a Storage ── */
function subirImagen(file, docId) {
  return new Promise((resolve, reject) => {
    const ext  = file.name.split('.').pop();
    const ruta = `productos/${docId}.${ext}`;
    const task = fbUploadBytesResumable(fbRef(storage, ruta), file);
    const wrap = document.getElementById('fbProgWrap');
    const bar  = document.getElementById('fbProgBar');
    const pct  = document.getElementById('fbProgPct');
    wrap.style.display = 'block';
    task.on('state_changed',
      snap => {
        const p = Math.round(snap.bytesTransferred / snap.totalBytes * 100);
        bar.style.width = p + '%';
        pct.textContent = `Subiendo... ${p}%`;
      },
      err => reject(err),
      async () => {
        const url = await fbGetDownloadURL(task.snapshot.ref);
        wrap.style.display = 'none';
        resolve(url);
      }
    );
  });
}

/* ── Guardar plato (crear o editar) ── */
async function guardarPlato() {
  const btn       = document.getElementById('fbBtnGuardar');
  const nombre    = document.getElementById('fbNombre').value.trim();
  const precio    = parseFloat(document.getElementById('fbPrecio').value);
  const categoria = document.getElementById('fbCategoria').value;
  const disp      = document.getElementById('fbDisponible').checked;
  const file      = document.getElementById('fbImgFile').files[0];
  const errEl     = document.getElementById('fbError');
  errEl.style.display = 'none';

  if (!nombre)              return showErr('El nombre es obligatorio');
  if (isNaN(precio)||precio<0) return showErr('Precio inválido');
  if (!categoria)           return showErr('Selecciona una categoría');

  btn.disabled    = true;
  btn.textContent = 'Guardando...';

  try {
    let imagenUrl = editandoImgUrl || '';

    if (editandoId) {
      // EDITAR
      if (file) imagenUrl = await subirImagen(file, editandoId);
      await fbUpdateDoc(fbDoc(db, 'productos', editandoId), {
        nombre, precio, categoria, disponible: disp, imagen: imagenUrl,
        updatedAt: fbServerTimestamp()
      });
      mostrarToast('✅ Plato actualizado');
    } else {
      // CREAR
      const nuevo = await fbAddDoc(fbCollection(db, 'productos'), {
        nombre, precio, categoria, disponible: disp,
        imagen: '', createdAt: fbServerTimestamp()
      });
      if (file) {
        imagenUrl = await subirImagen(file, nuevo.id);
        await fbUpdateDoc(fbDoc(db, 'productos', nuevo.id), { imagen: imagenUrl });
      }
      mostrarToast('✅ Plato creado');
    }
    cerrarModal();
  } catch (err) {
    console.error(err);
    showErr('Error: ' + err.message);
  } finally {
    btn.disabled  = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar plato';
  }
}

function showErr(msg) {
  const el = document.getElementById('fbError');
  el.textContent   = '⚠️ ' + msg;
  el.style.display = 'block';
}

/* ── Eliminar plato ── */
async function eliminarPlato(id, imgUrl) {
  if (!confirm('¿Eliminar este plato? No se puede deshacer.')) return;
  try {
    if (imgUrl && imgUrl.includes('firebasestorage')) {
      await fbDeleteObject(fbRef(storage, imgUrl)).catch(() => {});
    }
    await fbDeleteDoc(fbDoc(db, 'productos', id));
    mostrarToast('🗑️ Plato eliminado');
  } catch (err) {
    console.error(err);
    mostrarToast('❌ Error al eliminar');
  }
}

/* ── Toggle disponible (directo a Firebase) ── */
async function toggleDisp(id, valor) {
  try {
    await fbUpdateDoc(fbDoc(db, 'productos', id), { disponible: valor });
    mostrarToast(valor ? '✅ Disponible' : '❌ Agotado');
  } catch (err) {
    console.error(err);
  }
}

/* ── Cambiar precio (al cambiar el input) ── */
async function cambiarPrecio(id, precio) {
  if (isNaN(precio) || precio < 0) return;
  try {
    await fbUpdateDoc(fbDoc(db, 'productos', id), { precio });
  } catch (err) { console.error(err); }
}

/* ════════════════════════════════════════
   ESCUCHAR PRODUCTOS EN TIEMPO REAL
════════════════════════════════════════ */
function escucharProductos() {
  const q = fbQuery(
    fbCollection(db, 'productos'),
    fbOrderBy('categoria'),
    fbOrderBy('nombre')
  );
  fbOnSnapshot(q,
    snap => {
      productosCache = [];
      snap.forEach(d => productosCache.push({ id: d.id, ...d.data() }));
      renderGrid(catAdmin);
      actualizarStats();
    },
    err => {
      console.error(err);
      mostrarToast('❌ Error de conexión Firebase');
    }
  );
}

/* ════════════════════════════════════════
   RENDER GRID ADMIN
════════════════════════════════════════ */
function getVisible(cat) {
  return cat === 'all' ? productosCache
       : productosCache.filter(p => p.categoria === cat);
}

function renderGrid(cat) {
  catAdmin = cat;
  const grid = document.getElementById('adminGrid');
  if (!grid) return;
  const lista = getVisible(cat);
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = `<p style="color:#6b3a1f;padding:20px;grid-column:1/-1;
      font-weight:600;">No hay platos en esta categoría.</p>`;
    return;
  }

  lista.forEach(p => {
    const card = document.createElement('div');
    card.className = 'acard' + (!p.disponible ? ' off-card' : '');
    card.innerHTML = `
      <div class="acard-img-wrap">
        <img class="acard-img" src="${p.imagen||'img/placeholder.jpg'}" alt="${p.nombre}"
             onerror="this.src='img/placeholder.jpg'"/>
        <span class="acard-status ${p.disponible?'on':'off'}">
          ${p.disponible?'✓ Disponible':'✗ Agotado'}
        </span>
      </div>
      <div class="acard-body">
        <div class="acard-name">${p.nombre}</div>
        <div class="acard-row">
          <label>Precio S/</label>
          <input class="price-inp" type="number" step="0.5" min="0"
                 value="${(p.precio||0).toFixed(2)}" data-id="${p.id}"/>
        </div>
        <div class="acard-row">
          <label id="lbl-${p.id}">${p.disponible?'Disponible':'Agotado'}</label>
          <label class="tog">
            <input type="checkbox" ${p.disponible?'checked':''} data-id="${p.id}"/>
            <span class="tog-track"></span>
          </label>
        </div>
        <span class="acard-cat">${CAT_LABEL[p.categoria]||p.categoria}</span>
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn-editar-plato" data-id="${p.id}" style="
            flex:1;padding:8px;border-radius:8px;
            background:#e8a020;color:#fff;border:none;
            font-weight:700;font-size:.8rem;cursor:pointer;
            font-family:'Outfit',sans-serif;
            display:flex;align-items:center;justify-content:center;gap:5px;">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          <button class="btn-del-plato" data-id="${p.id}" style="
            flex:1;padding:8px;border-radius:8px;
            background:#e02020;color:#fff;border:none;
            font-weight:700;font-size:.8rem;cursor:pointer;
            font-family:'Outfit',sans-serif;
            display:flex;align-items:center;justify-content:center;gap:5px;">
            <i class="fa-solid fa-trash"></i> Eliminar
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
  });

  // Eventos toggle
  grid.querySelectorAll('input[type="checkbox"]').forEach(tog => {
    tog.addEventListener('change', e => {
      const id = e.target.dataset.id;
      const p  = productosCache.find(x => x.id === id);
      if (!p) return;
      p.disponible = e.target.checked;
      const card  = e.target.closest('.acard');
      const badge = card.querySelector('.acard-status');
      const lbl   = document.getElementById('lbl-' + id);
      badge.textContent = p.disponible ? '✓ Disponible' : '✗ Agotado';
      badge.className   = `acard-status ${p.disponible?'on':'off'}`;
      if (lbl) lbl.textContent = p.disponible ? 'Disponible' : 'Agotado';
      card.classList.toggle('off-card', !p.disponible);
      toggleDisp(id, p.disponible);
    });
  });

  // Eventos precio
  grid.querySelectorAll('.price-inp').forEach(inp => {
    inp.addEventListener('change', e => {
      cambiarPrecio(e.target.dataset.id, parseFloat(e.target.value));
    });
  });

  // Editar
  grid.querySelectorAll('.btn-editar-plato').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const p  = productosCache.find(x => x.id === id);
      if (p) abrirModal(p);
    });
  });

  // Eliminar
  grid.querySelectorAll('.btn-del-plato').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const p  = productosCache.find(x => x.id === id);
      if (p) eliminarPlato(id, p.imagen);
    });
  });
}

/* ── Stats sidebar ── */
function actualizarStats() {
  const total   = productosCache.length;
  const activos = productosCache.filter(p => p.disponible).length;
  const el = document.getElementById('sbStats');
  if (!el) return;
  el.innerHTML = `
    <div class="stat-pill"><strong>${total}</strong>Productos</div>
    <div class="stat-pill"><strong style="color:#4adb6a">${activos}</strong>Disponibles</div>
    <div class="stat-pill"><strong style="color:#e74c3c">${total-activos}</strong>Agotados</div>`;
}

/* ── Toast ── */
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ════════════════════════════════════════
   EVENTOS AL CARGAR
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // Restaurar sesión si ya inició
  if (sessionStorage.getItem('ebs_admin_ok') === '1') {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminLayout').classList.remove('hidden');
    iniciarPanel();
  }

  // Login
  document.getElementById('btnLogin').addEventListener('click', intentarLogin);
  document.getElementById('loginInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') intentarLogin();
  });

  // Ojo contraseña
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

  // Filtros
  document.getElementById('adminFilters')?.addEventListener('click', e => {
    const btn = e.target.closest('.af-btn');
    if (!btn) return;
    document.querySelectorAll('.af-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGrid(btn.dataset.acat);
  });

  // Logout
  document.getElementById('btnLogout')?.addEventListener('click', cerrarSesion);
});
