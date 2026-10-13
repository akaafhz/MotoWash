<template>
    <div class="flex h-screen overflow-hidden bg-app">
        <!-- Sidebar Desktop -->
        <aside
            class="hidden lg:flex flex-col fixed left-0 top-0 h-full z-30 transition-all duration-300 border-r border-theme bg-surface"
            :class="store.sidebarOpen ? 'w-64' : 'w-16'"
        >
            <!-- Logo -->
            <div class="flex items-center gap-3 px-4 h-16 border-b border-theme shrink-0">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 glow-cyan" style="background: var(--color-accent)">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"/>
                        <circle cx="7.5" cy="14.5" r="1.5"/>
                        <circle cx="16.5" cy="14.5" r="1.5"/>
                    </svg>
                </div>
                <Transition name="fade">
                    <div v-if="store.sidebarOpen">
                        <span class="font-bold text-base text-primary">MotoWash</span>
                        <p class="text-[10px] text-muted">Platform Cuci Motor</p>
                    </div>
                </Transition>
            </div>

            <!-- Role Indicator -->
            <div v-if="store.sidebarOpen" class="px-4 py-3 border-b border-theme">
                <p class="label mb-2">Mode Aktif</p>
                <div class="flex gap-1">
                    <button
                        v-for="role in roles"
                        :key="role.key"
                        @click="store.setRole(role.key)"
                        class="flex-1 py-1 px-1.5 rounded text-[10px] font-semibold transition-all"
                        :class="store.currentRole === role.key
                            ? 'text-white'
                            : 'text-muted bg-surface-2'"
                        :style="store.currentRole === role.key ? `background: var(--color-accent)` : ''"
                    >
                        {{ role.label }}
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto scrollbar-hide px-2 py-3 space-y-1">
                <router-link
                    v-for="link in navLinks"
                    :key="link.to"
                    :to="link.to"
                    class="sidebar-link"
                    :class="{ 'active': $route.path === link.to || ($route.path === '/' && link.to === '/') }"
                    :title="!store.sidebarOpen ? link.label : ''"
                >
                    <component :is="link.icon" class="w-5 h-5 shrink-0" />
                    <Transition name="fade">
                        <span v-if="store.sidebarOpen" class="flex-1">{{ link.label }}</span>
                    </Transition>
                    <Transition name="fade">
                        <span
                            v-if="store.sidebarOpen && link.badge !== undefined && link.badge > 0"
                            class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style="background: var(--color-accent); color: white"
                        >
                            {{ link.badge }}
                        </span>
                    </Transition>
                </router-link>
            </nav>

            <!-- Bottom: Theme + User -->
            <div class="border-t border-theme px-2 py-3 space-y-1 shrink-0">
                <!-- Theme toggle -->
                <button @click="store.toggleTheme()" class="sidebar-link w-full">
                    <SunIcon v-if="store.isDark" class="w-5 h-5 shrink-0" />
                    <MoonIcon v-else class="w-5 h-5 shrink-0" />
                    <Transition name="fade">
                        <span v-if="store.sidebarOpen">{{ store.isDark ? 'Light Mode' : 'Dark Mode' }}</span>
                    </Transition>
                </button>
                <!-- User -->
                <div v-if="store.sidebarOpen" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-2">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style="background: var(--color-accent)">
                        {{ userInitial }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-primary truncate">{{ store.user?.name || 'Guest' }}</p>
                        <p class="text-[10px] text-muted truncate">{{ store.user?.email || '' }}</p>
                    </div>
                    <button @click="handleLogout" class="text-muted hover:text-red-500 transition-colors">
                        <ArrowRightOnRectangleIcon class="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>

        <!-- Main Content -->
        <div
            class="flex-1 flex flex-col min-h-0 transition-all duration-300"
            :class="store.sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'"
        >
            <!-- Top Navbar -->
            <header class="h-16 border-b border-theme bg-surface flex items-center px-4 gap-3 shrink-0 sticky top-0 z-20">
                <!-- Toggle sidebar btn (desktop) / menu btn (mobile) -->
                <button
                    @click="store.toggleSidebar()"
                    class="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-2 text-muted transition-colors"
                >
                    <Bars3Icon class="w-5 h-5" />
                </button>
                <button
                    @click="mobileMenuOpen = true"
                    class="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-2 text-muted transition-colors"
                >
                    <Bars3Icon class="w-5 h-5" />
                </button>

                <!-- Mobile Logo -->
                <div class="lg:hidden flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: var(--color-accent)">
                        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z"/>
                        </svg>
                    </div>
                    <span class="font-bold text-sm text-primary">MotoWash</span>
                </div>

                <!-- Breadcrumb (desktop) -->
                <div class="hidden lg:flex items-center gap-2 text-sm">
                    <span class="text-muted">MotoWash</span>
                    <span class="text-muted">/</span>
                    <span class="font-medium text-primary">{{ currentPageTitle }}</span>
                </div>

                <div class="flex-1" />

                <!-- Role switcher pills (desktop) -->
                <div class="hidden md:flex gap-1 p-1 rounded-lg bg-surface-2">
                    <button
                        v-for="role in roles"
                        :key="role.key"
                        @click="store.setRole(role.key)"
                        class="px-3 py-1 rounded text-xs font-semibold transition-all"
                        :class="store.currentRole === role.key ? 'text-white shadow-sm' : 'text-muted'"
                        :style="store.currentRole === role.key ? 'background: var(--color-accent)' : ''"
                    >
                        {{ role.label }}
                    </button>
                </div>

                <!-- Queue Alert -->
                <Transition name="slide-down">
                    <div v-if="store.activeQueue" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse" style="background: rgba(34,211,238,0.15); color: var(--color-accent); border: 1px solid var(--color-accent)">
                        <SpeakerWaveIcon class="w-4 h-4" />
                        Antrean {{ store.activeQueue }} dipanggil!
                    </div>
                </Transition>

                <!-- Sound toggle -->
                <button
                    @click="store.toggleSound()"
                    class="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-2 transition-colors"
                    :class="store.soundEnabled ? 'text-accent' : 'text-muted'"
                    title="Toggle Suara"
                >
                    <SpeakerWaveIcon v-if="store.soundEnabled" class="w-5 h-5" />
                    <SpeakerXMarkIcon v-else class="w-5 h-5" />
                </button>

                <!-- Theme toggle -->
                <button
                    @click="store.toggleTheme()"
                    class="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-2 text-muted transition-colors"
                    title="Toggle Tema"
                >
                    <SunIcon v-if="store.isDark" class="w-5 h-5" />
                    <MoonIcon v-else class="w-5 h-5" />
                </button>

                <!-- Avatar -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer" style="background: var(--color-accent)" :title="store.user?.name">
                    {{ userInitial }}
                </div>
            </header>

            <!-- Page content -->
            <main class="flex-1 overflow-y-auto">
                <router-view />
            </main>

            <!-- Mobile Bottom Nav -->
            <nav class="lg:hidden flex items-center justify-around border-t border-theme bg-surface h-16 shrink-0 px-2">
                <router-link
                    v-for="link in mobileNavLinks"
                    :key="link.to"
                    :to="link.to"
                    class="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all"
                    :class="($route.path === link.to || ($route.path === '/' && link.to === '/')) ? 'text-accent' : 'text-muted'"
                >
                    <component :is="link.icon" class="w-5 h-5" />
                    <span class="text-[9px] font-medium">{{ link.short }}</span>
                </router-link>
            </nav>
        </div>

        <!-- Mobile drawer overlay -->
        <Transition name="fade">
            <div v-if="mobileMenuOpen" class="lg:hidden fixed inset-0 bg-black/60 z-40" @click="mobileMenuOpen = false" />
        </Transition>
        <Transition name="slide-right">
            <aside v-if="mobileMenuOpen" class="lg:hidden fixed left-0 top-0 h-full w-72 z-50 flex flex-col border-r border-theme bg-surface">
                <div class="flex items-center justify-between px-4 h-16 border-b border-theme">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background: var(--color-accent)">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>
                            </svg>
                        </div>
                        <span class="font-bold text-primary">MotoWash</span>
                    </div>
                    <button @click="mobileMenuOpen = false" class="text-muted">
                        <XMarkIcon class="w-5 h-5" />
                    </button>
                </div>
                <div class="px-4 py-3 border-b border-theme">
                    <p class="label mb-2">Mode Aktif</p>
                    <div class="flex gap-1">
                        <button
                            v-for="role in roles"
                            :key="role.key"
                            @click="store.setRole(role.key); mobileMenuOpen = false"
                            class="flex-1 py-1 px-1.5 rounded text-[10px] font-semibold transition-all"
                            :class="store.currentRole === role.key ? 'text-white' : 'text-muted bg-surface-2'"
                            :style="store.currentRole === role.key ? 'background: var(--color-accent)' : ''"
                        >
                            {{ role.label }}
                        </button>
                    </div>
                </div>
                <nav class="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                    <router-link
                        v-for="link in navLinks"
                        :key="link.to"
                        :to="link.to"
                        class="sidebar-link"
                        :class="{ 'active': $route.path === link.to }"
                        @click="mobileMenuOpen = false"
                    >
                        <component :is="link.icon" class="w-5 h-5 shrink-0" />
                        <span class="flex-1">{{ link.label }}</span>
                    </router-link>
                </nav>
                <div class="border-t border-theme px-4 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: var(--color-accent)">
                            {{ userInitial }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-semibold text-primary truncate">{{ store.user?.name || 'Guest' }}</p>
                            <p class="text-xs text-muted truncate">{{ store.user?.email }}</p>
                        </div>
                        <button @click="handleLogout" class="text-muted hover:text-red-500">
                            <ArrowRightOnRectangleIcon class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>
        </Transition>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';
import {
    HomeIcon, QueueListIcon, WrenchScrewdriverIcon, ChartBarIcon,
    Cog6ToothIcon, Bars3Icon, SunIcon, MoonIcon, XMarkIcon,
    SpeakerWaveIcon, SpeakerXMarkIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline';

const store = useAppStore();
const router = useRouter();
const route = useRoute();
const mobileMenuOpen = ref(false);

const roles = [
    { key: 'customer', label: 'Pembeli' },
    { key: 'washer', label: 'Pencuci' },
    { key: 'admin', label: 'Admin' },
];

const navLinks = computed(() => [
    { to: '/', label: 'Dashboard', icon: HomeIcon, badge: undefined },
    { to: '/booking', label: 'Booking Motor', icon: QueueListIcon, badge: undefined },
    { to: '/antrean', label: 'Antrean Live', icon: QueueListIcon, badge: store.tasksByStatus.menunggu.length },
    { to: '/tugas', label: 'Tugas Pencuci', icon: WrenchScrewdriverIcon, badge: store.tasksByStatus.proses.length },
    { to: '/admin', label: 'Panel Admin', icon: ChartBarIcon, badge: undefined },
    { to: '/pengaturan', label: 'Pengaturan', icon: Cog6ToothIcon, badge: undefined },
]);

const mobileNavLinks = [
    { to: '/', label: 'Dashboard', short: 'Home', icon: HomeIcon },
    { to: '/booking', label: 'Booking', short: 'Booking', icon: QueueListIcon },
    { to: '/antrean', label: 'Antrean', short: 'Antrean', icon: QueueListIcon },
    { to: '/tugas', label: 'Tugas', short: 'Tugas', icon: WrenchScrewdriverIcon },
    { to: '/admin', label: 'Admin', short: 'Admin', icon: ChartBarIcon },
];

const currentPageTitle = computed(() => {
    const link = navLinks.value.find(l => l.to === route.path);
    return link?.label || 'Dashboard';
});

const userInitial = computed(() =>
    (store.user?.name || 'G').charAt(0).toUpperCase()
);

function handleLogout() {
    store.logout();
    router.push({ name: 'login' });
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(-100%); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
