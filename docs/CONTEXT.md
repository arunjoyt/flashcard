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

**Card**: A single front/back pair of plain text — a prompt and its answer. Belongs to exactly one Deck.
_Avoid_: Note, item, flashcard (redundant with app name), entry

---

## Review

**Review** (mechanic): Simple flip-through, not spaced repetition. Cards are shown in some order; the user flips each one to reveal the answer. No scheduling algorithm, no per-card recall history driving when a card resurfaces.
_Avoid_: Study, practice, spaced repetition, SRS

**Review Session**: A single pass through one Deck's Cards, presented in shuffled order. The user flips each Card and marks it Know It or Don't Know It. A Don't Know It Card is requeued to reappear later in the same session. The session ends once every Card has been marked Know It at least once, showing a completion screen (cards reviewed, how many needed multiple passes) before returning to the Review tab. Nothing from a Review Session is persisted to the Card afterward.
_Avoid_: Round, quiz, test, practice run

**Know It / Don't Know It**: The two self-assessment marks the user can give a Card during a Review Session. Ephemeral — they only affect requeuing within the current session and are not stored on the Card.
_Avoid_: Correct/incorrect, pass/fail, right/wrong

**Flip**: Revealing a Card's back (answer) during a Review Session by tapping the card itself. The Know It / Don't Know It marks only become available after a Flip.
_Avoid_: Reveal, turn over

---

## Navigation

Three bottom tabs: Decks, Review, Settings. There is no per-Deck hub screen — each tab's Deck list leads straight into that tab's one job, so the same Deck row means something different depending which tab it's tapped from.

**Decks (tab)**: The default landing tab — shows all Decks with their Card counts, nothing else. No last-reviewed dates or other stats are tracked, consistent with Review Sessions being ephemeral (see [[ADR-0001]]). Decks are created here. Tapping a Deck goes straight to Manage Deck for it.
_Avoid_: Home, dashboard, library, Deck List

**Review (tab)**: Shows all Decks with their Card counts. Tapping a Deck with at least one Card launches a Review Session for it immediately — there's no intermediate confirmation screen. A Deck with no Cards is shown but not tappable here.
_Avoid_: Study, practice

**Manage Deck**: The per-Deck screen reached from the Decks tab. Cards are added, edited, and deleted here, showing both front and back of each Card. Deleting the Deck itself also happens only here.
_Avoid_: Deck detail, deck settings, edit deck

**Settings (tab)**: Account-level actions not scoped to any one Deck — currently just Log out.
_Avoid_: Account, profile
