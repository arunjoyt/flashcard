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

**Review Session**: A single pass through one Deck's Cards, presented in shuffled order. The user flips each Card and marks it Know It or Don't Know It. A Don't Know It Card is requeued to reappear later in the same session. The session ends once every Card has been marked Know It at least once, showing a completion screen (cards reviewed, how many needed multiple passes) before returning to Deck Detail. Nothing from a Review Session is persisted to the Card afterward.
_Avoid_: Round, quiz, test, practice run

**Know It / Don't Know It**: The two self-assessment marks the user can give a Card during a Review Session. Ephemeral — they only affect requeuing within the current session and are not stored on the Card.
_Avoid_: Correct/incorrect, pass/fail, right/wrong

**Flip**: Revealing a Card's back (answer) during a Review Session by tapping the card itself. The Know It / Don't Know It marks only become available after a Flip.
_Avoid_: Reveal, turn over

---

## Navigation

**Deck List**: The home screen — shows all Decks with their Card counts, nothing else. No last-reviewed dates or other stats are tracked, consistent with Review Sessions being ephemeral (see [[ADR-0001]]). Decks are created and deleted here.
_Avoid_: Home, dashboard, library

**Deck Detail**: The per-Deck screen reached by tapping a Deck on the Deck List. Shows that Deck's Cards; Cards are added, edited, and deleted here. The 'Start Review' action, which launches a Review Session, lives here.
_Avoid_: Deck view, deck page, deck home
