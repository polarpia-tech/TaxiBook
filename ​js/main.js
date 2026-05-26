import { auth, db } from './firebase-config.js';
import * as UI from './ui.js';
import * as Charts from './charts.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
    if (user) {
        UI.toggleVisibility('authScreen', false);
        UI.toggleVisibility('mainApp', true);
        const q = query(collection(db, "pro_shifts"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        let totals = { cash: 0, cards: 0, freenow: 0, uber: 0 };
        
        snapshot.docs.forEach(doc => {
            const d = doc.data();
            totals.cash += parseFloat(d.cash || 0);
            totals.cards += parseFloat(d.cards || 0);
            totals.freenow += parseFloat(d.freenow || 0);
            totals.uber += parseFloat(d.uber || 0);
        });

        UI.updateDashboard(totals.cash + totals.cards + totals.freenow + totals.uber);
        Charts.renderChart('analyticsChart', [totals.cash, totals.cards, totals.freenow, totals.uber]);
    } else {
        UI.toggleVisibility('authScreen', true);
        UI.toggleVisibility('mainApp', false);
    }
});
