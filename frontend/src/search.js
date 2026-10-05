// Search: a Card matches when every typed word appears in its Front or Back,
// ignoring case and accents, and matching parts of words.

export function searchWords(query) {
	return normalize(query).split(/\s+/).filter(Boolean);
}

// Returns [{ deck, cards }] grouped by Deck name A–Z; cards keep their given order.
export function searchCards(cards, decks, query) {
	const words = searchWords(query);
	if (!words.length) return [];
	const deckNames = new Map(decks.map((d) => [d.name, d.deck_name]));
	const groups = new Map();
	for (const card of cards) {
		const text = normalize(`${card.front} ${card.back}`);
		if (!words.every((w) => text.includes(w))) continue;
		if (!groups.has(card.deck)) {
			groups.set(card.deck, { deck: { name: card.deck, deck_name: deckNames.get(card.deck) || card.deck }, cards: [] });
		}
		groups.get(card.deck).cards.push(card);
	}
	return [...groups.values()].sort((a, b) => a.deck.deck_name.localeCompare(b.deck.deck_name));
}

// Splits `text` into [{ text, match }] parts, marking every place a search word appears.
export function highlightParts(text, words) {
	const { normalized, origin } = normalizeWithOrigin(text);
	const marked = new Array(text.length).fill(false);
	for (const word of words) {
		let at = normalized.indexOf(word);
		while (at !== -1) {
			for (let i = at; i < at + word.length; i++) marked[origin[i]] = true;
			at = normalized.indexOf(word, at + 1);
		}
	}
	const parts = [];
	for (let i = 0; i < text.length; i++) {
		const last = parts[parts.length - 1];
		if (last && last.match === marked[i]) last.text += text[i];
		else parts.push({ text: text[i], match: marked[i] });
	}
	return parts;
}

function normalize(text) {
	return normalizeWithOrigin(text).normalized;
}

// Lowercases and strips accents, keeping for each normalized character
// the index of the original character it came from, so highlights land on the original text.
function normalizeWithOrigin(text) {
	let normalized = "";
	const origin = [];
	for (let i = 0; i < text.length; i++) {
		const plain = text[i].normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
		normalized += plain;
		for (let k = 0; k < plain.length; k++) origin.push(i);
	}
	return { normalized, origin };
}
