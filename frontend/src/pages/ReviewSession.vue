<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { store } from "@/store";
import { api } from "@/api";
import ReviewComplete from "@/components/ReviewComplete.vue";

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

const allCards = ref([]);
const queue = ref([]);
const flipped = ref(false);
const attempts = ref({}); // card.name -> number of "don't know" requeues
const finished = ref(false);
const viewedCards = ref(new Set());
const statsSent = ref(false);

const answeredHistory = ref([]); // [{ card, mark: "know" | "dontknow" }], in the order answered
const viewIndex = ref(null); // null = live (showing the current queue card); else index into answeredHistory

const current = computed(() => queue.value[0] || null);
const viewingHistory = computed(() => viewIndex.value !== null);
const displayedCard = computed(() =>
	viewingHistory.value ? answeredHistory.value[viewIndex.value]?.card : current.value
);
const canGoPrev = computed(() =>
	viewIndex.value === null ? answeredHistory.value.length > 0 : viewIndex.value > 0
);
const canGoNext = computed(() => viewIndex.value !== null);
const totalCards = computed(() => allCards.value.length);
const remaining = computed(() => new Set(queue.value.map((c) => c.name)).size);
const multiPassCount = computed(
	() => Object.values(attempts.value).filter((n) => n > 0).length
);

onMounted(async () => {
	if (props.deckName) {
		if (store.activeDeck?.name !== props.deckName) {
			await store.openDeck(props.deckName);
		}
		allCards.value = store.activeDeck.cards;
	} else {
		allCards.value = await api.getAllCards();
	}
	queue.value = shuffled(allCards.value);
});

function flip() {
	flipped.value = !flipped.value;
	if (!viewingHistory.value && flipped.value && current.value) {
		viewedCards.value.add(current.value.name);
	}
}

function markKnowIt() {
	const card = queue.value.shift();
	answeredHistory.value.push({ card, mark: "know" });
	advance();
}

function markDontKnowIt() {
	const card = queue.value.shift();
	attempts.value[card.name] = (attempts.value[card.name] || 0) + 1;
	queue.value.push(card);
	answeredHistory.value.push({ card, mark: "dontknow" });
	advance();
}

function advance() {
	flipped.value = false;
	if (queue.value.length === 0) finished.value = true;
}

function goPrev() {
	if (!canGoPrev.value) return;
	flipped.value = false;
	viewIndex.value = viewIndex.value === null ? answeredHistory.value.length - 1 : viewIndex.value - 1;
}

function goNext() {
	if (viewIndex.value === null) return;
	flipped.value = false;
	viewIndex.value = viewIndex.value < answeredHistory.value.length - 1 ? viewIndex.value + 1 : null;
}

async function exitReview() {
	if (!statsSent.value) {
		statsSent.value = true;
		if (viewedCards.value.size > 0) {
			await api.recordCardsViewed(viewedCards.value.size);
		}
	}
	router.push({ name: "Decks" });
}
</script>

<template>
	<ReviewComplete
		v-if="finished"
		:total-cards="totalCards"
		:multi-pass-count="multiPassCount"
		@back="exitReview"
	/>

	<div v-else class="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-8">
		<div class="mb-6 flex items-center justify-between text-gray-900">
			<button class="font-semibold text-gray-500" @click="exitReview">✕ Exit</button>
			<span class="font-bold">{{ remaining }} left</span>
		</div>

		<div v-if="displayedCard" class="flip-scene flex flex-1 items-end justify-center pb-6">
			<div
				class="flip-card relative h-72 w-full max-w-sm cursor-pointer"
				:class="{ 'is-flipped': flipped }"
				data-test="review-card"
				@click="flip"
			>
				<div
					class="flip-face absolute inset-0 flex items-center justify-center rounded-3xl bg-white p-6 text-center shadow-2xl"
				>
					<p class="text-2xl font-bold text-grape-700">{{ displayedCard.front }}</p>
				</div>
				<div
					class="flip-face flip-face-back absolute inset-0 flex items-center justify-center rounded-3xl bg-grape-100 p-6 text-center shadow-2xl"
				>
					<p class="text-2xl font-bold text-grape-700">{{ displayedCard.back }}</p>
				</div>
			</div>
		</div>

		<p class="mb-4 h-6 text-center text-gray-500" data-test="history-indicator">
			<template v-if="viewingHistory">
				Card {{ viewIndex + 1 }} of {{ answeredHistory.length }} ·
				{{ answeredHistory[viewIndex].mark === "know" ? "✓ Know It" : "✗ Don't Know It" }}
			</template>
			<template v-else-if="!flipped">Tap the card to flip it</template>
		</p>

		<div class="flex gap-3">
			<button
				class="flex-1 rounded-2xl bg-white py-3 text-base font-bold text-gray-400 shadow-sm active:scale-95 disabled:opacity-30"
				data-test="history-prev"
				:disabled="!canGoPrev"
				@click="goPrev"
			>
				‹ Prev
			</button>
			<button
				class="flex-1 rounded-2xl bg-white py-3 text-base font-bold text-gray-400 shadow-sm active:scale-95 disabled:opacity-30"
				data-test="history-next"
				:disabled="!canGoNext"
				@click="goNext"
			>
				{{ viewingHistory && viewIndex === answeredHistory.length - 1 ? "Resume Review ›" : "Next ›" }}
			</button>
		</div>

		<div class="mt-3 flex gap-3">
			<template v-if="flipped && !viewingHistory">
				<button
					class="flex-1 rounded-2xl bg-white py-4 text-lg font-extrabold text-red-500 shadow-sm active:scale-95"
					data-test="mark-dont-know"
					@click="markDontKnowIt"
				>
					✗ Don't Know It
				</button>
				<button
					class="flex-1 rounded-2xl bg-white py-4 text-lg font-extrabold text-grape-600 shadow-sm active:scale-95"
					data-test="mark-know-it"
					@click="markKnowIt"
				>
					✓ Know It
				</button>
			</template>
			<div v-else class="h-[60px] flex-1"></div>
		</div>
	</div>
</template>
