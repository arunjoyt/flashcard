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
			{ name: "Spanish", deck_name: "Spanish", card_count: 3 },
			{ name: "French", deck_name: "French", card_count: 1 },
		];
		const { wrapper } = await mountDecks();
		// [data-test="deck-row"] matches real decks only — All Cards has its own data-test.
		const rows = wrapper.findAll('[data-test="deck-row"]');
		expect(rows).toHaveLength(2);
		expect(rows[0].text()).toContain("Spanish");
		expect(rows[0].text()).toContain("3 cards");
		expect(rows[1].text()).toContain("1 card");
	});

	it("does not show All Cards when every deck is empty", async () => {
		store.decks = [{ name: "Spanish", deck_name: "Spanish", card_count: 0 }];
		const { wrapper } = await mountDecks();
		expect(wrapper.find('[data-test="all-cards-row"]').exists()).toBe(false);
	});

	it("pins All Cards first with the total card count, and opening it starts a Review Session", async () => {
		store.decks = [
			{ name: "Spanish", deck_name: "Spanish", card_count: 3 },
			{ name: "French", deck_name: "French", card_count: 1 },
		];
		const { wrapper, router } = await mountDecks();
		const allCardsRow = wrapper.find('[data-test="all-cards-row"]');
		expect(allCardsRow.text()).toContain("All Cards");
		expect(allCardsRow.text()).toContain("4 cards");

		await allCardsRow.find('[data-test="deck-open"]').trigger("click");
		await vi.waitFor(() => {
			expect(router.currentRoute.value.name).toBe("ReviewAllCards");
		});
	});

	it("opening a deck with cards starts a Review Session", async () => {
		store.decks = [{ name: "Spanish", deck_name: "Spanish", card_count: 3 }];
		const { wrapper, router } = await mountDecks();
		// All Cards is also showing (totalCardCount > 0), so scope to the real deck row.
		await wrapper.find('[data-test="deck-row"] [data-test="deck-open"]').trigger("click");
		await vi.waitFor(() => {
			expect(router.currentRoute.value.name).toBe("ReviewSession");
		});
		expect(router.currentRoute.value.params.deckName).toBe("Spanish");
	});

	it("opening an empty deck goes to Manage Deck instead of Review", async () => {
		store.decks = [{ name: "Spanish", deck_name: "Spanish", card_count: 0 }];
		const { wrapper, router } = await mountDecks();
		await wrapper.find('[data-test="deck-open"]').trigger("click");
		await vi.waitFor(() => {
			expect(router.currentRoute.value.name).toBe("ManageDeck");
		});
		expect(router.currentRoute.value.params.deckName).toBe("Spanish");
	});

	it("the manage icon always goes to Manage Deck, even for a deck with cards", async () => {
		store.decks = [{ name: "Spanish", deck_name: "Spanish", card_count: 3 }];
		const { wrapper, router } = await mountDecks();
		await wrapper.find('[data-test="deck-manage"]').trigger("click");
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
