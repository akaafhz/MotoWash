<template>
    <div class="inline-block rounded-lg overflow-hidden" :style="{ width: size + 'px', height: size + 'px' }">
        <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" xmlns="http://www.w3.org/2000/svg">
            <!-- QR Background -->
            <rect :width="size" :height="size" fill="white" rx="4" />

            <!-- Finder patterns (corners) -->
            <!-- Top-left -->
            <rect :x="pad" :y="pad" :width="fp" :height="fp" fill="currentColor" rx="2" class="text-slate-900" />
            <rect :x="pad+inner" :y="pad+inner" :width="fp-inner*2" :height="fp-inner*2" fill="white" rx="1" />
            <rect :x="pad+inner*2" :y="pad+inner*2" :width="fp-inner*4" :height="fp-inner*4" fill="currentColor" rx="1" class="text-slate-900" />

            <!-- Top-right -->
            <rect :x="size-pad-fp" :y="pad" :width="fp" :height="fp" fill="currentColor" rx="2" class="text-slate-900" />
            <rect :x="size-pad-fp+inner" :y="pad+inner" :width="fp-inner*2" :height="fp-inner*2" fill="white" rx="1" />
            <rect :x="size-pad-fp+inner*2" :y="pad+inner*2" :width="fp-inner*4" :height="fp-inner*4" fill="currentColor" rx="1" class="text-slate-900" />

            <!-- Bottom-left -->
            <rect :x="pad" :y="size-pad-fp" :width="fp" :height="fp" fill="currentColor" rx="2" class="text-slate-900" />
            <rect :x="pad+inner" :y="size-pad-fp+inner" :width="fp-inner*2" :height="fp-inner*2" fill="white" rx="1" />
            <rect :x="pad+inner*2" :y="size-pad-fp+inner*2" :width="fp-inner*4" :height="fp-inner*4" fill="currentColor" rx="1" class="text-slate-900" />

            <!-- Random data modules based on value hash -->
            <g v-for="(row, ri) in dataModules" :key="ri">
                <rect
                    v-for="(on, ci) in row"
                    :key="ci"
                    v-if="on"
                    :x="dataX + ci * mod"
                    :y="dataY + ri * mod"
                    :width="mod - 0.5"
                    :height="mod - 0.5"
                    fill="currentColor"
                    class="text-slate-900"
                    rx="0.5"
                />
            </g>

            <!-- Center label -->
            <rect
                :x="size/2 - labelW/2"
                :y="size/2 - labelH/2"
                :width="labelW"
                :height="labelH"
                fill="#06b6d4"
                rx="3"
            />
            <text
                :x="size/2"
                :y="size/2 + 3.5"
                text-anchor="middle"
                font-family="monospace"
                :font-size="labelFontSize"
                font-weight="bold"
                fill="white"
            >{{ value }}</text>
        </svg>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    value: { type: String, default: 'A-00' },
    size: { type: Number, default: 80 },
});

const pad = computed(() => props.size * 0.08);
const fp = computed(() => props.size * 0.24);
const inner = computed(() => props.size * 0.04);
const mod = computed(() => props.size * 0.05);
const dataX = computed(() => props.size * 0.32);
const dataY = computed(() => props.size * 0.08);
const dataW = computed(() => Math.floor((props.size * 0.60) / mod.value));
const dataH = computed(() => Math.floor((props.size * 0.84) / mod.value));
const labelW = computed(() => props.size * 0.5);
const labelH = computed(() => props.size * 0.22);
const labelFontSize = computed(() => props.size * 0.1);

// Seeded pseudo-random based on value string
const dataModules = computed(() => {
    const seed = props.value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rows = [];
    for (let r = 0; r < dataH.value; r++) {
        const row = [];
        for (let c = 0; c < dataW.value; c++) {
            const n = (seed * (r * 31 + c * 17 + 7)) % 100;
            row.push(n > 40);
        }
        rows.push(row);
    }
    return rows;
});
</script>
