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

---

## Review

**Review** (mechanic): Simple flip-through, not spaced repetition. Cards are shown in some order; the user flips each one to reveal the answer. No scheduling algorithm, no per-card recall history driving when a card resurfaces.
_Avoid_: Study, practice, spaced repetition, SRS

**Review Session**: A single pass through one Deck's Cards (or, for All Cards, every Card pooled together), presented in shuffled order. The user flips each Card and marks it Know It or Don't Know It. A Don't Know It Card is requeued to reappear later in the same session. The session ends once every Card has been marked Know It at least once, showing a completion screen (cards reviewed, how many needed multiple passes) before returning to the Decks tab. Nothing from a Review Session is persisted to the Card afterward — see [[ADR-0001]] for why, and [[ADR-0002]] for how this coexists with Daily Stat.
_Avoid_: Round, quiz, test, practice run

**Know It / Don't Know It**: The two self-assessment marks the user can give a Card during a Review Session. Ephemeral — they only affect requeuing within the current session and are not stored on the Card.
_Avoid_: Correct/incorrect, pass/fail, right/wrong

**Flip**: Revealing a Card's back (answer) during a Review Session by tapping the card itself. The Know It / Don't Know It marks only become available after a Flip.
_Avoid_: Reveal, turn over

---

## Navigation

Three bottom tabs: Decks, Stats, Settings. Decks is the default landing tab — opening the app lands there, no auto-started Review Session (see [[ADR-0003]], reverted). There is no per-Deck hub screen — Manage Deck is the only per-Deck screen, reached from the Decks tab.

**Decks (tab)**: The default landing tab — shows All Cards (pinned first) plus every real Deck, each with its Card count. This is where Review and the old Decks tab merged — reviewing, not managing, is the primary action. Tapping a Deck row (or All Cards) with at least one Card launches a Review Session immediately, no intermediate confirmation screen. Tapping a real Deck row with zero Cards opens Manage Deck instead, since there's nothing to review yet. A small secondary control on each real Deck's row (not shown on All Cards, which has nothing to manage) opens Manage Deck directly even when the Deck has Cards. Decks are created here.
_Avoid_: Home, dashboard, library, Deck List, Review tab (merged away)

**Manage Deck**: The per-Deck screen reached from the Decks tab (see above for which taps land here). Cards are added, edited, and deleted here, showing both front and back of each Card. Deleting the Deck itself also happens only here. All Cards has no Manage Deck screen — it isn't a Deck.
_Avoid_: Deck detail, deck settings, edit deck

**Stats (tab)**: A calendar (month grid) of Daily Stats — one cell per day showing that day's Cards Viewed count.
_Avoid_: Analytics, dashboard, history, heatmap (rejected in favor of a numbered grid, see [[ADR-0002]])

**Settings (tab)**: Account-level actions not scoped to any one Deck — currently just Log out.
_Avoid_: Account, profile

---

## Usage Stats

**Daily Stat**: One aggregate record per calendar day per User, recording that day's Cards Viewed count. Not linked to any specific Deck or Card — see [[ADR-0002]] for why this is aggregate-only rather than a per-Card or per-Deck history.
_Avoid_: Analytics record, log entry, activity record

**Cards Viewed**: The count of distinct Cards flipped during a Review Session, credited to the day the session happened on. Each Card counts once per session even if shown multiple times (from Don't Know It requeuing). Credited even if the session is exited early rather than completed, since the review activity genuinely happened.
_Avoid_: Cards reviewed, cards studied, flips, sessions count (deliberately not tracked — nothing in the app surfaces it, see [[ADR-0002]])
