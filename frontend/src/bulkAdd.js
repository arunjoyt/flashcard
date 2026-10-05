// Bulk Add parsing: one line per Card, "front,back", CSV-style quoting.
export const BULK_ADD_LIMIT = 500;

export function parseBulkAdd(text) {
	const rows = text
		.split(/\r?\n/)
		.map((line, i) => ({ lineNumber: i + 1, line }))
		.filter(({ line }) => line.trim())
		.map(({ lineNumber, line }) => ({ lineNumber, ...parseLine(line) }));
	const tooMany = rows.length > BULK_ADD_LIMIT;
	const valid = rows.length > 0 && !tooMany && rows.every((r) => !r.error);
	return { rows, tooMany, valid };
}

function parseLine(line) {
	let fields;
	try {
		fields = splitFields(line);
	} catch (error) {
		return { front: "", back: "", error: error.message };
	}
	const [front = "", back = ""] = fields;
	if (fields.length === 1) {
		return { front, back, error: "Missing comma between Front and Back" };
	}
	if (fields.length !== 2) {
		return { front, back, error: `${fields.length} fields — quote text containing commas` };
	}
	if (!front || !back) {
		return { front, back, error: "Front and Back must not be empty" };
	}
	return { front, back, error: null };
}

function splitFields(line) {
	const fields = [];
	let pos = 0;
	while (true) {
		const { value, end } = readField(line, pos);
		fields.push(value);
		if (end >= line.length) return fields;
		pos = end + 1; // skip the comma
	}
}

// Returns the field starting at `start` and the index of the comma (or line end) after it.
function readField(line, start) {
	let pos = start;
	while (line[pos] === " " || line[pos] === "\t") pos++;
	if (line[pos] !== '"') {
		const comma = line.indexOf(",", start);
		const end = comma === -1 ? line.length : comma;
		return { value: line.slice(start, end).trim(), end };
	}
	let value = "";
	pos++;
	while (true) {
		if (pos >= line.length) throw new Error("Missing closing quote");
		if (line[pos] === '"' && line[pos + 1] === '"') {
			value += '"';
			pos += 2;
		} else if (line[pos] === '"') {
			pos++;
			break;
		} else {
			value += line[pos++];
		}
	}
	const rest = line.indexOf(",", pos);
	const end = rest === -1 ? line.length : rest;
	if (line.slice(pos, end).trim()) throw new Error("Text after closing quote");
	return { value: value.trim(), end };
}
