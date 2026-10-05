<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { store } from "@/store";
import { api } from "@/api";

const props = defineProps({
	deckName: { type: String, default: null },
});

const router = useRouter();

function shuffled(arr) {
	const copy = [...arr];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

const cards = ref([]);
const index = ref(0);
const flipped = ref(false);

const current = computed(() => cards.value[index.value] || null);
const canGoPrev = computed(() => index.value > 0);
const canGoNext = computed(() => index.value < cards.value.length - 1);

onMounted(async () => {
	let allCards;
	if (props.deckName) {
		if (store.activeDeck?.name !== props.deckName) {
			await store.openDeck(props.deckName);
		}
		allCards = store.activeDeck.cards;
	} else {
		allCards = await api.getAllCards();
	}
	cards.value = shuffled(allCards);
});

function flip() {
	flipped.value = !flipped.value;
}

function goTo(newIndex) {
	flipped.value = false;
	index.value = newIndex;
}

function goPrev() {
	if (canGoPrev.value) goTo(index.value - 1);
}

function goNext() {
	if (canGoNext.value) goTo(index.value + 1);
}

function exitReview() {
	router.push({ name: "Decks" });
}
</script>

<template>
	<div class="mx-auto flex h-dvh max-w-3xl flex-col overflow-hidden px-5 pb-10 pt-6">
		<div class="mb-4 flex items-center justify-between text-gray-900">
			<button class="font-semibold text-gray-500" @click="exitReview">✕ Exit</button>
			<span v-if="cards.length" class="font-bold" data-test="card-position">
				{{ index + 1 }}/{{ cards.length }}
			</span>
		</div>

		<div v-if="current" class="flip-scene flex min-h-0 flex-1 pb-6">
			<div
				class="flip-card relative h-full w-full cursor-pointer"
				:class="{ 'is-flipped': flipped }"
				data-test="review-card"
				@click="flip"
			>
				<div
					class="flip-face absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-white p-6 text-center shadow-2xl"
				>
					<p class="text-[2rem] font-bold leading-tight text-grape-700 sm:text-[3rem]">{{ current.front }}</p>
				</div>
				<div
					class="flip-face flip-face-back absolute inset-0 flex items-center justify-center rounded-[1.5rem] bg-grape-100 p-6 text-center shadow-2xl"
				>
					<p class="text-[2rem] font-bold leading-tight text-grape-700 sm:text-[3rem]">{{ current.back }}</p>
				</div>
			</div>
		</div>

		<div class="flex gap-5">
			<button
				class="h-20 flex-1 rounded-[1.25rem] bg-white text-[1.375rem] font-bold text-gray-600 shadow-md active:scale-95 disabled:opacity-30"
				data-test="card-prev"
				:disabled="!canGoPrev"
				@click="goPrev"
			>
				‹ Prev
			</button>
			<button
				class="h-20 flex-1 rounded-[1.25rem] bg-grape-600 text-[1.375rem] font-extrabold text-white shadow-md active:scale-95"
				data-test="card-flip"
				:disabled="!current"
				@click="flip"
			>
				Flip
			</button>
			<button
				class="h-20 flex-1 rounded-[1.25rem] bg-white text-[1.375rem] font-bold text-gray-600 shadow-md active:scale-95 disabled:opacity-30"
				data-test="card-next"
				:disabled="!canGoNext"
				@click="goNext"
			>
				Next ›
			</button>
		</div>
	</div>
</template>
