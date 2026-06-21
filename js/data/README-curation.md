# Content curation (test/revamp)

Curated with `scripts/curate-data.mjs` on branch `test/revamp`.

## Preserved unchanged
- `spells-data.js` — all parody lyrics (`t` field) and adult spells
- `bardic-data.js` — all song-based bardic inspiration

## Trimmed
- **actions** — 5 picks per situation; deduped; limited Tarrasque/rust-monster obsession to one per category
- **mockery** — max 12 per category; removed duplicate burns and repetitive innuendo patterns
- **generators** — insults deduped (35); introductions (8); compliments (25); battle cries kept full set
- **criticals / skill checks** — 5 (criticals) or 4 (skill checks) per subcategory

Re-run curation after editing source data: `node scripts/curate-data.mjs`
