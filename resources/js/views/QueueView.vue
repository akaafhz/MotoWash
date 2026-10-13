<template>
    <div class="p-4 md:p-6 lg:p-8 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
                <p class="label">Antrean · Live</p>
                <h1 class="text-2xl font-bold text-primary mt-1">Status Antrean</h1>
                <p class="text-muted text-sm mt-1">
                    <span class="inline-flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Update otomatis setiap 30 detik
                    </span>
                </p>
            </div>
            <div class="sm:ml-auto flex gap-2">
                <div class="flex gap-2 flex-wrap">
                    <button
                        v-for="f in filters"
                        :key="f.key"
                        @click="activeFilter = f.key"
                        class="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                        :class="activeFilter === f.key
                            ? 'text-white border-transparent'
                            : 'border-theme text-muted hover:border-accent'"
                        :style="activeFilter === f.key ? 'background: var(--color-accent)' : ''"
                    >
                        {{ f.label }} <span class="ml-1 opacity-70">({{ f.count }})</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Active Call Banner -->
        <Transition name="bounce">
            <div v-if="store.activeQueue" class="card p-4 glow-cyan flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse" style="background: var(--color-accent)">
                    <SpeakerWaveIcon class="w-6 h-6 text-white" />
                </div>
                <div>
                    <p class="text-xs text-muted font-semibold uppercase tracking-wider">📢 Dipanggil Sekarang!</p>
                    <p class="text-2xl font-black tabular" style="color: var(--color-accent)">{{ store.activeQueue }}</p>
                </div>
                <p class="ml-auto text-sm text-muted hidden sm:block">Silakan menuju ke counter cuci</p>
            </div>
        </Transition>

        <!-- Summary Pills -->
        <div class="grid grid-cols-3 gap-3">
            <div v-for="s in summary" :key="s.label" class="card p-3 text-center">
                <p class="text-2xl font-bold tabular" :style="`color: ${s.color}`">{{ s.count }}</p>
                <p class="text-xs text-muted mt-0.5">{{ s.label }}</p>
            </div>
        </div>

        <!-- Queue List -->
        <div class="space-y-3">
            <TransitionGroup name="list" tag="div" class="space-y-3">
                <div
                    v-for="task in filteredTasks"
                    :key="task.id"
                    class="card p-4 card-hover"
                    :class="task.status === 'proses' ? 'border-l-4' : ''"
                    :style="task.status === 'proses' ? 'border-left-color: var(--color-accent)' : ''"
                >
                    <div class="flex items-start gap-4">
                        <!-- Queue Number -->
                        <div class="text-center shrink-0">
                            <div class="w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg tabular"
                                :style="task.status === 'proses'
                                    ? 'background: var(--color-accent); color: white'
                                    : 'background: var(--color-surface-2); color: var(--color-text)'"
                            >
                                {{ task.queueNumber }}
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                                <p class="font-semibold text-primary">{{ task.customerName }}</p>
                                <span :class="statusBadgeClass(task.status)">{{ statusLabel(task.status) }}</span>
                                <span class="text-xs text-muted px-1.5 py-0.5 rounded bg-surface-2">{{ task.serviceType }}</span>
                            </div>
                            <p class="text-sm text-muted">🛵 {{ task.bikeModel }} · <span class="font-mono">{{ task.platNomor }}</span></p>
                            <p class="text-xs text-muted mt-0.5">📍 {{ task.location }}</p>
                            <div class="flex items-center gap-3 mt-2 text-xs text-muted">
                                <span>🕐 Jadwal: <span class="font-medium tabular">{{ task.scheduledTime }}</span></span>
                                <span v-if="task.washerName">👷 {{ task.washerName }}</span>
                            </div>

                            <!-- Wash progress bar (if in process) -->
                            <div v-if="task.status === 'proses'" class="mt-3">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-xs text-muted">Progress cuci</span>
                                    <span class="text-xs font-mono text-accent">{{ getElapsed(task) }}</span>
                                </div>
                                <div class="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                                    <div
                                        class="h-full rounded-full transition-all duration-1000"
                                        style="background: var(--color-accent)"
                                        :style="{ width: getProgress(task) + '%' }"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- QR -->
                        <div class="hidden sm:block shrink-0">
                            <QRPlaceholder :value="task.queueNumber" :size="60" />
                        </div>
                    </div>
                </div>
            </TransitionGroup>

            <div v-if="filteredTasks.length === 0" class="card p-12 text-center">
                <QueueListIcon class="w-12 h-12 mx-auto mb-3 text-muted opacity-40" />
                <p class="text-muted">Tidak ada antrean dengan filter ini</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/stores/app';
import { QueueListIcon, SpeakerWaveIcon } from '@heroicons/vue/24/outline';
import QRPlaceholder from '@/components/QRPlaceholder.vue';

const store = useAppStore();
const activeFilter = ref('all');
let ticker;

onMounted(() => { ticker = setInterval(() => {}, 1000); });
onUnmounted(() => clearInterval(ticker));

const filters = computed(() => [
    { key: 'all', label: 'Semua', count: store.tasks.length },
    { key: 'menunggu', label: 'Menunggu', count: store.tasksByStatus.menunggu.length },
    { key: 'proses', label: 'Proses', count: store.tasksByStatus.proses.length },
    { key: 'selesai', label: 'Selesai', count: store.tasksByStatus.selesai.length },
]);

const filteredTasks = computed(() => {
    const t = activeFilter.value === 'all' ? store.tasks : store.tasks.filter(t => t.status === activeFilter.value);
    return [...t].reverse();
});

const summary = computed(() => [
    { label: 'Menunggu', count: store.stats.menunggu, color: '#f59e0b' },
    { label: 'Sedang Dicuci', count: store.stats.proses, color: '#3b82f6' },
    { label: 'Selesai', count: store.stats.selesai, color: '#10b981' },
]);

function statusBadgeClass(s) {
    return { menunggu: 'badge-waiting', proses: 'badge-process', selesai: 'badge-done' }[s];
}
function statusLabel(s) {
    return { menunggu: 'Menunggu', proses: 'Sedang Dicuci', selesai: 'Selesai' }[s] || s;
}

function getElapsed(task) {
    if (!task.startedAt) return '00:00';
    const diff = Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function getProgress(task) {
    if (!task.startedAt) return 0;
    const elapsed = (Date.now() - new Date(task.startedAt).getTime()) / 1000;
    const duration = task.serviceType === 'Premium' ? 1800 : task.serviceType === 'Express' ? 1200 : 900;
    return Math.min((elapsed / duration) * 100, 100);
}
</script>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }

.bounce-enter-active { animation: bounceIn 0.5s; }
.bounce-leave-active { animation: bounceIn 0.3s reverse; }
@keyframes bounceIn {
    0% { transform: scale(0.9); opacity: 0; }
    70% { transform: scale(1.02); }
    100% { transform: scale(1); opacity: 1; }
}
</style>
