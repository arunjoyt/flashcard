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
		<button
			v-if="showManage"
			class="flex items-center px-4 text-2xl font-bold text-gray-400 hover:text-gray-600 active:scale-95"
			aria-label="Manage deck"
			data-test="deck-manage"
			@click.stop="$emit('manage')"
		>
			›
		</button>
	</li>
</template>
