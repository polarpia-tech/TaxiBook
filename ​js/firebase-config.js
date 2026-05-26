import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxIswpC499LRIriixb4x-A45RISwUoBeY",
  authDomain: "taxifahrer-7f594.firebaseapp.com",
  projectId: "taxifahrer-7f594",
  storageBucket: "taxifahrer-7f594.firebasestorage.app",
  messagingSenderId: "792387417426",
  appId: "1:792387417426:web:7f98406d4df1956158368b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
