# The Kramer Family Shas

A private family site: each person (Zaidy & Bubby down to the great-grandchildren) takes a
whole masechta or just a few blatt (Gemara) or perakim (Mishnayos), marks them learned,
and the family tracks its way to a siyum.

## How sign-in works
1. **Family code** (`FAMILY_CODE`): typed once per phone or computer.
2. **Pick your name, enter your 4-digit PIN.** The first person to open the site sets themselves up as admin.
3. Admins add people, reset PINs and remove people on the Admin page.

## Running on Render (free)
- Free web service, using the Blueprint in `render.yaml`.
- Database: a free Neon Postgres project (`DATABASE_URL`, direct connection string). Tables live in
  the `kramer_shas` schema.
- Env vars: `DATABASE_URL`, `FAMILY_CODE`, `SESSION_SECRET` (auto-generated), optional `FAMILY_NAME`.

## Local
```
DATABASE_URL=postgres://... FAMILY_CODE=TEST npm start
```
