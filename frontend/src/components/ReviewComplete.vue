<script setup>
import { onMounted } from "vue";
import confetti from "canvas-confetti";

const props = defineProps({
	totalCards: { type: Number, required: true },
	multiPassCount: { type: Number, required: true },
});
defineEmits(["back"]);

onMounted(() => {
	confetti({
		particleCount: 140,
		spread: 90,
		origin: { y: 0.6 },
		colors: ["#7C3AED", "#A78BFA", "#DDD6FE", "#ffffff"],
	});
});
</script>

<template>
	<div class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
		<div class="animate-bounce-in rounded-3xl bg-white p-8 shadow-2xl" data-test="review-complete">
			<p class="text-5xl">🎉</p>
			<h1 class="mt-3 text-2xl font-extrabold text-grape-700">Deck complete!</h1>
			<p class="mt-2 text-grape-500">
				You reviewed {{ totalCards }} card{{ totalCards === 1 ? "" : "s" }}.
			</p>
			<p v-if="multiPassCount > 0" class="text-grape-500">
				{{ multiPassCount }} needed a second look — nice work getting through them.
			</p>
			<button
				class="mt-6 w-full rounded-2xl bg-grape-600 py-3 text-lg font-extrabold text-white active:scale-95"
				@click="$emit('back')"
			>
				Back to Decks
			</button>
		</div>
	</div>
</template>
