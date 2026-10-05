<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Input, Button, ErrorMessage } from "frappe-ui";
import { store } from "@/store";
import { api } from "@/api";
import { searchCards } from "@/search";
import DeckRow from "@/components/DeckRow.vue";
import SearchResults from "@/components/SearchResults.vue";

const router = useRouter();
const route = useRoute();

// The search text lives in the URL (?q=) so Back and "← Decks" return to the same results.
const query = ref(route.query.q || "");
const searching = computed(() => query.value.trim() !== "");
const allCards = ref(null); // fetched once per visit, so edits made in Manage Deck show up
const loadingCards = ref(false);
const searchError = ref("");
const searchGroups = computed(() => (allCards.value ? searchCards(allCards.value, store.decks, query.value) : []));

watch(
	query,
	(q) => {
		store.lastSearch = q;
		router.replace({ query: q ? { q } : {} });
		if (searching.value) loadCards();
	},
	{ immediate: true }
);

async function loadCards() {
	if (allCards.value || loadingCards.value) return;
	loadingCards.value = true;
	searchError.value = "";
	try {
		allCards.value = await api.getAllCards();
	} catch (error) {
		searchError.value = error?.messages?.join("\n") || error?.message || "Failed to load cards";
	} finally {
		loadingCards.value = false;
	}
}

function openSearchResult(card) {
	router.push({ name: "ManageDeck", params: { deckName: card.deck }, query: { card: card.name } });
}

const allCardsDeck = computed(() => ({ deck_name: "All Cards", card_count: store.totalCardCount }));

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

function openAllCards() {
	router.push({ name: "ReviewAllCards" });
}

function openDeck(deck) {
	if (deck.card_count === 0) {
		router.push({ name: "ManageDeck", params: { deckName: deck.name } });
	} else {
		router.push({ name: "ReviewSession", params: { deckName: deck.name } });
	}
}

function manageDeck(deckName) {
	router.push({ name: "ManageDeck", params: { deckName } });
}
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-24 pt-10">
		<h1 class="mb-1 text-3xl font-extrabold text-gray-900">📚 Decks</h1>
		<p class="mb-4 text-gray-500">Tap a deck to start reviewing, or make a new one.</p>

		<div class="relative mb-5">
			<input
				v-model="query"
				type="search"
				placeholder="Search cards"
				aria-label="Search cards"
				class="w-full rounded-2xl border-0 bg-white py-3 pl-4 pr-10 text-base shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-grape-300 [&::-webkit-search-cancel-button]:hidden"
				data-test="search-input"
			/>
			<button
				v-if="query"
				class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-400 hover:text-gray-600"
				aria-label="Clear search"
				data-test="search-clear"
				@click="query = ''"
			>
				✕
			</button>
		</div>

		<template v-if="searching">
			<ErrorMessage :message="searchError" />
			<p v-if="loadingCards" class="mt-10 text-center text-gray-400">Searching…</p>
			<SearchResults v-else-if="allCards" :groups="searchGroups" :query="query" @open="openSearchResult" />
		</template>

		<template v-else>
			<div v-if="store.decks.length === 0" class="mt-10 text-center">
				<p class="text-lg font-semibold text-gray-600">No decks yet!</p>
				<p class="text-gray-400">Create your first deck to get started.</p>
			</div>

			<ul class="space-y-3">
				<DeckRow
					v-if="store.totalCardCount > 0"
					:deck="allCardsDeck"
					is-all-cards
					@click="openAllCards"
				/>
				<DeckRow
					v-for="deck in store.decks"
					:key="deck.name"
					:deck="deck"
					show-manage
					@click="openDeck(deck)"
					@manage="manageDeck(deck.name)"
				/>
			</ul>
		</template>

		<div v-if="!searching" class="fixed inset-x-0 bottom-20 flex justify-center pb-6">
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
