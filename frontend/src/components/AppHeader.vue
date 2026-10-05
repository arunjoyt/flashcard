<script setup>
import { ref } from "vue";
import { store } from "@/store";

// Set by the page's boot data (flashcard/www/flashcard.py).
const userName = window.user_full_name || "";
const appVersion = window.app_version || "";

const loggingOut = ref(false);

async function logout() {
	loggingOut.value = true;
	try {
		await store.logout();
	} finally {
		window.location.href = "/login";
	}
}
</script>

<template>
	<header class="mb-6 flex items-center justify-between gap-3">
		<div class="flex shrink-0 items-baseline gap-1.5">
			<span class="text-lg font-extrabold text-grape-600" data-test="app-name">🃏 Flashcard</span>
			<span class="text-[0.65rem] font-medium tracking-wide text-gray-400" data-test="app-version">
				v{{ appVersion }}
			</span>
		</div>
		<div class="flex min-w-0 items-center gap-2">
			<span class="truncate text-sm font-semibold text-gray-700" data-test="user-name">{{ userName }}</span>
			<button
				type="button"
				class="shrink-0 rounded-full border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 disabled:opacity-50"
				:disabled="loggingOut"
				data-test="logout-button"
				@click="logout"
			>
				Log out
			</button>
		</div>
	</header>
</template>
