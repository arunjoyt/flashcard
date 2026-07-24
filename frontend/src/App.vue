<script setup>
import { ref, onMounted } from "vue";
import { store } from "./store";
import DeckList from "./components/DeckList.vue";
import DeckDetail from "./components/DeckDetail.vue";
import ReviewSession from "./components/ReviewSession.vue";

const screen = ref("deckList"); // 'deckList' | 'deckDetail' | 'review'

async function openDeck(deckName) {
	await store.openDeck(deckName);
	screen.value = "deckDetail";
}

function backToDecks() {
	store.activeDeck = null;
	screen.value = "deckList";
}

function startReview() {
	screen.value = "review";
}

function finishReview() {
	screen.value = "deckDetail";
}

onMounted(() => store.loadDecks());

const appVersion = window.app_version || "";
</script>

<template>
	<div class="min-h-screen w-full">
		<DeckList v-if="screen === 'deckList'" @open-deck="openDeck" />
		<DeckDetail
			v-else-if="screen === 'deckDetail'"
			@back="backToDecks"
			@start-review="startReview"
		/>
		<ReviewSession v-else-if="screen === 'review'" @done="finishReview" />
		<div
			class="pointer-events-none fixed bottom-1.5 left-1/2 z-[51] -translate-x-1/2 rounded-full bg-gray-900/5 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-gray-500"
			data-test="app-version"
		>
			v{{ appVersion }}
		</div>
	</div>
</template>
