<script setup>
import { useRoute } from "vue-router";

const route = useRoute();

const tabs = [
	{ name: "Review", icon: "▶️", label: "Review" },
	{ name: "Decks", icon: "📚", label: "Decks" },
	{ name: "Settings", icon: "⚙️", label: "Settings" },
];

function isActive(name) {
	return route.name === name;
}
</script>

<template>
	<nav
		class="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-grape-100 bg-white/95 backdrop-blur"
		style="padding-bottom: env(safe-area-inset-bottom)"
	>
		<router-link
			v-for="tab in tabs"
			:key="tab.name"
			:to="{ name: tab.name }"
			data-test="bottom-nav-tab"
			class="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold transition active:scale-95"
			:class="isActive(tab.name) ? 'text-grape-600' : 'text-gray-400'"
		>
			<span class="text-lg leading-none">{{ tab.icon }}</span>
			{{ tab.label }}
		</router-link>
	</nav>
</template>
