<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Input, Button, ErrorMessage } from "frappe-ui";
import { store } from "@/store";
import CardGridRow from "@/components/CardGridRow.vue";
import BulkAddSheet from "@/components/BulkAddSheet.vue";

const props = defineProps({
	deckName: { type: String, required: true },
});

const router = useRouter();
const route = useRoute();
const highlightedCard = ref(null);

const showBulkAdd = ref(false);

const confirmingDeleteDeck = ref(false);
const deletingDeck = ref(false);
const deckDeleteError = ref("");

const renamingDeck = ref(false);
const deckNameInput = ref("");
const renamingBusy = ref(false);
const renameError = ref("");

onMounted(async () => {
	// Always reload: cards may have changed elsewhere, and a Search result must be in the grid.
	await store.openDeck(props.deckName);
	if (route.query.card) await showCard(route.query.card);
});

// Arriving from a Search result: scroll to the Card and flash its row.
async function showCard(cardName) {
	router.replace({ query: {} });
	highlightedCard.value = cardName;
	await nextTick();
	document.querySelector(`[data-card-name="${CSS.escape(cardName)}"]`)?.scrollIntoView({ block: "center" });
	setTimeout(() => (highlightedCard.value = null), 1500);
}

function backToDecks() {
	router.push({ name: "Decks", query: store.lastSearch ? { q: store.lastSearch } : {} });
}

function startRenameDeck() {
	deckNameInput.value = store.activeDeck?.deck_name || "";
	renameError.value = "";
	renamingDeck.value = true;
}

function cancelRenameDeck() {
	renamingDeck.value = false;
}

async function submitRenameDeck() {
	const name = deckNameInput.value.trim();
	if (!name || renamingBusy.value) return;
	renamingBusy.value = true;
	renameError.value = "";
	try {
		await store.renameDeck(props.deckName, name);
		renamingDeck.value = false;
	} catch (error) {
		renameError.value = error?.messages?.join("\n") || error?.message || "Failed to rename";
	} finally {
		renamingBusy.value = false;
	}
}

async function confirmDeleteDeck() {
	deletingDeck.value = true;
	deckDeleteError.value = "";
	try {
		await store.deleteDeck(props.deckName);
		router.push({ name: "Decks" });
	} catch (error) {
		deckDeleteError.value = error?.messages?.join("\n") || error?.message || "Failed to delete";
	} finally {
		deletingDeck.value = false;
	}
}
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-12 pt-8 md:max-w-3xl">
		<button
			class="mb-4 font-semibold text-gray-500"
			data-test="manage-back"
			@click="backToDecks"
		>
			← Decks
		</button>

		<div class="mb-6 flex items-center gap-2">
			<h1 v-if="!renamingDeck" class="flex-1 text-2xl font-extrabold text-gray-900">
				Manage "{{ store.activeDeck?.deck_name }}"
			</h1>
			<form v-else class="flex flex-1 items-start gap-2" @submit.prevent="submitRenameDeck">
				<Input
					v-model="deckNameInput"
					type="text"
					class="flex-1"
					autofocus
					data-test="rename-deck-input"
				/>
				<Button
					type="submit"
					variant="solid"
					theme="blue"
					size="sm"
					:loading="renamingBusy"
					data-test="save-deck-name"
				>
					Save
				</Button>
				<Button type="button" variant="ghost" size="sm" data-test="cancel-rename-deck" @click="cancelRenameDeck">
					Cancel
				</Button>
			</form>
			<button
				v-if="!renamingDeck"
				class="rounded-full p-2 text-gray-400 hover:bg-gray-100"
				aria-label="Rename deck"
				data-test="rename-deck-button"
				@click="startRenameDeck"
			>
				✏️
			</button>
		</div>
		<ErrorMessage class="mb-4" :message="renameError" />

		<div class="mb-3 flex items-center justify-between">
			<p class="text-sm text-gray-500">
				{{ store.activeDeck?.cards.length || 0 }} card{{ store.activeDeck?.cards.length === 1 ? "" : "s" }}
			</p>
			<Button variant="subtle" size="sm" data-test="bulk-add-button" @click="showBulkAdd = true">
				Paste cards
			</Button>
		</div>

		<div class="mb-2 grid grid-cols-[1fr_1fr_2rem] gap-2 px-3 text-xs font-bold uppercase text-gray-500">
			<div>Front</div>
			<div>Back</div>
		</div>
		<ul v-if="store.activeDeck" class="space-y-2 rounded-2xl bg-white p-3 shadow-sm" data-test="card-grid">
			<CardGridRow
				v-for="card in store.activeDeck.cards"
				:key="card.name"
				:card="card"
				:highlighted="card.name === highlightedCard"
			/>
			<CardGridRow key="new" />
		</ul>
		<p v-if="store.activeDeck && !store.activeDeck.cards.length" class="mt-3 text-center text-sm text-gray-400">
			No cards yet. Type in the first row, or use Paste cards to add many at once.
		</p>

		<ErrorMessage class="mt-4" :message="deckDeleteError" />

		<div v-if="confirmingDeleteDeck" class="mt-8 flex flex-col items-center gap-2">
			<p class="text-sm font-semibold text-gray-600">
				Delete "{{ store.activeDeck?.deck_name }}" and all its cards? This can't be undone.
			</p>
			<div class="flex gap-2">
				<Button
					data-test="deck-confirm-delete"
					variant="solid"
					theme="red"
					:loading="deletingDeck"
					@click="confirmDeleteDeck"
				>
					Confirm Delete
				</Button>
				<Button data-test="deck-cancel-delete" variant="ghost" @click="confirmingDeleteDeck = false">
					Cancel
				</Button>
			</div>
		</div>
		<button
			v-else
			class="mt-8 w-full text-center text-sm font-semibold text-gray-400 hover:text-red-500 hover:underline"
			data-test="delete-deck-button"
			@click="confirmingDeleteDeck = true"
		>
			Delete this deck
		</button>

		<BulkAddSheet v-if="showBulkAdd" @close="showBulkAdd = false" />
	</div>
</template>
