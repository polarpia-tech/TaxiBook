let chartInstance = null;

export function renderChart(canvasId, totalData) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Καταστροφή προηγούμενου γραφήματος αν υπάρχει
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cash', 'POS', 'FREE', 'Uber'],
            datasets: [{
                data: totalData, // Πίνακας με τα ποσά [cash, cards, freenow, uber]
                backgroundColor: ['#34d399', '#eab308', '#d97706', '#60a5fa']
            }]
        },
        options: { responsive: true, plugins: { legend: { display: true } } }
    });
}
