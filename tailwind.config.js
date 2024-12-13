/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				main: {
					light: "#F5F6FA",
					dark: "#1C1C1E",
					primary: "#C2185B",
					highlight: "#00A86B",
					warning: "#FFCA28",
					error: "#EF5350",
					blue: "#7c90bc",
					purple: "#580d71",
				},
				primary: {
					light: "#F3F4F6",
					dark: "#2C2C2E",
					nightshade: "#212121",
					blue: "#002B5B",
					golden: "#FFC107",
					amber: "#FFC857",
					emerald: "#127F5A",
					green: "#388E3C",
					platinum: "#D3D6DB",
					burgundy: "#6D435A",
					slate: "#495867",
				},
			},
			keyframes: {
				"fade-in": {
					"0%": { opacity: "0", transform: "scale(0.95)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
			},
			animation: {
				"fade-in": "fade-in 1s ease-out forwards",
			},
		},
	},
	plugins: [],
	darkMode: "class",
};
