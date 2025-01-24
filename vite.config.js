import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // Use named import instead of default

export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: {
				name: "ExpenseControl",
				short_name: "ExCo",
				description: "Manage your expenses easily with ExCo.",
				start_url: "/",
				display: "standalone",
				background_color: "#F3F4F6",
				theme_color: "#1C1C1E",
				icons: [
					{
						src: "/exco_bg_white.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "/exco_bg_white.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
			workbox: {
				globPatterns: ["**/*.{js,css,html,png,jpg}"],
				swDest: "dist/service-worker.js",
			},
		}),
	],
	resolve: {
		alias: {
			"@assets": "/src/assets",
			"@components": "/src/components",
			"@hooks": "/src/hooks",
			"@context": "/src/context",
			"@pages": "/src/pages",
			"@layout": "/src/layout",
			"@views": "/src/views",
			"@services": "/src/services",
			"@utils": "/src/utils",
			"@features": "/src/features",
		},
	},
});
