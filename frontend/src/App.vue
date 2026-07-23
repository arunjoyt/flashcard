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
	</div>
</template>
