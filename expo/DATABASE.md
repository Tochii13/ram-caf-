# Database approach for admin menu (foods) CRUD

For the **admin web app** (laptop-based), you’ll need a backend and database so admins can add, edit, and delete foods and manage the cafeteria menu. Here are practical options.

## Option 1: Supabase (recommended)

- **What:** Hosted Postgres + auth + realtime + REST/API.
- **Use for:** `menu_items` table (and optionally `weekly_menus`, `announcements`, `users_allergies` for admin visibility).
- **Admin flow:** Web dashboard (React/Next.js or plain HTML) with forms that call Supabase client: create/update/delete rows in `menu_items`. The student app (this repo) would fetch menu via Supabase client or a small API that reads from the same DB.
- **Schema idea:**  
  `menu_items(id, name, description, calories, emoji, dietary_tags[], meal_period, allergens[], ingredients, nutrition_json, availability, last_updated)`  
  and optionally `users` / `user_profiles` with `allergies` and `dietary_restrictions` so the admin can “view students’ allergies and dietary preferences” in one place.

## Option 2: Firebase Firestore

- **What:** NoSQL document store + auth.
- **Use for:** Collections like `menuItems`, `weeklyMenus`, `userProfiles` (with allergies/dietary for admin view).
- **Admin flow:** Web app uses Firebase SDK to add/update/delete documents. Student app reads the same collections (with security rules so students can’t write menu data).

## Option 3: Custom backend (Node/Express + Postgres or SQLite)

- **What:** Your own API (e.g. REST or tRPC) and database.
- **Use for:** Full control over schema, validation, and who can see allergies/dietary (e.g. admin-only endpoint that aggregates “students with allergies” for the cafeteria manager).
- **Admin flow:** Web dashboard calls your API; student app calls the same API (or a subset of endpoints). You can later point the Swift student app at the same API.

## Admin visibility for allergies and dietary preferences

- Store **allergies** and **dietary preferences** in the same backend you use for menu (e.g. `user_profiles` in Supabase or Firestore).
- Add an **admin-only** screen in the web dashboard that:
  - Lists students (or anonymized counts) and their allergies / dietary restrictions.
  - Lets the cafeteria manager see “how many students avoid X” or “which allergens to call out this week.”
- The student app already sends this data (e.g. on signup/onboarding and from Settings); the missing piece is persisting it in your backend and exposing it only to the admin web app.

## Summary

- Use **Supabase** or **Firebase** for a fast path to “admin CRUD for foods” and “admin view of allergies/dietary.”
- Use a **custom backend** if you need strict control or plan to reuse the same API for the Swift student app later.
- Ensure the student app’s profile/allergies updates are written to this backend (not only in-app state) so the admin dashboard stays in sync.
