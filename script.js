const serverPenCtx = document.getElementById('serverPenetrationChart').getContext('2d');
const attackerDistCtx = document.getElementById('attackerDistributionChart').getContext('2d');
let serverPenetrationGraph, attackerDistGraph;

// Funzione per creare i dati delle penetrazioni, con salti -1/+1 (random walk)
function createPenetrationData(numServers, numAttackers, successProb) {
    const attackResults = Array.from({ length: numAttackers }, () => [0]);
    const finalPenetrations = Array(numAttackers).fill(0);

    // Simulazione del random walk per gli attaccanti
    for (let attacker = 0; attacker < numAttackers; attacker++) {
        let penetrations = 0;
        for (let server = 1; server <= numServers; server++) {
            let jump = Math.random() < successProb ? 1 : -1;  // Salti -1/+1
            penetrations += jump;  // Aggiorna la penetrazione con il salto
            attackResults[attacker].push(penetrations);  // Salva i risultati
        }
        finalPenetrations[attacker] = penetrations;  // Salva il risultato finale
    }

    // Calcola la distribuzione delle penetrazioni finali
    const penetrationDistribution = finalPenetrations.reduce((acc, numPenetrations) => {
        acc[numPenetrations] = (acc[numPenetrations] || 0) + 1;
        return acc;
    }, {});

    return { attackResults, penetrationDistribution };
}

// Funzione per disegnare il grafico delle penetrazioni con traiettorie assolute e relative
function drawPenetrationGraph(numServers, numAttackers, successProb) {
    const { attackResults, penetrationDistribution } = createPenetrationData(numServers, numAttackers, successProb);
    const labels = Array.from({ length: numServers }, (_, i) => `${i + 1}`);
    
    // Dataset per ogni attaccante
    const attackerDatasets = attackResults.map((attackerData, idx) => ({
        label: `Attacker ${idx + 1}`,
        data: attackerData,
        borderColor: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, 0.9)`,
        fill: false,
        stepped: true,
        borderWidth: 2
    }));

    // Aggiorna o crea il grafico delle penetrazioni
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
}

// Funzione per disegnare la distribuzione assoluta delle penetrazioni degli attaccanti
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

// Funzione per calcolare la media e la varianza
function calculateMeanAndVariance(data) {
    const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
    const variance = data.reduce((sum, value) => sum + (value - mean) ** 2, 0) / data.length;
    return { mean, variance };
}

// Seleziona uno step intermedio dal GUI e calcola la media e la varianza
function displayStatsAtStep(attackResults, step) {
    const stepData = attackResults.map(trajectory => trajectory[step]);
    const { mean, variance } = calculateMeanAndVariance(stepData);
    
    document.getElementById('meanValue').innerText = mean.toFixed(2);
    document.getElementById('varianceValue').innerText = variance.toFixed(2);
}

// Event listener per la sottomissione del form
document.getElementById('configForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const numServers = parseInt(document.getElementById('serverCount').value);
    const numAttackers = parseInt(document.getElementById('hackerCount').value);
    const successProb = parseFloat(document.getElementById('penetrationProb').value);
    drawPenetrationGraph(numServers, numAttackers, successProb);
    displayStatsAtStep(attackResults, numServers / 2);  // Statistiche a uno step intermedio (es. metà)
});

// Disegna inizialmente il grafico con valori di esempio
drawPenetrationGraph(10, 5, 0.5);

