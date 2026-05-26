import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import * as UI from './ui.js';

// Global μεταβλητή για τα δεδομένα
let allShifts = [];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        UI.toggleVisibility('authScreen', false);
        UI.toggleVisibility('mainApp', true);
        
        // Φόρτωση δεδομένων μόλις συνδεθεί ο χρήστης
        await fetchShifts(user.uid);
    } else {
        UI.toggleVisibility('authScreen', true);
        UI.toggleVisibility('mainApp', false);
    }
});

async function fetchShifts(userId) {
    try {
        const q = query(collection(db, "pro_shifts"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        allShifts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // ΚΑΛΕΣΜΑ ΤΗΣ UI ΓΙΑ ΕΝΗΜΕΡΩΣΗ
        UI.updateDashboard(allShifts);
        
    } catch (error) {
        console.error("Σφάλμα στη φόρτωση:", error);
    }
}
