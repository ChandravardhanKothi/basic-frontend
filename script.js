// Agri-Advisory Platform interactivity

(function () {
  const navButtons = document.querySelectorAll('.nav-btn');
  const sections = ['#crop-health', '#future-plan', '#notifications'].map((s) => document.querySelector(s));
  function showSection(targetSelector) {
    sections.forEach((el) => {
      if (!el) return;
      if ('#' + el.id === targetSelector) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });
    navButtons.forEach((b) => {
      const isActive = b.getAttribute('data-target') === targetSelector;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });
  }
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target) showSection(target);
    });
  });

  // Elements
  const fileInput = document.getElementById('leafImage');
  const uploadBtn = document.getElementById('uploadBtn');
  const previewImage = document.getElementById('previewImage');
  const diseaseContent = document.getElementById('diseaseContent');
  const cropResults = document.getElementById('cropResults');
  const notificationList = document.getElementById('notificationList');

  // Preloaded Mosaic Virus text (static demo data)
  const mosaicVirusInfo = {
    name: 'Mosaic Virus',
    symptoms: [
      'Mottled yellow and green patches on leaves (mosaic pattern)',
      'Leaf curling, distortion, and stunted growth',
      'Reduced fruit size and uneven ripening',
      'Yield losses in severe infections'
    ],
    transmission: [
      'Spread by insects like aphids and whiteflies',
      'Mechanical transmission via contaminated tools and hands',
      'Infected seeds or plant material'
    ],
    management: [
      'Remove and destroy infected plants to reduce sources of infection',
      'Control insect vectors using approved, safe methods (e.g., sticky traps, recommended sprays)',
      'Sanitize tools and wash hands before handling plants',
      'Use resistant varieties and certified disease-free seeds',
      'Maintain field hygiene and manage weeds that can host viruses'
    ]
  };

  function renderDisease(info) {
    const html = [
      `<p><strong>Disease:</strong> ${info.name}</p>`,
      '<h3>Symptoms</h3>',
      `<ul>${info.symptoms.map((s) => `<li>${s}</li>`).join('')}</ul>`,
      '<h3>Transmission</h3>',
      `<ul>${info.transmission.map((t) => `<li>${t}</li>`).join('')}</ul>`,
      '<h3>Prevention & Management</h3>',
      `<ul>${info.management.map((m) => `<li>${m}</li>`).join('')}</ul>`
    ].join('');
    diseaseContent.innerHTML = html;
  }

  // Load disease info (try API, fallback to static)
  function loadDiseaseInfo() {
    // Use static preset only after upload per requirements
    renderDisease(mosaicVirusInfo);
  }

  // Image preview
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = String(e.target?.result || '');
      previewImage.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  // Upload handler opens picker first if no file chosen
  uploadBtn?.addEventListener('click', async () => {
    let file = fileInput?.files && fileInput.files[0];
    if (!file) {
      fileInput?.click();
      // wait for user to pick
      return;
    }
    const form = new FormData();
    form.append('file', file, file.name);
    // Demo: pretend upload succeeded and show results
    try {
      await fetch('/upload', { method: 'POST', body: form });
    } catch (_) { /* ignore in demo */ }
    cropResults?.classList.remove('hidden');
    loadDiseaseInfo();
  });

  // When a file is picked via hidden input, immediately show results and optionally auto-upload
  fileInput?.addEventListener('change', async () => {
    const file = fileInput?.files && fileInput.files[0];
    if (!file) return;
    cropResults?.classList.remove('hidden');
    loadDiseaseInfo();
    try {
      const form = new FormData();
      form.append('file', file, file.name);
      await fetch('/upload', { method: 'POST', body: form });
    } catch (_) { /* ignore in demo */ }
  });

  // Charts (Canvas API minimal line chart)
  function drawLineChart(canvas, series, { color = '#0B3D91', yMaxPad = 1.1 } = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const maxVal = Math.max(...series);
    const minVal = Math.min(...series);
    const range = (maxVal - minVal) || 1;
    const top = maxVal * yMaxPad;
    const leftPad = 32;
    const rightPad = 8;
    const topPad = 16;
    const bottomPad = 24;
    const chartW = width - leftPad - rightPad;
    const chartH = height - topPad - bottomPad;

    // Axes
    ctx.strokeStyle = '#d8dee9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftPad, topPad);
    ctx.lineTo(leftPad, topPad + chartH);
    ctx.lineTo(leftPad + chartW, topPad + chartH);
    ctx.stroke();

    // Line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    series.forEach((v, i) => {
      const x = leftPad + (i / (series.length - 1)) * chartW;
      const y = topPad + chartH - ((v - minVal) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function drawBarChart(canvas, series, { color = '#0E9F6E' } = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const maxVal = Math.max(...series) || 1;
    const leftPad = 32;
    const rightPad = 8;
    const topPad = 16;
    const bottomPad = 24;
    const chartW = width - leftPad - rightPad;
    const chartH = height - topPad - bottomPad;
    const barW = chartW / series.length - 6;

    // Axes
    ctx.strokeStyle = '#d8dee9';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftPad, topPad);
    ctx.lineTo(leftPad, topPad + chartH);
    ctx.lineTo(leftPad + chartW, topPad + chartH);
    ctx.stroke();

    // Bars
    ctx.fillStyle = color;
    series.forEach((v, i) => {
      const x = leftPad + i * (barW + 6) + 3;
      const h = (v / maxVal) * chartH;
      const y = topPad + chartH - h;
      ctx.fillRect(x, y, barW, h);
    });
  }

  // Fetch forecasts (try API, fallback to demo data)
  async function loadForecasts() {
    // Static sample data as requested
    const data = {
      marketPrices: [
        { day: 'Day 1', price: 24 },
        { day: 'Day 2', price: 25 },
        { day: 'Day 3', price: 26 },
        { day: 'Day 4', price: 24 },
        { day: 'Day 5', price: 27 },
        { day: 'Day 6', price: 28 },
        { day: 'Day 7', price: 29 }
      ], // Tomato prices in Hyderabad
      weather: Array.from({ length: 30 }).map((_, i) => ({ day: i + 1, temp: 21 + Math.round(Math.sin(i/4) * 3 + 3) }))
    };

    const marketCanvas = document.getElementById('marketChart');
    const marketSeries = (data.marketPrices || []).map((d) => d.price);
    drawLineChart(marketCanvas, marketSeries);

    const weatherCanvas = document.getElementById('weatherChart');
    const weatherSeries = (data.weather || []).map((d) => d.temp);
    drawBarChart(weatherCanvas, weatherSeries);
  }

  // Notifications (try API, fallback to sample and optional randomization)
  async function loadNotifications() {
    const items = [
      { title: "Today's Weather", body: 'Partly cloudy, 27°C. Light breeze in the afternoon.' },
      { title: 'Market Price (Tomato)', body: 'Likely Rs. 26–29/kg in Hyderabad this week.' },
      { title: 'Best Time to Work', body: 'Early morning (6–9 AM) recommended to avoid heat.' }
    ];

    notificationList.innerHTML = '';
    items.forEach((msg) => {
      const li = document.createElement('li');
      const h3 = document.createElement('h3');
      const p = document.createElement('p');
      h3.textContent = msg.title;
      p.textContent = msg.body;
      li.appendChild(h3);
      li.appendChild(p);
      notificationList.appendChild(li);
    });
  }

  // Kick-off initial data
  // Initial state: show Crop Health section only; analysis hidden until upload
  showSection('#crop-health');
  loadForecasts();
  loadNotifications();
})();


