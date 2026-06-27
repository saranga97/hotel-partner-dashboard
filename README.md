# Tripora Partner Dashboard

Hotel owner management dashboard for the Tripora platform. Allows hotel partners to manage their property profile, rooms, and bookings.

---

## Current Status

| Feature | Status |
|---|---|
| Partner login (token handoff from tripora-frontend) | Working |
| Hotel profile management (name, images, location, contact, amenities, FAQs, policies) | Working |
| Room management (add, edit, block/unblock, delete) | Working |
| Bookings management (view, filter by status/date, booking detail modal) | Working |
| Dashboard stats (total rooms, available, bookings, active) | Working |
| Real-time notifications (new bookings via Socket.IO) | Working |
| Analytics | Placeholder — not yet implemented |
| Settings | Placeholder — not yet implemented |
| Hotel registration (first-time setup) | Not yet implemented |

---

## Auth Flow

This dashboard has no standalone login form. Authentication is handled by a token handoff from **tripora-frontend**:

1. Partner logs in at `http://localhost:5173/partner/join`
2. tripora-frontend redirects to: `http://localhost:5175/login?token=<JWT>&user=<JSON>`
3. Dashboard stores credentials as `ceylonstay_token` and `ceylonstay_user` in localStorage
4. PrivateRoute validates token + `user.role === "partner"` on every route
5. On logout, clears localStorage and redirects back to tripora-frontend login

---

## Tech Stack

- **React 19** + Vite
- **React Router DOM 7**
- **Axios** — API calls via `src/api/axiosInstance.js` (auto-attaches Bearer token)
- **Socket.IO Client** — real-time booking notifications
- **Tailwind CSS v4** — with custom Tripora brand tokens
- **react-datepicker** — date filtering in bookings

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
│   ├── AddRoomModal.jsx        — Modal form to add a new room
│   ├── RoomDetailsModal.jsx    — View/edit/delete room details
│   ├── BookingDetailModal.jsx  — View full booking details
│   ├── LocationPicker.jsx      — Map picker for hotel coordinates
│   ├── PrivateRoute.jsx        — Auth guard (checks token + partner role)
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
│   ├── Dashboard.jsx           — Stats overview + recent bookings + quick actions
│   ├── HotelProfile.jsx        — 7-tab hotel editor
│   ├── Rooms.jsx               — Room grid with search/filter, add/edit/block/delete
│   ├── Bookings.jsx            — Bookings table with filters, pagination, detail modal
│   ├── Analytics.jsx           — Placeholder
│   └── Settings.jsx            — Placeholder
└── index.css                   — Tailwind v4 @theme tokens + global styles
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173
```

---

## Getting Started

```bash
npm install
npm run dev   # runs on http://localhost:5175
```

Backend must be running at `http://localhost:5000` with CORS allowing `http://localhost:5175`.
