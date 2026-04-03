/* ════════════════════════════════════════════════════
   admin.js  –  El Buen Sabor
   ✅ Imágenes con CLOUDINARY (100% gratis, sin tarjeta)
   ✅ Datos en FIRESTORE
   ✅ Crear / Editar / Eliminar platos
   ✅ Activar / Desactivar / Cambiar precio
   ✅ Subida de foto desde celular o PC
════════════════════════════════════════════════════ */
'use strict';

/* ══════════════════════════════════════════
   ⚙️  CONFIGURACIÓN  ← edita solo estos valores
══════════════════════════════════════════ */
const CLAVE_ADMIN        = '1234';             // contraseña del panel
 const CLOUDINARY_CLOUD = 'djgcwn86j';  // ej: dxyz123abc
const CLOUDINARY_PRESET  = 'elbuensabor';     // upload preset (unsigned)
/* ══════════════════════════════════════════ */

const CAT_LABEL = {
  menu:     'Menú del Día',
  postre:   'Postres',
  jugos:    'Jugos',
  broaster: 'Broaster'
};

/* ── Estado ── */
let db;
let fbCollection, fbDoc, fbAddDoc, fbUpdateDoc,
    fbDeleteDoc, fbOnSnapshot, fbQuery, fbOrderBy, fbServerTimestamp;
let productosCache = [];
let catAdmin       = 'all';
let editandoId     = null;
let editandoImgUrl = '';

/* ══════════════════════════════════════════
   CARGAR FIREBASE (solo Firestore, sin Storage)
══════════════════════════════════════════ */
async function cargarFirebase() {
  const { db: _db } = await import('./firebase.js');
  db = _db;
  const fs = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
  fbCollection      = fs.collection;
  fbDoc             = fs.doc;
  fbAddDoc          = fs.addDoc;
  fbUpdateDoc       = fs.updateDoc;
  fbDeleteDoc       = fs.deleteDoc;
  fbOnSnapshot      = fs.onSnapshot;
  fbQuery           = fs.query;
  fbOrderBy         = fs.orderBy;
  fbServerTimestamp = fs.serverTimestamp;
}

/* ══════════════════════════════════════════
   SUBIR IMAGEN A CLOUDINARY
   El dueño elige foto → sube directo al servidor
   de Cloudinary → devuelve URL lista para guardar
══════════════════════════════════════════ */
async function subirImagenCloudinary(file, onProgress) {
  const url  = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', CLOUDINARY_PRESET);
  form.append('folder', 'elbuensabor');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    // Progreso real de subida
    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round(e.loaded / e.total * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.secure_url); // URL final de la imagen
      } else {
        reject(new Error('Error Cloudinary: ' + xhr.status));
      }
    };
    xhr.onerror = () => reject(new Error('Sin conexión'));
    xhr.send(form);
  });
}

/* ══════════════════════════════════════════
   LOGIN
══════════════════════════════════════════ */
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

/* ══════════════════════════════════════════
   INICIAR PANEL
══════════════════════════════════════════ */
async function iniciarPanel() {
  await cargarFirebase();
  inyectarBotonNuevo();
  inyectarModal();
  escucharProductos();
}

/* ══════════════════════════════════════════
   BOTÓN "+ NUEVO PLATO"
══════════════════════════════════════════ */
function inyectarBotonNuevo() {
  if (document.getElementById('btnNuevoPlato')) return;
  const bar = document.querySelector('.admin-bar');
  if (!bar) return;
  const btn = document.createElement('button');
  btn.id        = 'btnNuevoPlato';
  btn.className = 'btn-save';
  btn.style.cssText = 'background:#1a7a30;margin-left:8px;flex-shrink:0;';
  btn.innerHTML = '<i class="fa-solid fa-plus"></i> Nuevo plato';
  btn.addEventListener('click', () => abrirModal());
  const rightDiv = bar.querySelector('div:last-child') || bar;
  rightDiv.appendChild(btn);
  // Guardar cambios manual ya no hace falta (Firebase guarda automático)
  const btnSave = document.getElementById('btnSave');
  if (btnSave) btnSave.style.display = 'none';
}

/* ══════════════════════════════════════════
   MODAL AGREGAR / EDITAR
══════════════════════════════════════════ */
function inyectarModal() {
  if (document.getElementById('fbModal')) return;

  document.body.insertAdjacentHTML('beforeend', `
  <div id="fbModal" style="
    display:none;position:fixed;inset:0;z-index:2000;
    background:rgba(20,8,2,.7);
    align-items:flex-end;justify-content:center;">

    <div style="
      background:#fdf6ed;width:100%;max-width:500px;
      max-height:94vh;overflow-y:auto;
      border-radius:22px 22px 0 0;">

      <!-- ── Cabecera ── -->
      <div style="
        display:flex;align-items:center;justify-content:space-between;
        padding:16px 18px;background:#b5460f;color:#fff;
        border-radius:22px 22px 0 0;
        position:sticky;top:0;z-index:2;">
        <h3 id="fbModalTitle" style="
          font-family:'Bebas Neue',sans-serif;font-size:1.15rem;
          letter-spacing:.06em;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-bowl-food"></i> Nuevo plato
        </h3>
        <button id="fbModalClose" style="
          width:32px;height:32px;border-radius:50%;
          background:rgba(255,255,255,.2);color:#fff;border:none;
          cursor:pointer;font-size:.9rem;
          display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- ── Cuerpo ── -->
      <div style="padding:18px 18px 36px;">

        <!-- Preview foto -->
        <div id="fbPreviewBox" style="
          width:100%;height:180px;border-radius:14px;
          background:#f2e8d8;overflow:hidden;margin-bottom:14px;
          display:flex;align-items:center;justify-content:center;
          position:relative;border:2px dashed #ddd0c0;">
          <div id="fbPreviewPlaceholder" style="text-align:center;color:#b89880;">
            <p style="font-size:2.5rem;">📷</p>
            <p style="font-size:.8rem;font-weight:600;margin-top:4px;">
              Vista previa de la foto
            </p>
          </div>
          <img id="fbPreviewImg" src="" alt="" style="
            display:none;width:100%;height:100%;
            object-fit:cover;position:absolute;inset:0;"/>
          <!-- Badge subiendo -->
          <div id="fbUploadBadge" style="
            display:none;position:absolute;inset:0;
            background:rgba(58,26,8,.75);
            flex-direction:column;
            align-items:center;justify-content:center;gap:10px;">
            <div style="
              width:44px;height:44px;border-radius:50%;
              border:4px solid rgba(255,255,255,.3);
              border-top-color:#fff;
              animation:adminSpin .8s linear infinite;"></div>
            <p id="fbUploadPct" style="
              color:#fff;font-weight:800;font-size:1.1rem;">0%</p>
          </div>
        </div>
        <style>@keyframes adminSpin{to{transform:rotate(360deg)}}</style>

        <!-- Input archivo -->
        <label id="fbFileLabel" style="
          display:flex;align-items:center;justify-content:center;gap:9px;
          width:100%;padding:11px;border-radius:9px;
          background:#3a1a08;color:#fff;
          font-weight:700;font-size:.88rem;
          cursor:pointer;margin-bottom:16px;
          font-family:'Outfit',sans-serif;
          transition:background .2s;">
          <i class="fa-solid fa-camera"></i>
          <span id="fbFileLabelText">📸 Elegir foto (celular o PC)</span>
          <input id="fbImgFile" type="file" accept="image/*"
                 style="display:none;"/>
        </label>

        <!-- Nombre -->
        <div style="margin-bottom:14px;">
          <label style="
            display:block;font-weight:700;font-size:.76rem;color:#5c2e10;
            margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;">
            Nombre del plato <span style="color:#b5460f;">*</span>
          </label>
          <input id="fbNombre" type="text"
            placeholder="Ej: Pollo a la Olla"
            style="
              width:100%;padding:11px 13px;
              border:2px solid #ddd0c0;border-radius:9px;
              font-size:.9rem;background:#fdf6ed;
              font-family:'Outfit',sans-serif;"/>
        </div>

        <!-- Precio -->
        <div style="margin-bottom:14px;">
          <label style="
            display:block;font-weight:700;font-size:.76rem;color:#5c2e10;
            margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;">
            Precio S/ <span style="color:#b5460f;">*</span>
          </label>
          <input id="fbPrecio" type="number" step="0.5" min="0"
            placeholder="7.00"
            style="
              width:100%;padding:11px 13px;
              border:2px solid #ddd0c0;border-radius:9px;
              font-size:.9rem;background:#fdf6ed;
              font-family:'Outfit',sans-serif;"/>
        </div>

        <!-- Categoría -->
        <div style="margin-bottom:14px;">
          <label style="
            display:block;font-weight:700;font-size:.76rem;color:#5c2e10;
            margin-bottom:5px;letter-spacing:.04em;text-transform:uppercase;">
            Categoría <span style="color:#b5460f;">*</span>
          </label>
          <select id="fbCategoria" style="
            width:100%;padding:11px 13px;
            border:2px solid #ddd0c0;border-radius:9px;
            font-size:.9rem;background:#fdf6ed;
            font-family:'Outfit',sans-serif;cursor:pointer;">
            <option value="">— Selecciona —</option>
            <option value="menu">Menú del Día</option>
            <option value="postre">Postres</option>
            <option value="jugos">Jugos</option>
            <option value="broaster">Broaster</option>
          </select>
        </div>

        <!-- Disponible -->
        <div style="
          display:flex;align-items:center;justify-content:space-between;
          padding:12px 14px;background:#f2e8d8;border-radius:9px;
          margin-bottom:18px;">
          <span style="font-weight:700;font-size:.88rem;color:#3a1a08;">
            ¿Disponible ahora?
          </span>
          <label class="tog">
            <input type="checkbox" id="fbDisponible" checked/>
            <span class="tog-track"></span>
          </label>
        </div>

        <!-- Error -->
        <p id="fbError" style="
          display:none;color:#e02020;font-size:.82rem;font-weight:700;
          margin-bottom:12px;padding:9px 12px;
          background:#fff0f0;border-radius:8px;
          border:1px solid #ffaaaa;"></p>

        <!-- Botón guardar -->
        <button id="fbBtnGuardar" style="
          width:100%;padding:14px;background:#b5460f;color:#fff;
          border:none;border-radius:9px;font-weight:800;font-size:.96rem;
          font-family:'Outfit',sans-serif;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:8px;
          transition:background .2s;">
          <i class="fa-solid fa-floppy-disk"></i> Guardar plato
        </button>

      </div>
    </div>
  </div>`);

  // Eventos
  document.getElementById('fbModalClose')
    .addEventListener('click', cerrarModal);
  document.getElementById('fbModal')
    .addEventListener('click', e => {
      if (e.target === document.getElementById('fbModal')) cerrarModal();
    });
  document.getElementById('fbImgFile')
    .addEventListener('change', onFileSelected);
  document.getElementById('fbBtnGuardar')
    .addEventListener('click', guardarPlato);
}

/* ── Previsualizar imagen seleccionada ── */
function onFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  const label = document.getElementById('fbFileLabelText');
  label.textContent = '✅ ' + file.name;
  const reader = new FileReader();
  reader.onload = ev => {
    const img  = document.getElementById('fbPreviewImg');
    const ph   = document.getElementById('fbPreviewPlaceholder');
    img.src            = ev.target.result;
    img.style.display  = 'block';
    ph.style.display   = 'none';
  };
  reader.readAsDataURL(file);
}

/* ── Abrir modal ── */
function abrirModal(plato = null) {
  editandoId     = null;
  editandoImgUrl = '';

  // Limpiar
  document.getElementById('fbNombre').value      = '';
  document.getElementById('fbPrecio').value      = '';
  document.getElementById('fbCategoria').value   = '';
  document.getElementById('fbImgFile').value     = '';
  document.getElementById('fbDisponible').checked = true;
  document.getElementById('fbError').style.display = 'none';
  document.getElementById('fbPreviewImg').style.display = 'none';
  document.getElementById('fbPreviewPlaceholder').style.display = '';
  document.getElementById('fbUploadBadge').style.display = 'none';
  document.getElementById('fbFileLabelText').textContent = '📸 Elegir foto (celular o PC)';

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
      const img = document.getElementById('fbPreviewImg');
      img.src           = plato.imagen;
      img.style.display = 'block';
      document.getElementById('fbPreviewPlaceholder').style.display = 'none';
      document.getElementById('fbFileLabelText').textContent = '📸 Cambiar foto (opcional)';
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

/* ── Mostrar / ocultar spinner de subida ── */
function mostrarSubiendo(pct) {
  const badge = document.getElementById('fbUploadBadge');
  badge.style.display = 'flex';
  document.getElementById('fbUploadPct').textContent = pct + '%';
}
function ocultarSubiendo() {
  document.getElementById('fbUploadBadge').style.display = 'none';
}

/* ══════════════════════════════════════════
   GUARDAR PLATO
   1. Si hay foto nueva → subir a Cloudinary
   2. Guardar/actualizar en Firestore
══════════════════════════════════════════ */
async function guardarPlato() {
  const btn        = document.getElementById('fbBtnGuardar');
  const nombre     = document.getElementById('fbNombre').value.trim();
  const precio     = parseFloat(document.getElementById('fbPrecio').value);
  const categoria  = document.getElementById('fbCategoria').value;
  const disponible = document.getElementById('fbDisponible').checked;
  const file       = document.getElementById('fbImgFile').files[0];
  const errEl      = document.getElementById('fbError');
  errEl.style.display = 'none';

  // Validaciones
  if (!nombre)                   return showErr('El nombre es obligatorio');
  if (isNaN(precio) || precio<0) return showErr('Ingresa un precio válido');
  if (!categoria)                return showErr('Selecciona una categoría');
  if (!editandoId && !file)      return showErr('Elige una foto para el plato');

  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

  try {
    let imagenUrl = editandoImgUrl;

    // ── Subir foto a Cloudinary si hay archivo nuevo ──
    if (file) {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo foto...';
      mostrarSubiendo(0);
      imagenUrl = await subirImagenCloudinary(file, pct => {
        mostrarSubiendo(pct);
        document.getElementById('fbUploadPct').textContent = pct + '%';
      });
      ocultarSubiendo();
      // Actualizar preview con la URL real de Cloudinary
      document.getElementById('fbPreviewImg').src = imagenUrl;
    }

    // ── Guardar en Firestore ──
    const datos = {
      nombre,
      precio,
      categoria,
      disponible,
      imagen: imagenUrl,
      updatedAt: fbServerTimestamp()
    };

    if (editandoId) {
      await fbUpdateDoc(fbDoc(db, 'productos', editandoId), datos);
      mostrarToast('✅ Plato actualizado');
    } else {
      datos.createdAt = fbServerTimestamp();
      await fbAddDoc(fbCollection(db, 'productos'), datos);
      mostrarToast('✅ Plato creado');
    }

    cerrarModal();

  } catch (err) {
    console.error(err);
    ocultarSubiendo();
    showErr('Error al guardar. Verifica tu conexión.');
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

/* ══════════════════════════════════════════
   ELIMINAR PLATO
══════════════════════════════════════════ */
async function eliminarPlato(id) {
  if (!confirm('¿Eliminar este plato? Esta acción no se puede deshacer.')) return;
  try {
    await fbDeleteDoc(fbDoc(db, 'productos', id));
    mostrarToast('🗑️ Plato eliminado');
  } catch (err) {
    console.error(err);
    mostrarToast('❌ Error al eliminar');
  }
}

/* ══════════════════════════════════════════
   TOGGLE DISPONIBLE  (guarda al instante)
══════════════════════════════════════════ */
async function toggleDisponible(id, valor) {
  try {
    await fbUpdateDoc(fbDoc(db, 'productos', id), { disponible: valor });
    mostrarToast(valor ? '✅ Disponible' : '❌ Marcado como agotado');
  } catch (err) { console.error(err); }
}

/* ══════════════════════════════════════════
   ACTUALIZAR PRECIO  (guarda al cambiar input)
══════════════════════════════════════════ */
async function actualizarPrecio(id, precio) {
  if (isNaN(precio) || precio < 0) return;
  try {
    await fbUpdateDoc(fbDoc(db, 'productos', id), { precio });
  } catch (err) { console.error(err); }
}

/* ══════════════════════════════════════════
   ESCUCHAR PRODUCTOS EN TIEMPO REAL
══════════════════════════════════════════ */
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
      mostrarToast('❌ Error de conexión con Firebase');
    }
  );
}

/* ══════════════════════════════════════════
   RENDER GRID ADMIN
══════════════════════════════════════════ */
function filtrados(cat) {
  return cat === 'all' ? productosCache
       : productosCache.filter(p => p.categoria === cat);
}

function renderGrid(cat) {
  catAdmin = cat;
  const grid = document.getElementById('adminGrid');
  if (!grid) return;
  const lista = filtrados(cat);
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;padding:50px 20px;text-align:center;color:#6b3a1f;">
        <p style="font-size:2.5rem;">🍽️</p>
        <p style="font-weight:700;font-size:1rem;margin-top:10px;">
          No hay platos aquí todavía
        </p>
        <p style="font-size:.85rem;margin-top:6px;color:#b89880;">
          Usa el botón <strong style="color:#1a7a30;">+ Nuevo plato</strong> para agregar
        </p>
      </div>`;
    return;
  }

  lista.forEach(p => {
    const card = document.createElement('div');
    card.className = 'acard' + (!p.disponible ? ' off-card' : '');
    card.innerHTML = `
      <div class="acard-img-wrap">
        <img class="acard-img"
             src="${p.imagen || 'img/placeholder.jpg'}"
             alt="${p.nombre}"
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
                 value="${Number(p.precio || 0).toFixed(2)}"
                 data-id="${p.id}"/>
        </div>

        <div class="acard-row">
          <label id="lbl-${p.id}">
            ${p.disponible ? 'Disponible' : 'Agotado'}
          </label>
          <label class="tog">
            <input type="checkbox" ${p.disponible ? 'checked' : ''}
                   data-id="${p.id}"/>
            <span class="tog-track"></span>
          </label>
        </div>

        <span class="acard-cat">
          ${CAT_LABEL[p.categoria] || p.categoria}
        </span>

        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn-editar-p" data-id="${p.id}" style="
            flex:1;padding:9px;border-radius:8px;
            background:#e8a020;color:#fff;border:none;
            font-weight:700;font-size:.8rem;cursor:pointer;
            font-family:'Outfit',sans-serif;
            display:flex;align-items:center;justify-content:center;gap:5px;">
            <i class="fa-solid fa-pen"></i> Editar
          </button>
          <button class="btn-del-p" data-id="${p.id}" style="
            flex:1;padding:9px;border-radius:8px;
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

  // Eventos delegados
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
      badge.className   = `acard-status ${p.disponible ? 'on' : 'off'}`;
      if (lbl) lbl.textContent = p.disponible ? 'Disponible' : 'Agotado';
      card.classList.toggle('off-card', !p.disponible);
      toggleDisponible(id, p.disponible);
    });
  });

  grid.querySelectorAll('.price-inp').forEach(inp => {
    inp.addEventListener('change', e => {
      actualizarPrecio(e.target.dataset.id, parseFloat(e.target.value));
    });
  });

  grid.querySelectorAll('.btn-editar-p').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.currentTarget.dataset.id;
      const p  = productosCache.find(x => x.id === id);
      if (p) abrirModal(p);
    });
  });

  grid.querySelectorAll('.btn-del-p').forEach(btn => {
    btn.addEventListener('click', e => {
      eliminarPlato(e.currentTarget.dataset.id);
    });
  });
}

/* ══════════════════════════════════════════
   STATS SIDEBAR
══════════════════════════════════════════ */
function actualizarStats() {
  const total    = productosCache.length;
  const activos  = productosCache.filter(p => p.disponible).length;
  const el = document.getElementById('sbStats');
  if (!el) return;
  el.innerHTML = `
    <div class="stat-pill">
      <strong>${total}</strong>Productos
    </div>
    <div class="stat-pill">
      <strong style="color:#4adb6a">${activos}</strong>Disponibles
    </div>
    <div class="stat-pill">
      <strong style="color:#e74c3c">${total - activos}</strong>Agotados
    </div>`;
}

/* ══════════════════════════════════════════
   TOAST
══════════════════════════════════════════ */
function mostrarToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════════
   EVENTOS AL CARGAR LA PÁGINA
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // Restaurar sesión si ya estaba logueado
  if (sessionStorage.getItem('ebs_admin_ok') === '1') {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminLayout').classList.remove('hidden');
    iniciarPanel();
  }

  // Login
  document.getElementById('btnLogin')
    .addEventListener('click', intentarLogin);
  document.getElementById('loginInput')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') intentarLogin();
    });

  // Ver/ocultar contraseña
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

  // Filtros de categoría
  document.getElementById('adminFilters')
    ?.addEventListener('click', e => {
      const btn = e.target.closest('.af-btn');
      if (!btn) return;
      document.querySelectorAll('.af-btn')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid(btn.dataset.acat);
    });

  // Logout
  document.getElementById('btnLogout')
    ?.addEventListener('click', cerrarSesion);
});
