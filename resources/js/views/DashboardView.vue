<template>
    <div class="page-shell p-4 md:p-6 lg:p-8 space-y-6">
        <!-- Welcome Header -->
        <div class="flex flex-col gap-1">
            <p class="label">Overview</p>
            <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-primary">Selamat Datang, {{ firstName }}!</h1>
            <p class="text-muted text-sm">{{ dateStr }} <span class="mx-1 text-slate-300">•</span> Mode: <span class="font-semibold text-accent capitalize">{{ store.currentRole }}</span></p>
        </div>

        <!-- Stats Row -->
        <div v-if="store.currentRole !== 'customer'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div
                v-for="stat in statCards"
                :key="stat.label"
                class="stat-card card-hover min-h-36 flex flex-col justify-between"
            >
                <div class="flex items-start justify-between gap-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="`background: ${stat.color}12`">
                        <component :is="stat.icon" class="w-5 h-5" :style="`color: ${stat.color}`" />
                    </div>
                    <span class="text-xs font-semibold px-2 py-1 rounded-full text-right" :style="`background: ${stat.color}15; color: ${stat.color}`">
                        {{ stat.change }}
                    </span>
                </div>
                <div class="mt-5">
                    <p class="text-2xl font-bold text-primary tabular leading-none">{{ stat.value }}</p>
                    <p class="text-xs text-muted mt-2">{{ stat.label }}</p>
                </div>
            </div>
        </div>

        <div v-if="store.currentRole === 'washer'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="card p-5 border-l-4" style="border-left-color: var(--color-accent)">
                <p class="label">Cuci Motor</p>
                <p class="text-2xl font-bold text-primary mt-1">{{ washSummary.waiting + washSummary.active }}</p>
                <p class="text-xs text-muted mt-1">{{ washSummary.waiting }} menunggu · {{ washSummary.active }} sedang dicuci</p>
            </div>
            <div class="card p-5 border-l-4" style="border-left-color: #c26a2d">
                <p class="label">Service Motor</p>
                <p class="text-2xl font-bold text-primary mt-1">{{ serviceSummary.waiting + serviceSummary.active }}</p>
                <p class="text-xs text-muted mt-1">{{ serviceSummary.waiting }} menunggu · {{ serviceSummary.active }} sedang diservice</p>
            </div>
        </div>

        <!-- Queue Call Notification (Customer) -->
        <Transition name="bounce">
            <div v-if="store.currentRole === 'customer' && store.queueCallForCurrentUser" class="card p-5 glow-cyan border-l-4" style="border-left-color: var(--color-accent)">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse shrink-0" style="background: var(--color-accent)">
                        <SpeakerWaveIcon class="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p class="label">Antrean kamu dipanggil</p>
                        <p class="text-3xl font-black tabular mt-0.5 text-accent">{{ store.queueCallForCurrentUser.queueNumber }}</p>
                        <p class="text-sm text-muted mt-1">Silakan menuju {{ store.queueCallForCurrentUser.location }}.</p>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- My Queue Card (Customer) -->
        <div v-if="store.currentRole === 'customer' && store.myQueue" class="card p-5 glow-cyan">
            <div class="flex items-center gap-2 mb-4">
                <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p class="label">Antrean Kamu</p>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div class="text-center">
                    <div class="text-5xl font-black tabular" style="color: var(--color-accent)">{{ store.myQueue.queueNumber }}</div>
                    <p class="text-xs text-muted mt-1">Nomor Antrean</p>
                </div>
                <div class="flex-1 space-y-2">
                    <div class="flex items-center gap-3">
                        <span :class="statusBadgeClass(store.myQueue.status)">{{ statusLabel(store.myQueue.status) }}</span>
                        <span class="text-xs text-muted">{{ store.myQueue.serviceType }}</span>
                    </div>
                    <p class="text-sm font-medium text-primary">{{ store.myQueue.bikeModel }} • {{ store.myQueue.platNomor }}</p>
                    <p class="text-xs text-muted">📍 {{ store.myQueue.location }}</p>
                    <p class="text-xs text-muted">🕐 Dijadwalkan {{ store.myQueue.scheduledTime }}</p>
                </div>
                <div class="text-center">
                    <QRPlaceholder :value="store.myQueue.queueNumber" />
                    <p class="text-[10px] text-muted mt-1">QR Pass</p>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div v-if="quickActions.length > 0">
            <p class="label mb-3">Aksi Cepat</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <router-link
                    v-for="action in quickActions"
                    :key="action.to"
                    :to="action.to"
                    class="card card-hover p-4 flex flex-col items-center gap-2 text-center cursor-pointer"
                >
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: var(--color-accent); opacity: 0.9">
                        <component :is="action.icon" class="w-5 h-5 text-white" />
                    </div>
                    <p class="text-sm font-semibold text-primary">{{ action.label }}</p>
                    <p class="text-xs text-muted">{{ action.desc }}</p>
                </router-link>
            </div>
        </div>

        <!-- Recent Queue -->
        <div v-if="store.currentRole !== 'customer'">
            <div class="flex items-center justify-between mb-3">
                <p class="label">Antrean Terkini</p>
                <router-link to="/antrean" class="text-xs text-accent hover:underline">Lihat Semua →</router-link>
            </div>
            <div class="card overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-theme">
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Antrean</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Motor</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden lg:table-cell">Lokasi</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-theme">
                            <tr v-for="task in recentTasks" :key="task.id" class="hover:bg-surface-2 transition-colors">
                                <td class="px-4 py-3">
                                    <span class="font-bold tabular text-accent">{{ task.queueNumber }}</span>
                                </td>
                                <td class="px-4 py-3">
                                    <p class="font-medium text-primary">{{ task.customerName }}</p>
                                    <p class="text-xs text-muted">{{ task.scheduledTime }}</p>
                                </td>
                                <td class="px-4 py-3 hidden md:table-cell text-muted">{{ task.bikeModel }}</td>
                                <td class="px-4 py-3 hidden lg:table-cell text-muted text-xs">{{ task.location }}</td>
                                <td class="px-4 py-3">
                                    <span :class="statusBadgeClass(task.status)">{{ statusLabel(task.status) }}</span>
                                </td>
                            </tr>
                            <tr v-if="recentTasks.length === 0">
                                <td colspan="5" class="px-6 py-12">
                                    <div class="mx-auto flex max-w-xs flex-col items-center text-center">
                                        <div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 text-indigo-500">
                                            <QueueListIcon class="h-6 w-6" />
                                        </div>
                                        <p class="mt-3 text-sm font-semibold text-primary">Belum ada antrean</p>
                                        <p class="mt-1 text-xs leading-5 text-muted">Antrean terbaru akan muncul di sini setelah customer melakukan booking.</p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/stores/app';
import {
    QueueListIcon, WrenchScrewdriverIcon, CheckCircleIcon,
    CurrencyDollarIcon, PlusCircleIcon, ChartBarIcon,
    SpeakerWaveIcon,
} from '@heroicons/vue/24/outline';
import QRPlaceholder from '@/components/QRPlaceholder.vue';

const store = useAppStore();
let queueCallTicker;

onMounted(() => {
    queueCallTicker = setInterval(store.syncQueueCall, 1000);
});

onUnmounted(() => clearInterval(queueCallTicker));

const firstName = computed(() => (store.user?.name || 'Tamu').split(' ')[0]);

const dateStr = computed(() => new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}));

const statCards = computed(() => [
    {
        label: 'Total Antrean Hari Ini',
        value: store.stats.total,
        icon: QueueListIcon,
        color: '#4f46e5',
        change: 'Hari ini',
    },
    {
        label: 'Sedang Menunggu',
        value: store.stats.menunggu,
        icon: QueueListIcon,
        color: '#6366f1',
        change: `${store.stats.menunggu} antri`,
    },
    {
        label: 'Sedang Dicuci',
        value: store.stats.proses,
        icon: WrenchScrewdriverIcon,
        color: '#64748b',
        change: `${store.stats.proses} aktif`,
    },
    {
        label: 'Pendapatan Hari Ini',
        value: `Rp ${(store.stats.pendapatan / 1000).toFixed(0)}K`,
        icon: CurrencyDollarIcon,
        color: '#475569',
        change: `${store.stats.selesai} selesai`,
    },
]);

const allQuickActions = [
    { to: '/booking', label: 'Booking Baru', desc: 'Daftar antrean cuci', icon: PlusCircleIcon },
    { to: '/antrean', label: 'Lihat Antrean', desc: 'Status antrean live', icon: QueueListIcon },
    { to: '/tugas', label: 'Tugas Pencuci/Service', desc: 'Board pengerjaan', icon: WrenchScrewdriverIcon },
    { to: '/admin', label: 'Panel Admin', desc: 'Monitoring operasional', icon: ChartBarIcon },
];

const quickActions = computed(() => allQuickActions.filter(action => {
    const allowedRoles = {
        '/booking': ['customer'],
        '/antrean': ['customer', 'washer', 'admin'],
        '/tugas': ['washer'],
        '/admin': ['admin'],
    };

    return allowedRoles[action.to].includes(store.currentRole);
}));

const recentTasks = computed(() => [...store.tasks].slice(-5).reverse());
const washSummary = computed(() => ({
    waiting: store.tasks.filter(task => task.serviceType === 'Cuci Motor' && task.status === 'menunggu').length,
    active: store.tasks.filter(task => task.serviceType === 'Cuci Motor' && task.status === 'proses').length,
}));
const serviceSummary = computed(() => ({
    waiting: store.tasks.filter(task => task.serviceType === 'Service Motor' && task.status === 'menunggu').length,
    active: store.tasks.filter(task => task.serviceType === 'Service Motor' && task.status === 'proses').length,
}));

function statusBadgeClass(status) {
    return {
        menunggu: 'badge-waiting',
        proses: 'badge-process',
        selesai: 'badge-done',
        dilewati: 'badge-skipped',
    }[status] || 'badge-waiting';
}

function statusLabel(status) {
    return { menunggu: 'Menunggu', proses: 'Sedang Dicuci', selesai: 'Selesai', dilewati: 'Dilewati' }[status] || status;
}
</script>

<style scoped>
.divide-theme > * + * { border-top: 1px solid var(--color-border); }
</style>
