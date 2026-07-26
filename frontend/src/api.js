import { frappeRequest } from "frappe-ui";

function call(method, params) {
	return frappeRequest({
		url: "/api/method/" + method,
		method: "POST",
		params,
	});
}

export const api = {
	getDecks: () => call("flashcard.flashcard.api.get_decks"),
	createDeck: (deck_name) => call("flashcard.flashcard.api.create_deck", { deck_name }),
	deleteDeck: (deck_name) => call("flashcard.flashcard.api.delete_deck", { deck_name }),
	updateDeck: (deck_name, new_name) =>
		call("flashcard.flashcard.api.update_deck", { deck_name, new_name }),
	getDeck: (deck_name) => call("flashcard.flashcard.api.get_deck", { deck_name }),
	createCard: (deck_name, front, back) =>
		call("flashcard.flashcard.api.create_card", { deck_name, front, back }),
	updateCard: (card_name, front, back) =>
		call("flashcard.flashcard.api.update_card", { card_name, front, back }),
	deleteCard: (card_name) => call("flashcard.flashcard.api.delete_card", { card_name }),
	getAllCards: () => call("flashcard.flashcard.api.get_all_cards"),
	recordCardsViewed: (count, date) =>
		call("flashcard.flashcard.api.record_cards_viewed", { count, date }),
	getMonthlyStats: (year, month) =>
		call("flashcard.flashcard.api.get_monthly_stats", { year, month }),
	logout: () => call("logout"),
};
