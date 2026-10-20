<template>
    <div class="page-shell p-4 md:p-6 lg:p-8 max-w-2xl space-y-6">
        <div>
            <p class="label">Pengaturan</p>
            <h1 class="text-2xl font-bold text-primary mt-1">Pengaturan Aplikasi</h1>
        </div>

        <!-- Profile Card -->
        <div class="card p-5">
            <p class="label mb-4">Profil</p>
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white" style="background: var(--color-accent)">
                    {{ userInitial }}
                </div>
                <div>
                    <p class="font-bold text-primary text-lg">{{ store.user?.name || 'Guest' }}</p>
                    <p class="text-muted text-sm">{{ store.user?.email || '-' }}</p>
                    <p class="text-xs mt-1 px-2 py-0.5 rounded-full inline-block font-semibold capitalize" style="background: var(--color-accent); color: white; opacity: 0.9">
                        {{ store.user?.role || store.currentRole }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Appearance -->
        <div class="card p-5 space-y-4">
            <p class="label">Tampilan</p>

            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium text-primary text-sm">Mode Terang</p>
                    <p class="text-xs text-muted">Tampilan terang digunakan untuk seluruh aplikasi</p>
                </div>
                <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Aktif
                </span>
            </div>

            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium text-primary text-sm">Efek Suara</p>
                    <p class="text-xs text-muted">Suara notifikasi booking & antrean</p>
                </div>
                <button
                    @click="store.toggleSound()"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    :style="store.soundEnabled ? 'background: var(--color-accent)' : 'background: var(--color-border)'"
                >
                    <span
                        class="inline-block h-4 w-4 rounded-full bg-white shadow-lg transform transition-transform"
                        :class="store.soundEnabled ? 'translate-x-6' : 'translate-x-1'"
                    />
                </button>
            </div>
        </div>

        <!-- App Info -->
        <div class="card p-5 space-y-3">
            <p class="label">Tentang Aplikasi</p>
            <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                    <span class="text-muted">Nama Aplikasi</span>
                    <span class="text-primary font-medium">MotoWash</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted">Versi</span>
                    <span class="font-mono text-accent">v1.0.0</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted">Stack</span>
                    <span class="text-primary font-medium">Laravel + Vue 3</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted">Total Antrean</span>
                    <span class="font-mono text-primary">{{ store.stats.total }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-muted">Pendapatan Hari Ini</span>
                    <span class="font-mono text-green-500 font-semibold">Rp {{ store.stats.pendapatan.toLocaleString('id-ID') }}</span>
                </div>
            </div>
        </div>

        <!-- Logout -->
        <button @click="handleLogout" class="btn-danger w-full py-3">
            Keluar dari Akun
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';

const store = useAppStore();
const router = useRouter();

const userInitial = computed(() => (store.user?.name || 'G').charAt(0).toUpperCase());

function handleLogout() {
    store.logout();
    router.push({ name: 'login' });
}
</script>
