const serverPenCtx = document.getElementById('serverPenetrationChart').getContext('2d');
const attackerDistCtx = document.getElementById('attackerDistributionChart').getContext('2d');
let serverPenetrationGraph, attackerDistGraph;

function createPenetrationData(numServers, numAttackers, successProb, isRelative = false) {
    const attackResults = Array.from({ length: numAttackers }, () => [0]);
    const finalPenetrations = Array(numAttackers).fill(0);

    for (let attacker = 0; attacker < numAttackers; attacker++) {
        let penetrations = 0;
        for (let server = 1; server <= numServers; server++) {
            // Simulate jumps of -1 or +1 with probability p (random walk)
            penetrations += Math.random() < successProb ? 1 : -1;
            attackResults[attacker].push(penetrations);
        }
        finalPenetrations[attacker] = penetrations;
    }

    const penetrationDistribution = finalPenetrations.reduce((acc, numPenetrations) => {
        acc[numPenetrations] = (acc[numPenetrations] || 0) + 1;
        return acc;
    }, {});

    // Calculate mean and variance
    const mean = finalPenetrations.reduce((sum, x) => sum + x, 0) / numAttackers;
    const variance = finalPenetrations.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / numAttackers;

    if (isRelative) {
        // Calculate relative frequency
        const total = numAttackers;
        for (let key in penetrationDistribution) {
            penetrationDistribution[key] = (penetrationDistribution[key] / total).toFixed(4);
        }
    }

    return { attackResults, penetrationDistribution, mean, variance };
}

function drawPenetrationGraph(numServers, numAttackers, successProb, isRelative = false) {
    const { attackResults, penetrationDistribution, mean, variance } = createPenetrationData(numServers, numAttackers, successProb, isRelative);
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
        serverPenetrationGraph.options.scales.y.min = -numServers;
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
                    y: { min: -numServers, max: numServers, grid: { display: false }, ticks: { color: '#999' } },
                    x: { grid: { display: false }, ticks: { color: '#999' } }
                },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
            }
        });
    }

    drawAttackerDistribution(penetrationDistribution, numServers, mean, variance);
}

function drawAttackerDistribution(penetrationDistribution, numServers, mean, variance) {
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

    // Display mean and variance
    document.getElementById('mean').textContent = `Mean: ${mean.toFixed(4)}`;
    document.getElementById('variance').textContent = `Variance: ${variance.toFixed(4)}`;
}

document.getElementById('absoluteFreqBtn').addEventListener('click', function() {
    const numServers = parseInt(document.getElementById('serverCount').value);
    const numAttackers = parseInt(document.getElementById('hackerCount').value);
    const successProb = parseFloat(document.getElementById('penetrationProb').value);
    drawPenetrationGraph(numServers, numAttackers, successProb, false);
});

document.getElementById('relativeFreqBtn').addEventListener('click', function() {
    const numServers = parseInt(document.getElementById('serverCount').value);
    const numAttackers = parseInt(document.getElementById('hackerCount').value);
    const successProb = parseFloat(document.getElementById('penetrationProb').value);
    drawPenetrationGraph(numServers, numAttackers, successProb, true);
});

// Initial call
drawPenetrationGraph(10, 5, 0.5);


