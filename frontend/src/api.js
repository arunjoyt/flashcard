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
	getDeck: (deck_name) => call("flashcard.flashcard.api.get_deck", { deck_name }),
	createCard: (deck_name, front, back) =>
		call("flashcard.flashcard.api.create_card", { deck_name, front, back }),
	updateCard: (card_name, front, back) =>
		call("flashcard.flashcard.api.update_card", { card_name, front, back }),
	deleteCard: (card_name) => call("flashcard.flashcard.api.delete_card", { card_name }),
};
