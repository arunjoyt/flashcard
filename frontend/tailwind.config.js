import { createRequire } from "module";
import path from "path";
import frappeUIPreset from "frappe-ui/tailwind";

// bench hoists frappe-ui to the app-level node_modules (apps/flashcard/node_modules),
// not frontend/node_modules, so a relative "./node_modules/frappe-ui" glob never
// matches anything and frappe-ui's own component classes silently never generate.
// Resolve the package's real install location instead of assuming where it lives.
const require = createRequire(import.meta.url);
const frappeUIRoot = path.dirname(path.dirname(require.resolve("frappe-ui/tailwind")));

export default {
	presets: [frappeUIPreset],
	content: [
		"./index.html",
		"./src/**/*.{vue,js}",
		`${frappeUIRoot}/src/**/*.{vue,js,ts,jsx,tsx}`,
		`${frappeUIRoot}/frappe/**/*.{vue,js,ts,jsx,tsx}`,
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Baloo 2", "ui-sans-serif", "system-ui", "sans-serif"],
			},
			colors: {
				grape: {
					// 100/900 fill in the scale so classes like border-grape-100 and
					// shadow-grape-900/10 (used throughout for card borders/shadow tint)
					// actually resolve — Tailwind silently drops utilities for shades
					// that aren't defined, so these were previously invisible.
					100: "#DDD6FE",
					500: "#7C3AED",
					600: "#6D28D9",
					700: "#5B21B6",
					900: "#4C1D95",
				},
				bubblegum: {
					50: "#FDF2F8",
					400: "#F472B6",
					500: "#EC4899",
					600: "#DB2777",
				},
				sunshine: {
					400: "#FACC15",
					500: "#EAB308",
				},
				// frappe-ui's Button theme="blue" reads these tokens directly (see
				// node_modules/frappe-ui/src/components/Button/Button.vue); overriding
				// them to grape keeps theme="blue" buttons matching the app's brand color.
				blue: {
					200: "#DDD6FE",
					300: "#C4B5FD",
					500: "#7C3AED",
					700: "#5B21B6",
				},
				"surface-blue": {
					2: "#EDE9FE",
					3: "#6D28D9",
				},
				"ink-blue": {
					3: "#7C3AED",
					link: "#7C3AED",
				},
				"outline-blue": {
					1: "#DDD6FE",
				},
			},
			keyframes: {
				"pop-in": {
					"0%": { opacity: "0", transform: "scale(0.9) translateY(8px)" },
					"100%": { opacity: "1", transform: "scale(1) translateY(0)" },
				},
				"bounce-in": {
					"0%": { opacity: "0", transform: "scale(0.6)" },
					"60%": { opacity: "1", transform: "scale(1.05)" },
					"100%": { transform: "scale(1)" },
				},
			},
			animation: {
				"pop-in": "pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
				"bounce-in": "bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
			},
		},
	},
	plugins: [],
};
