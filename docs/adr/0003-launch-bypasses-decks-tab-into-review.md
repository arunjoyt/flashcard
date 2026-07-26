# App launch bypasses the Decks tab, straight into a Review Session

**Reverted.** In practice the zero-tap auto-start felt too abrupt — exactly the risk this ADR called out below. `/` now redirects back to the Decks tab, which is the default landing tab again. Kept here for the reasoning trail; the mechanics described below no longer reflect current behavior.

---

Before this change, `/` redirected to the Review tab — already a list screen, one tap from reviewing. We're changing launch to skip tab navigation entirely: opening the app auto-starts a Review Session for All Cards immediately, with no list screen shown first. Exiting that session (or finishing it) lands on the Decks tab as normal; the tab is still there for picking a specific Deck, it's just no longer what launch shows first.

This is a step further than "reviewing is one tap away" — it makes reviewing the zero-tap default, at the cost of removing any choice at launch. A user who wants a specific Deck instead of All Cards must exit first. We accepted that cost because the stated goal was for going through cards to be "front and center," and a list screen — even a fast one — is still a screen to get past before review starts.

The one exception: if there isn't at least one Card anywhere yet, auto-starting is impossible, so launch falls back to the Decks tab's existing empty state ("No decks yet!").

If this turns out to feel too abrupt in practice (e.g. users wanting to choose a Deck most of the time), the reversal is cheap: redirect `/` back to the Decks tab. We're documenting the reasoning here specifically so that if this gets revisited, it's clear it was a deliberate call about how central review should be to the app, not an oversight.
