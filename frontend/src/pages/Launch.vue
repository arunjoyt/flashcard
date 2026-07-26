<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { store } from "@/store";

const router = useRouter();

onMounted(async () => {
	await store.loadDecks();
	if (store.totalCardCount > 0) {
		router.replace({ name: "ReviewAllCards" });
	} else {
		router.replace({ name: "Decks" });
	}
});
</script>

<template>
	<div class="flex min-h-screen items-center justify-center">
		<p class="text-gray-400">Loading…</p>
	</div>
</template>
