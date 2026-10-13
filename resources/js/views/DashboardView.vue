<template>
    <div class="p-4 md:p-6 lg:p-8 space-y-6">
        <!-- Welcome Header -->
        <div>
            <p class="label">Dashboard</p>
            <h1 class="text-2xl font-bold text-primary mt-1">Selamat Datang, {{ firstName }}! 👋</h1>
            <p class="text-muted text-sm mt-1">{{ dateStr }} • Mode: <span class="font-semibold text-accent capitalize">{{ store.currentRole }}</span></p>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="stat-card card-hover cursor-default" v-for="stat in statCards" :key="stat.label">
                <div class="flex items-start justify-between mb-3">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="`background: ${stat.color}20`">
                        <component :is="stat.icon" class="w-5 h-5" :style="`color: ${stat.color}`" />
                    </div>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :style="`background: ${stat.color}15; color: ${stat.color}`">
                        {{ stat.change }}
                    </span>
                </div>
                <p class="text-2xl font-bold text-primary tabular">{{ stat.value }}</p>
                <p class="text-xs text-muted mt-0.5">{{ stat.label }}</p>
            </div>
        </div>

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
        <div>
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
        <div>
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
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '@/stores/app';
import {
    QueueListIcon, WrenchScrewdriverIcon, CheckCircleIcon,
    CurrencyDollarIcon, PlusCircleIcon, ChartBarIcon,
} from '@heroicons/vue/24/outline';
import QRPlaceholder from '@/components/QRPlaceholder.vue';

const store = useAppStore();

const firstName = computed(() => (store.user?.name || 'Tamu').split(' ')[0]);

const dateStr = computed(() => new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}));

const statCards = computed(() => [
    {
        label: 'Total Antrean Hari Ini',
        value: store.stats.total,
        icon: QueueListIcon,
        color: '#06b6d4',
        change: '+2 hari ini',
    },
    {
        label: 'Sedang Menunggu',
        value: store.stats.menunggu,
        icon: QueueListIcon,
        color: '#f59e0b',
        change: `${store.stats.menunggu} antri`,
    },
    {
        label: 'Sedang Dicuci',
        value: store.stats.proses,
        icon: WrenchScrewdriverIcon,
        color: '#3b82f6',
        change: `${store.stats.proses} aktif`,
    },
    {
        label: 'Pendapatan Hari Ini',
        value: `Rp ${(store.stats.pendapatan / 1000).toFixed(0)}K`,
        icon: CurrencyDollarIcon,
        color: '#10b981',
        change: `${store.stats.selesai} selesai`,
    },
]);

const quickActions = [
    { to: '/booking', label: 'Booking Baru', desc: 'Daftar antrean cuci', icon: PlusCircleIcon },
    { to: '/antrean', label: 'Lihat Antrean', desc: 'Status antrean live', icon: QueueListIcon },
    { to: '/tugas', label: 'Tugas Pencuci', desc: 'Board pengerjaan', icon: WrenchScrewdriverIcon },
    { to: '/admin', label: 'Panel Admin', desc: 'Monitoring operasional', icon: ChartBarIcon },
];

const recentTasks = computed(() => [...store.tasks].slice(-5).reverse());

function statusBadgeClass(status) {
    return {
        menunggu: 'badge-waiting',
        proses: 'badge-process',
        selesai: 'badge-done',
    }[status] || 'badge-waiting';
}

function statusLabel(status) {
    return { menunggu: 'Menunggu', proses: 'Sedang Dicuci', selesai: 'Selesai' }[status] || status;
}
</script>

<style scoped>
.divide-theme > * + * { border-top: 1px solid var(--color-border); }
</style>
