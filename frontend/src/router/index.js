import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{ path: "/", redirect: "/decks" },
	{
		path: "/decks",
		name: "Decks",
		component: () => import("@/pages/Decks.vue"),
	},
	{
		path: "/decks/:deckName/manage",
		name: "ManageDeck",
		component: () => import("@/pages/ManageDeck.vue"),
		props: true,
	},
	{
		path: "/review",
		name: "ReviewAllCards",
		component: () => import("@/pages/ReviewSession.vue"),
	},
	{
		path: "/review/:deckName",
		name: "ReviewSession",
		component: () => import("@/pages/ReviewSession.vue"),
		props: true,
	},
	// Old links such as /settings land on Decks instead of a blank page.
	{ path: "/:pathMatch(.*)*", redirect: "/decks" },
];

export function createAppRouter() {
	return createRouter({
		history: createWebHistory("/flashcard"),
		routes,
	});
}

const router = createAppRouter();

export default router;
