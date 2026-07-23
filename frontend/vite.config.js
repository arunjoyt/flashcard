import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// nginx serves flashcard/public/manifest/* with a long-lived Cache-Control,
// and filenames never change between releases — so a changed icon needs a
// changed URL to ever reach users. Appending a content hash as a query
// string does that automatically, with no manual version bump to remember.
function iconUrl(filename) {
	const filePath = path.resolve(__dirname, "../flashcard/public/manifest", filename);
	const hash = crypto
		.createHash("md5")
		.update(fs.readFileSync(filePath))
		.digest("hex")
		.slice(0, 8);
	return `/assets/flashcard/manifest/${filename}?v=${hash}`;
}

export default defineConfig(async () => {
	const { default: frappeui } = await import("frappe-ui/vite");

	const icon192 = iconUrl("manifest-icon-192.maskable.png");
	const icon512 = iconUrl("manifest-icon-512.maskable.png");
	const appleIcon180 = iconUrl("apple-icon-180.png");

	return {
		plugins: [
			frappeui({
				frontendRoute: "/flashcard",
				buildConfig: {
					indexHtmlPath: "../flashcard/www/flashcard.html",
				},
			}),
			vue(),
			{
				name: "cache-bust-apple-touch-icon",
				transformIndexHtml(html) {
					return html.replace(
						/(rel="apple-touch-icon"\s+href=")[^"]*(")/,
						`$1${appleIcon180}$2`
					);
				},
			},
			VitePWA({
				registerType: "autoUpdate",
				devOptions: {
					enabled: true,
				},
				manifest: {
					display: "standalone",
					name: "Flashcard",
					short_name: "Flashcard",
					id: "/flashcard",
					start_url: "/flashcard",
					scope: "/flashcard",
					description: "A simple, fun flashcard review app",
					theme_color: "#7C3AED",
					background_color: "#7C3AED",
					icons: [
						{
							src: icon192,
							sizes: "192x192",
							type: "image/png",
							purpose: "any",
						},
						{
							src: icon192,
							sizes: "192x192",
							type: "image/png",
							purpose: "maskable",
						},
						{
							src: icon512,
							sizes: "512x512",
							type: "image/png",
							purpose: "any",
						},
						{
							src: icon512,
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable",
						},
					],
				},
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
			},
		},
	};
});
