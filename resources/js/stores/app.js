import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const SAMPLE_TASKS = [
    {
        id: 1,
        queueNumber: 'C-01',
        customerName: 'Budi Santoso',
        bikeModel: 'Honda Vario 125',
        platNomor: 'B 1234 XY',
        location: 'Parkir Depan Kantin',
        scheduledTime: '09:00',
        serviceType: 'Cuci Motor',
        status: 'selesai',
        washerName: 'Agus',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 2,
        queueNumber: 'C-02',
        customerName: 'Siti Rahayu',
        bikeModel: 'Yamaha NMAX',
        platNomor: 'D 5678 AB',
        location: 'Parkir Basement B2',
        scheduledTime: '10:00',
        serviceType: 'Cuci Motor',
        status: 'proses',
        washerName: 'Budi',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        startedAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
        id: 3,
        queueNumber: 'C-03',
        customerName: 'Rizky Pratama',
        bikeModel: 'Honda PCX 160',
        platNomor: 'F 9012 CD',
        location: 'Parkir Timur Lt. 2',
        scheduledTime: '10:30',
        serviceType: 'Cuci Motor',
        status: 'menunggu',
        washerName: null,
        createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
        id: 4,
        queueNumber: 'C-04',
        customerName: 'Dewi Lestari',
        bikeModel: 'Yamaha Aerox 155',
        platNomor: 'B 3456 EF',
        location: 'Parkir Depan Kantin',
        scheduledTime: '11:00',
        serviceType: 'Cuci Motor',
        status: 'menunggu',
        washerName: null,
        createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
        id: 5,
        queueNumber: 'C-05',
        customerName: 'Andi Kurniawan',
        bikeModel: 'Kawasaki Ninja 250',
        platNomor: 'AB 7890 GH',
        location: 'Parkir Selatan',
        scheduledTime: '11:30',
        serviceType: 'Cuci Motor',
        status: 'menunggu',
        washerName: null,
        createdAt: new Date().toISOString(),
    },
    {
        id: 6,
        queueNumber: 'S-01',
        customerName: 'Fajar Nugraha',
        bikeModel: 'Honda Beat Street',
        platNomor: 'B 2468 KLM',
        location: 'Parkir Basement B1',
        scheduledTime: '11:00',
        serviceType: 'Service Motor',
        notes: 'Motor sulit menyala dan terdengar bunyi dari bagian CVT.',
        status: 'menunggu',
        washerName: null,
        createdAt: new Date(Date.now() - 240000).toISOString(),
    },
    {
        id: 7,
        queueNumber: 'S-02',
        customerName: 'Nadia Putri',
        bikeModel: 'Yamaha NMAX',
        platNomor: 'D 1357 QRS',
        location: 'Parkir Timur Lt. 1',
        scheduledTime: '11:30',
        serviceType: 'Service Motor',
        notes: 'Mohon cek rem depan dan kondisi oli mesin.',
        status: 'menunggu',
        washerName: null,
        createdAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
        id: 8,
        queueNumber: 'S-03',
        customerName: 'Rangga Saputra',
        bikeModel: 'Suzuki Satria F150',
        platNomor: 'F 8642 TUV',
        location: 'Parkir Selatan',
        scheduledTime: '12:00',
        serviceType: 'Service Motor',
        notes: 'Rantai terasa kendur dan minta pemeriksaan gear set.',
        status: 'proses',
        washerName: 'Agus',
        createdAt: new Date(Date.now() - 1500000).toISOString(),
        startedAt: new Date(Date.now() - 600000).toISOString(),
    },
];

export const useAppStore = defineStore('app', () => {
    // State
    const theme = ref('light');
    const currentRole = ref(localStorage.getItem('motowash_role') || 'customer');
    const soundEnabled = ref(localStorage.getItem('motowash_sound') !== 'false');
    const sidebarOpen = ref(true);
    const tasks = ref([...SAMPLE_TASKS]);
    const vehicles = ref(JSON.parse(localStorage.getItem('motowash_vehicles') || '[]'));
    const nextQueueNum = ref(6);
    const nextServiceQueueNum = ref(1);
    const washTimers = ref({});
    const user = ref(JSON.parse(localStorage.getItem('motowash_user') || 'null'));
    const token = ref(localStorage.getItem('motowash_token') || null);
    const activeQueue = ref(null);
    const queueCall = ref(readQueueCall());

    // Computed
    const tasksByStatus = computed(() => ({
        menunggu: tasks.value.filter(t => t.status === 'menunggu'),
        proses: tasks.value.filter(t => t.status === 'proses'),
        selesai: tasks.value.filter(t => t.status === 'selesai'),
        dilewati: tasks.value.filter(t => t.status === 'dilewati'),
    }));

    const myQueue = computed(() => {
        if (!user.value) return null;
        return tasks.value.find(t => t.customerName === user.value.name && t.status !== 'selesai') || null;
    });

    const myBookings = computed(() => {
        if (!user.value) return [];
        return tasks.value
            .filter(task => task.customerName === user.value.name)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    const myVehicles = computed(() => {
        if (!user.value) return [];
        return vehicles.value.filter(vehicle => vehicle.ownerEmail === user.value.email);
    });

    const queueCallForCurrentUser = computed(() => {
        if (!queueCall.value || !user.value || queueCall.value.customerName !== user.value.name) return null;
        if (Date.now() - queueCall.value.calledAt > 10000) return null;
        return queueCall.value;
    });

    const stats = computed(() => ({
        total: tasks.value.length,
        menunggu: tasks.value.filter(t => t.status === 'menunggu').length,
        proses: tasks.value.filter(t => t.status === 'proses').length,
        selesai: tasks.value.filter(t => t.status === 'selesai').length,
        pendapatan: tasks.value
            .filter(t => t.status === 'selesai')
            .reduce((sum, task) => sum + (task.serviceType === 'Service Motor' ? 10000 : 15000), 0),
    }));

    // Actions
    function setRole(role) {
        currentRole.value = role;
        localStorage.setItem('motowash_role', role);
    }

    function toggleSound() {
        soundEnabled.value = !soundEnabled.value;
        localStorage.setItem('motowash_sound', soundEnabled.value);
    }

    function toggleSidebar() {
        sidebarOpen.value = !sidebarOpen.value;
    }

    function addVehicle(vehicleData) {
        const vehicle = {
            id: Date.now(),
            ownerEmail: user.value?.email,
            ...vehicleData,
        };

        vehicles.value.push(vehicle);
        localStorage.setItem('motowash_vehicles', JSON.stringify(vehicles.value));
        return vehicle;
    }

    function removeVehicle(vehicleId) {
        vehicles.value = vehicles.value.filter(vehicle => vehicle.id !== vehicleId);
        localStorage.setItem('motowash_vehicles', JSON.stringify(vehicles.value));
    }

    function createBooking(bookingData) {
        const isService = bookingData.serviceType === 'Service Motor';
        const num = String(isService ? nextServiceQueueNum.value : nextQueueNum.value).padStart(2, '0');
        const newTask = {
            id: Date.now(),
            queueNumber: `${isService ? 'S' : 'C'}-${num}`,
            customerName: user.value?.name || bookingData.customerName,
            bikeModel: bookingData.bikeModel,
            platNomor: bookingData.platNomor,
            location: bookingData.location,
            scheduledTime: bookingData.scheduledTime,
            serviceType: bookingData.serviceType,
            notes: bookingData.notes,
            status: 'menunggu',
            washerName: null,
            createdAt: new Date().toISOString(),
        };
        tasks.value.push(newTask);
        if (isService) {
            nextServiceQueueNum.value++;
        } else {
            nextQueueNum.value++;
        }
        playSound('booking');
        return newTask;
    }

    function startWash(taskId, washerName) {
        const task = tasks.value.find(t => t.id === taskId);
        if (task && task.status === 'menunggu' && !canStartTask(taskId)) return;
        if (task) {
            task.status = 'proses';
            task.washerName = washerName || user.value?.name;
            task.startedAt = new Date().toISOString();
            washTimers.value[taskId] = {
                startTime: Date.now(),
                elapsed: 0,
            };
            playSound('start');
        }
    }

    function finishWash(taskId) {
        const task = tasks.value.find(t => t.id === taskId);
        if (task) {
            task.status = 'selesai';
            task.finishedAt = new Date().toISOString();
            delete washTimers.value[taskId];
            playSound('done');
        }
    }

    function callNextQueue() {
        const next = nextWaitingTask.value;
        if (next) {
            activeQueue.value = next.queueNumber;
            queueCall.value = {
                queueNumber: next.queueNumber,
                customerName: next.customerName,
                location: next.location,
                calledAt: Date.now(),
            };
            localStorage.setItem('motowash_queue_call', JSON.stringify(queueCall.value));
            playSound('call');
            setTimeout(() => { activeQueue.value = null; }, 5000);
        }
        return next;
    }

    function syncQueueCall() {
        queueCall.value = readQueueCall();
    }

    const nextWaitingTask = computed(() => [...tasks.value]
        .filter(task => task.status === 'menunggu')
        .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime) || new Date(a.createdAt) - new Date(b.createdAt))[0] || null);

    function skipTask(taskId, reason) {
        const task = tasks.value.find(item => item.id === taskId);
        if (task && task.status === 'menunggu' && reason?.trim()) {
            task.status = 'dilewati';
            task.skipReason = reason.trim();
            return task;
        }

        return null;
    }

    function canStartTask(taskId) {
        const task = tasks.value.find(item => item.id === taskId);

        if (!task || task.status !== 'menunggu') return false;

        return tasks.value
            .filter(item => item.status === 'menunggu' && item.serviceType === task.serviceType)
            .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime) || new Date(a.createdAt) - new Date(b.createdAt))[0]?.id === taskId;
    }

    function setAuth(userData, authToken) {
        user.value = userData;
        token.value = authToken;
        localStorage.setItem('motowash_user', JSON.stringify(userData));
        localStorage.setItem('motowash_token', authToken);
        currentRole.value = userData.role || 'customer';
        localStorage.setItem('motowash_role', currentRole.value);
    }

    function logout() {
        user.value = null;
        token.value = null;
        localStorage.removeItem('motowash_user');
        localStorage.removeItem('motowash_token');
    }

    function playSound(type) {
        if (!soundEnabled.value) return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const sounds = {
            booking: { freq: 523, dur: 0.2, type: 'sine' },
            start: { freq: 659, dur: 0.3, type: 'sine' },
            done: { freq: [523, 659, 784], dur: 0.15, type: 'sine' },
            call: { freq: [784, 659, 523, 659, 784], dur: 0.1, type: 'square' },
        };

        const sound = sounds[type] || sounds.booking;
        const freqs = Array.isArray(sound.freq) ? sound.freq : [sound.freq];

        let time = ctx.currentTime;
        freqs.forEach(freq => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.value = freq;
            o.type = sound.type;
            g.gain.setValueAtTime(0.3, time);
            g.gain.exponentialRampToValueAtTime(0.001, time + sound.dur);
            o.start(time);
            o.stop(time + sound.dur);
            time += sound.dur;
        });
    }

    function initTheme() {
        theme.value = 'light';
        localStorage.setItem('motowash_theme', 'light');
        document.documentElement.classList.remove('dark');
    }

    window.addEventListener('storage', event => {
        if (event.key === 'motowash_queue_call') syncQueueCall();
    });

    return {
        theme, currentRole, soundEnabled, sidebarOpen,
        tasks, nextQueueNum, washTimers, vehicles, user, token, activeQueue, queueCall,
        tasksByStatus, myQueue, myBookings, myVehicles, stats, queueCallForCurrentUser, nextWaitingTask,
        setRole, toggleSound, toggleSidebar,
        addVehicle, removeVehicle,
        createBooking, startWash, finishWash, callNextQueue, syncQueueCall, skipTask, canStartTask,
        setAuth, logout, playSound, initTheme,
    };
});

function readQueueCall() {
    const storedCall = JSON.parse(localStorage.getItem('motowash_queue_call') || 'null');

    if (!storedCall || Date.now() - storedCall.calledAt > 10000) return null;

    return storedCall;
}
