import frappeUIPreset from "frappe-ui/tailwind";

export default {
	presets: [frappeUIPreset],
	content: [
		"./index.html",
		"./src/**/*.{vue,js}",
		"./node_modules/frappe-ui/src/**/*.{vue,js,ts,jsx,tsx}",
		"./node_modules/frappe-ui/frappe/**/*.{vue,js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Baloo 2", "ui-sans-serif", "system-ui", "sans-serif"],
			},
			colors: {
				grape: {
					500: "#7C3AED",
					600: "#6D28D9",
					700: "#5B21B6",
				},
				bubblegum: {
					400: "#F472B6",
					500: "#EC4899",
					600: "#DB2777",
				},
				sunshine: {
					400: "#FACC15",
					500: "#EAB308",
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
