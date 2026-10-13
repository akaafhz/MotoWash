<template>
    <div class="p-4 md:p-6 lg:p-8 max-w-3xl">
        <div class="mb-6">
            <p class="label">Customer · Pemesanan</p>
            <h1 class="text-2xl font-bold text-primary mt-1">Booking Motor</h1>
            <p class="text-muted text-sm mt-1">Daftar antrean cuci motor tanpa perlu antri di tempat</p>
        </div>

        <!-- Success state -->
        <Transition name="slide-up">
            <div v-if="booking" class="card p-6 mb-6 glow-cyan">
                <div class="flex items-center gap-3 mb-5">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/20">
                        <CheckCircleIcon class="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                        <p class="font-semibold text-primary">Booking Berhasil!</p>
                        <p class="text-xs text-muted">Nomor antrean kamu sudah aktif</p>
                    </div>
                    <button @click="booking = null" class="ml-auto text-muted hover:text-primary">
                        <XMarkIcon class="w-5 h-5" />
                    </button>
                </div>

                <!-- QR Ticket -->
                <div class="flex flex-col sm:flex-row items-center gap-6">
                    <div class="text-center">
                        <div class="text-6xl font-black tabular mb-1" style="color: var(--color-accent)">
                            {{ booking.queueNumber }}
                        </div>
                        <p class="text-xs text-muted">Nomor Antrean</p>
                        <div class="mt-3">
                            <QRPlaceholder :value="booking.queueNumber" :size="120" />
                            <p class="text-[10px] text-muted mt-1">Tunjukkan ke petugas</p>
                        </div>
                    </div>
                    <div class="flex-1 space-y-3 w-full">
                        <div class="p-3 rounded-lg bg-surface-2">
                            <div class="grid grid-cols-2 gap-y-2 text-sm">
                                <div>
                                    <p class="text-xs text-muted">Motor</p>
                                    <p class="font-medium text-primary">{{ booking.bikeModel }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-muted">Plat</p>
                                    <p class="font-medium text-primary tabular">{{ booking.platNomor }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-muted">Lokasi</p>
                                    <p class="font-medium text-primary">{{ booking.location }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-muted">Jadwal</p>
                                    <p class="font-medium text-primary tabular">{{ booking.scheduledTime }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-muted">Layanan</p>
                                    <p class="font-medium text-primary">{{ booking.serviceType }}</p>
                                </div>
                                <div>
                                    <p class="text-xs text-muted">Biaya</p>
                                    <p class="font-medium text-accent">{{ servicePrice(booking.serviceType) }}</p>
                                </div>
                            </div>
                        </div>
                        <span class="badge-waiting">⏳ Menunggu dipanggil</span>
                        <router-link to="/antrean" class="btn-secondary block text-center text-sm">
                            Pantau Status Antrean →
                        </router-link>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Form -->
        <div class="card p-6">
            <form @submit.prevent="handleSubmit" class="space-y-5">
                <!-- Motor Info -->
                <div>
                    <p class="label mb-3">Informasi Motor</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-muted mb-1.5">Model Motor *</label>
                            <input
                                v-model="form.bikeModel"
                                type="text"
                                class="input-field"
                                placeholder="Contoh: Honda Vario 125"
                                required
                            />
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-muted mb-1.5">Nomor Plat *</label>
                            <input
                                v-model="form.platNomor"
                                type="text"
                                class="input-field font-mono"
                                placeholder="B 1234 XY"
                                required
                                style="text-transform: uppercase"
                            />
                        </div>
                    </div>
                </div>

                <!-- Jadwal & Lokasi -->
                <div>
                    <p class="label mb-3">Jadwal & Lokasi</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-medium text-muted mb-1.5">Jam Pengambilan *</label>
                            <select v-model="form.scheduledTime" class="input-field" required>
                                <option value="">-- Pilih Jam --</option>
                                <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-muted mb-1.5">Lokasi Parkir *</label>
                            <select v-model="form.location" class="input-field" required>
                                <option value="">-- Pilih Lokasi --</option>
                                <option v-for="loc in locations" :key="loc" :value="loc">{{ loc }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Jenis Layanan -->
                <div>
                    <p class="label mb-3">Pilih Layanan</p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div
                            v-for="svc in services"
                            :key="svc.key"
                            @click="form.serviceType = svc.key"
                            class="card p-4 cursor-pointer transition-all border-2"
                            :class="form.serviceType === svc.key ? 'border-accent glow-cyan' : 'border-transparent hover:border-theme'"
                            :style="form.serviceType === svc.key ? 'border-color: var(--color-accent)' : ''"
                        >
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-lg">{{ svc.emoji }}</span>
                                <div
                                    class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                                    :style="form.serviceType === svc.key ? 'border-color: var(--color-accent); background: var(--color-accent)' : 'border-color: var(--color-border)'"
                                >
                                    <div v-if="form.serviceType === svc.key" class="w-2 h-2 rounded-full bg-white" />
                                </div>
                            </div>
                            <p class="font-semibold text-sm text-primary">{{ svc.name }}</p>
                            <p class="text-xs text-muted mt-0.5">{{ svc.desc }}</p>
                            <p class="text-sm font-bold mt-2" style="color: var(--color-accent)">{{ svc.price }}</p>
                        </div>
                    </div>
                </div>

                <!-- Catatan -->
                <div>
                    <label class="block text-xs font-medium text-muted mb-1.5">Catatan Tambahan</label>
                    <textarea
                        v-model="form.notes"
                        class="input-field resize-none"
                        rows="3"
                        placeholder="Contoh: motor ada lecet di bagian kanan, fokus ke area ban..."
                    />
                </div>

                <!-- Submit -->
                <div class="flex gap-3 pt-2">
                    <button
                        type="button"
                        @click="resetForm"
                        class="btn-secondary flex-1"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        class="btn-primary flex-1"
                        :disabled="submitting"
                    >
                        <span v-if="submitting" class="flex items-center justify-center gap-2">
                            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Memproses...
                        </span>
                        <span v-else>🛵 Booking Sekarang</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAppStore } from '@/stores/app';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import QRPlaceholder from '@/components/QRPlaceholder.vue';

const store = useAppStore();
const booking = ref(null);
const submitting = ref(false);

const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
    '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
];

const locations = [
    'Parkir Depan Kantin',
    'Parkir Basement B1',
    'Parkir Basement B2',
    'Parkir Timur Lt. 1',
    'Parkir Timur Lt. 2',
    'Parkir Selatan',
    'Parkir Utara (Dekat Lobby)',
];

const services = [
    { key: 'Standard', name: 'Standard', emoji: '🚿', desc: 'Cuci biasa + semprot', price: 'Rp 15.000' },
    { key: 'Express', name: 'Express', emoji: '⚡', desc: 'Cuci cepat 20 menit', price: 'Rp 20.000' },
    { key: 'Premium', name: 'Premium', emoji: '✨', desc: 'Cuci detail + lap poles', price: 'Rp 25.000' },
];

const defaultForm = {
    bikeModel: '',
    platNomor: '',
    scheduledTime: '',
    location: '',
    serviceType: 'Standard',
    notes: '',
};

const form = reactive({ ...defaultForm });

function servicePrice(type) {
    return services.find(s => s.key === type)?.price || '-';
}

function resetForm() {
    Object.assign(form, defaultForm);
    booking.value = null;
}

async function handleSubmit() {
    submitting.value = true;
    await new Promise(r => setTimeout(r, 600));
    booking.value = store.createBooking({ ...form });
    submitting.value = false;
    Object.assign(form, defaultForm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
