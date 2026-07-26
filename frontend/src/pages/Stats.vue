<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { api } from "@/api";
import { dateKey, todayDateKey } from "@/dateUtils";

const today = new Date();
const year = ref(today.getFullYear());
const month = ref(today.getMonth() + 1); // 1-12
const statsByDate = ref({}); // "YYYY-MM-DD" -> cards_viewed

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const monthLabel = computed(() =>
	new Date(year.value, month.value - 1, 1).toLocaleString(undefined, {
		month: "long",
		year: "numeric",
	})
);

const todayKey = todayDateKey();

const days = computed(() => {
	const daysInMonth = new Date(year.value, month.value, 0).getDate();
	const firstWeekday = new Date(year.value, month.value - 1, 1).getDay(); // 0=Sun
	const leadingBlanks = (firstWeekday + 6) % 7; // Monday-first offset

	const cells = Array.from({ length: leadingBlanks }, () => null);
	for (let d = 1; d <= daysInMonth; d++) {
		const key = dateKey(year.value, month.value, d);
		cells.push({
			day: d,
			key,
			cardsViewed: statsByDate.value[key] ?? 0,
			isToday: key === todayKey,
		});
	}
	return cells;
});

const isCurrentMonth = computed(
	() => year.value === today.getFullYear() && month.value === today.getMonth() + 1
);

async function loadStats() {
	statsByDate.value = await api.getMonthlyStats(year.value, month.value);
}

function prevMonth() {
	if (month.value === 1) {
		month.value = 12;
		year.value -= 1;
	} else {
		month.value -= 1;
	}
}

function nextMonth() {
	if (isCurrentMonth.value) return;
	if (month.value === 12) {
		month.value = 1;
		year.value += 1;
	} else {
		month.value += 1;
	}
}

watch([year, month], loadStats);
onMounted(loadStats);
</script>

<template>
	<div class="mx-auto max-w-md px-5 pb-24 pt-10">
		<h1 class="mb-1 text-3xl font-extrabold text-gray-900">📊 Stats</h1>
		<p class="mb-6 text-gray-500">Cards viewed each day.</p>

		<div class="mb-4 flex items-center justify-between">
			<button
				class="rounded-full p-2 text-xl text-gray-400 active:scale-95"
				aria-label="Previous month"
				data-test="stats-prev-month"
				@click="prevMonth"
			>
				‹
			</button>
			<div class="font-bold text-gray-900" data-test="stats-month-label">{{ monthLabel }}</div>
			<button
				class="rounded-full p-2 text-xl text-gray-400 active:scale-95 disabled:opacity-30"
				aria-label="Next month"
				data-test="stats-next-month"
				:disabled="isCurrentMonth"
				@click="nextMonth"
			>
				›
			</button>
		</div>

		<div class="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">
			<div v-for="label in weekdayLabels" :key="label">{{ label }}</div>
		</div>

		<div class="mt-1 grid grid-cols-7 gap-1">
			<div
				v-for="(cell, idx) in days"
				:key="cell?.key ?? `blank-${idx}`"
				class="flex aspect-square flex-col items-center justify-center rounded-xl"
				:class="cell ? (cell.isToday ? 'bg-grape-100' : 'bg-white shadow-sm') : ''"
				:data-test="cell?.isToday ? 'stats-today-cell' : 'stats-day-cell'"
			>
				<template v-if="cell">
					<span class="text-[0.65rem] text-gray-400">{{ cell.day }}</span>
					<span
						class="text-sm font-bold"
						:class="cell.cardsViewed > 0 ? 'text-grape-700' : 'text-gray-300'"
					>
						{{ cell.cardsViewed > 0 ? cell.cardsViewed : "–" }}
					</span>
				</template>
			</div>
		</div>
	</div>
</template>
