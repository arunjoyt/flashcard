<script setup>
import { computed } from "vue";
import { searchWords, highlightParts } from "@/search";

const props = defineProps({
	groups: { type: Array, required: true }, // [{ deck, cards }] from searchCards
	query: { type: String, required: true },
});
defineEmits(["open"]);

const words = computed(() => searchWords(props.query));
const total = computed(() => props.groups.reduce((sum, g) => sum + g.cards.length, 0));
</script>

<template>
	<div data-test="search-results">
		<p v-if="!total" class="mt-10 text-center text-gray-500" data-test="search-empty">
			No cards match "{{ query.trim() }}"
		</p>
		<template v-else>
			<p class="mb-3 text-sm text-gray-500" data-test="search-count">
				{{ total }} card{{ total === 1 ? "" : "s" }} match
			</p>
			<section v-for="group in groups" :key="group.deck.name" class="mb-5">
				<h2 class="mb-2 text-xs font-bold uppercase text-gray-500" data-test="search-deck">
					{{ group.deck.deck_name }}
				</h2>
				<ul class="space-y-2">
					<li v-for="card in group.cards" :key="card.name">
						<button
							class="w-full rounded-2xl bg-white p-4 text-left shadow-sm [overflow-wrap:anywhere] active:scale-[0.98]"
							data-test="search-result"
							@click="$emit('open', card)"
						>
							<div class="font-bold text-gray-900">
								<span
									v-for="(part, i) in highlightParts(card.front, words)"
									:key="i"
									:class="{ 'rounded bg-grape-100 text-grape-700': part.match }"
									>{{ part.text }}</span
								>
							</div>
							<div class="text-sm text-gray-500">
								<span
									v-for="(part, i) in highlightParts(card.back, words)"
									:key="i"
									:class="{ 'rounded bg-grape-100 text-grape-700': part.match }"
									>{{ part.text }}</span
								>
							</div>
						</button>
					</li>
				</ul>
			</section>
		</template>
	</div>
</template>
