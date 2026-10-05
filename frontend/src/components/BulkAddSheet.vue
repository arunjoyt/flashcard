<script setup>
import { ref, computed, onMounted } from "vue";
import { Button, ErrorMessage } from "frappe-ui";
import { store } from "@/store";
import { parseBulkAdd, BULK_ADD_LIMIT } from "@/bulkAdd";

const emit = defineEmits(["close"]);

const text = ref("");
const inputEl = ref(null);
const busy = ref(false);
const saveError = ref("");

// The `autofocus` attribute only works on page load, not on elements Vue adds later.
onMounted(() => inputEl.value?.focus());

const result = computed(() => parseBulkAdd(text.value));
const invalidCount = computed(() => result.value.rows.filter((r) => r.error).length);

const summary = computed(() => {
	if (result.value.tooMany) return `Too many lines — at most ${BULK_ADD_LIMIT} cards at once.`;
	if (invalidCount.value) return `${invalidCount.value} line${invalidCount.value === 1 ? "" : "s"} to fix.`;
	return "";
});

async function submit() {
	if (!result.value.valid || busy.value) return;
	busy.value = true;
	saveError.value = "";
	try {
		await store.addCards(result.value.rows.map(({ front, back }) => ({ front, back })));
		emit("close");
	} catch (error) {
		saveError.value = error?.messages?.join("\n") || error?.message || "Failed to add cards";
	} finally {
		busy.value = false;
	}
}
</script>

<template>
	<div class="fixed inset-0 z-10 flex items-end bg-black/40" @click.self="emit('close')">
		<form
			class="animate-bounce-in mx-auto flex max-h-[90vh] w-full max-w-3xl flex-col gap-3 rounded-t-3xl bg-white p-5"
			data-test="bulk-add-sheet"
			@submit.prevent="submit"
		>
			<h2 class="text-lg font-bold text-grape-700">Paste cards</h2>
			<p class="text-sm text-gray-500">
				One card per line: <code>front, back</code>. Put text that contains a comma in double quotes, like
				<code>"Paris, France", capital city</code>.
			</p>
			<textarea
				ref="inputEl"
				v-model="text"
				rows="5"
				placeholder="apple, a fruit"
				class="w-full rounded-lg border border-gray-300 p-2 font-mono text-sm focus:ring-2 focus:ring-grape-300"
				data-test="bulk-add-input"
			/>

			<div v-if="result.rows.length" class="min-h-0 flex-1 overflow-y-auto rounded-lg border border-gray-200">
				<table class="w-full table-fixed text-left text-sm [overflow-wrap:anywhere]" data-test="bulk-add-preview">
					<thead class="sticky top-0 bg-gray-50 text-xs font-bold uppercase text-gray-500">
						<tr>
							<th class="w-8 px-2 py-1">#</th>
							<th class="px-2 py-1">Front</th>
							<th class="px-2 py-1">Back</th>
						</tr>
					</thead>
					<tbody>
						<template v-for="row in result.rows" :key="row.lineNumber">
							<tr :class="row.error ? 'bg-red-50' : ''" data-test="bulk-add-preview-row">
								<td class="px-2 py-1 align-top text-gray-400">{{ row.lineNumber }}</td>
								<td class="px-2 py-1 align-top">{{ row.front }}</td>
								<td class="px-2 py-1 align-top">{{ row.back }}</td>
							</tr>
							<tr v-if="row.error" class="bg-red-50">
								<td />
								<td colspan="2" class="px-2 pb-1 text-xs text-red-600" data-test="bulk-add-line-error">
									{{ row.error }}
								</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>

			<p v-if="summary" class="text-sm font-semibold text-red-600">{{ summary }}</p>
			<ErrorMessage :message="saveError" />
			<div class="flex gap-2">
				<Button type="button" variant="ghost" class="flex-1" @click="emit('close')">Cancel</Button>
				<Button
					type="submit"
					variant="solid"
					theme="blue"
					class="flex-1"
					:disabled="!result.valid"
					:loading="busy"
					data-test="bulk-add-submit"
				>
					Add {{ result.rows.length }} card{{ result.rows.length === 1 ? "" : "s" }}
				</Button>
			</div>
		</form>
	</div>
</template>
