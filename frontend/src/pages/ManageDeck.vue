<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Input, Button, ErrorMessage } from "frappe-ui";
import { store } from "@/store";

const props = defineProps({
	deckName: { type: String, required: true },
});

const router = useRouter();

const showNewCard = ref(false);
const editingCard = ref(null); // card object being edited, or null
const front = ref("");
const back = ref("");
const busy = ref(false);
const formError = ref("");

const confirmingDeleteCard = ref(null);
const deletingCard = ref(false);
const cardDeleteError = ref("");

const confirmingDeleteDeck = ref(false);
const deletingDeck = ref(false);
const deckDeleteError = ref("");

const renamingDeck = ref(false);
const deckNameInput = ref("");
const renamingBusy = ref(false);
const renameError = ref("");

onMounted(async () => {
	if (store.activeDeck?.name !== props.deckName) {
		await store.openDeck(props.deckName);
	}
});

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

function openNewCard() {
	editingCard.value = null;
	front.value = "";
	back.value = "";
	formError.value = "";
	showNewCard.value = true;
}

function openEditCard(card) {
	editingCard.value = card;
	front.value = card.front;
	back.value = card.back;
	formError.value = "";
	showNewCard.value = true;
}

function closeForm() {
	showNewCard.value = false;
}

async function submitCard() {
	const f = front.value.trim();
	const b = back.value.trim();
	if (!f || !b || busy.value) return;
	busy.value = true;
	formError.value = "";
	try {
		if (editingCard.value) {
			await store.editCard(editingCard.value.name, f, b);
		} else {
			await store.addCard(f, b);
		}
		closeForm();
	} catch (error) {
		formError.value = error?.messages?.join("\n") || error?.message || "Failed to save";
	} finally {
		busy.value = false;
	}
}

function startDeleteCard(cardName) {
	cardDeleteError.value = "";
	confirmingDeleteCard.value = cardName;
}

async function confirmDeleteCard(cardName) {
	deletingCard.value = true;
	cardDeleteError.value = "";
	try {
		await store.removeCard(cardName);
		confirmingDeleteCard.value = null;
	} catch (error) {
		cardDeleteError.value = error?.messages?.join("\n") || error?.message || "Failed to delete";
	} finally {
		deletingCard.value = false;
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
	<div class="mx-auto max-w-md px-5 pb-28 pt-8">
		<button
			class="mb-4 font-semibold text-gray-500"
			data-test="manage-back"
			@click="router.push({ name: 'Decks' })"
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

		<div v-if="!store.activeDeck?.cards.length" class="mt-10 text-center">
			<p class="text-lg font-semibold text-gray-600">No cards yet!</p>
			<p class="text-gray-400">Add a card below to start building this deck.</p>
		</div>

		<ErrorMessage class="mb-3" :message="cardDeleteError" />

		<ul class="space-y-3">
			<li
				v-for="card in store.activeDeck?.cards"
				:key="card.name"
				data-test="manage-card-row"
				class="animate-pop-in flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
			>
				<button class="flex-1 text-left" @click="openEditCard(card)">
					<div class="font-bold text-gray-900">{{ card.front }}</div>
					<div class="text-sm text-gray-500">{{ card.back }}</div>
				</button>

				<div v-if="confirmingDeleteCard === card.name" class="ml-3 flex shrink-0 gap-1">
					<Button
						data-test="card-confirm-delete"
						variant="solid"
						theme="red"
						size="sm"
						:loading="deletingCard"
						@click="confirmDeleteCard(card.name)"
					>
						Confirm
					</Button>
					<Button
						data-test="card-cancel-delete"
						variant="ghost"
						size="sm"
						@click="confirmingDeleteCard = null"
					>
						Cancel
					</Button>
				</div>
				<button
					v-else
					class="ml-3 rounded-full p-2 text-red-500 hover:bg-red-50"
					aria-label="Delete card"
					data-test="card-delete"
					@click="startDeleteCard(card.name)"
				>
					✕
				</button>
			</li>
		</ul>

		<button
			class="mt-6 w-full rounded-2xl border-2 border-dashed border-grape-300 py-3 font-bold text-grape-600 active:scale-95"
			data-test="add-card-button"
			@click="openNewCard"
		>
			+ Add Card
		</button>

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

		<div v-if="showNewCard" class="fixed inset-0 flex items-end bg-black/40" @click.self="closeForm">
			<form
				class="animate-bounce-in w-full space-y-3 rounded-t-3xl bg-white p-5"
				@submit.prevent="submitCard"
			>
				<h2 class="text-lg font-bold text-grape-700">
					{{ editingCard ? "Edit Card" : "New Card" }}
				</h2>
				<Input
					v-model="front"
					type="textarea"
					placeholder="Front (question)"
					:rows="2"
					autofocus
					data-test="card-front-input"
				/>
				<Input
					v-model="back"
					type="textarea"
					placeholder="Back (answer)"
					:rows="2"
					data-test="card-back-input"
				/>
				<ErrorMessage :message="formError" />
				<div class="flex gap-2">
					<Button type="button" variant="ghost" class="flex-1" @click="closeForm">Cancel</Button>
					<Button
						type="submit"
						variant="solid"
						theme="blue"
						class="flex-1"
						:loading="busy"
						data-test="save-card"
					>
						Save
					</Button>
				</div>
			</form>
		</div>
	</div>
</template>
