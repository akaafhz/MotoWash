import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const SAMPLE_TASKS = [
    {
        id: 1,
        queueNumber: 'A-01',
        customerName: 'Budi Santoso',
        bikeModel: 'Honda Vario 125',
        platNomor: 'B 1234 XY',
        location: 'Parkir Depan Kantin',
        scheduledTime: '09:00',
        serviceType: 'Premium',
        status: 'selesai',
        washerName: 'Agus',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 2,
        queueNumber: 'A-02',
        customerName: 'Siti Rahayu',
        bikeModel: 'Yamaha NMAX',
        platNomor: 'D 5678 AB',
        location: 'Parkir Basement B2',
        scheduledTime: '10:00',
        serviceType: 'Express',
        status: 'proses',
        washerName: 'Budi',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        startedAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
        id: 3,
        queueNumber: 'A-03',
        customerName: 'Rizky Pratama',
        bikeModel: 'Honda PCX 160',
        platNomor: 'F 9012 CD',
        location: 'Parkir Timur Lt. 2',
        scheduledTime: '10:30',
        serviceType: 'Premium',
        status: 'menunggu',
        washerName: null,
        createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
        id: 4,
        queueNumber: 'A-04',
        customerName: 'Dewi Lestari',
        bikeModel: 'Yamaha Aerox 155',
        platNomor: 'B 3456 EF',
        location: 'Parkir Depan Kantin',
        scheduledTime: '11:00',
        serviceType: 'Standard',
        status: 'menunggu',
        washerName: null,
        createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
        id: 5,
        queueNumber: 'A-05',
        customerName: 'Andi Kurniawan',
        bikeModel: 'Kawasaki Ninja 250',
        platNomor: 'AB 7890 GH',
        location: 'Parkir Selatan',
        scheduledTime: '11:30',
        serviceType: 'Premium',
        status: 'menunggu',
        washerName: null,
        createdAt: new Date().toISOString(),
    },
];

export const useAppStore = defineStore('app', () => {
    // State
    const theme = ref(localStorage.getItem('motowash_theme') || 'dark');
    const currentRole = ref(localStorage.getItem('motowash_role') || 'customer');
    const soundEnabled = ref(localStorage.getItem('motowash_sound') !== 'false');
    const sidebarOpen = ref(true);
    const tasks = ref([...SAMPLE_TASKS]);
    const nextQueueNum = ref(6);
    const washTimers = ref({});
    const user = ref(JSON.parse(localStorage.getItem('motowash_user') || 'null'));
    const token = ref(localStorage.getItem('motowash_token') || null);
    const activeQueue = ref(null);

    // Computed
    const isDark = computed(() => theme.value === 'dark');

    const tasksByStatus = computed(() => ({
        menunggu: tasks.value.filter(t => t.status === 'menunggu'),
        proses: tasks.value.filter(t => t.status === 'proses'),
        selesai: tasks.value.filter(t => t.status === 'selesai'),
    }));

    const myQueue = computed(() => {
        if (!user.value) return null;
        return tasks.value.find(t => t.customerName === user.value.name && t.status !== 'selesai') || null;
    });

    const stats = computed(() => ({
        total: tasks.value.length,
        menunggu: tasks.value.filter(t => t.status === 'menunggu').length,
        proses: tasks.value.filter(t => t.status === 'proses').length,
        selesai: tasks.value.filter(t => t.status === 'selesai').length,
        pendapatan: tasks.value
            .filter(t => t.status === 'selesai')
            .reduce((sum, t) => sum + (t.serviceType === 'Premium' ? 25000 : t.serviceType === 'Express' ? 20000 : 15000), 0),
    }));

    // Actions
    function toggleTheme() {
        theme.value = theme.value === 'dark' ? 'light' : 'dark';
        localStorage.setItem('motowash_theme', theme.value);
        if (theme.value === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

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

    function createBooking(bookingData) {
        const num = String(nextQueueNum.value).padStart(2, '0');
        const newTask = {
            id: Date.now(),
            queueNumber: `A-${num}`,
            customerName: user.value?.name || bookingData.customerName,
            bikeModel: bookingData.bikeModel,
            platNomor: bookingData.platNomor,
            location: bookingData.location,
            scheduledTime: bookingData.scheduledTime,
            serviceType: bookingData.serviceType,
            status: 'menunggu',
            washerName: null,
            createdAt: new Date().toISOString(),
        };
        tasks.value.push(newTask);
        nextQueueNum.value++;
        playSound('booking');
        return newTask;
    }

    function startWash(taskId, washerName) {
        const task = tasks.value.find(t => t.id === taskId);
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
        const next = tasks.value.find(t => t.status === 'menunggu');
        if (next) {
            activeQueue.value = next.queueNumber;
            playSound('call');
            setTimeout(() => { activeQueue.value = null; }, 5000);
        }
        return next;
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
        if (theme.value === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    return {
        theme, currentRole, soundEnabled, sidebarOpen,
        tasks, nextQueueNum, washTimers, user, token, activeQueue,
        isDark, tasksByStatus, myQueue, stats,
        toggleTheme, setRole, toggleSound, toggleSidebar,
        createBooking, startWash, finishWash, callNextQueue,
        setAuth, logout, playSound, initTheme,
    };
});
