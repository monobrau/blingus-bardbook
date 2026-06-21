# Content curation (test/revamp)

Curated with `scripts/curate-data.mjs` and `scripts/curate-parody.py` on branch `test/revamp`.

## Spells & Bardic (song parodies)

- **Removed** lore/D&D one-liners disguised as parodies (`Forgotten Realms Lore`, `D&D Lore`, rust-monster jokes, etc.)
- **Scored** remaining lines for song-title fidelity, hook echo, and rhyme quality
- **Kept** top picks per category: **5** spell lines, **3** adult spell lines, **6** bardic lines
- **Deduped** duplicate song picks within each category

Re-run after editing source data:

```bash
python3 scripts/curate-parody.py
# or, if Node is installed:
node scripts/curate-data.mjs
```

## Previously trimmed (other files)
- **actions** — 5 picks per situation; deduped; limited Tarrasque/rust-monster obsession to one per category
- **mockery** — max 12 per category; removed duplicate burns and repetitive innuendo patterns
- **generators** — insults deduped (35); introductions (8); compliments (25); battle cries kept full set
- **criticals / skill checks** — 5 (criticals) or 4 (skill checks) per subcategory

Re-run curation after editing source data: `node scripts/curate-data.mjs`
