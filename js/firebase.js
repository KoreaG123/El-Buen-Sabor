/* ══════════════════════════════════════════
   firebase.js  –  El Buen Sabor
   ⚠️  REEMPLAZA los 6 valores de firebaseConfig
       con los de tu proyecto en Firebase Console
══════════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC971_tWgR4vogp0V5I5NzP5oAexgQIPVU",
  authDomain: "elbuensabor-562b9.firebaseapp.com",
  projectId: "elbuensabor-562b9",
  storageBucket: "elbuensabor-562b9.appspot.com",
  messagingSenderId: "254792083145",
  appId: "1:254792083145:web:442e7347f71f03fa8c0f18",
  measurementId: "G-GLVC9FHJ1B"
};

const app        = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const storage = getStorage(app);
