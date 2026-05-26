import { auth, db } from './firebase-config.js';
import * as UI from './ui.js';
import * as Charts from './charts.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Μεταβλητές κατάστασης
let currentUser = null;
let currentLang = 'el';
let allShiftsGlobal = [];

// Αρχικοποίηση
UI.initKeyboardEngine();

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('authScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        document.getElementById('bottomNav').classList.remove('hidden');
        
        await fetchShifts();
    } else {
        document.getElementById('authScreen').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('bottomNav').classList.add('hidden');
    }
});

async function fetchShifts() {
    if (!currentUser) return;
    const q = query(collection(db, "pro_shifts"), where("userId", "==", currentUser.uid));
    const snapshot = await getDocs(q);
    allShiftsGlobal = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    allShiftsGlobal.sort((a, b) => b.date.localeCompare(a.date));
    renderAll();
}

function renderAll() {
    // Εδώ καλείς τις συναρτήσεις από το UI.js και το Charts.js
    // για να ανανεώσεις το dashboard
    console.log("Rendering application...");
}

// Event Listeners για τα κουμπιά πλοήγησης
document.getElementById('showHomeBtn').addEventListener('click', () => UI.routeTo('homeTab'));
document.getElementById('showHistoryBtn').addEventListener('click', () => UI.routeTo('historyTab'));
document.getElementById('navLogoutBtn').addEventListener('click', () => signOut(auth));
