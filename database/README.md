# Later database migration

For the first web app, loading `data/generated/content.json` is the practical choice: static, fast, cheap, and easy to cache offline. A database becomes useful when you add accounts, progress that must sync across devices, an editor, or multiple content contributors.

When that time comes, start with SQLite. The schema mirrors the generated JSON and `data/generated/content.seed.sql` contains the current records.

With the SQLite CLI installed, create a local database with:

```powershell
Get-Content -Raw database/schema.sql, data/generated/content.seed.sql | sqlite3 german-reference.db
```

For a hosted app later, this same table maps directly to PostgreSQL or Supabase. Keep content IDs stable; user progress should live in a separate table keyed by `user_id` and `content_item_id`.
