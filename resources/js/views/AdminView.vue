<template>
    <div class="p-4 md:p-6 lg:p-8 space-y-6">
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
                                </td>
                                <td class="px-4 py-3 tabular text-sm" :class="task.status === 'selesai' ? 'text-green-500 font-semibold' : 'text-muted'">
                                    {{ task.status === 'selesai' ? servicePrice(task.serviceType) : '-' }}
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <div class="flex gap-1 justify-end">
                                        <button
                                            v-if="task.status === 'menunggu'"
                                            @click="store.startWash(task.id)"
                                            class="px-2 py-1 rounded text-xs btn-primary"
                                        >
                                            Mulai
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
import { SpeakerWaveIcon } from '@heroicons/vue/24/outline';

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

function callNext() {
    const next = store.callNextQueue();
    if (next) {
        calledQueue.value = next;
        setTimeout(() => calledQueue.value = null, 6000);
    }
}

function statusBadgeClass(s) {
    return { menunggu: 'badge-waiting', proses: 'badge-process', selesai: 'badge-done' }[s];
}
function statusLabel(s) {
    return { menunggu: 'Menunggu', proses: 'Sedang Dicuci', selesai: 'Selesai' }[s] || s;
}
function servicePrice(type) {
    return { Standard: 'Rp 15.000', Express: 'Rp 20.000', Premium: 'Rp 25.000' }[type] || '-';
}
function getProgress(task) {
    void tick.value;
    if (!task.startedAt) return 0;
    const dur = task.serviceType === 'Premium' ? 1800 : task.serviceType === 'Express' ? 1200 : 900;
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
