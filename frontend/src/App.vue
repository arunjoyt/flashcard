<script setup>
import { onMounted } from "vue";
import { store } from "./store";

onMounted(() => store.loadDecks());
</script>

<template>
	<div class="min-h-screen w-full">
		<router-view />
	</div>
</template>
