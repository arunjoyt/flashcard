import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import DeckList from "@/components/DeckList.vue";
import { store } from "@/store";

beforeEach(() => {
	store.decks = [];
	store.activeDeck = null;
});

describe("DeckList", () => {
	it("shows the empty state when there are no decks", () => {
		const wrapper = mount(DeckList);
		expect(wrapper.text()).toContain("No decks yet!");
	});

	it("renders a row per deck with its card count", () => {
		store.decks = [
			{ name: "Spanish", card_count: 3 },
			{ name: "French", card_count: 1 },
		];
		const wrapper = mount(DeckList);
		const rows = wrapper.findAll('[data-test="deck-row"]');
		expect(rows).toHaveLength(2);
		expect(rows[0].text()).toContain("Spanish");
		expect(rows[0].text()).toContain("3 cards");
		expect(rows[1].text()).toContain("1 card");
	});

	it("emits open-deck with the deck name when a row is opened", async () => {
		store.decks = [{ name: "Spanish", card_count: 3 }];
		const wrapper = mount(DeckList);
		await wrapper.find('[data-test="deck-open"]').trigger("click");
		expect(wrapper.emitted("open-deck")).toEqual([["Spanish"]]);
	});

	it("calls store.createDeck with the trimmed name on submit", async () => {
		const createDeck = vi.spyOn(store, "createDeck").mockResolvedValue();
		const wrapper = mount(DeckList);
		await wrapper.find('[data-test="new-deck-button"]').trigger("click");
		await wrapper.find('[data-test="deck-name-input"]').setValue("  Italian  ");
		await wrapper.find('[data-test="new-deck-form"]').trigger("submit");
		expect(createDeck).toHaveBeenCalledWith("Italian");
	});
});
