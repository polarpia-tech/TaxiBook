export function toggleVisibility(elementId, isVisible) {
    const el = document.getElementById(elementId);
    if (el) isVisible ? el.classList.remove('hidden') : el.classList.add('hidden');
}

export function updateDashboard(total) {
    const el = document.getElementById('dashGross');
    if (el) el.textContent = total.toFixed(2) + " €";
}
