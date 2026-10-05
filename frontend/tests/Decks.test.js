import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import Decks from "@/pages/Decks.vue";
import { store } from "@/store";
import { createAppRouter } from "@/router";
import { api } from "@/api";

vi.mock("@/api", () => ({ api: { getAllCards: vi.fn() } }));

beforeEach(() => {
	store.decks = [];
	store.activeDeck = null;
});

async function mountDecks(path = "/decks") {
	const router = createAppRouter();
	await router.push(path);
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

	it("shows the logged-in user's name and a Log out button at the top", async () => {
		window.user_full_name = "Ada Lovelace";
		const { wrapper } = await mountDecks();
		expect(wrapper.find('[data-test="user-name"]').text()).toBe("Ada Lovelace");
		expect(wrapper.find('[data-test="logout-button"]').text()).toBe("Log out");
		delete window.user_full_name;
	});

	it("sends unknown paths such as the old /settings to Decks", async () => {
		const { router } = await mountDecks("/settings");
		expect(router.currentRoute.value.name).toBe("Decks");
	});

	describe("search", () => {
		beforeEach(() => {
			store.decks = [
				{ name: "d1", deck_name: "Spanish", card_count: 2 },
				{ name: "d2", deck_name: "Biology", card_count: 1 },
			];
			api.getAllCards.mockReset().mockResolvedValue([
				{ name: "c1", deck: "d1", front: "Adiós", back: "Goodbye" },
				{ name: "c2", deck: "d1", front: "Hola", back: "Hello" },
				{ name: "c3", deck: "d2", front: "Photosynthesis", back: "Plants make sugar" },
			]);
		});

		it("replaces the deck list with matching cards and keeps the query in the URL", async () => {
			const { wrapper, router } = await mountDecks();
			await wrapper.find('[data-test="search-input"]').setValue("adios");
			await flushPromises();
			expect(wrapper.find('[data-test="deck-row"]').exists()).toBe(false);
			expect(wrapper.find('[data-test="new-deck-button"]').exists()).toBe(false);
			const results = wrapper.findAll('[data-test="search-result"]');
			expect(results).toHaveLength(1);
			expect(results[0].text()).toContain("Adiós");
			expect(wrapper.find('[data-test="search-deck"]').text()).toBe("Spanish");
			expect(router.currentRoute.value.query.q).toBe("adios");
			expect(store.lastSearch).toBe("adios");
		});

		it("loads cards once per visit, not on every keystroke", async () => {
			const { wrapper } = await mountDecks();
			const input = wrapper.find('[data-test="search-input"]');
			await input.setValue("h");
			await input.setValue("he");
			await flushPromises();
			expect(api.getAllCards).toHaveBeenCalledTimes(1);
		});

		it("restores the search from the URL", async () => {
			const { wrapper } = await mountDecks("/decks?q=photo");
			await flushPromises();
			expect(wrapper.find('[data-test="search-input"]').element.value).toBe("photo");
			expect(wrapper.findAll('[data-test="search-result"]')).toHaveLength(1);
		});

		it("says when nothing matches", async () => {
			const { wrapper } = await mountDecks();
			await wrapper.find('[data-test="search-input"]').setValue("zzz");
			await flushPromises();
			expect(wrapper.find('[data-test="search-empty"]').text()).toContain('No cards match "zzz"');
		});

		it("clearing the search brings the deck list back", async () => {
			const { wrapper, router } = await mountDecks("/decks?q=hola");
			await flushPromises();
			await wrapper.find('[data-test="search-clear"]').trigger("click");
			await flushPromises();
			expect(wrapper.findAll('[data-test="deck-row"]')).toHaveLength(2);
			expect(router.currentRoute.value.query.q).toBeUndefined();
		});

		it("opening a result goes to that card in Manage Deck", async () => {
			const { wrapper, router } = await mountDecks("/decks?q=photo");
			await flushPromises();
			await wrapper.find('[data-test="search-result"]').trigger("click");
			await vi.waitFor(() => {
				expect(router.currentRoute.value.name).toBe("ManageDeck");
			});
			expect(router.currentRoute.value.params.deckName).toBe("d2");
			expect(router.currentRoute.value.query.card).toBe("c3");
		});
	});
});
