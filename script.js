const serverPenCtx = document.getElementById('serverPenetrationChart').getContext('2d');
const attackerDistCtx = document.getElementById('attackerDistributionChart').getContext('2d');
let serverPenetrationGraph, attackerDistGraph;

document.getElementById('submitButton').addEventListener('click', function() {
    const numAttackers = parseInt(document.getElementById('hackerCount').value);
    const numServers = parseInt(document.getElementById('serverCount').value);
    const probability = parseFloat(document.getElementById('penetrationProb').value);

    drawChartAbsolute(numAttackers, numServers, probability);
});

document.getElementById('submitButton2').addEventListener('click', function() {
    const numAttackers = parseInt(document.getElementById('hackerCount').value);
    const numServers = parseInt(document.getElementById('serverCount').value);
    const probability = parseFloat(document.getElementById('penetrationProb').value);

    drawChartRelative(numAttackers, numServers, probability);
});

function createPenetrationData(numServers, numAttackers, successProb) {
    const attackResults = Array.from({ length: numAttackers }, () => [0]);
    const finalPenetrations = Array(numAttackers).fill(0);

    for (let attacker = 0; attacker < numAttackers; attacker++) {
        let penetrations = 0;
        for (let server = 1; server <= numServers; server++) {
            let jump = (Math.random() < successProb) ? 1 : -1;
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

function drawChartAbsolute(numAttackers, numServers, probability) {
    const { attackResults, penetrationDistribution } = createPenetrationData(numServers, numAttackers, probability);

    if (serverPenetrationGraph) {
        serverPenetrationGraph.data.datasets = attackResults.map((attackerData, idx) => ({
            label: `Attacker ${idx + 1}`,
            data: attackerData,
            borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
            fill: false,
            borderWidth: 2,
        }));
        serverPenetrationGraph.update();
    } else {
        serverPenetrationGraph = new Chart(serverPenCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: numServers + 1 }, (_, i) => `${i}`),
                datasets: attackResults.map((attackerData, idx) => ({
                    label: `Attacker ${idx + 1}`,
                    data: attackerData,
                    borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
                    fill: false,
                    borderWidth: 2,
                })),
            },
            options: {
                scales: {
                    y: { min: -numServers, max: numServers },
                    x: { grid: { display: false } },
                },
            },
        });
    }

    drawAttackerDistribution(penetrationDistribution, numServers);
}

function drawChartRelative(numAttackers, numServers, probability) {
    const { attackResults } = createPenetrationData(numServers, numAttackers, probability);

    if (serverPenetrationGraph) {
        serverPenetrationGraph.data.datasets = attackResults.map((attackerData, idx) => ({
            label: `Attacker ${idx + 1}`,
            data: attackerData.map((val, i) => val / (i + 1)),
            borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
            fill: false,
            borderWidth: 2,
        }));
        serverPenetrationGraph.update();
    } else {
        serverPenetrationGraph = new Chart(serverPenCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: numServers + 1 }, (_, i) => `${i}`),
                datasets: attackResults.map((attackerData, idx) => ({
                    label: `Attacker ${idx + 1}`,
                    data: attackerData.map((val, i) => val / (i + 1)),
                    borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
                    fill: false,
                    borderWidth: 2,
                })),
            },
            options: {
                scales: {
                    y: { min: -1, max: 1 },
                    x: { grid: { display: false } },
                },
            },
        });
    }
}

function drawAttackerDistribution(penetrationDistribution, numServers) {
    const labels = Array.from({ length: numServers +Ecco il codice completo richiesto, organizzato per l'HTML, il CSS e il JavaScript.

