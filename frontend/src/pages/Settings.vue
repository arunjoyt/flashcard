<script setup>
import { store } from "@/store";

async function logout() {
	await store.logout();
	window.location.href = "/login";
}
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-24 pt-10">
		<h1 class="mb-6 text-3xl font-extrabold text-white drop-shadow-sm">⚙️ Settings</h1>

		<button
			type="button"
			data-test="logout-button"
			class="mx-auto mt-8 block w-fit rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-bubblegum-600 shadow-sm transition active:scale-95"
			@click="logout"
		>
			🚪 Log out
		</button>
	</div>
</template>
