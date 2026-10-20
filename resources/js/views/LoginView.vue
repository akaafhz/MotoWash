<template>
    <div class="min-h-screen flex items-center justify-center bg-app p-4">
        <!-- Background decoration -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none">
            <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5" style="background: var(--color-accent); filter: blur(60px);" />
            <div class="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-5" style="background: var(--color-accent); filter: blur(60px);" />
        </div>

        <div class="w-full max-w-md relative">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-cyan" style="background: var(--color-accent)">
                    <svg class="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"/>
                        <circle cx="7.5" cy="14.5" r="1.5"/>
                        <circle cx="16.5" cy="14.5" r="1.5"/>
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-primary">MotoWash</h1>
                <p class="text-muted text-sm mt-1">Platform Cuci Motor Digital</p>
            </div>

            <!-- Card -->
            <div class="card p-6">
                <h2 class="text-lg font-semibold text-primary mb-1">{{ isRegister ? 'Daftar Akun' : 'Masuk' }}</h2>
                <p class="text-sm text-muted mb-6">{{ isRegister ? 'Buat akun MotoWash baru' : 'Masuk ke akun MotoWash kamu' }}</p>

                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div v-if="isRegister">
                        <label class="block text-xs font-medium text-muted mb-1.5">Nama Lengkap</label>
                        <input v-model="form.name" type="text" class="input-field" placeholder="Budi Santoso" required />
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-muted mb-1.5">Email</label>
                        <input v-model="form.email" type="email" class="input-field" placeholder="email@example.com" required />
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-muted mb-1.5">Password</label>
                        <div class="relative">
                            <input
                                v-model="form.password"
                                :type="showPass ? 'text' : 'password'"
                                class="input-field pr-10"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                @click="showPass = !showPass"
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                            >
                                <EyeIcon v-if="!showPass" class="w-4 h-4" />
                                <EyeSlashIcon v-else class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                        {{ error }}
                    </div>

                    <button
                        type="submit"
                        class="btn-primary w-full py-2.5"
                        :disabled="loading"
                    >
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            Memproses...
                        </span>
                        <span v-else>{{ isRegister ? 'Daftar' : 'Masuk' }}</span>
                    </button>
                </form>

                <!-- Quick Demo Login -->
                <div class="mt-4 pt-4 border-t border-theme">
                    <p class="text-xs text-muted text-center mb-3">Atau masuk cepat sebagai:</p>
                    <div class="grid grid-cols-3 gap-2">
                        <button
                            v-for="demo in demoAccounts"
                            :key="demo.role"
                            @click="quickLogin(demo)"
                            class="flex flex-col items-center gap-1 p-2 rounded-lg border border-theme hover:border-accent transition-all text-xs"
                            :class="'hover:bg-surface-2'"
                        >
                            <component :is="demo.icon" class="w-5 h-5 text-accent" />
                            <span class="text-muted font-medium">{{ demo.label }}</span>
                        </button>
                    </div>
                </div>

                <p class="text-center text-xs text-muted mt-4">
                    {{ isRegister ? 'Sudah punya akun?' : 'Belum punya akun?' }}
                    <button @click="isRegister = !isRegister; error = ''" class="text-accent font-semibold ml-1">
                        {{ isRegister ? 'Masuk' : 'Daftar' }}
                    </button>
                </p>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { EyeIcon, EyeSlashIcon, UserIcon, WrenchScrewdriverIcon, ChartBarIcon } from '@heroicons/vue/24/outline';

const store = useAppStore();
const router = useRouter();

const isRegister = ref(false);
const showPass = ref(false);
const loading = ref(false);
const error = ref('');

const form = reactive({
    name: '',
    email: '',
    password: '',
});

const demoAccounts = [
    { role: 'customer', label: 'Pembeli', icon: UserIcon, name: 'Budi Santoso', email: 'customer@motowash.id' },
    { role: 'washer', label: 'Pencuci', icon: WrenchScrewdriverIcon, name: 'Agus Washer', email: 'washer@motowash.id' },
    { role: 'admin', label: 'Admin', icon: ChartBarIcon, name: 'Admin Lapak', email: 'admin@motowash.id' },
];

function quickLogin(demo) {
    store.setAuth(
        { name: demo.name, email: demo.email, role: demo.role },
        'demo-token-' + demo.role
    );
    router.push('/');
}

async function handleSubmit() {
    loading.value = true;
    error.value = '';

    // Simulate API call - in production, this calls Laravel API
    await new Promise(r => setTimeout(r, 800));

    try {
        if (isRegister.value) {
            if (form.password.length < 6) {
                error.value = 'Password minimal 6 karakter';
                return;
            }
            store.setAuth(
                { name: form.name, email: form.email, role: 'customer' },
                'user-token-' + Date.now()
            );
        } else {
            // Demo: any credentials work
            const name = form.email.split('@')[0];
            store.setAuth(
                { name: name.charAt(0).toUpperCase() + name.slice(1), email: form.email, role: 'customer' },
                'user-token-' + Date.now()
            );
        }
        router.push('/');
    } catch (e) {
        error.value = 'Terjadi kesalahan. Coba lagi.';
    } finally {
        loading.value = false;
    }
}
</script>
