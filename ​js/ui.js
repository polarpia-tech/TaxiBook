export function toggleVisibility(elementId, isVisible) {
    const el = document.getElementById(elementId);
    if (el) {
        isVisible ? el.classList.remove('hidden') : el.classList.add('hidden');
    }
}

export function updateDashboard(shifts) {
    // Υπολογίζουμε τα σύνολα από τις βάρδιες
    let totalGross = 0;
    shifts.forEach(s => {
        totalGross += (parseFloat(s.cash) || 0) + (parseFloat(s.cards) || 0) + 
                      (parseFloat(s.freenow) || 0) + (parseFloat(s.uber) || 0);
    });

    // Εμφάνιση των δεδομένων στο HTML
    const dashElement = document.getElementById('dashGross');
    if (dashElement) {
        dashElement.textContent = totalGross.toFixed(2) + " €";
    }
    
    console.log("Dashboard updated with:", totalGross);
}
