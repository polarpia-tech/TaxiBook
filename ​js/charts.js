let chartInstance = null;
export function renderChart(canvasId, dataArray) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cash', 'POS', 'FREE', 'Uber'],
            datasets: [{ data: dataArray, backgroundColor: ['#34d399', '#eab308', '#d97706', '#60a5fa'] }]
        },
        options: { responsive: true, plugins: { legend: { display: true } } }
    });
}
