# Ram Café — Campus Dining App

## Progress
- [x] Fix premature auth navigation before root layout mount by moving redirects into the tab layout
- [x] Update app flow from 5 student tabs to 4 tabs with onboarding for new students
- [x] Add shared in-memory stores for menu, ratings, and inventory so admin edits update student views live
- [x] Expand student experience with recommendations, meal countdowns, allergy warnings, ratings, and onboarding reruns
- [x] Expand Campus Hub with live menu management, weekly planning, student ratings, and interactive inventory alerts
- [x] Restructure admin into 5-tab portal, remove ratings from admin, student-initiated rating banner, expanded weekly items
- [x] Add comprehensive accessibility features: dark mode, high contrast, expanded dietary tags, menu item details, search, HTU domain

## Features

### Authentication
- [x] **Login** with school email (@htu.edu) validation and inline error messages
- [x] **Sign up** with name, email, password, confirm password — all validated inline
- [x] **Admin shortcut** — logging in with admin@htu.edu opens the admin dashboard
- [x] **Animated auth toggle** between login and sign up
- [x] **Simulated loading state** on auth CTA buttons
- [x] **Log out** from Settings (student) or Admin Settings tab (admin)
- [x] **HTU domain** — all auth screens use @htu.edu (Huston-Tillotson University)

### Shared Data Layer
- [x] **MenuStore** for live today menu and weekly planner updates
- [x] **RatingsStore** for post-meal ratings and per-period prompt tracking
- [x] **InventoryStore** for reactive alert creation and resolution
- [x] **AppSession dietary preference syncing** for live recommendation and allergy updates
- [x] **Dark mode color system** with light/dark/system appearance modes
- [x] **High contrast mode** support with darker brand color and increased border widths

### Student Portal (4 tabs)

**Onboarding Flow**
- [x] Welcome step personalized with first name
- [x] Dietary preference selection step with expanded 7-tag scrollable list
- [x] Animated completion step that saves onboarding profile to session
- [x] Retake preferences quiz from Settings with shortened rerun flow

**Today Tab**
- [x] Personalized time-based greeting with first name
- [x] **Search bar** for filtering menu items by name
- [x] Announcement banner card (pink accent) linking to announcements
- [x] Today's Hours card with live "Open Now" badge based on real device time
- [x] Meal period countdown card that updates every 60 seconds
- [x] Student-initiated rating banner (replaces auto-triggered sheet)
- [x] "Picked for You" recommendations based on student dietary preferences
- [x] Today's Menu with horizontal filter chips (All / Breakfast / Lunch / Dinner)
- [x] Menu item cards with emoji, calories, dietary tag pills, allergy warning banners, and **availability status**
- [x] **Menu item detail view** with ingredients, nutrition facts, allergen warnings, and last updated time
- [x] **VoiceOver accessibility labels** on all interactive elements

**Weekly Tab**
- [x] Horizontal day picker with animated selection
- [x] **Arrow buttons** (◀ ▶) flanking the day picker for motor accessibility
- [x] Three meal period cards for the selected day
- [x] Expanded weekly menu rows with emoji, description, calories, and dietary tags
- [x] Student weekly menu reacts to admin planner edits
- [x] **Emoji prefixes** on dietary tag pills for color-blind accessibility

**Announcements Tab**
- [x] List of dining service announcements with title, date, and content
- [x] **Dark mode support** with dynamic colors

**Settings Tab**
- [x] Profile section showing name, email, role, and dietary summary
- [x] **Display section** with appearance mode picker (System / Light / Dark)
- [x] **High Contrast toggle** for increased visual contrast
- [x] **Text Size slider** (Small to XL) for adjustable text sizing
- [x] **Language picker** (English / Spanish / French) with MVP placeholder alert
- [x] **Expanded dietary preference toggles** (7 tags: Vegetarian, Vegan, Gluten-Free, High Protein, Dairy-Free, Nut-Free, Halal)
- [x] Retake Preferences Quiz row
- [x] **Expanded notification toggles** (Announcements, New Menu Items, Daily Menu Reminder, Meal Period Alerts)
- [x] Red "Log Out" button

### Accessibility Features
- [x] **Dark mode** with full color palette for dark scheme
- [x] **High contrast mode** with darker brand color, eliminated low-contrast secondary text, thicker borders
- [x] **Adjustable text size** via in-app slider
- [x] **Color-blind friendly** dietary tag pills with emoji prefixes
- [x] **VoiceOver / screen reader** labels on all student-facing interactive elements
- [x] **Menu item detail view** with ingredients list and nutrition facts table
- [x] **Food availability status** (Available / Limited / Sold Out) on menu cards
- [x] **Search bar** for cognitive accessibility — quick menu item lookup
- [x] **Arrow navigation buttons** on weekly day picker for motor accessibility
- [x] **Expanded dietary tags** (7 options including Dairy-Free, Nut-Free, Halal)
- [x] **Expanded allergen conflict mapping** (dairyFree→dairy, nutFree→nuts)
- [x] **Language toggle** architecture (MVP: English only, placeholder for Spanish/French)
- [x] **Expanded notification controls** (Daily Menu Reminder, Meal Period Alerts)
- [x] **Admin availability picker** on menu item form (Available / Limited / Sold Out)

### Admin Portal (5 tabs)

**Dashboard Tab**
- [x] KPI grid (Meals Served, Active Students, Inventory, Weekly Spend)
- [x] Today's Meals section with status chips (Completed / Serving Now / Preparing)
- [x] Upcoming Plans with date, status, and meal title
- [x] Top Favorites with rank, order count, and percentage change badges (no stars)

**Menu Tab**
- [x] Today / This Week toggle for consolidated menu management
- [x] Today view: grouped live menu with add, edit (form), and swipe-to-delete
- [x] This Week view: horizontal day picker with per-period item management
- [x] Empty state for periods with no items
- [x] **Availability picker** (Available / Limited / Sold Out) on menu item form
- [x] **Expanded dietary tags** (7 options) on menu item and weekly item forms

**Planner Tab**
- [x] Dedicated weekly planner with day picker and per-period cards
- [x] Add and swipe-to-delete weekly items

**Inventory Tab**
- [x] Full-screen interactive inventory alerts list
- [x] Add Alert form via header button
- [x] Swipe-to-resolve with confirmation
- [x] "New" badge on manually added alerts
- [x] Empty state when all alerts resolved

**Admin Settings Tab**
- [x] Admin profile card with avatar, name, email, role badge
- [x] Preferences section (display name, campus — read-only MVP)
- [x] App section (About, version)
- [x] Log Out button (destructive style)

---

## Design

- **Warm cafeteria palette:** dusty cranberry brand color (#9B4040), off-white background (#F6F5F5), white cards, green accents for open states, pink accents for announcements
- **Dark mode palette:** dark backgrounds (#1C1C1E, #2C2C2E), light text (#F2F2F7), adjusted borders (#3A3A3C)
- **High contrast mode:** darker brand (#6B1C1C), eliminated secondary text distinction, thicker borders
- **Card style:** White background, 12pt rounded corners, subtle border, soft shadow — used consistently
- **Typography:** Bold large titles for greetings, semibold headlines, regular body, light captions
- **Filter chips:** Cranberry fill when selected, light gray when not
- **Dietary pills:** Cranberry-tinted capsules with emoji prefixes for color-blind accessibility
- **Status chips:** Green for serving/ready, yellow for preparing/in progress, gray for completed/not started
- **Availability indicators:** Green for available, orange for limited, red for sold out — always paired with text label
- **Tab bar** tinted with the cranberry brand color for both student and admin portals
- **Percentage badges:** Green capsule for positive trends, red capsule for negative trends
- **Native iOS feel** with clean spacing, soft motion, and proper safe areas

---

## Screens

1. **Auth Screen** — animated login/sign up swap, inline validation, loading CTA, HTU domain
2. **Onboarding Flow** — welcome, expanded dietary preferences (7 tags), completion, and rerun mode
3. **Today Screen** — greeting, search bar, announcement banner, hours card, countdown, rating banner, recommendations, filtered menu with detail view
4. **Weekly Menu Screen** — horizontal day picker with arrow buttons, expanded breakfast, lunch, and dinner cards
5. **Announcements Screen** — list of announcement cards
6. **Settings Screen** — display section (appearance, contrast, text size, language), expanded dietary toggles, notifications, retake quiz, log out
7. **Menu Item Detail Screen** — large emoji, nutrition facts, ingredients, allergen warnings, availability status
8. **Admin Dashboard** — Campus Hub summary: KPIs, meals, plans, favorites
9. **Admin Menu Screen** — consolidated today + weekly menu management with availability picker
10. **Admin Planner Screen** — dedicated weekly planning with per-period add and delete
11. **Admin Inventory Screen** — full-screen alert management with add and resolve
12. **Admin Settings Screen** — admin profile, preferences, app info, log out

---

## App Icon
- Warm cranberry/dusty red background with a subtle gradient
- White fork-and-knife symbol centered, simple and modern
- Rounded corners matching iOS app icon style
