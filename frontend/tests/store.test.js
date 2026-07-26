import { describe, it, expect, vi, beforeEach } from "vitest";
import { store } from "@/store";

vi.mock("@/api", () => ({
	api: {
		getDecks: vi.fn(),
		createDeck: vi.fn(),
		deleteDeck: vi.fn(),
		updateDeck: vi.fn(),
		getDeck: vi.fn(),
		createCard: vi.fn(),
		updateCard: vi.fn(),
		deleteCard: vi.fn(),
		getAllCards: vi.fn(),
		recordCardsViewed: vi.fn(),
		getMonthlyStats: vi.fn(),
	},
}));

import { api } from "@/api";

beforeEach(() => {
	store.decks = [];
	store.activeDeck = null;
	vi.clearAllMocks();
});

describe("store", () => {
	it("loadDecks populates decks from the API", async () => {
		api.getDecks.mockResolvedValue([{ name: "Spanish", card_count: 3 }]);
		await store.loadDecks();
		expect(store.decks).toEqual([{ name: "Spanish", card_count: 3 }]);
	});

	it("deleteDeck removes the deck locally without a full reload", async () => {
		store.decks = [
			{ name: "Spanish", card_count: 3 },
			{ name: "French", card_count: 1 },
		];
		api.deleteDeck.mockResolvedValue();
		await store.deleteDeck("Spanish");
		expect(store.decks).toEqual([{ name: "French", card_count: 1 }]);
		expect(api.getDecks).not.toHaveBeenCalled();
	});

	it("addCard pushes the new card and bumps the deck's card_count", async () => {
		store.decks = [{ name: "Spanish", card_count: 1 }];
		store.activeDeck = { name: "Spanish", cards: [] };
		api.createCard.mockResolvedValue({ name: "c1", front: "Hola", back: "Hello" });
		await store.addCard("Hola", "Hello");
		expect(store.activeDeck.cards).toEqual([{ name: "c1", front: "Hola", back: "Hello" }]);
		expect(store.decks[0].card_count).toBe(2);
	});

	it("removeCard removes the card and decrements the deck's card_count", async () => {
		store.decks = [{ name: "Spanish", card_count: 2 }];
		store.activeDeck = {
			name: "Spanish",
			cards: [{ name: "c1" }, { name: "c2" }],
		};
		api.deleteCard.mockResolvedValue();
		await store.removeCard("c1");
		expect(store.activeDeck.cards).toEqual([{ name: "c2" }]);
		expect(store.decks[0].card_count).toBe(1);
	});

	it("renameDeck updates the deck_name in the list and on the active deck", async () => {
		store.decks = [{ name: "Spanish", deck_name: "Spanish", card_count: 3 }];
		store.activeDeck = { name: "Spanish", deck_name: "Spanish", cards: [] };
		api.updateDeck.mockResolvedValue({ name: "Spanish", deck_name: "Español" });
		await store.renameDeck("Spanish", "Español");
		expect(api.updateDeck).toHaveBeenCalledWith("Spanish", "Español");
		expect(store.decks[0].deck_name).toBe("Español");
		expect(store.activeDeck.deck_name).toBe("Español");
	});

	it("renameDeck does not touch activeDeck if a different deck is open", async () => {
		store.decks = [{ name: "Spanish", deck_name: "Spanish", card_count: 3 }];
		store.activeDeck = { name: "French", deck_name: "French", cards: [] };
		api.updateDeck.mockResolvedValue({ name: "Spanish", deck_name: "Español" });
		await store.renameDeck("Spanish", "Español");
		expect(store.activeDeck.deck_name).toBe("French");
	});

	it("totalCardCount sums card_count across all decks", () => {
		store.decks = [
			{ name: "Spanish", card_count: 3 },
			{ name: "French", card_count: 1 },
		];
		expect(store.totalCardCount).toBe(4);
	});

	it("totalCardCount is 0 when there are no decks", () => {
		expect(store.totalCardCount).toBe(0);
	});
});
