<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Input, Button } from "frappe-ui";
import { store } from "@/store";
import DeckRow from "@/components/DeckRow.vue";

const router = useRouter();

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

function openDeck(deckName) {
	router.push({ name: "ManageDeck", params: { deckName } });
}
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-24 pt-10">
		<h1 class="mb-1 text-3xl font-extrabold text-gray-900">🃏 Flashcard</h1>
		<p class="mb-6 text-gray-500">Pick a deck to manage, or make a new one.</p>

		<div v-if="store.decks.length === 0" class="mt-10 text-center">
			<p class="text-lg font-semibold text-gray-600">No decks yet!</p>
			<p class="text-gray-400">Create your first deck to get started.</p>
		</div>

		<ul class="space-y-3">
			<DeckRow
				v-for="deck in store.decks"
				:key="deck.name"
				:deck="deck"
				@click="openDeck(deck.name)"
			/>
		</ul>

		<div class="fixed inset-x-0 bottom-20 flex justify-center pb-6">
			<div v-if="showNewDeck" class="w-full max-w-md px-5">
				<form
					class="animate-bounce-in flex gap-2 rounded-2xl bg-white p-3 shadow-xl"
					data-test="new-deck-form"
					@submit.prevent="submitNewDeck"
				>
					<Input
						v-model="newDeckName"
						type="text"
						placeholder="Deck name"
						data-test="deck-name-input"
						class="flex-1"
						autofocus
					/>
					<Button type="submit" variant="solid" theme="blue" :loading="busy" data-test="submit-new-deck">
						Add
					</Button>
				</form>
			</div>
			<button
				v-else
				class="rounded-full bg-grape-600 px-6 py-3 text-lg font-extrabold text-white shadow-lg shadow-grape-900/20 active:scale-95"
				data-test="new-deck-button"
				@click="showNewDeck = true"
			>
				+ New Deck
			</button>
		</div>
	</div>
</template>
