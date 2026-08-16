# Tripora Partner Dashboard

Hotel owner management dashboard for the Tripora platform. Allows hotel partners to manage their property profile, rooms, and bookings.

---

## Current Status

> **2026-07-18: rewritten to match the current `tripora-backend` API** (it had drifted onto an old, incompatible contract — wrong base URL, old Hotel/Room schema, a `packages`/day-out room model, bulk room creation, and a "pending → approve/reject" booking workflow none of which exist anymore). Everything below reflects the rewrite.
>
> **2026-08-02: backend made 3 room GET endpoints hotel-owner-only** (`GET /rooms/hotel/:hotel_id`, `/rooms/hotel/:hotel_id/ids`, `/rooms/:room_id` — 401 with no token, 403 if the token's owner doesn't own that hotel) and added a new public `GET /rooms/hotel/:hotel_id/available` for customer-facing browsing. This dashboard already sent its Bearer token on every request and only ever queries its own hotel's rooms via `hotel_id` from `GET /hotels/my-hotels`, so `Rooms.jsx`/`Dashboard.jsx` needed no endpoint change — but the global 401/403 handling in `axiosInstance.js` was fixed: previously both statuses forced a logout+redirect to `/login`, which is wrong for 403 (a valid session hitting a hotel it doesn't own isn't a session problem). Now only 401 clears the session and redirects; 403 is left for the calling page to catch and show an inline "You're not authorized to view rooms for this hotel." warning instead (`Rooms.jsx`, `Dashboard.jsx`).
>
> **2026-08-15: cut down to the pages that actually work, wired Bookings up to real data, added a native login.** `Settings.jsx` (pure mockup, nothing wired to any backend) is gone, along with its route and nav entry. `Bookings.jsx` and the booking stats/recent-bookings panel on the Dashboard now call the real `GET /bookings/hotel/:hotel_id` (hotel-owner-only) instead of `constants/sampleBookings.js`, which is deleted — that endpoint existed on the backend the whole time, the dashboard just never used it. `bookingController.js`'s populate for that endpoint was extended with `room.price` and `user.phoneNumber`/`profileImage` since the backend doesn't store a booking total — it's derived client-side from `room.price × nights` (`src/utils/bookings.js`, shared by `Bookings.jsx`, `Dashboard.jsx`, `BookingDetailModal.jsx`). `Analytics.jsx` is now an honest "coming soon" placeholder instead of a mockup with fabricated revenue/occupancy numbers. Nav is now Home → Rooms → Bookings → Analytics, with Hotel Profile and Logout grouped at the bottom. The dashboard also gained a **native login form** (see Auth Flow below) — the frontend token-handoff flow is untouched.
>
> **2026-08-16: fixed the room block/unblock toggle, which was completely broken.** Backend commit `8006161` (TRB-020) renamed the room field `isTemporaryBlocked` → `isOnHold` and the endpoints `PUT /rooms/:id/block`/`/unblock` → `/hold`/`/release` — confirmed live that every room now comes back with `isOnHold`, not the old field name, so the dashboard's toggle always rendered "available" (green) regardless of real state, and clicking it 404'd against the old endpoint paths. Renamed every reference across `Rooms.jsx`, `RoomDetailsModal.jsx`, and `Dashboard.jsx`'s "Available Rooms" stat. User-facing wording ("Blocked"/"Click to unblock") deliberately left as-is — only the field name and endpoint paths needed to change. Live-verified: toggled a room to blocked, confirmed the badge/stat update, then hard-reloaded the page and confirmed the blocked state persisted (proves the `PUT .../hold` call actually succeeded server-side, not just an optimistic UI update).

| Feature | Status |
|---|---|
| Partner login | **Two paths, both working:** (1) token handoff from tripora-frontend, unchanged; (2) native login form on `/login` (`POST /auth/login`) for partners going to the dashboard directly — see Auth Flow |
| Hotel registration (first-time setup, `POST /hotels/register`) | Working — full field set (was previously missing most required fields and tried to also create the user account, which the real endpoint never did) |
| Hotel profile management (Overview, Location, Guest Experience, Pricing & Booking, Amenities, Gallery) | Working against the real `Hotel` model. Map/coordinates picker and Activities/FAQs/Policies tabs removed — no matching backend field exists for any of them |
| Room management (add, edit, block/unblock, delete, images) | Working against the real `Room` model (`FAMILY`/`COUPLE`, `AC`/`NON_AC`, bed types array, floor, feature booleans, flat `price`). Bulk room-count creation and "day-out packages" removed — neither exists on the backend |
| Bookings management, Dashboard booking stats | Working — real data from `GET /bookings/hotel/:hotel_id` (hotel-owner-only). Total price per booking is derived client-side (`price × nights`) since the backend doesn't store one |
| Real-time notifications (new bookings via Socket.IO) | Client connects, but nothing on the current backend emits `new_booking` — inert until/unless the backend adds a Socket.IO emitter |
| Analytics | Honest "coming soon" placeholder — not yet implemented |
| Settings | Removed — was an unwired mockup with no real settings to manage |

---

## Auth Flow

Two ways to reach the dashboard, both landing in the same `AuthContext`/localStorage session:

**1. Token handoff from tripora-frontend** (unchanged):

1. Partner logs in at `http://localhost:5173/partner/join` (tripora-frontend's onboarding flow also creates the hotel itself before handoff — see that repo's README — so a partner reaching this dashboard normally already has a hotel)
2. tripora-frontend redirects to: `http://localhost:5175/login?token=<JWT>&user=<JSON>`
3. Dashboard stores credentials as `ceylonstay_token` and `ceylonstay_user` in localStorage and forwards to `/`

**2. Native login form** (new): visiting `/login` directly with no handoff query params and no existing session shows a real email/phone + password form that calls `POST /auth/login`. A successful login whose `user.role` isn't (case-insensitively) `HOTEL` is rejected client-side with an inline message — nothing is stored. `axiosInstance`'s global 401 handler is skipped specifically for `/auth/login` requests, so a wrong-password 401 shows an inline error instead of yanking the user back through `/login` mid-attempt.

In both cases: `PrivateRoute` validates token + `user.role` case-insensitively equals `"HOTEL"`. On logout, `AuthContext.logout()` clears localStorage and the user is sent to the dashboard's own `/login` (no more bouncing out to tripora-frontend).

---

## Tech Stack

- **React 19** + Vite
- **React Router DOM 7**
- **Axios** — API calls via `src/api/axiosInstance.js` (auto-attaches Bearer token)
- **Socket.IO Client** — real-time booking notifications (currently inert — see Current Status)
- **Tailwind CSS v4** — with custom Tripora brand tokens
- **react-datepicker** — date filtering in bookings

`leaflet`/`react-leaflet` were removed 2026-07-18 along with `LocationPicker.jsx` — the current `Hotel` model has no coordinates field.

---

## Brand Tokens (Tailwind v4 `@theme`)

| Token | Value | Usage |
|---|---|---|
| `primary` | `#D85A30` | Buttons, active nav, links |
| `primary-dark` | `#A83D18` | Hover states |
| `tint` | `#FFF5F1` | Light backgrounds, highlighted rows |
| `surface` | `#F7F7F7` | Page background, input backgrounds |
| `brand-border` | `#EBEBEB` | All borders |
| `muted` | `#717171` | Secondary text, icons |
| `font-sans` | Plus Jakarta Sans | Body text |
| `font-display` | DM Serif Display | Headings |

---

## Project Structure

```
src/
├── api/
│   └── axiosInstance.js        — Axios with auth interceptor; 401 → clear session + redirect to /login, 403 → left for the calling page to handle (not a session problem)
├── components/
│   ├── Layout.jsx              — Sidebar + Topbar shell
│   ├── Sidebar.jsx             — Navigation links, logout
│   ├── Topbar.jsx              — Search bar, notification bell, user avatar
│   ├── AddRoomModal.jsx        — Modal form to add a new room (creates the room, then optionally uploads images as a separate follow-up call)
│   ├── RoomDetailsModal.jsx    — View/edit/delete room details
│   ├── BookingDetailModal.jsx  — Read-only booking detail view (no approve/reject — see Current Status)
│   ├── PrivateRoute.jsx        — Auth guard (checks token + HOTEL role)
│   └── ui/
│       ├── Button.jsx          — primary / secondary / danger / success / icon variants
│       ├── Badge.jsx           — success / warning / danger / info / neutral / purple
│       ├── StatCard.jsx        — Dashboard stat tiles
│       ├── FormInput.jsx       — Labeled input with brand focus ring
│       ├── FormSelect.jsx      — Labeled select
│       ├── Modal.jsx           — Base modal wrapper
│       ├── Alert.jsx           — Success / error alert banners
│       ├── EmptyState.jsx      — Empty content placeholder
│       ├── LoadingSpinner.jsx  — Centered spinner
│       ├── PageHeader.jsx      — Page title + subtitle + action slot
│       └── ToggleChip.jsx      — Toggle chip for amenity/activity selection
├── context/
│   ├── AuthContext.jsx         — Auth state (reads from localStorage)
│   └── NotificationContext.jsx — Socket.IO connection + notification state
├── pages/
│   ├── Login.jsx               — Token-handoff auto-login (unchanged) + native email/phone+password login form for direct dashboard access
│   ├── Dashboard.jsx           — Real room-count stats + real booking stats/recent bookings (GET /bookings/hotel/:hotel_id) + quick actions
│   ├── HotelProfile.jsx        — Register-hotel form (no hotel yet) + 6-tab editor (Overview, Location, Guest Experience, Pricing & Booking, Amenities, Gallery)
│   ├── Rooms.jsx                — Room grid with search/filter, add/edit/block/delete
│   ├── Bookings.jsx            — Real bookings table (GET /bookings/hotel/:hotel_id) with search/status filter, detail modal
│   └── Analytics.jsx           — "Coming soon" placeholder (honest — no fabricated stats)
├── constants/
│   └── hotel.js                 — Enum label lists (HOTEL_TYPES, ROOM_TYPES, BED_TYPES, etc.) mirroring tripora-backend's ALLOWED_* arrays exactly, plus the COUNTRIES list
├── utils/
│   └── bookings.js              — Shared helpers (nightsBetween, bookingTotalPrice, formatDate, getRelativeTime) for real Booking documents, used by Dashboard/Bookings/BookingDetailModal
└── index.css                   — Tailwind v4 @theme tokens + global styles
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:5004/api/v1
VITE_SOCKET_URL=http://localhost:5004
VITE_APP_URL=http://localhost:5173
```

`VITE_API_URL` must include the `/v1` suffix — `tripora-backend`'s routes are all under `/api/v1`, not `/api`.

---

## Getting Started

```bash
npm install
npm run dev   # runs on http://localhost:5175
```

Backend must be running at `http://localhost:5004` (Node 20.x — see `tripora-backend/README.local.md`) with `CORS_ORIGINS` including `http://localhost:5175`.
