import { reactive } from "vue";
import { api } from "./api";

export const store = reactive({
	decks: [],
	activeDeck: null, // { name, cards: [{ name, front, back }] }

	async loadDecks() {
		if (!this._loadDecksPromise) {
			this._loadDecksPromise = api.getDecks().finally(() => {
				this._loadDecksPromise = null;
			});
		}
		this.decks = await this._loadDecksPromise;
	},

	get totalCardCount() {
		return this.decks.reduce((sum, deck) => sum + deck.card_count, 0);
	},

	async createDeck(deckName) {
		await api.createDeck(deckName);
		await this.loadDecks();
	},

	async deleteDeck(deckName) {
		await api.deleteDeck(deckName);
		this.decks = this.decks.filter((d) => d.name !== deckName);
	},

	async renameDeck(deckName, newName) {
		const result = await api.updateDeck(deckName, newName);
		if (this.activeDeck?.name === deckName) {
			this.activeDeck.deck_name = result.deck_name;
		}
		const deck = this.decks.find((d) => d.name === deckName);
		if (deck) deck.deck_name = result.deck_name;
	},

	async openDeck(deckName) {
		this.activeDeck = await api.getDeck(deckName);
	},

	async addCard(front, back) {
		const card = await api.createCard(this.activeDeck.name, front, back);
		this.activeDeck.cards.push(card);
		this.bumpCardCount(this.activeDeck.name, 1);
	},

	async editCard(cardName, front, back) {
		const card = await api.updateCard(cardName, front, back);
		const idx = this.activeDeck.cards.findIndex((c) => c.name === cardName);
		if (idx !== -1) this.activeDeck.cards[idx] = card;
	},

	async removeCard(cardName) {
		await api.deleteCard(cardName);
		this.activeDeck.cards = this.activeDeck.cards.filter((c) => c.name !== cardName);
		this.bumpCardCount(this.activeDeck.name, -1);
	},

	bumpCardCount(deckName, delta) {
		const deck = this.decks.find((d) => d.name === deckName);
		if (deck) deck.card_count += delta;
	},

	async logout() {
		await api.logout();
	},
});
