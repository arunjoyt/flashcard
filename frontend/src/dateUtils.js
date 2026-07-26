function pad(n) {
	return String(n).padStart(2, "0");
}

export function dateKey(year, month, day) {
	return `${year}-${pad(month)}-${pad(day)}`;
}

export function todayDateKey() {
	const now = new Date();
	return dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
