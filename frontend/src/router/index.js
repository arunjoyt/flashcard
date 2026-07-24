import { createRouter, createWebHistory } from "vue-router";

const routes = [
	{ path: "/", redirect: "/review" },
	{
		path: "/decks",
		name: "Decks",
		component: () => import("@/pages/Decks.vue"),
		meta: { tab: true },
	},
	{
		path: "/decks/:deckName/manage",
		name: "ManageDeck",
		component: () => import("@/pages/ManageDeck.vue"),
		props: true,
	},
	{
		path: "/review",
		name: "Review",
		component: () => import("@/pages/Review.vue"),
		meta: { tab: true },
	},
	{
		path: "/review/:deckName",
		name: "ReviewSession",
		component: () => import("@/pages/ReviewSession.vue"),
		props: true,
	},
	{
		path: "/settings",
		name: "Settings",
		component: () => import("@/pages/Settings.vue"),
		meta: { tab: true },
	},
];

export function createAppRouter() {
	return createRouter({
		history: createWebHistory("/flashcard"),
		routes,
	});
}

const router = createAppRouter();

export default router;
