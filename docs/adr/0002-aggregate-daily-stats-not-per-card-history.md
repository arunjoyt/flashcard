# Aggregate daily stats, not per-Card or per-Deck history

[[ADR-0001]] deliberately kept Review ephemeral: no per-Card interval, ease factor, or due date, and no last-reviewed date on Deck. We're now adding Daily Stat — one record per calendar day per User, holding a Cards Viewed count — to back a Stats tab calendar. This looks like a reversal of ADR-0001 but isn't: Daily Stat is not linked to any Deck or Card. It answers "how much did I review today," not "when is this Card due" or "when did I last touch this Deck." ADR-0001's actual target — scheduling algorithms and per-Card recall history — is untouched.

Two design choices within this feature, both made together:

**Aggregate counter, not a per-view event log.** We store one number per day rather than a row per Card-view (timestamp + Card + Deck). An event log would let us answer richer questions later ("most-reviewed Deck this week") without a data-model change, at the cost of far more writes and storage. Nothing asked for that yet — the whole feature is "how many Cards did I view today," which an aggregate answers directly. If per-Deck or per-Card breakdowns are wanted later, that's a genuine new feature requiring an event log or a Deck-scoped stat, not a natural extension of this one.

**Distinct Cards viewed, not every flip.** A Card requeued after Don't Know It and shown again later in the same session counts once, not twice. This makes the number describe review *coverage* ("how much of what I looked at today"), not raw interaction volume. A day where one 10-card Deck took 3 passes to clear still reads as 10, not 25+.

**Credited even on early exit.** A Review Session that's abandoned via Exit still credits whatever distinct Cards were flipped before exiting — the review activity happened regardless of whether the session reached its completion screen. Only sessions with zero Cards flipped (e.g. opened and immediately exited) contribute nothing.

We considered but rejected tracking a sessions-count alongside Cards Viewed — every use case in scope only needed the Cards Viewed number, and a field nothing reads is a field not worth storing. If a session-level metric becomes genuinely needed, add it then.

We also considered a GitHub-style heatmap for the Stats tab instead of a numbered month grid. Rejected because the ask was specifically "number of cards viewed" as the main focus — a heatmap requires a tap or hover to learn the actual number, while a numbered grid shows it directly.
