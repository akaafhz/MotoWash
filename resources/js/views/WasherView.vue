<template>
    <div class="page-shell p-4 md:p-6 lg:p-8 space-y-6">
        <div>
            <p class="label">Pencuci · Service</p>
            <h1 class="text-2xl font-bold text-primary mt-1">Tugas Pencuci/Service</h1>
            <p class="text-muted text-sm">
                Selamat datang, <strong class="text-primary">{{ store.user?.name || 'Pencuci' }}</strong> —
                <span class="text-accent font-semibold">{{ activeTasks.length + activeServiceTasks.length }}</span> tugas aktif
            </p>
        </div>

        <!-- Active Wash Cards -->
        <div v-if="activeTasks.length > 0">
            <p class="label mb-3">Sedang Dikerjakan · Cuci Motor</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    v-for="task in activeTasks"
                    :key="task.id"
                    class="card p-5 border-l-4 glow-cyan"
                    style="border-left-color: var(--color-accent)"
                >
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-2xl font-black tabular" style="color: var(--color-accent)">{{ task.queueNumber }}</span>
                                <span class="badge-process">Sedang Dicuci</span>
                            </div>
                            <p class="font-semibold text-primary">{{ task.customerName }}</p>
                            <p class="text-sm text-muted">{{ task.bikeModel }} · <span class="font-mono">{{ task.platNomor }}</span></p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-mono font-bold tabular" style="color: var(--color-accent)">
                                {{ getElapsed(task) }}
                            </div>
                            <p class="text-[10px] text-muted">Waktu Berjalan</p>
                        </div>
                    </div>

                    <!-- Info -->
                    <div class="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div class="p-2 rounded-lg bg-surface-2">
                            <p class="text-xs text-muted">Lokasi</p>
                            <p class="font-medium text-primary text-xs mt-0.5">{{ task.location }}</p>
                        </div>
                        <div class="p-2 rounded-lg bg-surface-2">
                            <p class="text-xs text-muted">Layanan</p>
                            <p class="font-medium text-primary text-xs mt-0.5">{{ task.serviceType }} · {{ servicePrice(task.serviceType) }}</p>
                        </div>
                    </div>

                    <!-- Progress Ring -->
                    <div class="flex items-center gap-3 mb-4">
                        <svg class="w-14 h-14 shrink-0 timer-ring -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke-width="3" style="stroke: var(--color-surface-2)" />
                            <circle
                                cx="18" cy="18" r="15" fill="none" stroke-width="3"
                                stroke-linecap="round"
                                :stroke-dasharray="`${getProgress(task) * 0.942} 94.2`"
                                style="stroke: var(--color-accent); transition: stroke-dasharray 1s linear"
                            />
                        </svg>
                        <div class="flex-1">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-muted">Progress</span>
                                <span class="tabular font-semibold text-accent">{{ Math.round(getProgress(task)) }}%</span>
                            </div>
                            <div class="h-2 rounded-full bg-surface-2 overflow-hidden">
                                <div
                                    class="h-full rounded-full transition-all duration-1000"
                                    style="background: var(--color-accent)"
                                    :style="{ width: getProgress(task) + '%' }"
                                />
                            </div>
                            <p class="text-xs text-muted mt-1">Estimasi selesai: {{ getETA(task) }}</p>
                        </div>
                    </div>

                    <button
                        @click="finishWash(task)"
                        class="btn-primary w-full py-3 text-base"
                    >
                        ✅ Selesaikan Cuci
                    </button>
                </div>
            </div>
        </div>

        <!-- Service Tasks -->
        <section>
            <div class="flex items-center justify-between mb-3">
                <div>
                    <p class="label">Service Motor</p>
                    <p class="text-sm text-muted mt-1">Pengecekan awal Rp10.000 · biaya tambahan ditentukan setelah pemeriksaan.</p>
                </div>
                <span class="badge-process">{{ activeServiceTasks.length }} aktif</span>
            </div>
            <div v-if="serviceTasks.length === 0" class="card p-6 text-center">
                <p class="text-sm text-muted">Tidak ada antrean service motor.</p>
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    v-for="task in serviceTasks"
                    :key="task.id"
                    class="card p-5 border-l-4 glow-cyan"
                    style="border-left-color: #c26a2d"
                >
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-2xl font-black tabular text-accent">{{ task.queueNumber }}</span>
                                <span :class="task.status === 'proses' ? 'badge-process' : 'badge-waiting'">
                                    {{ task.status === 'proses' ? 'Sedang Diservice' : 'Menunggu' }}
                                </span>
                            </div>
                            <p class="font-semibold text-primary">{{ task.customerName }}</p>
                            <p class="text-sm text-muted">{{ task.bikeModel }} · <span class="font-mono">{{ task.platNomor }}</span></p>
                        </div>
                        <div v-if="task.status === 'proses'" class="text-center">
                            <div class="text-3xl font-mono font-bold tabular text-accent">{{ getElapsed(task) }}</div>
                            <p class="text-[10px] text-muted">Waktu Berjalan</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div class="p-2 rounded-lg bg-surface-2">
                            <p class="text-xs text-muted">Lokasi</p>
                            <p class="font-medium text-primary text-xs mt-0.5">{{ task.location }}</p>
                        </div>
                        <div class="p-2 rounded-lg bg-surface-2">
                            <p class="text-xs text-muted">Biaya awal</p>
                            <p class="font-medium text-primary text-xs mt-0.5">Rp 10.000</p>
                        </div>
                    </div>

                    <div class="p-3 rounded-lg bg-surface-2 mb-4">
                        <p class="text-xs text-muted">Keluhan customer</p>
                        <p class="text-sm text-primary mt-1">{{ task.notes || 'Tidak ada catatan.' }}</p>
                    </div>

                    <div v-if="task.status === 'proses'" class="flex items-center gap-3 mb-4">
                        <svg class="w-14 h-14 shrink-0 timer-ring -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke-width="3" style="stroke: var(--color-surface-2)" />
                            <circle
                                cx="18" cy="18" r="15" fill="none" stroke-width="3"
                                stroke-linecap="round"
                                :stroke-dasharray="`${getProgress(task) * 0.942} 94.2`"
                                style="stroke: #c26a2d; transition: stroke-dasharray 1s linear"
                            />
                        </svg>
                        <div class="flex-1">
                            <div class="flex justify-between text-xs mb-1">
                                <span class="text-muted">Progress service</span>
                                <span class="tabular font-semibold text-accent">{{ Math.round(getProgress(task)) }}%</span>
                            </div>
                            <div class="h-2 rounded-full bg-surface-2 overflow-hidden">
                                <div class="h-full rounded-full" style="background: #c26a2d" :style="{ width: getProgress(task) + '%' }" />
                            </div>
                            <p class="text-xs text-muted mt-1">Estimasi selesai: {{ getETA(task) }}</p>
                        </div>
                    </div>

                    <button v-if="task.status === 'menunggu'" @click="startWash(task)" class="btn-primary w-full py-3 text-base">
                        ▶ Mulai Service
                    </button>
                    <button v-else @click="finishWash(task)" class="btn-primary w-full py-3 text-base">
                        ✅ Selesaikan Service
                    </button>
                </div>
            </div>
        </section>

        <!-- Waiting Tasks -->
        <div>
            <div class="flex items-center justify-between mb-3">
                <p class="label">Tugas Cuci Motor Masuk ({{ waitingTasks.length }})</p>
            </div>

            <div v-if="waitingTasks.length === 0" class="card p-10 text-center">
                <CheckCircleIcon class="w-12 h-12 mx-auto mb-3 text-green-500 opacity-60" />
                <p class="font-semibold text-primary">Semua tugas selesai!</p>
                <p class="text-sm text-muted mt-1">Tidak ada motor menunggu pengerjaan</p>
            </div>

            <div class="space-y-3">
                <div
                    v-for="task in waitingTasks"
                    :key="task.id"
                    class="card p-4 card-hover"
                >
                    <div class="flex items-center gap-4">
                        <div
                            class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm tabular shrink-0 bg-surface-2 text-primary"
                        >
                            {{ task.queueNumber }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-0.5 flex-wrap">
                                <p class="font-semibold text-primary">{{ task.customerName }}</p>
                                <span class="badge-waiting">Menunggu</span>
                                <span class="text-xs text-muted px-1.5 py-0.5 rounded bg-surface-2">{{ task.serviceType }}</span>
                            </div>
                            <p class="text-sm text-muted">{{ task.bikeModel }} · <span class="font-mono text-xs">{{ task.platNomor }}</span></p>
                            <p class="text-xs text-muted mt-0.5">📍 {{ task.location }} · 🕐 {{ task.scheduledTime }}</p>
                        </div>
                        <button
                            @click="startWash(task)"
                            class="btn-primary shrink-0 text-sm py-2"
                        >
                            ▶ Mulai Cuci
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Completed Today -->
        <div v-if="doneTasks.length > 0">
            <p class="label mb-3">Selesai Hari Ini ({{ doneTasks.length }})</p>
            <div class="card overflow-hidden">
                <div class="divide-y" style="--tw-divide-opacity: 1">
                    <div v-for="task in doneTasks" :key="task.id" class="flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors">
                        <div class="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                        <span class="font-mono font-bold text-sm text-accent">{{ task.queueNumber }}</span>
                        <span class="text-sm text-primary flex-1">{{ task.customerName }}</span>
                        <span class="text-xs text-muted hidden sm:block">{{ task.bikeModel }}</span>
                        <span class="badge-done">Selesai</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useAppStore } from '@/stores/app';
import { CheckCircleIcon } from '@heroicons/vue/24/outline';

const store = useAppStore();
const tick = ref(0);
let interval;

onMounted(() => { interval = setInterval(() => tick.value++, 1000); });
onUnmounted(() => clearInterval(interval));

const waitingTasks = computed(() => store.tasksByStatus.menunggu
    .filter(task => task.serviceType === 'Cuci Motor')
    .sort(sortBySchedule));
const activeTasks = computed(() => store.tasksByStatus.proses.filter(task => task.serviceType === 'Cuci Motor'));
const serviceTasks = computed(() => store.tasks
    .filter(task => task.serviceType === 'Service Motor' && task.status !== 'selesai')
    .sort(sortBySchedule));
const activeServiceTasks = computed(() => serviceTasks.value.filter(task => task.status === 'proses'));

function sortBySchedule(a, b) {
    return a.scheduledTime.localeCompare(b.scheduledTime) || new Date(a.createdAt) - new Date(b.createdAt);
}
const doneTasks = computed(() => store.tasksByStatus.selesai);

function servicePrice(type) {
    return type === 'Cuci Motor' ? 'Rp 15K' : type === 'Service Motor' ? 'Rp 10K cek awal' : '-';
}

function getElapsed(task) {
    void tick.value;
    if (!task.startedAt) return '00:00';
    const diff = Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function getDuration(task) {
    return task.serviceType === 'Service Motor' ? 1200 : 900;
}

function getProgress(task) {
    void tick.value;
    if (!task.startedAt) return 0;
    const elapsed = (Date.now() - new Date(task.startedAt).getTime()) / 1000;
    return Math.min((elapsed / getDuration(task)) * 100, 100);
}

function getETA(task) {
    if (!task.startedAt) return '--:--';
    const done = new Date(task.startedAt).getTime() + getDuration(task) * 1000;
    return new Date(done).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function startWash(task) {
    if (!store.canStartTask(task.id)) return;
    store.startWash(task.id, store.user?.name);
}

function finishWash(task) {
    store.finishWash(task.id);
}
</script>

<style scoped>
.divide-y > * + * { border-top: 1px solid var(--color-border); }
</style>
