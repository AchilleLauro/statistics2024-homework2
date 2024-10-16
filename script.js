const serverPenCtx = document.getElementById('serverPenetrationChart').getContext('2d');
const attackerDistCtx = document.getElementById('attackerDistributionChart').getContext('2d');
let serverPenetrationGraph, attackerDistGraph;

function createPenetrationData(numServers, numAttackers, successProb) {
    const attackResults = Array.from({ length: numAttackers }, () => [0]);
    const finalPenetrations = Array(numAttackers).fill(0);

    for (let attacker = 0; attacker < numAttackers; attacker++) {
        let penetrations = 0;
        for (let server = 1; server <= numServers; server++) {
            let jump = (Math.random() < successProb) ? 1 : -1;  // Jump -1 or +1 based on probability
            penetrations += jump;
            attackResults[attacker].push(penetrations);
        }
        finalPenetrations[attacker] = penetrations;
    }

    const penetrationDistribution = finalPenetrations.reduce((acc, numPenetrations) => {
        acc[numPenetrations] = (acc[numPenetrations] || 0) + 1;
        return acc;
    }, {});

    return { attackResults, penetrationDistribution };
}

function recursiveAverage(arr, sum = 0, index = 0) {
    if (index === arr.length) {
        return sum / arr.length;
    }
    return recursiveAverage(arr, sum + arr[index], index + 1);
}

function recursiveVariance(arr, mean, sumSquaredDiff = 0, index = 0) {
    if (index === arr.length) {
        return sumSquaredDiff / arr.length;
    }
    const squaredDiff = (arr[index] - mean) ** 2;
    return recursiveVariance(arr, mean, sumSquaredDiff + squaredDiff, index + 1);
}

function calculateStatistics(atStep, attackResults) {
    const stepResults = attackResults.map(results => results[atStep] || 0);
    const mean = recursiveAverage(stepResults);
    const variance = recursiveVariance(stepResults, mean);
    return { mean, variance };
}

function drawPenetrationGraph(numServers, numAttackers, successProb) {
    const { attackResults, penetrationDistribution } = createPenetrationData(numServers, numAttackers, successProb);
    const labels = Array.from({ length: numServers }, (_, i) => `${i + 1}`);
    const attackerDatasets = attackResults.map((attackerData, idx) => ({
        label: `Attacker ${idx + 1}`,
        data: attackerData,
        borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
        fill: false,
        stepped: true,
        borderWidth: 2
    }));

    if (serverPenetrationGraph) {
        serverPenetrationGraph.data.labels = ['Start', ...labels];
        serverPenetrationGraph.data.datasets = attackerDatasets;
        serverPenetrationGraph.options.scales.y.max = numServers;
        serverPenetrationGraph.update();
    } else {
        serverPenetrationGraph = new Chart(serverPenCtx, {
            type: 'line',
            data: {
                labels: ['Start', ...labels],
                datasets: attackerDatasets
            },
            options: {
                scales: {
                    y: { min: 0, max: numServers, grid: { display: false }, ticks: { color: '#999' } },
                    x: { grid: { display: false }, ticks: { color: '#999' } }
                },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
            }
        });
    }

    drawAttackerDistribution(penetrationDistribution, numServers);

    // Calcola e mostra la statistica per il passo temporale selezionato
    const stepToAnalyze = Math.floor(numServers / 2);  // Step selezionato arbitrariamente per esempio
    const stats = calculateStatistics(stepToAnalyze, attackResults);
    document.getElementById('mean').textContent = stats.mean.toFixed(5);
    document.getElementById('variance').textContent = stats.variance.toFixed(5);
}

function drawAttackerDistribution(penetrationDistribution, numServers) {
    const labels = Array.from({ length: numServers + 1 }, (_, i) => `${i}`);
    const distData = labels.map(label => penetrationDistribution[label] || 0);

    if (attackerDistGraph) {
        attackerDistGraph.data.labels = labels;
        attackerDistGraph.data.datasets[0].data = distData;
        attackerDistGraph.update();
    } else {
        attackerDistGraph = new Chart(attackerDistCtx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data: distData,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: { grid: { display: false }, ticks: { color: '#999' } },
                    x: { grid: { display: false }, ticks: { color: '#999' } }
                },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
            }
        });
    }
}

document.getElementById('configForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const numServers = parseInt(document.getElementById('serverCount').value);
    const numAttackers = parseInt(document.getElementById('hackerCount').value);
    const successProb = parseFloat(document.getElementById('penetrationProb').value);
    drawPenetrationGraph(numServers, numAttackers, successProb);
});

drawPenetrationGraph(10, 5, 0.5);
