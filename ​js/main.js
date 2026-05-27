import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, updateDoc, query, where, getDocs, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { translations } from "./translations.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxIswpC499LRIriixb4x-A45RISwUoBeY",
  authDomain: "taxifahrer-7f594.firebaseapp.com",
  projectId: "taxifahrer-7f594",
  storageBucket: "taxifahrer-7f594.firebasestorage.app",
  messagingSenderId: "792387417426",
  appId: "1:792387417426:web:7f98406d4df1956158368b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let userTaxiNumber = "TAXI 0000";
let allShiftsGlobal = [];
let isLoginMode = true;
let currentLang = 'el';

let statsChartInstance = null;
let expensesChartInstance = null;
let trendChartInstance = null;

const authScreen = document.getElementById('authScreen');
const mainApp = document.getElementById('mainApp');
const bottomNav = document.getElementById('bottomNav');
const homeTab = document.getElementById('homeTab');
const historyTab = document.getElementById('historyTab');
const formTab = document.getElementById('formTab');
const showHomeBtn = document.getElementById('showHomeBtn');
const showHistoryBtn = document.getElementById('showHistoryBtn');
const floatingAddBtn = document.getElementById('floatingAddBtn');
const navLogoutBtn = document.getElementById('navLogoutBtn');

function initKeyboardEngine() {
    const allInputs = document.querySelectorAll('input, select, textarea');
    
    allInputs.forEach(input => {
        input.addEventListener('focus', () => {
            bottomNav.classList.add('nav-hidden');
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 80);
        });

        input.addEventListener('blur', () => {
            bottomNav.classList.remove('nav-hidden');
        });
    });

    document.getElementById('shiftForm').addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            if (e.target.id === 'notes' || e.target.type === 'submit') {
                return;
            }
            
            e.preventDefault();
            
            if (e.target.id === 'date') {
                document.getElementById('taximetro').focus();
            } else if (e.target.id === 'taximetro') {
                document.getElementById('kmEnd').focus();
            } else if (e.target.id === 'kmEnd') {
                document.getElementById('metrita').focus();
            } else if (e.target.id === 'metrita') {
                document.getElementById('kartes').focus();
            } else if (e.target.id === 'kartes') {
                document.getElementById('freenow').focus();
            } else if (e.target.id === 'freenow') {
                document.getElementById('uber').focus();
            } else if (e.target.id === 'uber') {
                document.getElementById('tips').focus();
            } else if (e.target.id === 'tips') {
                document.getElementById('kausima').focus();
            } else if (e.target.id === 'kausima') {
                document.getElementById('service').focus();
            } else if (e.target.id === 'service') {
                document.getElementById('plysimo').focus();
            } else if (e.target.id === 'plysimo') {
                document.getElementById('allaExoda').focus();
            } else if (e.target.id === 'allaExoda') {
                document.getElementById('notes').focus();
            }
        }
    });
}

document.getElementById('authForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const taxiNo = document.getElementById('authTaxiNumber').value.trim().toUpperCase() || "TAXI 0000";
    
    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", cred.user.uid), { email, taxiNumber: taxiNo, createdAt: new Date() });
            alert("Ο λογαριασμός δημιουργήθηκε!");
        }
    } catch (error) { alert("Σφάλμα σύνδεσης: " + error.message); }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        authScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        bottomNav.classList.remove('hidden');
        
        const driverName = user.email.split('@')[0].toUpperCase();
        document.getElementById('userDisplay').textContent = driverName;
        document.getElementById('idCardDriverName').textContent = driverName;
        document.getElementById('idCardDriverUid').textContent = user.uid.substring(0, 7).toUpperCase();
        
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            userTaxiNumber = userDoc.exists() ? (userDoc.data().taxiNumber || "TAXI 0000") : "TAXI 0000";
        } catch(e) { userTaxiNumber = "TAXI 0000"; }
        document.getElementById('idCardTaxiNumber').textContent = userTaxiNumber;

        applyTranslations();
        initKeyboardEngine();
        await fetchShiftsOnDemand();
    } else {
        currentUser = null;
        authScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
        bottomNav.classList.add('hidden');
    }
});

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = translations[currentLang]?.[key] || translations['el']?.[key];
        if (text) { el.textContent = text; }
    });
}

document.getElementById('langSelect').addEventListener('change', function() {
    currentLang = this.value;
    applyTranslations();
    renderDashboardAndLists();
});

document.getElementById('kmStart').addEventListener('input', calculateLiveKm);
document.getElementById('kmEnd').addEventListener('input', calculateLiveKm);

function calculateLiveKm() {
    const kmStart = parseInt(document.getElementById('kmStart').value) || 0;
    const kmEnd = parseInt(document.getElementById('kmEnd').value) || 0;
    const liveLbl = document.getElementById('liveKmCalculated');
    if (kmEnd > kmStart) { liveLbl.textContent = `+${kmEnd - kmStart} KM`; liveLbl.style.color = "#34d399"; }
    else { liveLbl.textContent = ""; }
}

function routeTo(tab) {
    homeTab.classList.add('hidden');
    historyTab.classList.add('hidden');
    formTab.classList.add('hidden');
    showHomeBtn.classList.remove('active');
    showHistoryBtn.classList.remove('active');
    
    if(tab === 'home') { homeTab.classList.remove('hidden'); showHomeBtn.classList.add('active'); }
    else if(tab === 'history') { historyTab.classList.remove('hidden'); showHistoryBtn.classList.add('active'); }
    else if(tab === 'form') { formTab.classList.remove('hidden'); }
}

showHomeBtn.addEventListener('click', () => { routeTo('home'); renderDashboardAndLists(); });
showHistoryBtn.addEventListener('click', () => { routeTo('history'); renderDashboardAndLists(); });

floatingAddBtn.addEventListener('click', () => { 
    resetFormState(); 
    routeTo('form'); 
    setTimeout(() => {
        document.getElementById('taximetro').focus();
    }, 150);
});

navLogoutBtn.addEventListener('click', () => signOut(auth));

document.getElementById('toggleAuth').addEventListener('click', function() {
    isLoginMode = !isLoginMode;
    const t = translations[currentLang] || translations['el'];
    document.getElementById('authTitle').textContent = isLoginMode ? t.authTitle : t.createTitle;
    document.getElementById('authSubmitBtn').textContent = isLoginMode ? t.loginBtn : t.registerBtn;
    this.textContent = isLoginMode ? t.createAccount : t.loginHere;
    document.getElementById('taxiIdFieldWrapper').classList.toggle('hidden', isLoginMode);
});

const initDate = new Date();
document.getElementById('date').valueAsDate = initDate;
document.getElementById('statsMonth').value = `${initDate.getFullYear()}-${String(initDate.getMonth() + 1).padStart(2, '0')}`;

async function fetchShiftsOnDemand() {
    if (!currentUser) return;
    try {
        const q = query(collection(db, "pro_shifts"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        allShiftsGlobal = [];
        
        querySnapshot.forEach((doc) => { 
            allShiftsGlobal.push({ id: doc.id, ...doc.data() }); 
        });

        allShiftsGlobal.sort((a,b) => b.date.localeCompare(a.date));

        if (allShiftsGlobal.length > 0 && !document.getElementById('editingShiftId').value) {
            document.getElementById('kmStart').value = allShiftsGlobal[0].kmEnd;
            document.getElementById('autoKmLbl').classList.remove('hidden');
        }
        renderDashboardAndLists();
    } catch(e) { 
        alert("Σφάλμα ανάγνωσης από Firebase: " + e.message); 
    }
}

document.getElementById('shiftForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!currentUser) return;

    const editingId = document.getElementById('editingShiftId').value;
    const shiftData = {
        date: document.getElementById('date').value,
        taximetro: parseFloat(document.getElementById('taximetro').value) || 0,
        kmStart: parseInt(document.getElementById('kmStart').value) || 0,
        kmEnd: parseInt(document.getElementById('kmEnd').value) || 0,
        metrita: parseFloat(document.getElementById('metrita').value) || 0,
        kartes: parseFloat(document.getElementById('kartes').value) || 0,
        freenow: parseFloat(document.getElementById('freenow').value) || 0,
        uber: parseFloat(document.getElementById('uber').value) || 0,
        tips: parseFloat(document.getElementById('tips').value) || 0,
        kausima: parseFloat(document.getElementById('kausima').value) || 0,
        service: parseFloat(document.getElementById('service').value) || 0,
        plysimo: parseFloat(document.getElementById('plysimo').value) || 0,
        allaExoda: parseFloat(document.getElementById('allaExoda').value) || 0,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        notes: document.getElementById('notes').value,
        timestamp: new Date().getTime()
    };

    shiftData.totalKm = shiftData.kmEnd - shiftData.kmStart;
    shiftData.synolikesEispraxeis = shiftData.metrita + shiftData.kartes + shiftData.freenow + shiftData.uber;
    shiftData.totalExpenses = shiftData.kausima + shiftData.service + shiftData.plysimo + shiftData.allaExoda;
    shiftData.katharoKerdos = (shiftData.synolikesEispraxeis + shiftData.tips) - shiftData.totalExpenses;

    if (shiftData.kmEnd <= shiftData.kmStart) {
        alert("Σφάλμα: Τα χιλιόμετρα λήξης πρέπει να είναι μεγαλύτερα από τα χιλιόμετρα έναρξης.");
        return;
    }

    try {
        if (editingId) {
            await updateDoc(doc(db, "pro_shifts", editingId), shiftData);
        } else {
            await addDoc(collection(db, "pro_shifts"), shiftData);
        }
        alert("Η βάρδια καταχωρήθηκε επιτυχώς στη βάση δεδομένων!");
        resetFormState();
        await fetchShiftsOnDemand();
        routeTo('home');
    } catch (error) { 
        alert("ΑΠΟΡΡΙΨΗ ΑΠΟ FIREBASE: " + error.message); 
    }
});

document.getElementById('statsMonth').addEventListener('change', renderDashboardAndLists);

function resetFormState() {
    document.getElementById('editingShiftId').value = "";
    document.getElementById('shiftForm').reset();
    document.getElementById('date').valueAsDate = new Date();
    document.getElementById('cancelEditBtn').classList.add('hidden');
    if(allShiftsGlobal.length > 0) {
        document.getElementById('kmStart').value = allShiftsGlobal[0].kmEnd;
        document.getElementById('autoKmLbl').classList.remove('hidden');
    }
}

window.startEditShift = function(id) {
    const shift = allShiftsGlobal.find(s => s.id === id);
    if (!shift) return;

    const t = translations[currentLang] || translations['el'];
    document.getElementById('editingShiftId').value = shift.id;
    document.getElementById('date').value = shift.date;
    document.getElementById('taximetro').value = shift.taximetro;
    document.getElementById('kmStart').value = shift.kmStart;
    document.getElementById('kmEnd').value = shift.kmEnd;
    document.getElementById('metrita').value = shift.metrita;
    document.getElementById('kartes').value = shift.kartes;
    document.getElementById('freenow').value = shift.freenow;
    document.getElementById('uber').value = shift.uber || 0;
    document.getElementById('tips').value = shift.tips;
    document.getElementById('kausima').value = shift.kausima;
    document.getElementById('service').value = shift.service;
    document.getElementById('plysimo').value = shift.plysimo;
    document.getElementById('allaExoda').value = shift.allaExoda;
    document.getElementById('notes').value = shift.notes || "";

    document.getElementById('cancelEditBtn').classList.remove('hidden');
    document.getElementById('saveShiftBtn').textContent = t.save;
    document.getElementById('formHeaderTitle').textContent = t.editShiftTitle;
    calculateLiveKm();
    routeTo('form');
};

function renderDashboardAndLists() {
    const selectedMonth = document.getElementById('statsMonth').value;
    const t = translations[currentLang] || translations['el'];

    if(selectedMonth && t.months) {
        const parts = selectedMonth.split('-');
        document.getElementById('monthHeaderTitle').textContent = `${t.months[parseInt(parts[1])-1]} ${parts[0]}`;
    }

    let monthGross = 0, monthExp = 0, monthNet = 0, monthKm = 0, shiftCount = 0;
    let tCash = 0, tCards = 0, tFree = 0, tUber = 0;
    
    let tFuel = 0, tService = 0, tWash = 0, tOtherExp = 0;

    let trendLabels = [];
    let trendGrossData = [];
    let trendNetData = [];

    const recentList = document.getElementById('recentShiftsList');
    const fullList = document.getElementById('fullHistoryList');
    if(recentList) recentList.innerHTML = "";
    if(fullList) fullList.innerHTML = "";

    const chronologicalShifts = [...allShiftsGlobal].reverse();
    chronologicalShifts.forEach((data) => {
        if (selectedMonth && !data.date.startsWith(selectedMonth)) return;
        
        try {
            const parts = data.date.split('-');
            trendLabels.push(`${parts[2]}/${parts[1]}`);
        } catch(e) { trendLabels.push(data.date); }
        
        trendGrossData.push(data.synolikesEispraxeis || 0);
        trendNetData.push(data.katharoKerdos || 0);
    });

    allShiftsGlobal.forEach((data) => {
        if (selectedMonth && !data.date.startsWith(selectedMonth)) return;

        monthGross += data.synolikesEispraxeis || 0;
        monthExp += data.totalExpenses || 0;
        monthNet += data.katharoKerdos || 0;
        monthKm += data.totalKm || 0;
        shiftCount++;

        tCash += data.metrita || 0;
        tCards += data.kartes || 0;
        tFree += data.freenow || 0;
        tUber += data.uber || 0;

        tFuel += data.kausima || 0;
        tService += data.service || 0;
        tWash += data.plysimo || 0;
        tOtherExp += data.allaExoda || 0;

        let dateDisplay = data.date;
        try {
            const parts = data.date.split('-');
            dateDisplay = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } catch(e) {}

        const cardHtml = `
            <div class="app-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <span style="font-size: 10px; color: #525252; font-weight: bold; display: block; margin-bottom: 2px;">${dateDisplay}</span>
                        <span style="font-size: 1.35rem; font-weight: 900; color: #eab308; font-family: monospace;">${(data.katharoKerdos || 0).toFixed(2)} €</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 8px; font-weight: bold; color: #525252; display: block;">${t.gross}</span>
                        <span style="font-size: 0.8rem; font-weight: bold; color: #d4d4d4; display: block;">${(data.synolikesEispraxeis || 0).toFixed(2)} €</span>
                        <span style="font-size: 10px; font-weight: 500; color: #ef4444; display: block; margin-top: 1px;">-${(data.totalExpenses || 0).toFixed(0)} €</span>
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-1-5" style="margin-top: 10px; border-top: 1px solid #141414; padding-top: 8px; text-align: center;">
                    <div class="sub-box">
                        <span style="font-size: 8px; color: #525252; font-weight: bold; display: block;">${t.cash}</span>
                        <span style="font-size: 10px; font-weight: bold; color: #34d399;">${(data.metrita || 0).toFixed(0)} €</span>
                    </div>
                    <div class="sub-box">
                        <span style="font-size: 8px; color: #525252; font-weight: bold; display: block;">${t.cards}</span>
                        <span style="font-size: 10px; font-weight: bold; color: #a3a3a3;">${(data.kartes || 0).toFixed(0)} €</span>
                    </div>
                    <div class="sub-box">
                        <span style="font-size: 8px; color: #525252; font-weight: bold; display: block;">${t.free}</span>
                        <span style="font-size: 10px; font-weight: bold; color: #a3a3a3;">${(data.freenow || 0).toFixed(0)} €</span>
                    </div>
                    <div class="sub-box">
                        <span style="font-size: 8px; color: #525252; font-weight: bold; display: block;">${t.km}</span>
                        <span style="font-size: 10px; font-weight: bold; color: #a3a3a3;">${data.totalKm || 0} km</span>
                    </div>
                </div>
                <div style="display: flex; justify-content: flex-end; margin-top: 10px; border-top: 1px solid #141414; padding-top: 8px;">
                    <button onclick="startEditShift('${data.id}')" style="background: none; border: none; color: #737373; font-size: 11px; font-weight: bold; cursor: pointer;">${t.editBtn}</button>
                </div>
            </div>`;

        if (recentList && shiftCount <= 5) { recentList.insertAdjacentHTML('beforeend', cardHtml); }
        if (fullList) { fullList.insertAdjacentHTML('beforeend', cardHtml); }
    });

    document.getElementById('dashNet').textContent = monthNet.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    document.getElementById('dashGross').textContent = monthGross.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    document.getElementById('dashExp').textContent = monthExp.toLocaleString('el-GR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
    document.getElementById('dashKm').textContent = monthKm.toLocaleString('el-GR') + " km";
    document.getElementById('dashShiftCount').textContent = `${shiftCount} ${t.shiftCountText || 'βάρδιες αυτόν τον μήνα'}`;

    if(document.getElementById('analyticsChart')) {
        renderAnalyticsChart(tCash, tCards, tFree, tUber);
    }
    if(document.getElementById('expensesChart')) {
        renderExpensesChart(tFuel, tService, tWash, tOtherExp);
    }
    if(document.getElementById('trendChart')) {
        renderTrendChart(trendLabels, trendGrossData, trendNetData);
    }
}

function renderAnalyticsChart(cash, cards, freenow, uber) {
    const canvas = document.getElementById('analyticsChart');
    if(!canvas) return;
    if (statsChartInstance) { statsChartInstance.destroy(); }
    
    const total = cash + cards + freenow + uber;
    const dataSet = total === 0 ? [1] : [cash, cards, freenow, uber];
    const colorSet = total === 0 ? ['#1f1f1f'] : ['#34d399', '#eab308', '#d97706', '#60a5fa'];

    statsChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Cash', 'POS', 'FREE', 'Uber'],
            datasets: [{ data: dataSet, backgroundColor: colorSet, borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%' }
    });
}

function renderExpensesChart(fuel, service, wash, other) {
    const canvas = document.getElementById('expensesChart');
    if(!canvas) return;
    if (expensesChartInstance) { expensesChartInstance.destroy(); }

    const t = translations[currentLang] || translations['el'];
    const total = fuel + service + wash + other;
    const dataSet = total === 0 ? [1] : [fuel, service, wash, other];
    const colorSet = total === 0 ? ['#1f1f1f'] : ['#ef4444', '#f97316', '#06b6d4', '#737373'];

    expensesChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [t.fuel, t.service, t.wash, t.otherExp],
            datasets: [{ data: dataSet, backgroundColor: colorSet, borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%' }
    });
}

function renderTrendChart(labels, grossData, netData) {
    const canvas = document.getElementById('trendChart');
    if(!canvas) return;
    if (trendChartInstance) { trendChartInstance.destroy(); }

    const t = translations[currentLang] || translations['el'];

    trendChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels.length === 0 ? ['-'] : labels,
            datasets: [
                {
                    label: t.grossLabel || 'Μικτά',
                    data: grossData.length === 0 ? [0] : grossData,
                    borderColor: '#eab308',
                    backgroundColor: 'rgba(234, 179, 8, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: t.netLabel || 'Καθαρά',
                    data: netData.length === 0 ? [0] : netData,
                    borderColor: '#34d399',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, labels: { color: '#737373', boxWidth: 12, font: { size: 9 } } } },
            scales: {
                x: { grid: { color: '#141414' }, ticks: { color: '#525252', font: { size: 9 } } },
                y: { grid: { color: '#141414' }, ticks: { color: '#525252', font: { size: 9 } } }
            }
        }
    });
}
