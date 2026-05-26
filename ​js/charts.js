let statsChartInstance = null;
let expensesChartInstance = null;
let trendChartInstance = null;

export function renderAnalyticsChart(canvas, cash, cards, freenow, uber) {
    if (statsChartInstance) statsChartInstance.destroy();
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

export function renderExpensesChart(canvas, fuel, service, wash, other, labels) {
    if (expensesChartInstance) expensesChartInstance.destroy();
    const total = fuel + service + wash + other;
    const dataSet = total === 0 ? [1] : [fuel, service, wash, other];
    const colorSet = total === 0 ? ['#1f1f1f'] : ['#ef4444', '#f97316', '#06b6d4', '#737373'];

    expensesChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{ data: dataSet, backgroundColor: colorSet, borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%' }
    });
}

export function renderTrendChart(canvas, labels, grossData, netData, langLabels) {
    if (trendChartInstance) trendChartInstance.destroy();
    trendChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels.length === 0 ? ['-'] : labels,
            datasets: [
                { label: langLabels.gross, data: grossData, borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.1)', tension: 0.3, fill: true },
                { label: langLabels.net, data: netData, borderColor: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', tension: 0.3, fill: true }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } }
    });
}
