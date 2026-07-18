# Tripora Partner Dashboard

Hotel owner management dashboard for the Tripora platform. Allows hotel partners to manage their property profile, rooms, and bookings.

---

## Current Status

> **2026-07-18: rewritten to match the current `tripora-backend` API** (it had drifted onto an old, incompatible contract — wrong base URL, old Hotel/Room schema, a `packages`/day-out room model, bulk room creation, and a "pending → approve/reject" booking workflow none of which exist anymore). Everything below reflects the rewrite.

| Feature | Status |
|---|---|
| Partner login (token handoff from tripora-frontend) | Working — role check fixed to match backend's uppercase `HOTEL` role |
| Hotel registration (first-time setup, `POST /hotels/register`) | Working — full field set (was previously missing most required fields and tried to also create the user account, which the real endpoint never did) |
| Hotel profile management (Overview, Location, Guest Experience, Pricing & Booking, Amenities, Gallery) | Working against the real `Hotel` model. Map/coordinates picker and Activities/FAQs/Policies tabs removed — no matching backend field exists for any of them |
| Room management (add, edit, block/unblock, delete, images) | Working against the real `Room` model (`FAMILY`/`COUPLE`, `AC`/`NON_AC`, bed types array, floor, feature booleans, flat `price`). Bulk room-count creation and "day-out packages" removed — neither exists on the backend |
| Bookings management, Dashboard booking stats | **Sample/placeholder data** — there is no hotel-owner-scoped booking list or stats endpoint on the current backend, and no approve/reject concept (every booking is created already `status:'booked'`). Room-count stats on the Dashboard (total/available/family/couple/blocked) are real, pulled from `GET /rooms/hotel/:hotel_id` |
| Real-time notifications (new bookings via Socket.IO) | Client connects, but nothing on the current backend emits `new_booking` — inert until/unless the backend adds a Socket.IO emitter |
| Analytics | Placeholder — not yet implemented |
| Settings | Placeholder — not yet implemented |

---

## Auth Flow

This dashboard has no standalone login form. Authentication is handled by a token handoff from **tripora-frontend**:

1. Partner logs in at `http://localhost:5173/partner/join` (tripora-frontend's onboarding flow also creates the hotel itself before handoff — see that repo's README — so a partner reaching this dashboard normally already has a hotel)
2. tripora-frontend redirects to: `http://localhost:5175/login?token=<JWT>&user=<JSON>`
3. Dashboard stores credentials as `ceylonstay_token` and `ceylonstay_user` in localStorage
4. PrivateRoute validates token + `user.role` case-insensitively equals `"HOTEL"` (the backend's actual role value — this used to check the literal string `"partner"`, which never matched and bounced every handoff back to `/login`)
5. On logout, clears localStorage and redirects back to tripora-frontend login

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
│   └── axiosInstance.js        — Axios with auth interceptor + 401 handler
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
│   ├── Login.jsx               — Token reception page (no login form)
│   ├── Dashboard.jsx           — Real room-count stats + sample booking stats/recent bookings + quick actions
│   ├── HotelProfile.jsx        — Register-hotel form (no hotel yet) + 6-tab editor (Overview, Location, Guest Experience, Pricing & Booking, Amenities, Gallery)
│   ├── Rooms.jsx                — Room grid with search/filter, add/edit/block/delete
│   ├── Bookings.jsx            — Sample-data bookings table (see Current Status) with search/status filter, detail modal
│   ├── Analytics.jsx           — Placeholder
│   └── Settings.jsx            — Placeholder
├── constants/
│   ├── hotel.js                 — Enum label lists (HOTEL_TYPES, ROOM_TYPES, BED_TYPES, etc.) mirroring tripora-backend's ALLOWED_* arrays exactly, plus the COUNTRIES list
│   └── sampleBookings.js        — Placeholder booking data used by Bookings.jsx/Dashboard.jsx until a real partner-bookings endpoint exists
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
