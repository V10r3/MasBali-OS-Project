let processes = [];

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

document.getElementById('generate-random').addEventListener('click', () => {
    const count = parseInt(document.getElementById('rand-count').value);
    const maxJob = parseInt(document.getElementById('rand-max').value);

    if (isNaN(count) || isNaN(maxJob) || count < 1 || maxJob < 1) {
        alert('Please enter valid numbers for count and max job length.');
        return;
    }

    for (let i = 0; i < count; i++) {
        const pid = (processes.length + 1).toString();
        const arrivalTime = randInt(0, maxJob);
        const burstTime = randInt(1, maxJob);
        const queue = randInt(0, 3);
        processes.push({ pid, arrivalTime, burstTime, queue });
    }
    updateProcessList();
});

document.getElementById('process-form').addEventListener('submit', e => {
    e.preventDefault();
    const pid = document.getElementById('pid').value;
    const arrival = parseInt(document.getElementById('arrival').value);
    const burst = parseInt(document.getElementById('burst').value);
    const queue = parseInt(document.getElementById('queue').value);

    processes.push({ pid, arrivalTime: arrival, burstTime: burst, queue });
    updateProcessList();
    document.getElementById('process-form').reset();
});

function updateProcessList() {
    const tbody = document.querySelector('#process-list tbody');
    tbody.innerHTML = '';
    processes.forEach(p => {
        const row = document.createElement('tr');
        row.innerHTML = `
  <td>${p.pid}</td>
  <td>${p.arrivalTime}</td>
  <td>${p.burstTime}</td>
  <td>${p.queue}</td>
  <td>
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" id="progress-${p.pid}" style="width:0%"></div>
    </div>
  </td>
`;
        tbody.appendChild(row);
    });
}

document.getElementById('algorithm').addEventListener('change', e => {
    document.getElementById('mlfq-settings').style.display = e.target.value === 'mlfq' ? 'block' : 'none';
});

document.getElementById('reset').addEventListener('click', () => {
    processes = [];
    updateProcessList();
    document.getElementById('timeline').innerHTML = '';
    document.getElementById('metrics').innerHTML = '';
});

function deepCopyProcesses(ps) {
    return ps.map(p => ({ ...p }));
}

document.getElementById('run').addEventListener('click', () => {
    processes.forEach(p => {
        const bar = document.getElementById(`progress-${p.pid}`);
        if (bar) bar.style.width = '0%';
    });

    const algo = document.getElementById('algorithm').value;
    const rrQ = parseInt(document.getElementById('rr-quantum').value);
    const q0 = parseInt(document.getElementById('q0').value);
    const q1 = parseInt(document.getElementById('q1').value);
    const q2 = parseInt(document.getElementById('q2').value);
    const q3Raw = document.getElementById('q3').value.trim();
    const q3 = q3Raw.toLowerCase() === 'infinity' ? Infinity : parseInt(q3Raw);

    const a0 = parseInt(document.getElementById('a0').value);
    const a1 = parseInt(document.getElementById('a1').value);
    const a2 = parseInt(document.getElementById('a2').value);
    const a3Raw = document.getElementById('a3').value.trim();
    const a3 = a3Raw.toLowerCase() === 'infinity' ? Infinity : parseInt(a3Raw);

    const freshProcesses = deepCopyProcesses(processes);

    let result;
    switch (algo) {
        case 'fifo': result = fifoScheduling(freshProcesses); break;
        case 'sjf': result = sjfNonPreemptive(freshProcesses); break;
        case 'srtf': result = srtfPreemptive(freshProcesses); break;
        case 'rr': result = roundRobin(freshProcesses, rrQ); break;
        case 'mlfq': result = mlfqScheduling(freshProcesses, [q0, q1, q2, q3], [a0, a1, a2, a3]); break;
    }

    
    animateTimelineAndProgress(result, freshProcesses);
});

function fifoScheduling(ps) {
    const queue = [...ps].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let time = 0;
    return queue.map(p => {
        const start = Math.max(time, p.arrivalTime);
        const end = start + p.burstTime;
        time = end;
        return { pid: p.pid, start, end };
    });
}

function sjfNonPreemptive(ps) {
    const queue = [...ps];
    let time = 0;
    const timeline = [];
    while (queue.length) {
        const ready = queue.filter(p => p.arrivalTime <= time);
        if (!ready.length) { time++; continue; }
        const current = ready.sort((a, b) => a.burstTime - b.burstTime)[0];
        const start = time;
        const end = start + current.burstTime;
        timeline.push({ pid: current.pid, start, end });
        time = end;
        queue.splice(queue.indexOf(current), 1);
    }
    return timeline;
}

function srtfPreemptive(ps) {
    const queue = ps.map(p => ({ ...p, remaining: p.burstTime }));
    const timeline = [];
    let time = 0;
    while (queue.some(p => p.remaining > 0)) {
        const ready = queue.filter(p => p.arrivalTime <= time && p.remaining > 0);
        if (!ready.length) { time++; continue; }
        const current = ready.reduce((a, b) => a.remaining < b.remaining ? a : b);
        timeline.push({ pid: current.pid, start: time, end: time + 1 });
        current.remaining--;
        time++;
    }
    return timeline;
}

function roundRobin(ps, quantum) {
    const queue = ps.map(p => ({ ...p, remaining: p.burstTime }));
    let time = 0;
    const timeline = [];

    while (queue.some(p => p.remaining > 0)) {
        let didRun = false;

        for (const p of queue) {
            if (p.remaining > 0 && p.arrivalTime <= time) {
                const exec = Math.min(quantum, p.remaining);
                timeline.push({ pid: p.pid, start: time, end: time + exec });
                p.remaining -= exec;
                time += exec
                didRun = true;
            }
        }

        if (!didRun) time++;
    }

    return timeline;
}

function mlfqScheduling(ps, quantums, allotments) {
    const all = ps.map(p => ({
        ...p,
        remaining: p.burstTime,
        level: p.queue ?? 0,
        used: 0 
    }));
    const timeline = [];
    let time = 0;

    while (all.some(p => p.remaining > 0)) {
        const ready = all.filter(p => p.remaining > 0 && p.arrivalTime <= time);
        if (!ready.length) { time++; continue; }

        for (const p of ready) {
            const level = p.level;
            const quantum = quantums[level];
            const allotment = allotments[level];
            const timeLeftInAllotment = allotment === Infinity ? p.remaining : allotment - p.used;
            const exec = Math.min(quantum, p.remaining, timeLeftInAllotment);

            timeline.push({ pid: `${p.pid}-Q${level}`, start: time, end: time + exec });
            p.remaining -= exec;
            p.used += exec;
            time += exec;

            if (p.remaining > 0) {
                if (p.used >= allotment) {
                    if (level < quantums.length - 1) {
                        p.level++;
                        p.used = 0;
                    } else {
                        p.used = 0;
                    }
                }
            } else {
                p.used = 0;
            }
        }
    }

    return timeline;
}

function calculateMetrics(schedule, ps) {
    const grouped = {};
    for (const slot of schedule) {
        const base = slot.pid.split("-")[0];
        if (!grouped[base]) grouped[base] = [];
        grouped[base].push(slot);
    }

    return ps.map(p => {
        const pid = p.pid;
        const arrival = p.arrivalTime;
        const burst = p.burstTime;

        const slots = grouped[pid];
        const firstStart = Math.min(...slots.map(s => s.start));
        const lastEnd = Math.max(...slots.map(s => s.end));

        const turnaround = lastEnd - arrival;
        const response = firstStart - arrival;

        return { pid, arrival, burst, completion: lastEnd, turnaround, response };
    });
}

function renderMetrics(data) {
    const container = document.getElementById('metrics');
    container.innerHTML = '';
    let totalTurnaround = 0, totalResponse = 0;

    const table = document.createElement('table');
    table.innerHTML = `
<tr>
  <th>Process ID</th><th>Arrival Time</th><th>Burst Time</th>
  <th>Completion Time</th><th>Turnaround Time</th><th>Response Time</th>
</tr>
`;

    data.forEach(proc => {
        totalTurnaround += proc.turnaround;
        totalResponse += proc.response;
        table.innerHTML += `
  <tr>
    <td>${proc.pid}</td>
    <td>${proc.arrival}</td>
    <td>${proc.burst}</td>
    <td>${proc.completion}</td>
    <td>${proc.turnaround}</td>
    <td>${proc.response}</td>
  </tr>
`;
    });

    const avgTAT = (totalTurnaround / data.length).toFixed(2);
    const avgRT = (totalResponse / data.length).toFixed(2);
    table.innerHTML += `
<tr>
  <td colspan="4"><strong>Averages</strong></td>
  <td><strong>${avgTAT}</strong></td>
  <td><strong>${avgRT}</strong></td>
</tr>
`;
    container.appendChild(table);
}

function renderMetricsIncremental(metrics, finishedPIDs, showAverages) {
    const container = document.getElementById('metrics');
    let totalTurnaround = 0, totalResponse = 0, count = 0;

    
    let html = `
    <table>
    <tr>
      <th>Process ID</th><th>Arrival Time</th><th>Burst Time</th>
      <th>Completion Time</th><th>Turnaround Time</th><th>Response Time</th>
    </tr>
    `;

   
    metrics.forEach(proc => {
        if (finishedPIDs.has(proc.pid)) {
            html += `
            <tr>
                <td>${proc.pid}</td>
                <td>${proc.arrival}</td>
                <td>${proc.burst}</td>
                <td>${proc.completion}</td>
                <td>${proc.turnaround}</td>
                <td>${proc.response}</td>
            </tr>
            `;
            totalTurnaround += proc.turnaround;
            totalResponse += proc.response;
            count++;
        }
    });

    
    if (showAverages && count > 0) {
        const avgTAT = (totalTurnaround / count).toFixed(2);
        const avgRT = (totalResponse / count).toFixed(2);
        html += `
        <tr>
            <td colspan="4"><strong>Averages</strong></td>
            <td><strong>${avgTAT}</strong></td>
            <td><strong>${avgRT}</strong></td>
        </tr>
        `;
    }

    html += '</table>';
    container.innerHTML = html;
}

document.getElementById('process-form').addEventListener('reset', () => { });
document.getElementById('dequeue-process').addEventListener('click', () => {
    if (processes.length > 0) {
        processes.shift(); 
        updateProcessList();
    }
});

function animateTimelineAndProgress(schedule, processes) {
    
    const colorPalette = [
        '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#f44336',
        '#009688', '#E91E63', '#795548', '#607D8B', '#FFC107'
    ];

    
    const pidList = processes.map(p => p.pid);
    const colorMap = {};
    pidList.forEach((pid, idx) => {
        colorMap[pid] = colorPalette[idx % colorPalette.length];
    });

    const container = document.getElementById('timeline');
    container.innerHTML = '';

    const burstMap = {};
    processes.forEach(p => burstMap[p.pid] = p.burstTime);

    const progress = {};
    processes.forEach(p => progress[p.pid] = 0);

    const metrics = calculateMetrics(schedule, processes);
    const finishedPIDs = new Set();

    let i = 0;
    function step() {
        if (i >= schedule.length) {
            renderMetricsIncremental(metrics, finishedPIDs, true);
            return;
        }
        const slot = schedule[i];

        
        const basePid = slot.pid.split('-')[0];

        const div = document.createElement('div');
        div.className = 'block';
        div.style.width = `${(slot.end - slot.start) * 25}px`;
        div.style.backgroundColor = colorMap[basePid] || '#888';
        div.innerText = slot.pid;
        container.appendChild(div);

        progress[basePid] += (slot.end - slot.start);
        const percent = Math.min(100, (progress[basePid] / burstMap[basePid]) * 100);
        const bar = document.getElementById(`progress-${basePid}`);
        if (bar) bar.style.width = percent + "%";

        if (progress[basePid] >= burstMap[basePid] && !finishedPIDs.has(basePid)) {
            finishedPIDs.add(basePid);
            renderMetricsIncremental(metrics, finishedPIDs, false);
        }

        i++;
        setTimeout(step, 400);
    }

    document.getElementById('metrics').innerHTML = '';
    step();
}