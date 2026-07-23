<script setup>
import { ref, computed, onMounted } from "vue";
import { store } from "../store";
import ReviewComplete from "./ReviewComplete.vue";

const emit = defineEmits(["done"]);

function shuffled(arr) {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

const queue = ref([]);
const flipped = ref(false);
const attempts = ref({}); // card.name -> number of "don't know" requeues
const finished = ref(false);

const current = computed(() => queue.value[0] || null);
const totalCards = computed(() => store.activeDeck?.cards.length ?? 0);
const remaining = computed(() => new Set(queue.value.map((c) => c.name)).size);
const multiPassCount = computed(
	() => Object.values(attempts.value).filter((n) => n > 0).length
);

onMounted(() => {
	queue.value = shuffled(store.activeDeck.cards);
});

function flip() {
	flipped.value = !flipped.value;
}

function markKnowIt() {
	queue.value.shift();
	advance();
}

function markDontKnowIt() {
	const card = queue.value.shift();
	attempts.value[card.name] = (attempts.value[card.name] || 0) + 1;
	queue.value.push(card);
	advance();
}

function advance() {
	flipped.value = false;
	if (queue.value.length === 0) finished.value = true;
}
</script>

<template>
	<ReviewComplete
		v-if="finished"
		:total-cards="totalCards"
		:multi-pass-count="multiPassCount"
		@back="emit('done')"
	/>

	<div v-else class="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-8">
		<div class="mb-6 flex items-center justify-between text-white">
			<button class="font-semibold text-white/90" @click="emit('done')">✕ Exit</button>
			<span class="font-bold">{{ remaining }} left</span>
		</div>

		<div v-if="current" class="flip-scene flex flex-1 items-center justify-center">
			<div
				class="flip-card relative h-72 w-full max-w-sm cursor-pointer"
				:class="{ 'is-flipped': flipped }"
				@click="flip"
			>
				<div
					class="flip-face absolute inset-0 flex items-center justify-center rounded-3xl bg-white p-6 text-center shadow-2xl"
				>
					<p class="text-2xl font-bold text-grape-700">{{ current.front }}</p>
				</div>
				<div
					class="flip-face flip-face-back absolute inset-0 flex items-center justify-center rounded-3xl bg-sunshine-400 p-6 text-center shadow-2xl"
				>
					<p class="text-2xl font-bold text-grape-700">{{ current.back }}</p>
				</div>
			</div>
		</div>

		<p v-if="!flipped" class="mb-4 text-center text-white/80">Tap the card to flip it</p>

		<div v-if="flipped" class="mt-6 flex gap-3">
			<button
				class="flex-1 rounded-2xl bg-white/95 py-4 text-lg font-extrabold text-bubblegum-600 shadow-lg active:scale-95"
				@click="markDontKnowIt"
			>
				✗ Don't Know It
			</button>
			<button
				class="flex-1 rounded-2xl bg-white/95 py-4 text-lg font-extrabold text-grape-600 shadow-lg active:scale-95"
				@click="markKnowIt"
			>
				✓ Know It
			</button>
		</div>
		<div v-else class="mt-6 h-[68px]"></div>
	</div>
</template>
