import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import Decks from "@/pages/Decks.vue";
import { store } from "@/store";
import { createAppRouter } from "@/router";

beforeEach(() => {
	store.decks = [];
	store.activeDeck = null;
});

async function mountDecks() {
	const router = createAppRouter();
	await router.push("/decks");
	await router.isReady();
	return { router, wrapper: mount(Decks, { global: { plugins: [router] } }) };
}

describe("Decks page", () => {
	it("shows the empty state when there are no decks", async () => {
		const { wrapper } = await mountDecks();
		expect(wrapper.text()).toContain("No decks yet!");
	});

	it("renders a row per deck with its card count", async () => {
		store.decks = [
			{ name: "Spanish", card_count: 3 },
			{ name: "French", card_count: 1 },
		];
		const { wrapper } = await mountDecks();
		const rows = wrapper.findAll('[data-test="deck-row"]');
		expect(rows).toHaveLength(2);
		expect(rows[0].text()).toContain("Spanish");
		expect(rows[0].text()).toContain("3 cards");
		expect(rows[1].text()).toContain("1 card");
	});

	it("navigates to the manage deck route when a row is opened", async () => {
		store.decks = [{ name: "Spanish", card_count: 3 }];
		const { wrapper, router } = await mountDecks();
		await wrapper.find('[data-test="deck-open"]').trigger("click");
		// ManageDeck.vue is lazy-imported, so the navigation resolves
		// asynchronously — poll instead of guessing how long that import takes.
		await vi.waitFor(() => {
			expect(router.currentRoute.value.name).toBe("ManageDeck");
		});
		expect(router.currentRoute.value.params.deckName).toBe("Spanish");
	});

	it("calls store.createDeck with the trimmed name on submit", async () => {
		const createDeck = vi.spyOn(store, "createDeck").mockResolvedValue();
		const { wrapper } = await mountDecks();
		await wrapper.find('[data-test="new-deck-button"]').trigger("click");
		await wrapper.find('[data-test="deck-name-input"]').setValue("  Italian  ");
		await wrapper.find('[data-test="new-deck-form"]').trigger("submit");
		expect(createDeck).toHaveBeenCalledWith("Italian");
	});
});
