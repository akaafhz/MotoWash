<template>
    <div class="page-shell p-4 md:p-6 lg:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
                <p class="label">Admin · Monitoring</p>
                <h1 class="text-2xl font-bold text-primary mt-1">Panel Operasional</h1>
                <p class="text-muted text-sm">Monitoring real-time antrean, kapasitas & pendapatan</p>
            </div>
            <div class="sm:ml-auto">
                <button
                    @click="callNext"
                    class="btn-primary px-6 py-3 text-base w-full sm:w-auto flex items-center gap-2 justify-center"
                    :disabled="store.tasksByStatus.menunggu.length === 0"
                >
                    <SpeakerWaveIcon class="w-5 h-5" />
                    Panggil Antrean Berikutnya
                </button>
            </div>
        </div>

        <!-- Call Banner -->
        <Transition name="bounce">
            <div v-if="calledQueue" class="card p-5 glow-cyan flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center animate-bounce" style="background: var(--color-accent)">
                    <SpeakerWaveIcon class="w-7 h-7 text-white" />
                </div>
                <div>
                    <p class="label">📢 Dipanggil!</p>
                    <p class="text-3xl font-black tabular mt-0.5" style="color: var(--color-accent)">{{ calledQueue.queueNumber }}</p>
                    <p class="text-sm text-muted">{{ calledQueue.customerName }} · {{ calledQueue.location }}</p>
                </div>
            </div>
        </Transition>

        <!-- Revenue & Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="stat-card" v-for="s in statCards" :key="s.label">
                <p class="label mb-2">{{ s.label }}</p>
                <p class="text-3xl font-bold tabular text-primary">{{ s.value }}</p>
                <p class="text-xs text-muted mt-1">{{ s.sub }}</p>
            </div>
        </div>

        <!-- Service and report summary -->
        <section>
            <div class="flex items-end justify-between gap-4 mb-3">
                <div>
                    <p class="label">Insight Operasional</p>
                    <h2 class="text-lg font-bold text-primary mt-1">Ringkasan layanan & laporan hari ini</h2>
                </div>
                <p class="hidden sm:block text-xs text-muted">Data diperbarui secara real-time</p>
            </div>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                <div class="card p-5 h-full">
                    <div class="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <p class="label">Ringkasan Layanan</p>
                            <p class="text-sm text-muted mt-1">Distribusi order berdasarkan layanan.</p>
                        </div>
                        <div class="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center shrink-0">
                            <ChartBarIcon class="w-5 h-5 text-accent" />
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div v-for="service in serviceSummary" :key="service.name">
                            <div class="flex items-center justify-between gap-4 text-sm mb-2">
                                <span class="font-semibold text-primary">{{ service.name }}</span>
                                <span class="text-xs text-muted text-right">{{ service.count }} order · {{ service.revenue }}</span>
                            </div>
                            <div class="h-2.5 rounded-full bg-surface-2 overflow-hidden">
                                <div class="h-full rounded-full" :style="{ width: service.percent + '%', background: service.color }" />
                            </div>
                        </div>
                    </div>
                    <div class="mt-5 pt-4 border-t border-theme flex items-center justify-between text-xs">
                        <span class="text-muted">Total order tercatat</span>
                        <span class="font-bold text-primary">{{ store.tasks.length }} order</span>
                    </div>
                </div>

                <div class="card p-5 h-full">
                    <div class="flex items-start justify-between gap-4 mb-5">
                        <div>
                            <p class="label">Laporan Hari Ini</p>
                            <p class="text-sm text-muted mt-1">Ringkasan yang siap ditinjau admin.</p>
                        </div>
                        <span class="badge-done shrink-0">Aktif</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="rounded-xl bg-surface-2 p-4">
                            <p class="text-xs text-muted">Rata-rata antrean</p>
                            <p class="text-xl font-bold text-primary mt-1">{{ averageQueueTime }} mnt</p>
                        </div>
                        <div class="rounded-xl bg-surface-2 p-4">
                            <p class="text-xs text-muted">Tingkat selesai</p>
                            <p class="text-xl font-bold text-primary mt-1">{{ completionRate }}%</p>
                        </div>
                        <div class="rounded-xl bg-surface-2 p-4">
                            <p class="text-xs text-muted">Bay tersedia</p>
                            <p class="text-xl font-bold text-primary mt-1">{{ bays.length - busyBays }}/{{ bays.length }}</p>
                        </div>
                        <div class="rounded-xl bg-surface-2 p-4">
                            <p class="text-xs text-muted">Omzet selesai</p>
                            <p class="text-xl font-bold text-primary mt-1">Rp {{ store.stats.pendapatan.toLocaleString('id-ID') }}</p>
                        </div>
                    </div>
                    <div class="mt-5 pt-4 border-t border-theme flex items-center justify-between text-xs">
                        <span class="text-muted">Status operasional</span>
                        <span class="font-semibold text-accent">{{ busyBays }}/{{ bays.length }} bay sedang digunakan</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Bay Capacity -->
        <div>
            <p class="label mb-3">Kapasitas Bay ({{ busyBays }}/{{ bays.length }} Terpakai)</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div
                    v-for="bay in bays"
                    :key="bay.id"
                    class="card p-4 cursor-pointer card-hover"
                    :class="bay.task ? 'border-l-4' : ''"
                    :style="bay.task ? 'border-left-color: var(--color-accent)' : ''"
                    @click="bay.task ? null : null"
                >
                    <div class="flex items-center justify-between mb-3">
                        <p class="font-bold text-sm text-primary">Bay {{ bay.id }}</p>
                        <span
                            class="w-2.5 h-2.5 rounded-full"
                            :class="bay.task ? 'bg-blue-400 animate-pulse' : 'bg-green-400'"
                        />
                    </div>
                    <div v-if="bay.task">
                        <p class="text-xs font-semibold text-accent">{{ bay.task.queueNumber }}</p>
                        <p class="text-xs text-primary font-medium mt-0.5 truncate">{{ bay.task.customerName }}</p>
                        <p class="text-xs text-muted mt-0.5 truncate">{{ bay.task.bikeModel }}</p>
                        <div class="mt-2 h-1 rounded-full bg-surface-2 overflow-hidden">
                            <div
                                class="h-full rounded-full"
                                style="background: var(--color-accent); transition: width 1s linear"
                                :style="{ width: getProgress(bay.task) + '%' }"
                            />
                        </div>
                    </div>
                    <div v-else class="text-center py-2">
                        <p class="text-xs text-green-500 font-semibold">✓ Kosong</p>
                        <p class="text-[10px] text-muted">Siap pakai</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Queue Board Table -->
        <div>
            <p class="label mb-3">Semua Antrean Hari Ini</p>
            <div class="card overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-theme bg-surface-2">
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">No</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Customer</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden sm:table-cell">Motor</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider hidden md:table-cell">Lokasi</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Layanan</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                                <th class="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Pendapatan</th>
                                <th class="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="task in store.tasks"
                                :key="task.id"
                                class="border-b border-theme hover:bg-surface-2 transition-colors"
                            >
                                <td class="px-4 py-3">
                                    <span class="font-bold tabular text-accent">{{ task.queueNumber }}</span>
                                </td>
                                <td class="px-4 py-3">
                                    <p class="font-medium text-primary">{{ task.customerName }}</p>
                                    <p class="text-xs text-muted tabular">{{ task.scheduledTime }}</p>
                                </td>
                                <td class="px-4 py-3 text-muted hidden sm:table-cell text-xs">
                                    {{ task.bikeModel }}<br>
                                    <span class="font-mono">{{ task.platNomor }}</span>
                                </td>
                                <td class="px-4 py-3 text-muted hidden md:table-cell text-xs">{{ task.location }}</td>
                                <td class="px-4 py-3">
                                    <span class="text-xs px-1.5 py-0.5 rounded bg-surface-2 text-muted">{{ task.serviceType }}</span>
                                </td>
                                <td class="px-4 py-3">
                                    <span :class="statusBadgeClass(task.status)">{{ statusLabel(task.status) }}</span>
                                    <p v-if="task.status === 'dilewati'" class="text-[11px] text-muted mt-1">
                                        Alasan: {{ task.skipReason || 'Tidak dicatat' }}
                                    </p>
                                </td>
                                <td class="px-4 py-3 tabular text-sm" :class="task.status === 'selesai' ? 'text-green-500 font-semibold' : 'text-muted'">
                                    {{ task.status === 'selesai' ? servicePrice(task.serviceType) : '-' }}
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <div class="flex gap-1 justify-end">
                                        <button
                                            v-if="task.status === 'menunggu' && store.canStartTask(task.id)"
                                            @click="store.startWash(task.id)"
                                            class="px-2 py-1 rounded text-xs btn-primary"
                                        >
                                            Mulai
                                        </button>
                                        <button
                                            v-if="task.status === 'menunggu'"
                                            @click="skipTask(task)"
                                            class="px-2 py-1 rounded text-xs btn-secondary"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            v-if="task.status === 'proses'"
                                            @click="store.finishWash(task.id)"
                                            class="px-2 py-1 rounded text-xs bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                                        >
                                            Selesai
                                        </button>
                                        <span v-if="task.status === 'selesai'" class="text-xs text-green-500">✓</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/stores/app';
import { SpeakerWaveIcon, ChartBarIcon } from '@heroicons/vue/24/outline';

const store = useAppStore();
const calledQueue = ref(null);
const tick = ref(0);
let interval;

onMounted(() => { interval = setInterval(() => tick.value++, 1000); });
onUnmounted(() => clearInterval(interval));

const busyBays = computed(() => store.tasksByStatus.proses.length);

const bays = computed(() => {
    const active = store.tasksByStatus.proses;
    return [1, 2, 3, 4].map(id => ({
        id,
        task: active[id - 1] || null,
    }));
});

const statCards = computed(() => [
    { label: 'Total Antrean', value: store.stats.total, sub: 'Hari ini' },
    { label: 'Menunggu', value: store.stats.menunggu, sub: 'Belum dikerjakan' },
    { label: 'Sedang Proses', value: store.stats.proses, sub: `${busyBays.value}/4 bay aktif` },
    { label: 'Pendapatan', value: `Rp ${(store.stats.pendapatan / 1000).toFixed(0)}K`, sub: `${store.stats.selesai} order selesai` },
]);

const serviceSummary = computed(() => {
    const definitions = [
        { name: 'Cuci Motor', color: '#0f766e', price: 15000 },
        { name: 'Service Motor', color: '#c26a2d', price: 10000 },
    ];
    const total = store.tasks.length || 1;

    return definitions.map(service => {
        const count = store.tasks.filter(task => task.serviceType === service.name).length;
        return {
            ...service,
            count,
            percent: Math.max((count / total) * 100, count ? 8 : 0),
            revenue: `Rp ${(store.tasks.filter(task => task.serviceType === service.name && task.status === 'selesai').length * service.price).toLocaleString('id-ID')}`,
        };
    });
});

const averageQueueTime = computed(() => {
    if (!store.tasks.length) return 0;
    const totalMinutes = store.tasks.reduce((total, task) => {
        if (!task.startedAt) return total;
        return total + Math.max(0, (new Date(task.startedAt) - new Date(task.createdAt)) / 60000);
    }, 0);
    return Math.round(totalMinutes / store.tasks.length);
});

const completionRate = computed(() => Math.round((store.stats.selesai / Math.max(store.stats.total, 1)) * 100));

function callNext() {
    const next = store.callNextQueue();
    if (next) {
        calledQueue.value = next;
        setTimeout(() => calledQueue.value = null, 6000);
    }
}

function skipTask(task) {
    const reason = window.prompt(`Alasan skip antrean ${task.queueNumber}:`);
    if (reason?.trim()) store.skipTask(task.id, reason);
}

function statusBadgeClass(s) {
    return { menunggu: 'badge-waiting', proses: 'badge-process', selesai: 'badge-done', dilewati: 'badge-skipped' }[s];
}
function statusLabel(s) {
    return { menunggu: 'Menunggu', proses: 'Sedang Dicuci', selesai: 'Selesai', dilewati: 'Dilewati' }[s] || s;
}
function servicePrice(type) {
    return type === 'Cuci Motor' ? 'Rp 15.000' : type === 'Service Motor' ? 'Rp 10.000 (cek awal)' : '-';
}
function getProgress(task) {
    void tick.value;
    if (!task.startedAt) return 0;
    const dur = task.serviceType === 'Service Motor' ? 1200 : 900;
    return Math.min(((Date.now() - new Date(task.startedAt).getTime()) / 1000 / dur) * 100, 100);
}
</script>

<style scoped>
.bounce-enter-active { animation: bounceIn 0.4s; }
.bounce-leave-active { animation: bounceIn 0.3s reverse; }
@keyframes bounceIn {
    0% { transform: scale(0.9); opacity: 0; }
    70% { transform: scale(1.02); }
    100% { transform: scale(1); opacity: 1; }
}
</style>
