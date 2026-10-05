import { describe, it, expect } from "vitest";
import { searchCards, searchWords, highlightParts } from "@/search";

const decks = [
	{ name: "d1", deck_name: "Spanish" },
	{ name: "d2", deck_name: "Biology" },
];
const cards = [
	{ name: "c1", deck: "d1", front: "Adiós", back: "Goodbye" },
	{ name: "c2", deck: "d2", front: "Why is the sky blue?", back: "Rayleigh scattering" },
	{ name: "c3", deck: "d2", front: "Photosynthesis", back: "Plants make sugar from light" },
	{ name: "c4", deck: "d1", front: "Hola", back: "Hello" },
];

function names(query) {
	return searchCards(cards, decks, query).flatMap((g) => g.cards.map((c) => c.name));
}

describe("searchCards", () => {
	it("returns nothing for an empty or blank query", () => {
		expect(searchCards(cards, decks, "")).toEqual([]);
		expect(searchCards(cards, decks, "   ")).toEqual([]);
	});

	it("matches Front or Back, ignoring case", () => {
		expect(names("GOODBYE")).toEqual(["c1"]);
		expect(names("photo")).toEqual(["c3"]);
	});

	it("ignores accents both ways", () => {
		expect(names("adios")).toEqual(["c1"]);
		expect(names("ADIÓS")).toEqual(["c1"]);
	});

	it("needs every word, in any order, on either side", () => {
		expect(names("blue sky")).toEqual(["c2"]);
		expect(names("sky rayleigh")).toEqual(["c2"]);
		expect(names("sky hello")).toEqual([]);
	});

	it("groups by Deck name A–Z and keeps card order inside a Deck", () => {
		const groups = searchCards(cards, decks, "o");
		expect(groups.map((g) => g.deck.deck_name)).toEqual(["Biology", "Spanish"]);
		expect(groups[1].cards.map((c) => c.name)).toEqual(["c1", "c4"]);
	});
});

describe("highlightParts", () => {
	it("marks every match, keeping the original accented text", () => {
		expect(highlightParts("Adiós amigo", searchWords("adios"))).toEqual([
			{ text: "Adiós", match: true },
			{ text: " amigo", match: false },
		]);
	});

	it("marks several words and repeated matches", () => {
		const parts = highlightParts("sky is blue, sky", searchWords("sky blue"));
		expect(parts.filter((p) => p.match).map((p) => p.text)).toEqual(["sky", "blue", "sky"]);
	});

	it("returns one unmarked part when nothing matches", () => {
		expect(highlightParts("Hola", ["xyz"])).toEqual([{ text: "Hola", match: false }]);
	});
});
