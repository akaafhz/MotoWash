<template>
    <div class="page-shell p-4 md:p-6 lg:p-8 max-w-4xl space-y-6">
        <div class="mb-6">
            <p class="label">Customer · Pemesanan</p>
            <h1 class="text-2xl font-bold text-primary mt-1">Booking Motor</h1>
            <p class="text-muted text-sm mt-1">Daftar antrean cuci motor tanpa perlu antri di tempat</p>
        </div>

        <!-- Saved vehicles -->
        <section class="card p-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <p class="label">Kendaraan Saya</p>
                    <p class="text-sm text-muted mt-1">Simpan data motor agar booking berikutnya lebih cepat.</p>
                </div>
                <span class="text-xs font-semibold text-accent">{{ store.myVehicles.length }} kendaraan tersimpan</span>
            </div>

            <div v-if="store.myVehicles.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div
                    v-for="vehicle in store.myVehicles"
                    :key="vehicle.id"
                    class="rounded-lg border border-theme p-3 flex items-center gap-3"
                >
                    <div class="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-lg">🛵</div>
                    <button type="button" class="text-left flex-1 min-w-0" @click="useVehicle(vehicle)">
                        <p class="font-semibold text-sm text-primary truncate">{{ vehicle.bikeModel }}</p>
                        <p class="text-xs text-muted font-mono">{{ vehicle.platNomor }}</p>
                    </button>
                    <button type="button" class="text-xs text-red-500 hover:underline" @click="store.removeVehicle(vehicle.id)">
                        Hapus
                    </button>
                </div>
            </div>

            <form class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2" @submit.prevent="saveVehicle">
                <input v-model="vehicleForm.bikeModel" class="input-field" placeholder="Model motor" required />
                <input v-model="vehicleForm.platNomor" class="input-field font-mono" placeholder="Nomor plat" required />
                <button class="btn-secondary" type="submit">+ Simpan Motor</button>
            </form>
        </section>

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

                        <!-- Customer history -->
                        <section class="card overflow-hidden">
                            <div class="p-5 border-b border-theme">
                                <p class="label">Riwayat Antrean</p>
                                <p class="text-sm text-muted mt-1">Riwayat booking yang pernah dibuat dari akun ini.</p>
                            </div>
                            <div v-if="store.myBookings.length" class="divide-theme">
                                <div v-for="item in store.myBookings" :key="item.id" class="flex items-center gap-3 px-5 py-3">
                                    <span class="font-bold text-accent tabular">{{ item.queueNumber }}</span>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-primary truncate">{{ item.bikeModel }} · {{ item.platNomor }}</p>
                                        <p class="text-xs text-muted">{{ item.serviceType }} · {{ item.scheduledTime }}</p>
                                    </div>
                                    <span :class="statusBadgeClass(item.status)">{{ statusLabel(item.status) }}</span>
                                </div>
                            </div>
                            <p v-else class="p-5 text-sm text-muted">Belum ada riwayat booking.</p>
                        </section>
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
                                <option
                                    v-for="slot in availableTimeSlots"
                                    :key="slot.time"
                                    :value="slot.time"
                                    :disabled="slot.full"
                                >
                                    {{ slot.time }}{{ slot.full ? ' — Penuh' : '' }}
                                </option>
                            </select>
                            <p class="text-xs text-muted mt-1.5">
                                Pilih mode dan lokasi terlebih dahulu untuk melihat jam yang masih tersedia.
                            </p>
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
                        :required="form.serviceType === 'Service Motor'"
                        :placeholder="form.serviceType === 'Service Motor'
                            ? 'Jelaskan kerusakan atau keluhan motor...'
                            : 'Contoh: motor ada lecet di bagian kanan, fokus ke area ban...'"
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
import { ref, reactive, computed, watch } from 'vue';
import { useAppStore } from '@/stores/app';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import QRPlaceholder from '@/components/QRPlaceholder.vue';

const store = useAppStore();
const booking = ref(null);
const submitting = ref(false);
const vehicleForm = reactive({ bikeModel: '', platNomor: '' });

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
    { key: 'Cuci Motor', name: 'Cuci Motor', emoji: '🚿', desc: 'Cuci motor standar, 15 menit', price: 'Rp 15.000' },
    { key: 'Service Motor', name: 'Service Motor', emoji: '🔧', desc: 'Pengecekan awal, 20 menit', price: 'Rp 10.000' },
];

const activeBookings = computed(() => store.tasks.filter(task => task.status !== 'selesai'));

const availableTimeSlots = computed(() => timeSlots.map(time => ({
    time,
    full: !form.location || activeBookings.value.some(task =>
        task.location === form.location &&
        task.scheduledTime === time &&
        task.serviceType === form.serviceType
    ),
})));

const defaultForm = {
    bikeModel: '',
    platNomor: '',
    scheduledTime: '',
    location: '',
    serviceType: 'Cuci Motor',
    notes: '',
};

const form = reactive({ ...defaultForm });

watch(() => [form.location, form.serviceType], () => {
    if (form.scheduledTime && availableTimeSlots.value.find(slot => slot.time === form.scheduledTime)?.full) {
        form.scheduledTime = '';
    }
});

function servicePrice(type) {
    return services.find(s => s.key === type)?.price || 'Ditentukan setelah pengecekan';
}

function resetForm() {
    Object.assign(form, defaultForm);
    booking.value = null;
}

function useVehicle(vehicle) {
    form.bikeModel = vehicle.bikeModel;
    form.platNomor = vehicle.platNomor;
}

function saveVehicle() {
    store.addVehicle({
        bikeModel: vehicleForm.bikeModel.trim(),
        platNomor: vehicleForm.platNomor.trim().toUpperCase(),
    });
    Object.assign(vehicleForm, { bikeModel: '', platNomor: '' });
}

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

async function handleSubmit() {
    if (!form.location || !form.scheduledTime || availableTimeSlots.value.find(slot => slot.time === form.scheduledTime)?.full) {
        return;
    }
    if (form.serviceType === 'Service Motor' && !form.notes.trim()) {
        return;
    }

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
