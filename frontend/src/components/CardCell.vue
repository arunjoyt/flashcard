<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";

const model = defineModel({ type: String, default: "" });
defineProps({
	cell: { type: String, required: true },
	placeholder: { type: String, default: "" },
	invalid: { type: Boolean, default: false },
});
const emit = defineEmits(["enter"]);

const el = ref(null);

// Re-measure when the cell's width changes (layout settling, window resize) and once
// web fonts load, otherwise wrapped text is clipped on first render.
let observer;
let lastWidth = 0;
onMounted(() => {
	resize();
	observer = new ResizeObserver(([entry]) => {
		if (entry.contentRect.width === lastWidth) return;
		lastWidth = entry.contentRect.width;
		resize();
	});
	observer.observe(el.value);
	document.fonts?.ready.then(resize);
});
onBeforeUnmount(() => observer?.disconnect());
watch(model, () => nextTick(resize));

// Cards are single-line: Enter navigates instead of adding a line break,
// and line breaks in pasted text become spaces.
function onInput(event) {
	model.value = event.target.value.replace(/\r?\n/g, " ");
}

function onEnter(event) {
	if (event.isComposing) return;
	event.preventDefault();
	emit("enter");
}

// A textarea that grows with its content, so long text wraps instead of scrolling sideways.
function resize() {
	if (!el.value) return;
	el.value.style.height = "auto";
	el.value.style.height = `${el.value.scrollHeight}px`;
}

defineExpose({ focus: () => el.value?.focus() });
</script>

<template>
	<textarea
		ref="el"
		rows="1"
		:value="model"
		:placeholder="placeholder"
		:data-cell="cell"
		:data-test="`card-${cell}-cell`"
		class="block w-full resize-none overflow-hidden rounded-lg border-0 bg-gray-50 px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-grape-300"
		:class="{ 'ring-2 ring-red-300': invalid }"
		@input="onInput"
		@keydown.enter="onEnter"
	/>
</template>
