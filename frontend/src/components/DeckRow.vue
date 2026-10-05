<script setup>
defineProps({
	deck: { type: Object, required: true },
	showManage: { type: Boolean, default: false },
	isAllCards: { type: Boolean, default: false },
});
defineEmits(["click", "manage"]);
</script>

<template>
	<li
		:data-test="isAllCards ? 'all-cards-row' : 'deck-row'"
		class="animate-pop-in flex items-stretch rounded-2xl bg-white shadow-sm"
	>
		<button class="flex-1 p-4 text-left" data-test="deck-open" @click="$emit('click')">
			<div class="text-lg font-bold text-gray-900">{{ deck.deck_name }}</div>
			<div class="text-sm text-gray-500">
				{{ deck.card_count }} card{{ deck.card_count === 1 ? "" : "s" }}
			</div>
		</button>
		<div v-if="showManage" class="flex items-center pr-4">
			<button
				class="rounded-full border border-gray-300 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:scale-95"
				aria-label="Manage deck"
				data-test="deck-manage"
				@click.stop="$emit('manage')"
			>
				Manage
			</button>
		</div>
	</li>
</template>
