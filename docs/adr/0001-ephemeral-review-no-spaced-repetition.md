# Ephemeral Review marks, no spaced repetition

Flashcard apps conventionally schedule Cards by recall difficulty (SM-2/Anki-style: an interval and ease factor per Card, adjusted after each review, determining when the Card resurfaces). We deliberately do not do this. A Review Session's Know It / Don't Know It marks only drive requeuing within that single pass — nothing is written back to the Card, and there is no per-Card review history, interval, or due date.

We chose this because the app targets simple, low-stakes review (e.g. cramming a Deck before a quiz) rather than long-term retention scheduling, and a scheduling algorithm adds meaningful data-model and UI surface (due dates, "cards due today," interval tuning) for a use case that doesn't need it.

This is a deliberate omission, not a gap: if long-term retention scheduling is wanted later, it requires new persistent state on Card (interval, ease factor, due date, last-reviewed) and a scheduling algorithm — a genuine redesign, not an incremental add.
