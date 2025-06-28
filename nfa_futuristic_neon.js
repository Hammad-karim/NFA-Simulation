let states = [];
let startState = "";
let acceptStates = [];
let transitions = {};

let canvas = document.getElementById('nfa-canvas');
let ctx = canvas.getContext('2d');
let positions = {};

function createNFA() {
    const statesInput = document.getElementById("states").value.trim();
    const startStateInput = document.getElementById("startState").value.trim();
    const acceptStatesInput = document.getElementById("acceptStates").value.trim();
    const transitionsInput = document.getElementById("transitions").value.trim();

    if (!statesInput || !startStateInput || !acceptStatesInput || !transitionsInput) {
        alert("Please fill in all fields.");
        return;
    }

    states = statesInput.split(",").map(s => s.trim());
    startState = startStateInput;
    acceptStates = acceptStatesInput.split(",").map(s => s.trim());

    if (!states.includes(startState) || !acceptStates.every(s => states.includes(s))) {
        alert("Start state and accepting states must be valid states.");
        return;
    }

    transitions = {};
    let transitionsLines = transitionsInput.split("\n");
    for (let line of transitionsLines) {
        let parts = line.trim().split(" ");
        if (parts.length !== 3) continue;
        let [from, symbol, toStatesStr] = parts;
        let toStates = toStatesStr.split(",").map(s => s.trim());

        if (!states.includes(from) || !toStates.every(s => states.includes(s))) continue;

        if (!transitions[from]) transitions[from] = {};
        transitions[from][symbol] = toStates;
    }

    document.getElementById("nfa-input-form").style.display = "none";
    document.getElementById("nfa-simulation").style.display = "block";

    resizeCanvas();
    drawNFA();
}

function resizeCanvas() {
    const container = document.querySelector('.canvas-container');
    canvas.width = Math.min(800, container.clientWidth - 40);
    canvas.height = 400;
}

function drawNFA(currentStates = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let gap = canvas.width / (states.length + 1);
    positions = {};

    states.forEach((state, idx) => {
        positions[state] = { x: (idx + 1) * gap, y: canvas.height / 2 };
    });

    // Draw transitions
    ctx.strokeStyle = '#00d4ff';
    ctx.fillStyle = '#00d4ff';
    ctx.font = "16px Orbitron";
    for (let fromState in transitions) {
        for (let symbol in transitions[fromState]) {
            for (let toState of transitions[fromState][symbol]) {
                drawArrow(positions[fromState], positions[toState], symbol, fromState === toState);
            }
        }
    }

    // Draw states
    states.forEach((state) => {
        let { x, y } = positions[state];
        ctx.beginPath();
        ctx.arc(x, y, 45, 0, 2 * Math.PI);
        ctx.fillStyle = currentStates.includes(state) ? '#ff00ff' : acceptStates.includes(state) ? '#39ff14' : '#00d4ff';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#1b263b';
        ctx.stroke();

        // Double circle for accepting states
        if (acceptStates.includes(state)) {
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Glow effect
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = currentStates.includes(state) ? 'rgba(255, 0, 255, 0.5)' : acceptStates.includes(state) ? 'rgba(57, 255, 20, 0.5)' : 'rgba(0, 212, 255, 0.5)';
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#1b263b';
        ctx.font = "18px Orbitron";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state, x, y);
    });

    // Draw start state indicator
    if (startState && positions[startState]) {
        let { x, y } = positions[startState];
        ctx.beginPath();
        ctx.moveTo(x - 70, y);
        ctx.lineTo(x - 45, y);
        ctx.lineTo(x - 55, y - 10);
        ctx.moveTo(x - 45, y);
        ctx.lineTo(x - 55, y + 10);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#00d4ff';
        ctx.stroke();
    }
}

function drawArrow(from, to, label, selfLoop = false) {
    ctx.beginPath();
    ctx.lineWidth = 2;

    if (selfLoop) {
        // Draw a more elegant loop arrow
        const radius = 30;
        const startAngle = Math.PI / 4;
        const endAngle = 2 * Math.PI - Math.PI / 4;
        ctx.arc(from.x, from.y - 45, radius, startAngle, endAngle);
        ctx.stroke();

        // Arrowhead
        const arrowX = from.x + radius * Math.cos(endAngle);
        const arrowY = (from.y - 45) + radius * Math.sin(endAngle);
        const angle = endAngle + Math.PI / 2;
        const headlen = 10;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - headlen * Math.cos(angle - Math.PI / 6), arrowY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(arrowX - headlen * Math.cos(angle + Math.PI / 6), arrowY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.lineTo(arrowX, arrowY);
        ctx.fillStyle = '#00d4ff';
        ctx.fill();

        ctx.fillText(label, from.x, from.y - 85);
        return;
    }

    const offset = 45;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const startX = from.x + Math.cos(angle) * offset;
    const startY = from.y + Math.sin(angle) * offset;
    const endX = to.x - Math.cos(angle) * offset;
    const endY = to.y - Math.sin(angle) * offset;

    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const headlen = 15;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(endX, endY);
    ctx.fillStyle = '#00d4ff';
    ctx.fill();

    ctx.fillText(label, (startX + endX) / 2, (startY + endY) / 2 - 15);
}

function startSimulation() {
    const input = document.getElementById("inputString").value.trim();
    if (!input) {
        alert("Please enter a string.");
        return;
    }

    let currentStates = [startState];
    drawNFA(currentStates);

    let i = 0;
    function step() {
        if (i >= input.length) {
            const accepted = currentStates.some(s => acceptStates.includes(s));
            document.getElementById("result").textContent = accepted ? "Accepted ✅" : "Rejected ❌";
            document.getElementById("result").className = accepted ? "result accepted" : "result rejected";
            return;
        }

        const symbol = input[i];
        let nextStates = [];

        for (let state of currentStates) {
            if (transitions[state] && transitions[state][symbol]) {
                nextStates.push(...transitions[state][symbol]);
            }
        }

        currentStates = [...new Set(nextStates)];
        drawNFA(currentStates);
        i++;
        setTimeout(step, 800);
    }

    step();
}

function resetNFA() {
    document.getElementById("nfa-input-form").style.display = "block";
    document.getElementById("nfa-simulation").style.display = "none";
    document.getElementById("states").value = "";
    document.getElementById("startState").value = "";
    document.getElementById("acceptStates").value = "";
    document.getElementById("transitions").value = "";
    document.getElementById("inputString").value = "";
    document.getElementById("result").textContent = "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Resize canvas on window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    drawNFA();
});