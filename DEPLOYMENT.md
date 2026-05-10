# GiveLedger — Deployment Notes

## Vercel Setup

\*\*Root Directory must be set to `giveledger` (not the repo root).

In Vercel project settings → General → Root Directory must be set to `giveledger`

## Required Environment Variables

Set all four in Vercel → Project → Settings → Environment Variables:

| Variable                        | Description                                                            |
| ------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (`https://xxxx.supabase.co`)                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key                                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key (server-side only, never exposed to browser) |
| `ANTHROPIC_API_KEY`             | Anthropic API key for Claude Vision photo analysis                     |

## Supabase Table

Run this in Supabase SQL Editor before first deploy:

```sql
create table donations (
  id uuid default gen_random_uuid() primary key,
  org_id text not null default 'demo-org-food-for-all',
  type text not null check (type in ('financial', 'physical')),
  amount numeric,
  currency text default 'USD',
  source text,
  donor_name text,
  notes text,
  photo_url text,
  category text,
  subcategory text,
  quantity numeric,
  unit text,
  condition text,
  estimated_value_usd numeric,
  ai_analysis jsonb,
  human_confirmed boolean default true,
  donated_at timestamptz default now(),
  created_at timestamptz default now()
);
```

## Mobile Camera

iOS Safari requires HTTPS for `getUserMedia`. Camera scanning only works on the deployed Vercel URL, not on `localhost`.

## Demo Flow

1. Go to `/log/physical`
2. Tap **Live Camera Scan** or upload a photo
3. Claude analyzes the image and fills the form
4. Confirm and submit
5. Dashboard at `/dashboard` shows updated stats, chart, and recent activity
6. History at `/history` shows the new row
