const serverPenCtx = document.getElementById('serverPenetrationChart').getContext('2d');
const attackerDistCtx = document.getElementById('attackerDistributionChart').getContext('2d');
let serverPenetrationGraph, attackerDistGraph;

function createPenetrationData(numServers, numAttackers, successProb, isRelative = false) {
    const attackResults = Array.from({ length: numAttackers }, () => [0]);
    const finalPenetrations = Array(numAttackers).fill(0);
    const savedScores = [];

    for (let attacker = 0; attacker < numAttackers; attacker++) {
        let penetrations = 0;
        for (let server = 1; server <= numServers; server++) {
            penetrations += Math.random() < successProb ? 1 : -1;
            const totalToPush = isRelative ? penetrations / numServers : penetrations;
            attackResults[attacker].push(totalToPush);

            if (server === numServers - 1) {
                savedScores.push(totalToPush);
            }
        }
        finalPenetrations[attacker] = isRelative ? penetrations / numServers : penetrations;
    }

    const penetrationDistribution = finalPenetrations.reduce((acc, numPenetrations) => {
        acc[numPenetrations] = (acc[numPenetrations] || 0) + 1;
        return acc;
    }, {});

    const mean = finalPenetrations.reduce((sum, x) => sum + x, 0) / numAttackers;
    let variance = finalPenetrations.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / numAttackers;

    return { attackResults, penetrationDistribution, mean, variance, savedScores };
}

function drawPenetrationGraph(numServers, numAttackers, successProb, isRelative = false) {
    const { attackResults, penetrationDistribution, mean, variance, savedScores } = createPenetrationData(numServers, numAttackers, successProb, isRelative);
    const labels = Array.from({ length: numServers }, (_, i) => `${i + 1}`);
    const attackerDatasets = attackResults.map((attackerData, idx) => ({
        label: `Attacker ${idx + 1}`,
        data: attackerData,
        borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
        fill: false,
        stepped: true,
        borderWidth: 2
    }));

    const yMin = isRelative ? -1 : -numServers;
    const yMax = isRelative ? 1 : numServers;

    if (serverPenetrationGraph) {
        serverPenetrationGraph.data.labels = ['Start', ...labels];
        serverPenetrationGraph.data.datasets = attackerDatasets;
        serverPenetrationGraph.options.scales.y.min = yMin;
        serverPenetrationGraph.options.scales.y.max = yMax;
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
                    y: { 
                        min: yMin,
                        max: yMax,
                        grid: { display: false }, 
                        ticks: { color: '#999' } 
                    },
                    x: { grid: { display: false }, ticks: { color: '#999' } }
                },
                plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } }
            }
        });
    }

    drawAttackerDistribution(penetrationDistribution, numServers, mean, variance, isRelative, savedScores);
}

function drawAttackerDistribution(penetrationDistribution, numServers, mean, variance, isRelative, savedScores) {
    let minXValue = Math.min(...savedScores);
    let maxXValue = Math.max(...savedScores);

    if (isRelative) {
        minXValue = Math.floor(minXValue * 10) / 10;
        maxXValue = Math.ceil(maxXValue * 10) / 10;
    }

    const stepSize = isRelative ? 0.1 : 1;
    const labels = Array.from({ length: Math.ceil((maxXValue - minXValue) / stepSize) + 1 }, (_, i) => (minXValue + i * stepSize).toFixed(1));

    const distData = labels.map(label => {
        const floatLabel = parseFloat(label);
        return savedScores.filter(score => Math.abs(score - floatLabel) < stepSize / 2).length;
    });

    const maxYValue = Math.max(...distData);

    if (attackerDistGraph) {
        attackerDistGraph.data.labels = labels;
        attackerDistGraph.data.datasets[0].data = distData;
        attackerDistGraph.options.scales.y.max = maxYValue;
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
                    y: {
                        min: 0,
                        max: maxYValue,
                        grid: { display: false }, 
                        ticks: { color: '#999' }
                    },
                    x: {
                        grid: { display: false }, 
                        ticks: { color: '#999' }
                    }
                },
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { mode: 'index', intersect: false } 
                }
            }
        });
    }

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

drawPenetrationGraph(100, 50, 0.5);
