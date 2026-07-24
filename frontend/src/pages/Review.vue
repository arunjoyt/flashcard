<script setup>
import { useRouter } from "vue-router";
import { store } from "@/store";
import DeckRow from "@/components/DeckRow.vue";

const router = useRouter();

function reviewDeck(deck) {
	if (deck.card_count === 0) return;
	router.push({ name: "ReviewSession", params: { deckName: deck.name } });
}
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-24 pt-10">
		<h1 class="mb-1 text-3xl font-extrabold text-white drop-shadow-sm">▶️ Review</h1>
		<p class="mb-6 text-white/80">Pick a deck to review.</p>

		<div v-if="store.decks.length === 0" class="mt-10 text-center">
			<p class="text-lg font-semibold text-white/80">No decks yet!</p>
			<p class="text-white/60">Add a deck from the Decks tab to get started.</p>
		</div>

		<ul class="space-y-3">
			<DeckRow
				v-for="deck in store.decks"
				:key="deck.name"
				:deck="deck"
				:disabled="deck.card_count === 0"
				@click="reviewDeck(deck)"
			/>
		</ul>
	</div>
</template>
