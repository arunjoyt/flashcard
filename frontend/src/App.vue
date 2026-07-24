<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { store } from "./store";
import BottomNav from "./components/BottomNav.vue";

const route = useRoute();
const showNav = computed(() => !!route.meta.tab);

onMounted(() => store.loadDecks());

const appVersion = window.app_version || "";
</script>

<template>
	<div class="min-h-screen w-full">
		<router-view />
		<BottomNav v-if="showNav" />
		<div
			class="pointer-events-none fixed bottom-1.5 left-1/2 z-[51] -translate-x-1/2 rounded-full bg-gray-900/5 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-gray-500"
			data-test="app-version"
		>
			v{{ appVersion }}
		</div>
	</div>
</template>
