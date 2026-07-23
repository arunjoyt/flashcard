<script setup>
import { ref } from "vue";
import { store } from "../store";

const emit = defineEmits(["open-deck"]);

const showNewDeck = ref(false);
const newDeckName = ref("");
const busy = ref(false);

async function submitNewDeck() {
	const name = newDeckName.value.trim();
	if (!name || busy.value) return;
	busy.value = true;
	try {
		await store.createDeck(name);
		newDeckName.value = "";
		showNewDeck.value = false;
	} finally {
		busy.value = false;
	}
}

async function removeDeck(deckName) {
	if (!confirm(`Delete "${deckName}" and all its cards? This can't be undone.`)) return;
	await store.deleteDeck(deckName);
}
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-24 pt-10">
		<h1 class="mb-1 text-3xl font-extrabold text-white drop-shadow-sm">🃏 Flashcard</h1>
		<p class="mb-6 text-white/80">Pick a deck to review, or make a new one.</p>

		<div v-if="store.decks.length === 0" class="mt-10 text-center text-white/90">
			<p class="text-lg font-semibold">No decks yet!</p>
			<p class="text-white/70">Create your first deck to get started.</p>
		</div>

		<ul class="space-y-3">
			<li
				v-for="deck in store.decks"
				:key="deck.name"
				class="animate-pop-in flex items-center justify-between rounded-2xl bg-white/95 p-4 shadow-lg shadow-grape-900/10"
			>
				<button class="flex-1 text-left" @click="emit('open-deck', deck.name)">
					<div class="text-lg font-bold text-grape-700">{{ deck.name }}</div>
					<div class="text-sm text-grape-500">
						{{ deck.card_count }} card{{ deck.card_count === 1 ? "" : "s" }}
					</div>
				</button>
				<button
					class="ml-3 rounded-full p-2 text-bubblegum-500 hover:bg-bubblegum-50"
					aria-label="Delete deck"
					@click="removeDeck(deck.name)"
				>
					✕
				</button>
			</li>
		</ul>

		<div class="fixed inset-x-0 bottom-0 flex justify-center pb-6">
			<div v-if="showNewDeck" class="w-full max-w-md px-5">
				<form
					class="animate-bounce-in flex gap-2 rounded-2xl bg-white p-3 shadow-xl"
					@submit.prevent="submitNewDeck"
				>
					<input
						v-model="newDeckName"
						type="text"
						placeholder="Deck name"
						class="flex-1 rounded-xl border-2 border-grape-100 px-3 py-2 outline-none focus:border-grape-400"
						autofocus
					/>
					<button
						type="submit"
						class="rounded-xl bg-grape-500 px-4 py-2 font-bold text-white active:scale-95"
						:disabled="busy"
					>
						Add
					</button>
				</form>
			</div>
			<button
				v-else
				class="rounded-full bg-sunshine-400 px-6 py-3 text-lg font-extrabold text-grape-700 shadow-xl shadow-grape-900/30 active:scale-95"
				@click="showNewDeck = true"
			>
				+ New Deck
			</button>
		</div>
	</div>
</template>
