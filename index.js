
const DEMO_USERNAME = 'admin';
const DEMO_PASSWORD = 'admin';

function showDashboardAfterLogin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardApp').style.display = 'flex';
}

function handleGreenhouseLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {

        sessionStorage.setItem('greenhouseLoggedIn', 'true');

        showDashboardAfterLogin();

    } else {
        alert('Username atau password salah!');
    }
}

function togglePassword() {
    const passwordInput = document.getElementById('loginPassword');
    const eyeIcon = document.getElementById('eyeIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
}

function logoutUser() {
    sessionStorage.removeItem('greenhouseLoggedIn');
    localStorage.removeItem('greenhouseRemembered');

    location.reload();
}

document.addEventListener('DOMContentLoaded', function () {

    if (sessionStorage.getItem('greenhouseLoggedIn') === 'true') {
        showDashboardAfterLogin();
    } else {
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('dashboardApp').style.display = 'none';
    }

});

      
      
      
      
      
      // State Management
        let isKipasOn = false;
        let isPompaOn = false;
    
        let lastSoilUpdate = 0;
        let lastDhtUpdate = 0;
        let lastKipasUpdate = 0;
        let lastPompaUpdate = 0;
        // =====================================================
        // MQTT BIOMATRIX SMART GREENHOUSE
        // =====================================================

        // Alamat MQTT WebSocket
        // =====================================================
        // MQTT BIOMATRIX SMART GREENHOUSE
        // =====================================================

        const MQTT_BROKER = 'ws://10.15.16.179:9001';

        console.log('Menghubungkan ke MQTT:', MQTT_BROKER);

        const mqttClient = mqtt.connect(MQTT_BROKER, {
            reconnectPeriod: 3000,
            connectTimeout: 10000,
            clean: true
        });

        mqttClient.on('connect', function () {

            console.log('================================');
            console.log('MQTT DASHBOARD TERHUBUNG');
            console.log('Broker:', MQTT_BROKER);
            console.log('================================');

            // Sensor
            mqttClient.subscribe(
                'biomatrix/sensor/tanah'
            );

            mqttClient.subscribe(
                'biomatrix/sensor/dht11'
            );

            // Status aktuator
            mqttClient.subscribe(
                'biomatrix/kipas'
            );

            mqttClient.subscribe(
                'biomatrix/pompa'
            );

        });
        function formatTanggalUpdate() {
            const sekarang = new Date();

            return sekarang.toLocaleString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        }
        
        // =====================================================
        // MENERIMA DATA MQTT
        // =====================================================

        mqttClient.on('message', function (topic, message) {

    const data = message.toString();

    console.log('MQTT:', topic, data);


    // =====================================================
    // SENSOR TANAH
    // =====================================================

    if (topic === 'biomatrix/sensor/tanah') {

        const soil = parseFloat(data);
        const waktuUpdateTanah = formatTanggalUpdate();

        if (isNaN(soil)) {
            updateActivityLog('Kelembapan Tanah', '--', 'Error Sensor');
            return;
        }

        lastSoilUpdate = Date.now();

        console.log('Kelembapan tanah:', soil + '%');

        updateActivityLog(
            'Kelembapan Tanah',
            soil + '%',
            'Normal'
        );

        // Dashboard
        const dashboardSoil =
            document.getElementById('dashboard-soil');

        if (dashboardSoil) {
            dashboardSoil.innerHTML =
                soil + '<span class="text-sm font-normal text-emerald-300">%</span>';
        }


        // Progress text
        const soilProgress =
            document.getElementById('dashboard-soil-progress');

        if (soilProgress) {
            soilProgress.innerText = soil + '%';
        }


        // Progress bar
        const soilBar =
            document.getElementById('soil-progress-bar');

        if (soilBar) {
            soilBar.style.width = soil + '%';
        }


        // Sensor page
        const sensorSoil =
            document.getElementById('sensor-soil');

        if (sensorSoil) {
            sensorSoil.innerText = soil + '%';
        }


        // Halaman tanah
        const tanahValue =
            document.getElementById('tanah-value');

        if (tanahValue) {
            tanahValue.innerText = soil + '%';
        }


        const tanahInfo =
            document.getElementById('tanah-info-value');

        if (tanahInfo) {
            tanahInfo.innerText = soil + '%';
        }


        // Grafik
        updateSoilChart(soil);

        const tanahLastUpdate =
            document.getElementById('tanah-last-update');

        if (tanahLastUpdate) {
            tanahLastUpdate.innerText = waktuUpdateTanah;
        }
    }


    // =====================================================
    // DHT11
    // =====================================================

    if (topic === 'biomatrix/sensor/dht11') {

        try {

            const dht = JSON.parse(data);

            const suhu = parseFloat(dht.suhu);
            const kelembapan = parseFloat(dht.kelembapan);
            const waktuUpdateDHT = formatTanggalUpdate();

            if (isNaN(suhu) || isNaN(kelembapan)) {
                updateActivityLog('DHT11 (Suhu)', '--', 'Error Sensor');
                updateActivityLog('DHT11 (Kelembapan)', '--', 'Error Sensor');
                return;
            }

            lastDhtUpdate = Date.now();

            console.log('Suhu:', suhu);
            console.log('Kelembapan:', kelembapan);

            updateActivityLog('DHT11 (Suhu)', suhu + ' °C', 'Normal');
            updateActivityLog('DHT11 (Kelembapan)', kelembapan + '%', 'Normal');


            // =============================================
            // SUHU DASHBOARD
            // =============================================

            const dashboardTemperature =
                document.getElementById('dashboard-temperature');

            if (dashboardTemperature) {

                dashboardTemperature.innerHTML =
                    suhu +
                    '<span class="text-sm font-normal text-emerald-300">°C</span>';
            }


            // =============================================
            // KELEMBAPAN DASHBOARD
            // =============================================

            const dashboardHumidity =
                document.getElementById('dashboard-humidity');

            if (dashboardHumidity) {

                dashboardHumidity.innerHTML =
                    kelembapan +
                    '<span class="text-sm font-normal text-emerald-300">%</span>';
            }


            // =============================================
            // KONDISI LINGKUNGAN
            // =============================================

            const temperatureText =
                document.getElementById(
                    'temperature-progress-text'
                );

            if (temperatureText) {
                temperatureText.innerText =
                    suhu + ' °C';
            }


            const humidityText =
                document.getElementById(
                    'humidity-progress-text'
                );

            if (humidityText) {
                humidityText.innerText =
                    kelembapan + '%';
            }


            const humidityBar =
                document.getElementById(
                    'humidity-progress-bar'
                );

            if (humidityBar) {
                humidityBar.style.width =
                    kelembapan + '%';
            }


            // =============================================
            // SENSOR PAGE
            // =============================================

            const sensorTemperature =
                document.getElementById(
                    'sensor-temperature'
                );

            if (sensorTemperature) {
                sensorTemperature.innerText =
                    suhu + ' °C';
            }


            const sensorHumidity =
                document.getElementById(
                    'sensor-humidity'
                );

            if (sensorHumidity) {
                sensorHumidity.innerText =
                    kelembapan + '%';
            }


            // =============================================
            // DHT11 PAGE
            // =============================================

            const dhtTemperature =
                document.getElementById(
                    'dht-temperature'
                );

            if (dhtTemperature) {
                dhtTemperature.innerText =
                    suhu + ' °C';
            }


            const dhtHumidity =
                document.getElementById(
                    'dht-humidity'
                );

            if (dhtHumidity) {
                dhtHumidity.innerText =
                    kelembapan + '%';
            }


            // =============================================
            // GRAFIK
            // =============================================

            updateDHTChart(
                suhu,
                kelembapan
            );


        } catch (error) {

            console.error(
                'Format data DHT11 tidak valid:',
                data
            );
        updateActivityLog('DHT11 (Suhu)', '--', 'Error Sensor');
        updateActivityLog('DHT11 (Kelembapan)', '--', 'Error Sensor');
        }
    }


    // =====================================================
    // STATUS KIPAS
    // =====================================================

    if (topic === 'biomatrix/kipas') {

        const status = data.trim().toUpperCase();

        if (status !== 'ON' && status !== 'OFF') {
            updateActivityLog('Kipas', '--', 'Error Kipas');
            return;
        }

        const state = status === 'ON';

        const waktuUpdateKipas = formatTanggalUpdate();

        const kipasLastUpdate =
            document.getElementById('kipas-last-update');

        if (kipasLastUpdate) {
            kipasLastUpdate.innerText = waktuUpdateKipas;
        }

        isKipasOn = state;
        lastKipasUpdate = Date.now();

        dashboardUpdateKipasUI(state);

        updateActivityLog(
            'Kipas',
            status,
            'Normal'
        );
    }


    // =====================================================
    // STATUS POMPA
    // =====================================================

    if (topic === 'biomatrix/pompa') {

        const status = data.trim().toUpperCase();

        if (status !== 'ON' && status !== 'OFF') {
            updateActivityLog('Pompa', '--', 'Error Pompa');
            return;
        }

        const state = status === 'ON';
        const waktuUpdatePompa = formatTanggalUpdate();

        const pompaLastUpdate =
            document.getElementById('pompa-last-update');

        if (pompaLastUpdate) {
            pompaLastUpdate.innerText = waktuUpdatePompa;
        }

        isPompaOn = state;
        lastPompaUpdate = Date.now();

        dashboardUpdatePompaUI(state);

        updateActivityLog(
            'Pompa',
            status,
            'Normal'
        );
    }
});

function updateActivityLog(device, value, description) {

    const headings = document.querySelectorAll('h3');

    let table = null;

    headings.forEach(function (heading) {

        if (heading.innerText.trim() === 'Log Aktivitas Terbaru') {
            table = heading.parentElement.querySelector('table');
        }

    });

    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(function (row) {

        const cells = row.querySelectorAll('td');

        if (cells.length < 5) return;

        // Kolom:
        // 0 = No
        // 1 = Waktu
        // 2 = Sensor / Aktuator
        // 3 = Nilai / Status
        // 4 = Keterangan

        const deviceName = cells[2].innerText.trim();

        if (deviceName !== device) return;

        const now = new Date();

        const waktu =
            now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0') + ':' +
            now.getSeconds().toString().padStart(2, '0');

        cells[1].innerText = waktu;

        cells[3].innerText = value;

        if (description === 'Normal') {

            cells[4].innerHTML =
                '<span class="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px]">' +
                'Normal' +
                '</span>';

        } else {

            cells[4].innerHTML =
                '<span class="bg-red-950 text-red-300 px-2 py-0.5 rounded text-[10px]">' +
                description +
                '</span>';

        }

    });
}

setInterval(function () {

    const sekarang = Date.now();

    if (lastSoilUpdate > 0 && sekarang - lastSoilUpdate > 5000) {
        updateActivityLog(
            'Kelembapan Tanah',
            '--',
            'Error Sensor'
        );
    }

    if (lastDhtUpdate > 0 && sekarang - lastDhtUpdate > 5000) {
        updateActivityLog(
            'DHT11 (Suhu)',
            '--',
            'Error Sensor'
        );

        updateActivityLog(
            'DHT11 (Kelembapan)',
            '--',
            'Error Sensor'
        );
    }

    if (lastKipasUpdate > 0 && sekarang - lastKipasUpdate > 5000) {
        updateActivityLog(
            'Kipas',
            '--',
            'Error Kipas'
        );
    }

    if (lastPompaUpdate > 0 && sekarang - lastPompaUpdate > 5000) {
        updateActivityLog(
            'Pompa',
            '--',
            'Error Pompa'
        );
    }

}, 1000);
// =====================================================
// DATA GRAFIK REALTIME
// =====================================================

let soilChart;
let dhtRealtimeChart;

let soilLabels = [];
let soilData = [];

let temperatureData = [];
let humidityData = [];


// =====================================================
// UPDATE GRAFIK TANAH
// =====================================================

function updateSoilChart(value) {

    const now = new Date();

    const time =
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0') +
        ':' +
        now.getSeconds().toString().padStart(2, '0');


    soilLabels.push(time);
    soilData.push(value);


    // Maksimal 20 data
    if (soilLabels.length > 20) {

        soilLabels.shift();
        soilData.shift();

    }


    if (soilChart) {

        soilChart.data.labels =
            soilLabels;

        soilChart.data.datasets[0].data =
            soilData;

        soilChart.update();
    }
}


// =====================================================
// UPDATE GRAFIK DHT11
// =====================================================

function updateDHTChart(
    temperature,
    humidity
) {

    const now = new Date();

    const time =
        now.getHours().toString().padStart(2, '0') +
        ':' +
        now.getMinutes().toString().padStart(2, '0');


    if (dhtRealtimeChart) {

        dhtRealtimeChart.data.labels.push(time);

        dhtRealtimeChart.data.datasets[0].data.push(
            temperature
        );

        dhtRealtimeChart.data.datasets[1].data.push(
            humidity
        );


        if (
            dhtRealtimeChart.data.labels.length > 20
        ) {

            dhtRealtimeChart.data.labels.shift();

            dhtRealtimeChart.data.datasets[0].data.shift();

            dhtRealtimeChart.data.datasets[1].data.shift();
        }


        dhtRealtimeChart.update();
    }
}

        // =====================================================
        // MQTT ERROR
        // =====================================================

        mqttClient.on('error', function (error) {
            console.error('MQTT ERROR:', error);

        });

        mqttClient.on('offline', function () {
            console.warn('MQTT DASHBOARD OFFLINE');
        });

        mqttClient.on('reconnect', function () {
            console.log('MQTT mencoba terhubung kembali...');
        });

        mqttClient.on('close', function () {
            console.warn('MQTT koneksi ditutup');
        });
            


        // =====================================================
        // MQTT TERPUTUS
        // =====================================================

        mqttClient.on('close', function () {

            console.log('MQTT terputus');

        });


        // =====================================================
        // UPDATE TAMPILAN KIPAS
        // =====================================================

        function updateKipasUI(state) {

            // Toggle Kipas
            document.querySelectorAll('.toggle-kipas-input').forEach(input => {
                input.checked = state;
            });

            // Teks pada kontrol aktuator
            document.querySelectorAll('.label-kipas-text').forEach(text => {
                text.innerText = state ? 'Aktif (Menyala)' : 'Mati';
            });

            // Teks pada card
            document.querySelectorAll('.card-kipas-text').forEach(text => {
                text.innerText = state ? 'Aktif' : 'Mati';
            });

            // Badge pada card
            document.querySelectorAll('.card-kipas-badge').forEach(badge => {
                badge.innerText = state ? 'Aktif' : 'Nonaktif';
            });


            // ANIMASI + WARNA KIPAS
            document.querySelectorAll('.icon-kipas-box').forEach(box => {
                const icon = box.querySelector('i');

                if (icon) {
                    icon.classList.remove('animate-spin');

                    if (state) {
                        icon.classList.add('text-[#00e699]');
                        icon.classList.remove('text-slate-400');
                        icon.classList.add('animate-spin');
                    } else {
                        icon.classList.remove('text-[#00e699]');
                        icon.classList.add('text-slate-400');
                    }
                }
            });
        }

        // =====================================================
        // UPDATE TAMPILAN POMPA
        // =====================================================

        function updatePompaUI(state) {

            // Toggle Pompa
            document.querySelectorAll('.toggle-pompa-input').forEach(input => {
                input.checked = state;
            });

            // Teks pada kontrol aktuator
            document.querySelectorAll('.label-pompa-text').forEach(text => {
                text.innerText = state ? 'Aktif (Menyala)' : 'Mati';
            });

            // Teks pada card
            document.querySelectorAll('.card-pompa-text').forEach(text => {
                text.innerText = state ? 'Aktif' : 'Mati';
            });

            // Badge pada card
            document.querySelectorAll('.card-pompa-badge').forEach(badge => {
                badge.innerText = state ? 'Aktif' : 'Nonaktif';
            });

            // ANIMASI + WARNA POMPA
            document.querySelectorAll('.icon-pompa-box').forEach(box => {
                const icon = box.querySelector('i');

                if (icon) {
                    icon.classList.remove('animate-bounce');

                    if (state) {
                        icon.classList.add('text-blue-400');
                        icon.classList.remove('text-slate-400');
                        icon.classList.add('animate-bounce');
                    } else {
                        icon.classList.remove('text-blue-400');
                        icon.classList.add('text-slate-400');
                    }
                }
            });
        }

        // Single Page App - Tab Switcher
        function dashboardSwitchTab(tabId) {
            document.querySelectorAll('.page-content').forEach(el => el.classList.add('hidden'));
            const activePage = document.getElementById(`page-${tabId}`);
            if (activePage) activePage.classList.remove('hidden');

            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('bg-[#0e4334]', 'text-white', 'glow-green');
                btn.classList.add('text-emerald-200/70');
            });

            const activeBtn = document.querySelector(`.nav-btn[data-tab="${tabId}"]`);
            if (activeBtn) {
                activeBtn.classList.add('bg-[#0e4334]', 'text-white', 'glow-green');
                activeBtn.classList.remove('text-emerald-200/70');
            }

            // Close sidebar on mobile after clicking
            if (window.innerWidth < 1024) {
                document.getElementById('sidebar').classList.add('hidden');
            }

            document.querySelectorAll('.icon-pompa-box').forEach(box => {
                box.className = `w-10 h-10 rounded-lg flex items-center justify-center transition ${state ? 'bg-blue-500/20' : 'bg-[#03140f]'}`;

                const icon = box.querySelector('i');
                if (icon) {
                    icon.classList.toggle('text-blue-400', state);
                    icon.classList.toggle('text-slate-400', !state);
                    icon.classList.toggle('animate-bounce', state);
                }
            });
        }

        
        // =====================================================
        // KONTROL AKTUATOR MELALUI MQTT
        // =====================================================

        function toggleActuator(type, state) {

            // =================================================
            // CEK MQTT
            // =================================================

            if (!mqttClient || !mqttClient.connected) {

                console.error(
                    'MQTT BELUM TERHUBUNG'
                );

                showToast(
                    'MQTT belum terhubung',
                    'error'
                );

                return;
            }


            // Perintah
            const command = state ? 'ON' : 'OFF';


            // =================================================
            // KIPAS
            // =================================================

            if (type === 'kipas') {

                console.log(
                    'Mengirim perintah kipas:',
                    command
                );

                mqttClient.publish(
                    'biomatrix/kipas/control',
                    command,
                    function(error) {

                        if (error) {

                            console.error(
                                'Gagal mengirim perintah kipas:',
                                error
                            );

                            showToast(
                                'Perintah kipas gagal dikirim',
                                'error'
                            );

                            return;
                        }

                        console.log(
                            'Perintah kipas berhasil dikirim:',
                            command
                        );

                        isKipasOn = state;

                        updateKipasUI(state);

                        showToast(
                            `Kipas ${
                                state
                                    ? 'Dinyalakan'
                                    : 'Dimatikan'
                            }`,
                            'success'
                        );

                    }
                );

                return;
            }


            // =================================================
            // POMPA
            // =================================================

            if (type === 'pompa') {

                console.log(
                    'Mengirim perintah pompa:',
                    command
                );

                mqttClient.publish(
                    'biomatrix/pompa/control',
                    command,
                    function(error) {

                        if (error) {

                            console.error(
                                'Gagal mengirim perintah pompa:',
                                error
                            );

                            showToast(
                                'Perintah pompa gagal dikirim',
                                'error'
                            );

                            return;
                        }

                        console.log(
                            'Perintah pompa berhasil dikirim:',
                            command
                        );

                        isPompaOn = state;

                        updatePompaUI(state);

                        showToast(
                            `Pompa ${
                                state
                                    ? 'Dinyalakan'
                                    : 'Dimatikan'
                            }`,
                            'success'
                        );

                    }
                );

                return;
            }


            // =================================================
            // TIPE TIDAK DIKENAL
            // =================================================

            console.error(
                'Tipe aktuator tidak dikenal:',
                type
            );
        }
        function exportToCSV() {
            const rows = [
                ["No", "Waktu", "Suhu", "Kelembapan Udara", "Kelembapan Tanah", "Kipas", "Pompa"],
                ["1", "26-09-2025 07:41", "28.5", "72", "65", isKipasOn ? "Aktif" : "Mati", isPompaOn ? "Aktif" : "Mati"],
                ["2", "26-09-2025 07:36", "28.4", "71", "64", "Mati", "Mati"],
                ["3", "26-09-2025 07:31", "28.2", "70", "63", "Mati", "Mati"]
            ];

            let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "riwayat_sensor_biomatrix.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('File CSV berhasil diunduh', 'success');
        }

        // Chart.js Setup
        window.onload = function() {
            // Mobile Sidebar Toggle
            document.getElementById('menu-toggle').addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('hidden');
            });

            // 1. Dashboard Chart
            const ctxDash = document.getElementById('dashChart').getContext('2d');
            new Chart(ctxDash, {
                type: 'line',
                data: {
                    labels: ['07:00', '07:10', '07:20', '07:30', '07:40'],
                    datasets: [
                        { label: 'Kelembapan Tanah (%)', data: [62, 60, 64, 63, 65], borderColor: '#10b981', tension: 0.3 },
                        { label: 'Suhu (°C)', data: [27.8, 28.0, 28.2, 28.4, 28.5], borderColor: '#f59e0b', tension: 0.3 },
                        { label: 'Kelembapan Udara (%)', data: [75, 73, 71, 70, 72], borderColor: '#3b82f6', tension: 0.3 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });

            // 2. Tanah Chart
            // 2. Tanah Chart
            const ctxTanah = document.getElementById('tanahChart').getContext('2d');

            soilChart = new Chart(ctxTanah, {
                type: 'line',

                data: {
                    labels: soilLabels,

                    datasets: [{
                        label: 'Kelembapan Tanah (%)',
                        data: soilData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        fill: true,
                        tension: 0.3
                    }]
                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false,

                    scales: {
                        y: {
                            min: 0,
                            max: 100
                        }
                    }
                }
            });

            // 3. DHT11 Chart
            const ctxDHT = document.getElementById('dhtChart').getContext('2d');
            dhtRealtimeChart = new Chart(ctxDHT, {

                type: 'line',

                data: {

                    labels: [],

                    datasets: [

                        {
                            label: 'Suhu (°C)',
                            data: [],
                            borderColor: '#f59e0b'
                        },

                        {
                            label: 'Kelembapan Udara (%)',
                            data: [],
                            borderColor: '#3b82f6'
                        }

                    ]

                },

                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }

            });

            // 4. Grid Charts (Page Grafik)
            const opt = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
            new Chart(document.getElementById('chartSuhu'), { type: 'line', data: { labels: ['1', '2', '3', '4'], datasets: [{ data: [27, 28, 28.5, 28], borderColor: '#f59e0b' }] }, options: opt });
            new Chart(document.getElementById('chartUdara'), { type: 'line', data: { labels: ['1', '2', '3', '4'], datasets: [{ data: [70, 72, 71, 72], borderColor: '#3b82f6' }] }, options: opt });
            new Chart(document.getElementById('chartTanah2'), { type: 'line', data: { labels: ['1', '2', '3', '4'], datasets: [{ data: [62, 64, 63, 65], borderColor: '#10b981' }] }, options: opt });
            new Chart(document.getElementById('chartAktuator'), { type: 'bar', data: { labels: ['07:00', '07:10', '07:20', '07:30'], datasets: [{ label: 'Kipas', data: [0, 1, 0, 0], backgroundColor: '#10b981' }, { label: 'Pompa', data: [1, 0, 0, 0], backgroundColor: '#3b82f6' }] }, options: opt });
        };

        function updateTanggalWaktu() {
            const sekarang = new Date();

            const tanggal = sekarang.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            const waktu = sekarang.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const elemen = document.getElementById('current-datetime');

            if (elemen) {
                elemen.textContent = `${tanggal}, ${waktu} WIB`;
            }
        }

        updateTanggalWaktu();
        setInterval(updateTanggalWaktu, 1000);

        function updateLogAktivitas() {
            const sekarang = new Date();

            const waktu = sekarang.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            const log1 = document.getElementById('log-time-1');

            if (log1) {
                log1.textContent = waktu;
            }
        }

        updateLogAktivitas();
