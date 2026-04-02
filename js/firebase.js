/* ══════════════════════════════════════════
   firebase.js  –  El Buen Sabor
   ⚠️  REEMPLAZA los 6 valores de firebaseConfig
       con los de tu proyecto en Firebase Console
══════════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey:            "PEGA_AQUI_TU_API_KEY",
  authDomain:        "PEGA_AQUI_TU_PROJECT.firebaseapp.com",
  projectId:         "PEGA_AQUI_TU_PROJECT_ID",
  storageBucket:     "PEGA_AQUI_TU_PROJECT.appspot.com",
  messagingSenderId: "PEGA_AQUI_TU_SENDER_ID",
  appId:             "PEGA_AQUI_TU_APP_ID"
};

const app        = initializeApp(firebaseConfig);
export const db      = getFirestore(app);
export const storage = getStorage(app);
