<script setup>
import { ref, computed, watch } from "vue";
import { Button } from "frappe-ui";
import { store } from "@/store";
import CardCell from "@/components/CardCell.vue";

// `card` is null for the always-empty new row at the bottom of the grid.
const props = defineProps({
	card: { type: Object, default: null },
});

const isNew = computed(() => !props.card);
const front = ref(props.card?.front || "");
const back = ref(props.card?.back || "");
const isDraft = ref(false); // new row left half-filled
const status = ref(null); // null | "saving" | "saved" | "error"
const errorMessage = ref("");
const confirmingDelete = ref(false);
const deleting = ref(false);

const rowEl = ref(null);
const frontCell = ref(null);
const backCell = ref(null);

watch(
	() => props.card,
	(card) => {
		if (!card) return;
		front.value = card.front;
		back.value = card.back;
	}
);

// Save when focus leaves the row, not when it moves between the row's own cells.
function onFocusOut(event) {
	if (rowEl.value.contains(event.relatedTarget)) return;
	save();
}

function onBackEnter() {
	const nextFront = rowEl.value.nextElementSibling?.querySelector('[data-cell="front"]');
	if (nextFront) {
		nextFront.focus(); // the focusout saves this row
		return;
	}
	save();
	frontCell.value.focus();
}

function save() {
	const f = front.value.trim();
	const b = back.value.trim();
	return isNew.value ? saveNew(f, b) : saveExisting(f, b);
}

async function saveNew(f, b) {
	isDraft.value = Boolean(f || b) && !(f && b);
	if (!f || !b) return;
	// Clear right away so typing the next card can start while this one saves.
	front.value = "";
	back.value = "";
	await run(
		() => store.addCard(f, b),
		() => {
			if (front.value || back.value) return;
			front.value = f;
			back.value = b;
		}
	);
}

async function saveExisting(f, b) {
	const card = props.card;
	if (f === card.front && b === card.back) return;
	if (!f || !b) {
		// A Card can't have an empty side; deleting is only via ✕.
		front.value = card.front;
		back.value = card.back;
		return;
	}
	await run(() => store.editCard(card.name, f, b));
}

async function run(action, onError) {
	status.value = "saving";
	errorMessage.value = "";
	try {
		await action();
		status.value = "saved";
		setTimeout(() => {
			if (status.value === "saved") status.value = null;
		}, 1500);
	} catch (error) {
		status.value = "error";
		errorMessage.value = error?.messages?.join("\n") || error?.message || "Failed to save";
		onError?.();
	}
}

async function confirmDelete() {
	deleting.value = true;
	errorMessage.value = "";
	try {
		await store.removeCard(props.card.name);
	} catch (error) {
		errorMessage.value = error?.messages?.join("\n") || error?.message || "Failed to delete";
		deleting.value = false;
	}
}
</script>

<template>
	<li
		ref="rowEl"
		:data-test="isNew ? 'new-card-row' : 'manage-card-row'"
		class="grid grid-cols-[1fr_1fr_2rem] items-start gap-2"
		@focusout="onFocusOut"
	>
		<CardCell
			ref="frontCell"
			v-model="front"
			cell="front"
			:placeholder="isNew ? 'New card front' : ''"
			:invalid="isDraft && !front.trim()"
			@enter="backCell.focus()"
		/>
		<CardCell
			ref="backCell"
			v-model="back"
			cell="back"
			:placeholder="isNew ? 'Back' : ''"
			:invalid="isDraft && !back.trim()"
			@enter="onBackEnter"
		/>
		<div class="flex flex-col-reverse items-center justify-end">
			<span v-if="status === 'saving'" class="text-xs text-gray-500" data-test="row-saving">…</span>
			<span v-else-if="status === 'saved'" class="text-sm text-green-600" data-test="row-saved">✓</span>
			<button
				v-else-if="status === 'error'"
				class="text-sm text-red-600"
				:title="`${errorMessage} — tap to retry`"
				aria-label="Retry save"
				data-test="row-retry"
				@click="save"
			>
				⚠
			</button>
			<button
				v-if="!isNew && !confirmingDelete"
				class="rounded-full p-1.5 text-red-500 hover:bg-red-50"
				aria-label="Delete card"
				data-test="card-delete"
				@click="confirmingDelete = true"
			>
				✕
			</button>
		</div>
		<div v-if="confirmingDelete" class="col-span-3 flex items-center justify-end gap-2">
			<span class="text-sm text-gray-600">Delete this card?</span>
			<Button
				data-test="card-confirm-delete"
				variant="solid"
				theme="red"
				size="sm"
				:loading="deleting"
				@click="confirmDelete"
			>
				Confirm
			</Button>
			<Button data-test="card-cancel-delete" variant="ghost" size="sm" @click="confirmingDelete = false">
				Cancel
			</Button>
		</div>
		<p v-if="errorMessage" class="col-span-3 text-sm text-red-600" data-test="row-error">{{ errorMessage }}</p>
	</li>
</template>
