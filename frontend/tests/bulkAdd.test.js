import { describe, it, expect } from "vitest";
import { parseBulkAdd, BULK_ADD_LIMIT } from "@/bulkAdd";

function cards(text) {
	return parseBulkAdd(text).rows.map(({ front, back, error }) => ({ front, back, error }));
}

describe("parseBulkAdd", () => {
	it("splits each line at the comma and trims spaces", () => {
		expect(cards("apple, a fruit\ndog,an animal")).toEqual([
			{ front: "apple", back: "a fruit", error: null },
			{ front: "dog", back: "an animal", error: null },
		]);
	});

	it("skips blank lines but keeps original line numbers", () => {
		const { rows } = parseBulkAdd("a,b\n\n  \nc,d");
		expect(rows.map((r) => r.lineNumber)).toEqual([1, 4]);
	});

	it("allows commas inside quoted fields", () => {
		expect(cards('"Paris, France", "capital, city"')).toEqual([
			{ front: "Paris, France", back: "capital, city", error: null },
		]);
	});

	it('reads "" inside quotes as a literal quote', () => {
		expect(cards('say ""hi"", "he said ""hi"""')[0].back).toBe('he said "hi"');
	});

	it("flags unquoted extra commas", () => {
		expect(cards("apple, a fruit, usually red")[0].error).toMatch(/3 fields/);
	});

	it("flags a line with no comma", () => {
		expect(cards("apple")[0].error).toBe("Missing comma between Front and Back");
	});

	it("flags empty sides", () => {
		expect(cards("apple,")[0].error).toMatch(/must not be empty/);
		expect(cards(',""')[0].error).toMatch(/must not be empty/);
	});

	it("flags a missing closing quote and text after a closing quote", () => {
		expect(cards('"apple, fruit')[0].error).toBe("Missing closing quote");
		expect(cards('"apple" x, fruit')[0].error).toBe("Text after closing quote");
	});

	it("is valid only when every line parses", () => {
		expect(parseBulkAdd("a,b\nc,d").valid).toBe(true);
		expect(parseBulkAdd("a,b\nc").valid).toBe(false);
		expect(parseBulkAdd("  ").valid).toBe(false);
	});

	it("rejects more than the limit", () => {
		const result = parseBulkAdd("a,b\n".repeat(BULK_ADD_LIMIT + 1));
		expect(result.tooMany).toBe(true);
		expect(result.valid).toBe(false);
	});
});
