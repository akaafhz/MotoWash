<template>
    <div class="min-h-screen bg-app transition-colors duration-300">
        <router-view />
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAppStore } from '@/stores/app';

const store = useAppStore();

onMounted(() => {
    store.initTheme();
});
</script>
