<script setup>
import { ref } from "vue";
import { store } from "../store";

const emit = defineEmits(["back", "start-review"]);

const showNewCard = ref(false);
const editingCard = ref(null); // card object being edited, or null
const front = ref("");
const back = ref("");
const busy = ref(false);

function openNewCard() {
	editingCard.value = null;
	front.value = "";
	back.value = "";
	showNewCard.value = true;
}

function openEditCard(card) {
	editingCard.value = card;
	front.value = card.front;
	back.value = card.back;
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
	try {
		if (editingCard.value) {
			await store.editCard(editingCard.value.name, f, b);
		} else {
			await store.addCard(f, b);
		}
		closeForm();
	} finally {
		busy.value = false;
	}
}

async function removeCard(cardName) {
	if (!confirm("Delete this card?")) return;
	await store.removeCard(cardName);
}
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-28 pt-8">
		<button class="mb-4 font-semibold text-white/90" @click="emit('back')">← Decks</button>

		<h1 class="mb-6 text-2xl font-extrabold text-white drop-shadow-sm">
			{{ store.activeDeck?.name }}
		</h1>

		<div v-if="!store.activeDeck?.cards.length" class="mt-10 text-center text-white/90">
			<p class="text-lg font-semibold">No cards yet!</p>
			<p class="text-white/70">Add a card below to start building this deck.</p>
		</div>

		<ul class="space-y-3">
			<li
				v-for="card in store.activeDeck?.cards"
				:key="card.name"
				class="animate-pop-in flex items-center justify-between rounded-2xl bg-white/95 p-4 shadow-lg shadow-grape-900/10"
			>
				<button class="flex-1 text-left" @click="openEditCard(card)">
					<div class="font-bold text-grape-700">{{ card.front }}</div>
					<div class="text-sm text-grape-500">{{ card.back }}</div>
				</button>
				<button
					class="ml-3 rounded-full p-2 text-bubblegum-500 hover:bg-bubblegum-50"
					aria-label="Delete card"
					@click="removeCard(card.name)"
				>
					✕
				</button>
			</li>
		</ul>

		<button
			class="mt-6 w-full rounded-2xl border-2 border-dashed border-white/60 py-3 font-bold text-white active:scale-95"
			@click="openNewCard"
		>
			+ Add Card
		</button>

		<div class="fixed inset-x-0 bottom-0 flex justify-center pb-6">
			<button
				class="rounded-full bg-sunshine-400 px-8 py-4 text-lg font-extrabold text-grape-700 shadow-xl shadow-grape-900/30 active:scale-95 disabled:opacity-50"
				:disabled="!store.activeDeck?.cards.length"
				@click="emit('start-review')"
			>
				▶ Start Review
			</button>
		</div>

		<div v-if="showNewCard" class="fixed inset-0 flex items-end bg-black/40" @click.self="closeForm">
			<form
				class="animate-bounce-in w-full space-y-3 rounded-t-3xl bg-white p-5"
				@submit.prevent="submitCard"
			>
				<h2 class="text-lg font-bold text-grape-700">
					{{ editingCard ? "Edit Card" : "New Card" }}
				</h2>
				<textarea
					v-model="front"
					placeholder="Front (question)"
					rows="2"
					class="w-full rounded-xl border-2 border-grape-100 px-3 py-2 outline-none focus:border-grape-400"
					autofocus
				/>
				<textarea
					v-model="back"
					placeholder="Back (answer)"
					rows="2"
					class="w-full rounded-xl border-2 border-grape-100 px-3 py-2 outline-none focus:border-grape-400"
				/>
				<div class="flex gap-2">
					<button
						type="button"
						class="flex-1 rounded-xl bg-grape-100 py-2 font-bold text-grape-700"
						@click="closeForm"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="flex-1 rounded-xl bg-grape-500 py-2 font-bold text-white active:scale-95"
						:disabled="busy"
					>
						Save
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
