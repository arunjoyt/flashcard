<script setup>
defineProps({
	deck: { type: Object, required: true },
	disabled: { type: Boolean, default: false },
});
defineEmits(["click"]);
</script>

<template>
	<li
		data-test="deck-row"
		class="animate-pop-in rounded-2xl bg-white shadow-sm"
		:class="{ 'opacity-60': disabled }"
	>
		<button
			class="w-full p-4 text-left"
			data-test="deck-open"
			:disabled="disabled"
			@click="$emit('click')"
		>
			<div class="text-lg font-bold text-gray-900">{{ deck.deck_name }}</div>
			<div class="text-sm text-gray-500">
				{{ deck.card_count }} card{{ deck.card_count === 1 ? "" : "s" }}
			</div>
		</button>
	</li>
</template>
