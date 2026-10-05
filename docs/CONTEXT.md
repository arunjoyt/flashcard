# Flashcard — Domain Language

A single-user flashcard app for reviewing self-authored front/back cards, organized into decks. No spaced-repetition scheduling — review is a simple flip-through.

---

## People

**User**: The single account that owns all Decks and Cards. No sharing, no roles, no multi-user permission model.
_Avoid_: Member, owner, learner

---

## Content

**Deck**: A named collection of Cards on one topic (e.g. "Spanish Verbs"). A Card belongs to exactly one Deck. Review happens one Deck at a time. Deleting a Deck cascades to delete all its Cards, after user confirmation.
_Avoid_: Set, collection, stack, pile

**All Cards**: A pinned pseudo-deck, always shown first in the Decks tab, that pools every Card from every real Deck into one shuffled Review Session. It is not a Deck record — it has no row in the database, can't be renamed or deleted, and has no Manage Deck screen, since a Card's home Deck doesn't change by appearing in it. This preserves "a Card belongs to exactly one Deck" exactly as written above.
_Avoid_: Random deck, mixed deck, combined deck

**Card**: A single front/back pair of plain text — a prompt and its answer. Belongs to exactly one Deck.
_Avoid_: Note, item, flashcard (redundant with app name), entry

**Bulk Add**: Adding many Cards to one Deck at once by pasting text — one line per Card, Front and Back separated by a comma, with a field wrapped in double quotes when it contains a comma itself. Every line is shown as a Card in a preview before saving; if any line is not exactly a non-empty Front and Back, nothing is added until it is fixed. A Bulk Add is saved whole or not at all — never partially. Bulk Add only adds Cards — it never edits or replaces Cards already in the Deck, and does not detect duplicates.
_Avoid_: Import, upload, CSV import

---

## Review

**Review** (mechanic): Simple flip-through, not spaced repetition. Cards are shown in some order; the user flips each one to reveal the answer. No scheduling algorithm, no per-card recall history driving when a card resurfaces.
_Avoid_: Study, practice, spaced repetition, SRS

**Review Session**: A flip-through of one Deck's Cards (or, for All Cards, every Card pooled together), presented in shuffled order. The user moves between Cards with Prev and Next, and flips the current Card with the Flip button (or by tapping the card). Moving to another Card shows its front again. There is no self-assessment, no requeuing and no completion screen — the user exits when done. Nothing from a Review Session is persisted — see [[ADR-0001]].
_Avoid_: Round, quiz, test, practice run

**Flip**: Revealing a Card's back (answer) during a Review Session, with the Flip button or by tapping the card itself.
_Avoid_: Reveal, turn over

---

## Navigation

Two bottom tabs: Decks, Settings. Decks is the default landing tab — opening the app lands there, no auto-started Review Session (see [[ADR-0003]], reverted). There is no per-Deck hub screen — Manage Deck is the only per-Deck screen, reached from the Decks tab.

**Decks (tab)**: The default landing tab — shows All Cards (pinned first) plus every real Deck, each with its Card count. This is where Review and the old Decks tab merged — reviewing, not managing, is the primary action. Tapping a Deck row (or All Cards) with at least one Card launches a Review Session immediately, no intermediate confirmation screen. Tapping a real Deck row with zero Cards opens Manage Deck instead, since there's nothing to review yet. A labelled "Manage" button on each real Deck's row (not shown on All Cards, which has nothing to manage) opens Manage Deck directly even when the Deck has Cards. Decks are created here.
_Avoid_: Home, dashboard, library, Deck List, Review tab (merged away)

**Manage Deck**: The per-Deck screen reached from the Decks tab (see above for which taps land here). Cards are shown as a two-column Front | Back grid and are added, edited, and deleted directly in it — one at a time by typing into the grid, or many at once via Bulk Add. Deleting the Deck itself also happens only here. All Cards has no Manage Deck screen — it isn't a Deck.
_Avoid_: Deck detail, deck settings, edit deck

**Settings (tab)**: Account-level actions not scoped to any one Deck — currently just Log out.
_Avoid_: Account, profile

