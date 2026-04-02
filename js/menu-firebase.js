/* ════════════════════════════════════════════════
   menu-firebase.js  –  El Buen Sabor
   Carga productos desde Firestore en tiempo real
   y los envía a app.js via evento "productosActualizados"
════════════════════════════════════════════════ */
import { db } from './firebase.js';
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

/* ── Loading mientras carga ── */
function mostrarLoading() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = `
    <div style="grid-column:1/-1;display:flex;flex-direction:column;
      align-items:center;justify-content:center;padding:60px 20px;gap:14px;">
      <div style="width:42px;height:42px;border-radius:50%;
        border:4px solid #f2e8d8;border-top-color:#b5460f;
        animation:ebsSpin .8s linear infinite;"></div>
      <p style="font-weight:700;font-size:.9rem;color:#b5460f;">Cargando menú...</p>
    </div>
    <style>@keyframes ebsSpin{to{transform:rotate(360deg)}}</style>`;
}

/* ── Iniciar escucha en tiempo real ── */
export function iniciarMenuFirebase() {
  mostrarLoading();

  const q = query(
    collection(db, 'productos'),
    orderBy('categoria'),
    orderBy('nombre')
  );

  onSnapshot(
    q,
    snapshot => {
      const lista = [];
      snapshot.forEach(doc => lista.push({ id: doc.id, ...doc.data() }));
      // Enviar a app.js
      window.dispatchEvent(new CustomEvent('productosActualizados', { detail: lista }));
    },
    error => {
      console.error('Firebase error:', error);
      // app.js tiene fallback automático a los 4 seg
    }
  );
}
