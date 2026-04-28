# Client Plan — `client.md`

Design doc for the frontend. Pair read: [assets.md](assets.md) for terminology, `server.md` for the API it talks to.

---

## 1. Goals

Build a React + TypeScript SPA that lets an authenticated user:

1. Upload videos (with upload-progress UI).
2. Watch processing status stream in real time.
3. Play the video back with **seamless, time-synced real-time switching** between the original audio and a server-transformed audio — **without the server producing a new video**.
4. Manage a library of their uploaded videos.
5. Manage their own account (signup, login, profile edit, delete account).

No cross-user leakage. Tokens never logged. Auth guards everything except the public marketing pages.

---

## 2. Tech stack

**Runtime model:** pure **SPA** — no SSR, no SSG, no RSC. Client fetches everything from the FastAPI backend over HTTPS. The whole app ships as static assets (HTML + JS + CSS) behind a CDN/static host, with a fallback route to `index.html` for deep links.

| Concern          | Choice                                                                                                 | Why                                                                                                                                                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | **React 19 + TypeScript**                                                                              | Latest features (Actions, `useActionState`, `useOptimistic`, Suspense improvements, `use` for promises, ref-as-prop)                                                                                                                                                       |
| Build            | **Vite**                                                                                               | Fast HMR, first-class TS, ES modules in dev                                                                                                                                                                                                                                |
| Routing          | **react-router v6 (data routers)**                                                                     | Standard, loaders for auth guards, per-module route files composed into the root router                                                                                                                                                                                    |
| Server state     | **TanStack Query v5**                                                                                  | Request dedupe, cache, retries, stale-while-revalidate for the assets list / profile / etc.                                                                                                                                                                                |
| Client state     | **Redux Toolkit** (RTK) + **React-Redux**                                                              | Required by the architecture. Slices per module, typed hooks, listener middleware for cross-slice reactions. TanStack Query owns server state — Redux owns pure client state (auth session, player UI state, toasts). **Not** using RTK Query (TanStack covers that role). |
| HTTP             | **axios** (with interceptors)                                                                          | Needed for 401-driven refresh-token interceptor                                                                                                                                                                                                                            |
| SSE              | **native `EventSource`** wrapped in a hook                                                             | Works with JWT via `?access_token=...` or custom polyfill; revisit if cookie auth is chosen server-side                                                                                                                                                                    |
| Forms            | **react-hook-form + zod**                                                                              | Validation co-located with types                                                                                                                                                                                                                                           |
| Styling          | **Tailwind CSS** + **shadcn/ui** primitives, scoped per-module CSS file alongside the module component | Fast to build a polished UI; `*.component.css` keeps module styling local                                                                                                                                                                                                  |
| Media            | `<video>`, `<audio>`, **Web Audio API**                                                                | Built in, no external player lib needed                                                                                                                                                                                                                                    |
| i18n             | **i18next** + **react-i18next**                                                                        | Browser language detection, fallback to English, translations colocated in `public/locales/`                                                                                                                                                                               |
| Waveform (bonus) | Custom canvas renderer consuming server-provided peaks JSON                                            | Avoids decoding the whole audio client-side                                                                                                                                                                                                                                |
| Testing          | **Vitest** + **React Testing Library**; **Playwright** for E2E                                         | Fast unit tests; E2E for the upload→play happy path                                                                                                                                                                                                                        |

### Redux vs TanStack Query — who owns what?

| Data                                                      | Owner                           | Why                                                            |
| --------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------- |
| Logged-in user + access token + auth status               | Redux (`auth` slice)            | Pure client state; sync with interceptors and guards           |
| Current asset list / single asset / profile               | **TanStack Query**              | Server state — caching, refetch, invalidation                  |
| Upload in progress (file, percent, xhr handle)            | Redux (`assets` slice)          | Not a server value; shared across components                   |
| Player toggles: active track, volume, playback rate       | Redux (`player` slice)          | Cross-component UI state                                       |
| Player hot values: `currentTime`, `duration`, `isPlaying` | Component refs + local state    | Updates 60×/s — would thrash Redux and rerender the whole tree |
| Theme, toasts, modals                                     | Redux (`ui` slice in `shared/`) | Cross-cutting UI state                                         |

---

## 3. Folder structure

Three top-level buckets: **`core/`** (app infrastructure), **`shared/`** (reusable, feature-agnostic building blocks), **`modules/`** (feature modules). Every feature module has the same shape; `core/` and `shared/` have the same sub-folders **minus** the three `module.*` files, since they don't own routes and aren't mounted as a top-level feature component.

### 3.1 Feature module shape (the contract)

Every module under `modules/<name>/` follows this structure exactly:

```
modules/<name>/
  components/                  # module-scoped components (not reused outside)
  services/                    # api clients, sse subscribers, module-specific side effects
  pages/                       # route-level components
  hooks/                       # module-specific hooks
  contexts/                    # react contexts scoped to this module
  stores/                      # redux slices + selectors for this module
  models/                      # TS types / domain models (no zod)
  schemas/                     # zod schemas (forms + API boundary validation)
  constants/                   # enums, endpoints, limits
  <name>.component.tsx         # module root: layout + <Outlet /> for nested routes
  <name>.component.css         # module-scoped styles
  <name>.routes.ts             # RouteObject[] exported for composition in the root router
```

### 3.2 Core and shared shape

```
core/ | shared/
  components/
  services/
  hooks/
  contexts/
  stores/
  models/
  schemas/       # (present only if cross-cutting zod schemas exist; may stay empty)
  constants/
  utils/
```

### 3.3 Full tree

File bases are **kebab-case**; suffixes encode the file's role (`.component.tsx`, `.page.tsx`, `.hook.ts`, `.service.ts`, `.slice.ts`, `.model.ts`, `.schema.ts`, `.constants.ts`, `.context.tsx`). See §17 for the full convention.

```
src/
  main.tsx                                    # bootstraps React + Redux Provider + QueryClientProvider + RouterProvider
  i18n/
    index.ts                                  # merges all module translations; exports resources, Translation, SupportedLanguage
  environments/
    .env.example
    .env.development
    .env.staging
    .env.production
  vite-env.d.ts

  app/
    app.component.tsx                         # root (providers, router, error boundary)

    core/
    components/
      app-layout.component.tsx
      app-layout.component.css
      protected-route.component.tsx
      error-boundary.component.tsx
      suspense-fallback.component.tsx
    services/
      axios.service.ts                        # instance + interceptors
      sse.service.ts                          # EventSource helper
      api-error.service.ts                    # error → typed ApiError
      query-client.service.ts                 # TanStack QueryClient factory
      env.service.ts                          # parsed + validated env singleton (import { env })
    hooks/
      auth-bootstrap.hook.ts                  # useAuthBootstrap — restore session on mount
      sse.hook.ts                             # useSSE (generic)
    contexts/
      root-providers.context.tsx              # composes Redux + Query + Theme
    stores/
      store.ts                                # configureStore, typed RootState/AppDispatch
      root-reducer.ts
      listener-middleware.ts
      hooks.ts                                # useAppDispatch / useAppSelector
    models/
      api-error.model.ts
      paginated.model.ts
    constants/
      base-routes.constants.ts
      roles.constants.ts

    shared/
    components/
      button.component.tsx
      input.component.tsx
      dialog.component.tsx
      toast.component.tsx
      dropzone.component.tsx
      spinner.component.tsx
      avatar.component.tsx
      skeleton.component.tsx
    services/
      format.service.ts                       # bytes, duration formatters
      logger.service.ts
    pages/                                    # (empty)
    hooks/
      debounce.hook.ts                        # useDebounce
      event-listener.hook.ts                  # useEventListener
      local-storage.hook.ts                   # useLocalStorage
      media-query.hook.ts                     # useMediaQuery
    contexts/
      theme.context.tsx
      toast.context.tsx
    stores/
      ui.slice.ts                             # theme, toasts, modals
    models/
      form-helpers.model.ts
    constants/
      breakpoints.constants.ts
      design-tokens.constants.ts
      regex.constants.ts

    modules/
    auth/
      components/
        auth-card.component.tsx
        password-strength-meter.component.tsx
      services/
        auth-api.service.ts                   # login/signup/refresh/logout/forgot/reset
      pages/
        login.page.tsx
        login.page.css
        signup.page.tsx
        signup.page.css
        forgot-password.page.tsx              # stretch
        reset-password.page.tsx               # stretch
      hooks/
        login.hook.ts                         # useLogin
        signup.hook.ts                        # useSignup
        logout.hook.ts                        # useLogout
        require-guest.hook.ts                 # useRequireGuest — redirect authed users away from /login
      contexts/                               # (empty)
      stores/
        auth.slice.ts                         # { user, accessToken, status }
        auth.selectors.ts                     # memoized selectors
      models/
        user.model.ts
        auth-tokens.model.ts
      schemas/
        login.schema.ts                       # zod — login form
        signup.schema.ts                      # zod — signup form
        forgot-password.schema.ts             # zod — stretch
        reset-password.schema.ts              # zod — stretch
        user.schema.ts                        # zod — API boundary (parses /auth/me)
      constants/
        auth-endpoints.constants.ts
        auth-error-codes.constants.ts
      auth.component.tsx
      auth.component.css
      auth.routes.ts

    user/
      components/
        update-details-form.component.tsx
        delete-account-dialog.component.tsx
        avatar-upload.component.tsx           # stretch
      services/
        user-api.service.ts                   # getMe, updateMe, deleteMe, uploadAvatar
      pages/
        profile.page.tsx
        profile.page.css
      hooks/
        current-user.hook.ts                  # useCurrentUser
        update-me.hook.ts                     # useUpdateMe
        delete-me.hook.ts                     # useDeleteMe
      contexts/
      stores/                                 # (empty — user mirror lives in auth.slice)
      models/                                 # (empty unless we add domain types)
      schemas/
        update-profile.schema.ts              # zod — profile form
        change-password.schema.ts             # zod — stretch
      constants/
        user-endpoints.constants.ts
      user.component.tsx
      user.component.css
      user.routes.ts

    assets/
      components/
        asset-table.component.tsx
        asset-table.component.css
        asset-table-row.component.tsx
        upload-dropzone.component.tsx
        upload-metadata-form.component.tsx    # title + description form
        upload-progress-bar.component.tsx
        processing-indicator.component.tsx    # consumes SSE state
        player.component.tsx                  # muted <video> + two <audio> + Web Audio shell
        player.component.css
        transport-bar.component.tsx           # play/pause/seek/volume/rate
        track-switch.component.tsx            # Original | Modified
        waveform.component.tsx                # stretch (canvas)
      services/
        assets-api.service.ts                 # upload, list, get, delete
        assets-events.service.ts              # SSE subscriber for processing status
      pages/
        asset-list.page.tsx
        asset-list.page.css
        asset-upload.page.tsx
        asset-upload.page.css
        asset-view.page.tsx
        asset-view.page.css
      hooks/
        asset-list.hook.ts                    # useAssets (TanStack list)
        asset-detail.hook.ts                  # useAsset (TanStack detail)
        upload-asset.hook.ts                  # useUploadAsset (mutation + XHR progress)
        delete-asset.hook.ts                  # useDeleteAsset
        asset-events.hook.ts                  # useAssetEvents (SSE lifecycle)
        audio-context.hook.ts                 # useAudioContext — singleton per AssetViewPage
        media-sync.hook.ts                    # useMediaSync — master-video → follower-audio loop
        crossfade.hook.ts                     # useCrossfade — GainNode ramp helper
      contexts/
        audio-graph.context.tsx               # shares AudioContext + gains across player subtree
      stores/
        assets.slice.ts                       # uploads in-progress, currentAssetId
        player.slice.ts                       # activeTrack, volume, playbackRate, isMuted
      models/
        asset.model.ts                        # id, title, description, originalFilename, originalExtension, sizeBytes, durationSec, state, thumbnailUrl, originalAudioUrl, modifiedAudioUrl, peaksUrl, createdAt, updatedAt
        processing-state.model.ts             # union
        peaks.model.ts                        # peaks JSON shape
      schemas/
        upload-asset.schema.ts                # zod — upload metadata form (title, description, file)
        asset.schema.ts                       # zod — API boundary (parses /assets/:id)
        peaks.schema.ts                       # zod — API boundary (parses peaks JSON)
      constants/
        assets-endpoints.constants.ts
        supported-mime.constants.ts           # video/mp4, video/webm, video/quicktime
        limits.constants.ts                   # MAX_UPLOAD_BYTES
        player.constants.ts                   # CROSSFADE_SEC, SYNC_THRESHOLD_SEC, HARD_SEEK_SEC
      assets.component.tsx
      assets.component.css
      assets.routes.ts

    landing/                                  # stretch
      components/
        header.component.tsx                  # login button / profile avatar
        hero.component.tsx
        feature-grid.component.tsx
        footer.component.tsx
      services/
      pages/
        landing.page.tsx
        landing.page.css
      hooks/
      contexts/
      stores/
      models/
      constants/
      landing.component.tsx
      landing.component.css
      landing.routes.ts
```

### 3.4 Route composition & code-splitting

`core/stores/` builds the Redux store; `core/components/AppLayout.tsx` is the shell. The root router in `App.tsx` composes per-module routes with **lazy loading** for code-splitting:

```ts
// App.tsx (sketch)
import { lazy, Suspense } from 'react';
import { authRoutes } from "@/app/modules/auth/auth.routes";
import { userRoutes } from "@/app/modules/user/user.routes";
import { assetsRoutes } from "@/app/modules/assets/assets.routes";

// Lazy load module components for code-splitting
const LandingModule = lazy(() => import('@/app/modules/landing/landing.component').then(m => ({ default: m.Landing })));
const AssetsModule = lazy(() => import('@/app/modules/assets/assets.component').then(m => ({ default: m.Assets })));
const UserModule = lazy(() => import('@/app/modules/user/user.component').then(m => ({ default: m.User })));

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<SuspenseFallback />}>
            <LandingModule />
          </Suspense>
        ),
        children: landingRoutes, // stretch
      },
      ...authRoutes,
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <UserModule />
              </Suspense>
            ),
            children: userRoutes,
          },
          {
            element: (
              <Suspense fallback={<SuspenseFallback />}>
                <AssetsModule />
              </Suspense>
            ),
            children: assetsRoutes,
          },
        ],
      },
    ],
  },
]);
```

Each `*.routes.ts` exports a `RouteObject[]`. A module's `<name>.component.tsx` is the layout wrapper for that module's routes (rendered via `<Outlet />`), so nested styling and providers are self-contained.

**Code-splitting strategy:**

- Auth routes (`/login`, `/signup`) load synchronously — needed immediately, small bundle.
- Module components (landing, assets, user) are **lazy-loaded** via `React.lazy()` — only bundle and render when user navigates to them.
- Use `<Suspense fallback={<SuspenseFallback />}>` to show a spinner while the chunk loads.
- This keeps the initial JS bundle small; large modules load on-demand.

---

## 4. Routing

Each module owns its routes in `module.routes.ts` and the root router composes them (see 3.4). Full map:

| Path               | Component          | Module              | Guard                                            |
| ------------------ | ------------------ | ------------------- | ------------------------------------------------ |
| `/`                | LandingPage        | `landing` (stretch) | public                                           |
| `/login`           | LoginPage          | `auth`              | public — redirect to `/assets` if already authed |
| `/signup`          | SignupPage         | `auth`              | public                                           |
| `/forgot-password` | ForgotPasswordPage | `auth` (stretch)    | public                                           |
| `/reset-password`  | ResetPasswordPage  | `auth` (stretch)    | public                                           |
| `/assets`          | AssetListPage      | `assets`            | **protected**                                    |
| `/assets/upload`   | AssetUploadPage    | `assets`            | **protected**                                    |
| `/assets/:id`      | AssetViewPage      | `assets`            | **protected**                                    |
| `/profile`         | ProfilePage        | `user`              | **protected**                                    |
| `*`                | NotFoundPage       | `core`              | —                                                |

`<ProtectedRoute>` in `core/components/` runs on mount:

- Reads `auth.status` from the Redux store.
- If `unauthed` → redirect to `/login?next=<current-path>`.
- If `refreshing` → render a small suspense fallback until it resolves.
- On initial app mount, `useAuthBootstrap` in `core/hooks/` calls `/auth/refresh` once to restore the session from the httpOnly refresh cookie before the first protected render.

---

## 5. Auth module

### 5.1 Token strategy

- **Access token** (JWT, ~15 min TTL) — held in memory only, in the Redux `auth` slice (`modules/auth/stores/authSlice.ts`). Never in `localStorage` — XSS-stealable. Cleared on page reload; restored by calling `/auth/refresh` on app bootstrap.
- **Refresh token** (~7–30 day TTL) — **httpOnly, Secure, SameSite=Lax cookie** set by the server. JS can't read it; server reads it on `/auth/refresh`.
- On app boot, call `/auth/refresh` → if it succeeds, the server sets a new access token in the response body and (optionally) rotates the refresh cookie. This is how we get "stay logged in across refreshes" without exposing the refresh token to JS.

### 5.2 Axios interceptors

Lives in `core/services/axios.service.ts`. Reads/writes the Redux store via the typed `store` reference imported from `core/stores/store.ts`.

- **Request:** attach `Authorization: Bearer <access>` if present in the `auth` slice.
- **Response:** on `401` for a non-`/auth/*` request:
    1. Set `auth.status = "refreshing"` and pause all other in-flight requests (queue).
    2. Call `/auth/refresh` (cookie-based).
    3. On success: dispatch `setTokens`, retry the original request and flush the queue.
    4. On failure: dispatch `logout`, redirect to `/login?next=<current>`.

### 5.3 Pages

| Page                      | Fields                                                          | Actions                               |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| Signup                    | email, password, confirmPassword, displayName                   | `POST /auth/signup` → auto-login      |
| Login                     | email, password                                                 | `POST /auth/login`                    |
| Forgot password (stretch) | email                                                           | `POST /auth/forgot-password`          |
| Reset password (stretch)  | token (from URL), newPassword                                   | `POST /auth/reset-password`           |
| Profile                   | displayName, email, avatar (stretch), password change (stretch) | `PATCH /users/me`, `DELETE /users/me` |

### 5.4 Delete account

- Two-step confirm dialog (type email to confirm).
- On success: clear tokens, revoke refresh cookie, redirect to `/login` (or `/` if landing page exists).
- Server hard-deletes user row and cascades to their videos/audio/peaks.

---

## 6. Upload flow

Two-step page at `/assets/upload`:

### Step 1 — pick a file

- `UploadDropzone` supports drag-and-drop **or** click-to-browse. Accept `video/*` with client-side extension allow-list (`.mp4`, `.mov`, `.webm`).
- Client-side size cap (configurable, e.g. 500 MB) — human-readable error before starting the upload.
- On file selected: advance to Step 2 (don't start upload yet — we want metadata first).

### Step 2 — metadata form (`UploadMetadataForm`)

| Field           | Required | Default                                                                             | Notes                              |
| --------------- | -------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| **Title**       | yes      | Filename with extension stripped (e.g. `Summer Trip 2025.mp4` → `Summer Trip 2025`) | Max ~100 chars, validated with zod |
| **Description** | no       | empty                                                                               | Multi-line, max ~1000 chars        |

- User can edit the title before kicking off the upload. Empty title falls back to the default (validated; can't submit blank).
- **Submit** button says "Upload". Back button returns to Step 1 (file still selected).
- On submit: POST to the server as `multipart/form-data` with fields `title`, `description`, and `file`.
- **Progress bar** driven by `XMLHttpRequest.upload.onprogress` (fetch has no upload progress event). Wrap XHR in a promise-returning helper.
- While uploading: show filename, title, speed, remaining time, cancel button.
- On success: server returns `{ assetId, status: "queued" }`. Navigate to `/assets/:id` — the view page will show a processing indicator until ready.

### Failure handling

- Network drop → allow retry; **do not** silently resume (resumable uploads are out of scope; noted as future improvement).
- 413 (payload too large) → surface server limit.
- 401 mid-upload → interceptor refreshes + we retry from scratch (again, resumable is future work).

---

## 7. Processing status (SSE)

- Subscribe to `GET /assets/:id/events` via `EventSource`.
- Events the server emits:
    - `status` — `{ state: "queued" | "extracting" | "transforming" | "finalizing" | "ready" | "failed", progress: 0..1, message?: string }`
    - `ready` — `{ originalAudioUrl, modifiedAudioUrl, peaksUrl? }` (final payload; UI can start loading the player)
    - `error` — `{ code, message }` (terminal)
- `useAssetEvents(assetId)` hook (in `modules/assets/hooks/`):
    - Opens `EventSource`, parses events, writes to TanStack Query cache (`["asset", id]`) so the UI rerenders.
    - Closes the stream on `ready` / `error` / unmount.
    - Reconnects on transient `error` event from the browser itself (up to N retries with backoff).
- **EventSource auth gotcha:** native `EventSource` can't set headers, so either (a) use a small polyfill that does (e.g. `event-source-polyfill`), or (b) put the short-lived access token in the query string and require HTTPS. Will confirm in `server.md`.

The `ProcessingIndicator` shows the current `state` + a progress bar (`progress`). Once `ready` fires, render the `Player`.

---

## 8. The player — the hard part

> **Constraint recap.** Server never rebuilds a video; the video file the user uploaded _has its own audio track_. We play that video muted and drive sound through **two separate audio files**, switchable in real time without re-buffering or drift.

### 8.1 Approaches considered

| #     | Approach                                                                                                      | Pros                                                                                                                              | Cons                                                                                                          | Verdict                          |
| ----- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| **1** | **Muted `<video>` + two `<audio>` elements, both routed into Web Audio `GainNode`s, crossfade between gains** | Streams any length, low memory, seamless switch via gain ramp, works with range-requested audio, simple waveform via server peaks | Two decoders → possible tiny drift → needs a correction loop; needs one user gesture to unlock `AudioContext` | **✅ Chosen**                    |
| 2     | Fully decode both audios into `AudioBuffer`s and play via `AudioBufferSourceNode`s                            | Sample-accurate switching (shared `AudioContext.currentTime` clock), trivial waveform rendering from samples                      | Entire audio loaded to RAM → bad for long videos; manual re-schedule on every seek; harder code               | Rejected (memory + complexity)   |
| 3     | Re-request the server with `?track=original\|modified`, swap the `<audio>.src` on toggle                      | Simplest code                                                                                                                     | Requires a full re-buffer on every switch; violates "no additional buffering"                                 | Rejected (fails the requirement) |
| 4     | Use MSE (`MediaSource` + `SourceBuffer`) to multiplex                                                         | Full control                                                                                                                      | Massive implementation cost for no benefit here                                                               | Rejected                         |

We go with **Approach 1**. Keeping this comparison so anyone reviewing the code knows _why_ — and so if a requirement later changes (e.g., "must be sample-accurate"), we can pivot deliberately.

### 8.2 Topology

```
<video muted autoplay=false>                 ← master clock, video frames only
   └── audio track muted (not used)

<audio id="orig" src="/audio/original.m4a"   preload="auto" crossorigin="anonymous">
<audio id="mod"  src="/audio/modified.m4a"   preload="auto" crossorigin="anonymous">

AudioContext
   orig ─► MediaElementSourceNode ─► GainNode A ─┐
                                                 ├─► AudioContext.destination
   mod  ─► MediaElementSourceNode ─► GainNode B ─┘

initial state:  GainA = 1, GainB = 0
switch:         linearRampToValueAtTime(0, now + Δ)   on current
                linearRampToValueAtTime(1, now + Δ)   on target
                Δ ≈ 0.03–0.08 s  (short crossfade, click-free)
```

### 8.3 Sync loop

The video is the **master clock**. Both `<audio>` elements follow it.

```ts
// useMediaSync.ts (sketch)
const SYNC_THRESHOLD = 0.05; // 50 ms drift budget
const SEEK_DEBOUNCE = 0.15; // only hard-seek if off by more than this

function tick() {
	const t = video.currentTime;
	for (const a of [orig, mod]) {
		const delta = a.currentTime - t;
		if (Math.abs(delta) > SEEK_DEBOUNCE) {
			a.currentTime = t; // hard re-align (after a seek)
		} else if (Math.abs(delta) > SYNC_THRESHOLD) {
			a.playbackRate = delta > 0 ? 0.98 : 1.02; // gentle pull toward master
		} else {
			a.playbackRate = 1; // in sync
		}
	}
	rafId = requestAnimationFrame(tick);
}
```

Event handlers:

| Video event               | Action                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| `play`                    | `orig.play(); mod.play();` (both always playing — only gains differ)                         |
| `pause`                   | `orig.pause(); mod.pause();`                                                                 |
| `seeking`                 | pause both audios                                                                            |
| `seeked`                  | `orig.currentTime = mod.currentTime = video.currentTime;` then resume if `!video.paused`     |
| `ratechange`              | `orig.playbackRate = mod.playbackRate = video.playbackRate;` (then sync loop will fine-tune) |
| `ended`                   | stop sync loop                                                                               |
| `waiting`                 | pause audios (video is buffering — don't let audio run ahead)                                |
| `canplay` (after waiting) | resume audios in sync                                                                        |

Why **both** audios play all the time: swapping gain is instantaneous and doesn't cause a decoder to spin up. If only the active one were playing, the moment the user toggled we'd have to start the other from zero and wait for it to reach `currentTime` — exactly the jitter the requirement forbids.

### 8.4 Crossfade (`useCrossfade`)

```ts
function crossfadeTo(target: 'orig' | 'mod') {
	const now = audioCtx.currentTime;
	const fade = 0.05;
	const [up, down] = target === 'orig' ? [gainA, gainB] : [gainB, gainA];
	down.gain.cancelScheduledValues(now);
	up.gain.cancelScheduledValues(now);
	down.gain.setValueAtTime(down.gain.value, now);
	up.gain.setValueAtTime(up.gain.value, now);
	down.gain.linearRampToValueAtTime(0, now + fade);
	up.gain.linearRampToValueAtTime(1, now + fade);
}
```

`cancelScheduledValues` matters if the user toggles twice quickly.

### 8.5 Browser unlock + edge cases

- **`AudioContext` suspended** on page load until a user gesture. Wrap the first Play button click with `await audioCtx.resume()` and only _then_ start playback.
- **Autoplay policy** — never call `.play()` outside a user gesture; require an explicit "Play" the first time.
- **CORS** — `<audio>` tags with `crossorigin="anonymous"` are required to route through Web Audio without "tainting" the element. The server must send proper CORS headers on audio URLs.
- **Range requests** — the server must honor HTTP `Range` so seeking doesn't re-download the whole file.
- **Codec compatibility** — stick to AAC/MP4 or Opus/WebM containers. Document supported browsers.
- **iOS Safari quirks** — often only one `<audio>` element can play at once in the background; foreground + user-gesture-unlocked contexts work. Tested manually during development.

### 8.6 Transport UI

- Play/Pause button (space bar).
- Current time / duration readout.
- Seek bar (native `<input type="range">` styled). Dragging → `video.currentTime = value`; the `seeking`/`seeked` handlers above cover the audios.
- Volume slider → `audioCtx.destination`-attached master gain (not per-track — per-track gains are for crossfade).
- Track switch — segmented toggle: `Original | Modified`. Hotkey `T` to toggle.
- Playback rate menu (0.5×, 1×, 1.25×, 1.5×, 2×) — optional polish.

---

## 9. Asset list (assets module)

- Route: `/assets`. `useAssets()` calls `GET /assets` (user-scoped on the server via JWT) via TanStack Query.
- Rendered as a **table** (`AssetTable`), one row per asset (`AssetTableRow`).

### Columns

| #   | Column    | Content                                | Notes                                                                                                   |
| --- | --------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | Thumbnail | Small image (e.g. 64×36)               | Server-generated on processing; placeholder icon while pending                                          |
| 2   | Name      | `asset.title`                          | Click anywhere in the row → navigate to `/assets/:id`. Fallback to `originalFilename` if title missing. |
| 3   | Format    | Extension badge (`MP4`, `MOV`, `WEBM`) | From `asset.originalExtension`, uppercased                                                              |
| 4   | Created   | `asset.createdAt`                      | Locale-formatted (`Apr 21, 2026 · 10:34`), tooltip with ISO timestamp                                   |
| 5   | Updated   | `asset.updatedAt`                      | Same format; "—" if equal to created                                                                    |
| 6   | State     | Processing state badge                 | `queued / processing / ready / failed`                                                                  |
| 7   | Actions   | `⋯` menu: View, Delete                 | Confirm dialog on Delete                                                                                |

### Behaviors

- Header cells are click-to-sort (Name, Created, Updated, Format) — sort state in URL (`?sort=createdAt&dir=desc`) so it survives refresh/back nav. Default: `createdAt desc`.
- Search input above the table filters by title (client-side over the TanStack cache for small lists; promote to server query if scale demands).
- Row hover shows subtle highlight + cursor pointer.
- Delete → `DELETE /assets/:id` with confirm dialog, then `queryClient.invalidateQueries({ queryKey: ["assets"] })`.
- Empty state: "No videos yet — [Upload]" → `/assets/upload`.
- Responsive: on narrow viewports, collapse Updated + Format columns into a secondary line under the Name.

Switching between assets is just route navigation — the `Player` component unmounts, tearing down its `AudioContext` nodes in cleanup; the next mount builds a fresh graph for the new asset.

---

## 10. Waveform (bonus)

- Server pre-computes peaks during processing: one JSON file per audio (original, modified), e.g. `{ "version": 2, "channels": 1, "sample_rate": 48000, "samples_per_pixel": 1024, "bits": 8, "length": 12345, "data": [ ... ] }` (audiowaveform's format is a fine spec to borrow).
- Client fetches the JSON once (cached by React Query), renders bars on a `<canvas>` scaled to the transport bar's width.
- Click on the canvas → seek video to the corresponding time.
- Two overlaid waveforms (dim the inactive track) or only the active track — pick the clearer visualization; try both.

Doing peaks server-side means the client never has to decode the audio just to draw it, which keeps us aligned with Approach 1.

---

## 11. Error handling & UX polish

- Toast-based global error surface (never `alert()`).
- 401 → silent refresh; only boot to login if refresh fails.
- Processing failures: surface server's `error.message`, offer a "Retry upload" link.
- All async buttons show a spinner state; disabled during in-flight.
- Skeleton loaders for library grid and profile.
- Keyboard shortcuts documented in a `?` help overlay.
- Dark mode (system-preference, toggleable).
- All forms use `aria-*` labels; transport bar is keyboard-navigable.

### 11.1 Mobile-first responsive design

**The design reference files (`design/`) are desktop-first. We build mobile-first and improve on them as we go.**

Principles:

- **Default styles target mobile** (≥ 360 px). Desktop/tablet styles live behind `min-width` media queries — never `max-width` (no desktop-first overrides).
- **Breakpoints** (raw values — CSS custom properties don't work inside `@media` rules):
  | Token | Value | Context |
  |---|---|---|
  | `--bp-xs` | `400px` | phablet / large phone |
  | `--bp-sm` | `640px` | small tablet / landscape phone |
  | `--bp-md` | `768px` | tablet portrait |
  | `--bp-lg` | `1024px` | tablet landscape / small desktop |
  | `--bp-xl` | `1280px` | desktop |
- **`--gutter`** is responsive: `16px` on mobile, `24px` at `≥ 640px`. All shell padding uses `var(--gutter)` so pages automatically scale.
- **App shell (header / footer / main):**
    - Header: nav links hidden on mobile (< 640 px); GitHub icon hidden on very small screens; gutter collapses.
    - Brand name hidden on tiny screens (< 400 px) — icon only.
    - Footer: wraps on narrow viewports.
    - Main: full-width on mobile; `.container` utility caps at `1180 px` with responsive horizontal padding.
- **Per-page layout:** pages use `.container` (or `.container-narrow` / `.container-wide`) for max-width + padding. Inner grid/flex layouts default to single-column on mobile and add columns at `≥ 640 px` or `≥ 1024 px`.
- **Touch targets:** all interactive elements are at least `44 × 44 px` (tap target, not visible size).
- **Images / media:** use `max-width: 100%` by default; no fixed pixel widths on content images.
- **Tables (asset list):** collapse non-critical columns on narrow viewports rather than horizontal-scroll.
- **Typography scale:** large hero headings (`h1`) scale down on mobile (`clamp()`).
- **No horizontal overflow** on any route — test by setting viewport to 360 px and verifying `overflow-x` is clean.

---

## 12. Testing strategy

- **Unit (Vitest + RTL):**
    - `sync.ts` pure helpers (drift calc).
    - `useMediaSync` via fake `<video>` + `<audio>` and fake timers.
    - Auth store reducers.
    - Form validation schemas.
- **Integration:** player mounted with mocked audio URLs; assert the crossfade scheduler makes the expected `setValueAtTime` calls (mock `AudioContext`).
- **E2E (Playwright):** signup → upload fixture video → poll until `ready` → play → toggle track → seek → toggle → ensure no errors / console warnings.
- **Manual test matrix:** Chrome, Safari (desktop + iOS), Firefox. iOS Safari is the likely offender — test first.

---

## 13. Security considerations (client)

- Access token **in memory only**, never `localStorage` / `sessionStorage`.
- Refresh token **never visible to JS** (httpOnly cookie from server).
- `axios` instance uses `withCredentials: true` only for `/auth/refresh` (and logout) so the cookie isn't leaked to unrelated requests.
- Strict CSP header at the host (inline script nonces; no `unsafe-inline`).
- Validate media URLs from the server are same-origin or a trusted CDN before assigning to `src`.
- Never render server-supplied HTML. React's default escaping handles this unless someone reaches for `dangerouslySetInnerHTML`; lint-rule against it.
- Logout → clear store + `POST /auth/logout` → server invalidates refresh token + clears the cookie.

---

## 14. Miscellaneous / stretch (do after the core is solid)

1. **Landing module** (`modules/landing/`) mounted at `/` — product explainer with a top header (`Header.tsx`). Unauthenticated header: "Login" / "Sign up" buttons. Authenticated header: profile button (avatar + dropdown → Assets, Profile, Logout). Pulls `auth` slice to decide which version to render.
2. **Profile image / avatar upload** — in the user module. Client-side crop; upload to `POST /users/me/avatar` (multipart). Stored on `authSlice.user.avatarUrl`; surfaced in the landing header and profile page.
3. **Forgot password** flow — in the auth module. `Forgot password?` link on the login page → `/forgot-password` (email form) → server emails a reset link → `/reset-password?token=...` → new-password form → redirect to `/login`.
4. **Testing** — add unit tests (Vitest + React Testing Library) and E2E tests via **Playwright**. Unit tests cover the sync math, player hooks (with mocked media elements), auth store, and zod schemas. E2E covers the happy path: signup → upload → poll until `ready` → play → toggle track → seek → toggle. CI job runs both. See §12 for the detailed strategy.
5. Resumable uploads (`tus`) for large files.
6. Offline-aware asset list (cache last-seen list for viewing thumbnails).
7. **Additional languages** (after core is solid) — add translations for Spanish, French, etc. following the modular structure in §17.9. Language switcher component in the UI for manual override.
8. Accessibility audit (axe) pass.

---

## 15. Open questions / risks

- **EventSource + JWT** — confirm with server whether we pass the token via query string or use a polyfill with custom headers. Decide before implementing SSE.
- **iOS Safari** dual-audio behavior — mitigation plan if we hit platform limits: fall back to only the active `<audio>` playing, accepting a small buffer hit on switch (documented degradation).
- **Clock drift** over long videos — if 50 ms threshold proves audible, tighten to 20 ms and use `playbackRate` trimming more aggressively.
- **File size limit** — align client cap with server cap; display the same number in both places (single source of truth in env config).

---

## 16. Deliverables from the client side

- Vite-built SPA served from `/`.
- README snippet: dev (`npm run dev`), build (`npm run build`), env variables (`VITE_API_URL`, `VITE_MAX_UPLOAD_MB`).
- Playwright test suite runnable via `npm run test:e2e`.
- No secrets in the bundle.

---

## 17. File & code conventions

### 17.0 Project configuration

**Monorepo-level** (root):

- `.prettierrc` — single formatting config for entire monorepo (4-tab indents, 120 char width, single quotes, semicolons, trailing commas es5).
- `.editorconfig` — shared across all projects (LF line endings, charset utf-8).

**App-level** (`apps/client/`):

- `.eslintrc.json` — React + TypeScript rules (extends `eslint:recommended`, `plugin:react/recommended`, `plugin:@typescript-eslint/recommended`).
- `tsconfig.app.json` — path aliases (`@/*` → `src/*`), React 19 + JSX, strict mode.
- `project.json` — Nx targets (build, serve, lint, test, e2e).

### 17.0.1 Persistent user preferences

User preferences (language, theme) are **persisted to localStorage** and restored on app boot:

| Preference          | Key            | Default                        | Storage      | State           |
| ------------------- | -------------- | ------------------------------ | ------------ | --------------- |
| **Language (i18n)** | `app:language` | Browser language or `en`       | localStorage | Redux + i18next |
| **Theme**           | `app:theme`    | System preference (light/dark) | localStorage | Redux context   |

**Behavior:**

1. App loads → check localStorage for saved values.
2. If found: restore to Redux/context immediately (before first render).
3. User changes preference → dispatch Redux action + sync to localStorage.
4. On next app load → restore from localStorage, not system default.
5. User never sees a flash of wrong theme/language.

**Implementation:**

- `useAuthBootstrap` hook (in `core/hooks/`) also restores i18n + theme on app mount.
- Redux slices (`ui.slice.ts`) listen to preference changes and write to localStorage via listener middleware.
- Use `useLocalStorage` hook (in `shared/hooks/`) for convenient read/write to storage.

### 17.1 File naming — dotted suffix + kebab-case

Every non-trivial file's role is encoded in a dotted suffix; the base is kebab-case. This mirrors Angular-style conventions and keeps greps/imports self-describing.

| Kind                                       | Suffix                                  | Extension               | Example filename                                                   | Symbol name                          |
| ------------------------------------------ | --------------------------------------- | ----------------------- | ------------------------------------------------------------------ | ------------------------------------ |
| Component                                  | `.component`                            | `.tsx`                  | `asset-table.component.tsx`                                        | `AssetTable`                         |
| Component styles                           | `.component`                            | `.css`                  | `asset-table.component.css`                                        | —                                    |
| Page (route-level component)               | `.page`                                 | `.tsx`                  | `asset-list.page.tsx`                                              | `AssetListPage`                      |
| Hook                                       | `.hook`                                 | `.ts`                   | `media-sync.hook.ts`                                               | `useMediaSync`                       |
| Service (API client, side-effect helper)   | `.service`                              | `.ts`                   | `assets-api.service.ts`                                            | `assetsApi` or `AssetsApiService`    |
| Redux slice                                | `.slice`                                | `.ts`                   | `auth.slice.ts`                                                    | `authSlice`, `authReducer`           |
| Redux selectors (when separate from slice) | `.selectors`                            | `.ts`                   | `auth.selectors.ts`                                                | `selectCurrentUser`, …               |
| TS type / domain model                     | `.model`                                | `.ts`                   | `asset.model.ts`                                                   | `type Asset`, `type ProcessingState` |
| Zod schema                                 | `.schema`                               | `.ts`                   | `login.schema.ts`                                                  | `loginSchema`, `type LoginInput`     |
| Constants                                  | `.constants`                            | `.ts`                   | `assets-endpoints.constants.ts`                                    | `UPPER_SNAKE` exports                |
| React context                              | `.context`                              | `.tsx`                  | `theme.context.tsx`                                                | `ThemeProvider`, `useTheme`          |
| Guard / HOC                                | `.guard`                                | `.tsx`                  | `protected-route.guard.tsx`                                        | `ProtectedRoute`                     |
| Utility (pure functions)                   | `.util`                                 | `.ts`                   | `format-duration.util.ts`                                          | `formatDuration`                     |
| Test (colocated)                           | `.test` or `.spec`                      | `.ts(x)`                | `asset-table.component.test.tsx`                                   | —                                    |
| Module entry                               | `.component` / `.component` / `.routes` | `.tsx` / `.css` / `.ts` | `assets.component.tsx`, `assets.component.css`, `assets.routes.ts` | —                                    |

**Rules of thumb:**

- `.tsx` only when the file contains JSX; `.ts` otherwise. Hooks that return JSX (rare) are still `.hook.ts` unless they render — then promote to a component.
- **One thing per file.** One component, one hook, one slice, one schema. Group only when variants are trivially related (a tiny sub-row for a table).
- **Named exports only**, with one exception: `*.page.tsx` and `*.component.tsx` may use `default export` to pair with `React.lazy()` for route-level code-splitting. Still export a named version too.
- **No barrel `index.ts`** inside folders. Each module's consumers import from the specific file (`modules/auth/stores/auth.slice.ts`). Tree-shaking stays clean.

### 17.2 Symbol naming

- **Components / Pages / Contexts / Classes:** `PascalCase`.
- **Hooks / variables / functions:** `camelCase`, hooks start with `use`.
- **Redux slice actions:** past-tense event names (`loggedIn`, `tokenRefreshed`, `uploadFailed`) — not command names (`login`, `refreshToken`).
- **Selectors:** `selectX` (`selectCurrentUser`, `selectActiveTrack`).
- **Zod schemas:** `xxxSchema` + inferred type `XxxInput` / `XxxPayload`.
- **Constants:** `SCREAMING_SNAKE` inside the file, regardless of filename.

### 17.3 Zod schemas

Schemas live in the module's **dedicated `schemas/` folder** (sibling to `models/`) with a `.schema.ts` suffix. Keeping them separate from `models/` makes intent explicit:

- `models/` — static TypeScript types / domain models (no runtime code, no zod).
- `schemas/` — zod schemas (runtime validation + form resolvers). **Inferred types live in the schema file** (`export type XxxInput = z.infer<typeof xxxSchema>`) — never duplicated in `models/`.

Schemas serve **two** jobs:

1. **Forms** — paired with `react-hook-form` via `@hookform/resolvers/zod`. The form's input type comes from `z.infer`.
2. **API boundary validation** — parse server responses/request bodies at the edge in services (recommended for any endpoint where the payload is non-trivial).

#### Example — login form

```ts
// modules/auth/schemas/login.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
	email: z.string().trim().email('Please enter a valid email'),
	password: z.string().min(8, 'At least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

```tsx
// modules/auth/pages/login.page.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '../schemas/login.schema';

export default function LoginPage() {
	const form = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' },
	});

	const onSubmit = form.handleSubmit((values) => login(values));

	return <form onSubmit={onSubmit}>{/* … */}</form>;
}
```

#### Example — upload metadata

```ts
// modules/assets/schemas/upload-asset.schema.ts
import { z } from 'zod';
import { SUPPORTED_MIME } from '../constants/supported-mime.constants';
import { MAX_UPLOAD_BYTES } from '../constants/limits.constants';

export const uploadAssetSchema = z.object({
	title: z.string().trim().min(1, 'Title is required').max(100, 'Max 100 characters'),
	description: z.string().trim().max(1000, 'Max 1000 characters').optional().default(''),
	file: z
		.instanceof(File, { message: 'File is required' })
		.refine((f) => SUPPORTED_MIME.includes(f.type), 'Unsupported format')
		.refine((f) => f.size <= MAX_UPLOAD_BYTES, 'File is too large'),
});

export type UploadAssetInput = z.infer<typeof uploadAssetSchema>;
```

#### Example — validating a server response at the boundary

```ts
// modules/assets/schemas/asset.schema.ts
import { z } from 'zod';

export const assetSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	originalFilename: z.string(),
	originalExtension: z.string(),
	state: z.enum(['queued', 'extracting', 'transforming', 'finalizing', 'ready', 'failed']),
	createdAt: z.string(),
	updatedAt: z.string(),
	// ...
});

export type AssetDto = z.infer<typeof assetSchema>;
```

```ts
// modules/assets/services/assets-api.service.ts
import { assetSchema } from '../schemas/asset.schema';

export async function getAsset(id: string) {
	const res = await axios.get(`/assets/${id}`);
	return assetSchema.parse(res.data); // throws on mismatch — surfaced to ErrorBoundary
}
```

This is optional but cheap — catches schema drift in development instantly and gives us runtime-safe values everywhere downstream without casting.

#### Schema inventory

| Module   | Form schemas (in `schemas/`)                                                         | API schemas (in `schemas/`)    |
| -------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| `auth`   | `login.schema`, `signup.schema`, `forgot-password.schema`_, `reset-password.schema`_ | `user.schema`                  |
| `user`   | `update-profile.schema`, `change-password.schema`\*                                  | —                              |
| `assets` | `upload-asset.schema`                                                                | `asset.schema`, `peaks.schema` |

### 17.4 Component structure (enforced by convention)

- **Each component lives in its own sub-directory** named after the component. The component file and its CSS file both sit inside that folder:
    ```
    shared/components/
      button/
        button.component.tsx
        button.component.css
      icon-button/
        icon-button.component.tsx
        icon-button.component.css
    ```
    Never place a component file directly in the parent `components/` folder.
- **Props are always `type`, never `interface`** — use intersection for extending HTML element props:
    ```ts
    type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    	variant?: ButtonVariant;
    };
    ```
    `interface` is banned for props because it enables declaration merging, which can silently widen a component's contract in unexpected ways.
- Split data/effects into a hook; keep the component body mostly JSX.
- Destructure props in the signature, not inside the function body.
- Early-return edge cases at the top.
- `handleX` for internal handlers, `onX` for callback props.
- React 19: `ref` is a normal prop — no `forwardRef`.
- Don't reach for `useEffect` outside of external-system lifecycles (sync loop, `EventSource`, `AudioContext`).

### 17.5 Form conventions — react-hook-form + zod

All forms use **react-hook-form** with a **zod resolver**. No controlled `useState` per field, no manual validation logic.

#### Pattern

```ts
// 1. Schema lives in schemas/ — inferred type exported from the same file
// modules/auth/schemas/login.schema.ts
export const loginSchema = z.object({
	email: z.string().trim().email('Please enter a valid email'),
	password: z.string().min(8, 'At least 8 characters'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// 2. Page/component wires up the form
// modules/auth/pages/login.page.tsx
const form = useForm<LoginInput>({
	resolver: zodResolver(loginSchema),
	defaultValues: { email: '', password: '' },
});
const onSubmit = form.handleSubmit((values) => login(values));
```

#### Rules

- **One schema per form** — lives in the module's `schemas/` folder.
- **`useForm` in the page/smart component** — pass values + errors down to dumb input components as props.
- **Dumb inputs** receive `...form.register('field')` or a controlled `value`/`onChange` — they don't call `useForm` themselves.
- **`form.handleSubmit`** wraps `onSubmit` — never call the submit handler directly.
- **Async submission errors** (e.g. `401 invalid credentials`) → `form.setError('root', { message })` so they surface near the form, not in a toast.
- **`formState.isSubmitting`** drives the submit button's disabled/spinner state — no separate `isLoading` state.
- **No** `useState` for individual field values — react-hook-form tracks them internally.

### 17.6 Redux patterns

- `createSlice` + `createEntityAdapter` + `createSelector` — never bare reducers.
- Typed hooks `useAppDispatch` / `useAppSelector` from `core/stores/hooks.ts`. Don't import raw `useDispatch`/`useSelector`.
- Listener middleware for cross-slice side effects (e.g. `logout` → purge TanStack cache).
- Slice goes in the feature module (`modules/auth/stores/auth.slice.ts`); `core/stores/root-reducer.ts` imports them.
- Don't mirror server data in Redux — that's TanStack's job.

### 17.7 TanStack Query patterns

- One query-key factory per module: `export const assetsQueries = { all, list, detail }`, each returning `queryOptions(...)` so the same config serves `useQuery`, `ensureQueryData`, and `prefetchQuery`.
- Route loaders call `queryClient.ensureQueryData(...)` so the component's `useQuery` hits a warm cache — no waterfall, deep-links work.
- Defaults (set once in `core/services/query-client.service.ts`): `staleTime: 30_000`, `gcTime: 5 * 60_000`, `refetchOnWindowFocus: false`.
- Mutations invalidate by module keys; optimistic updates only where the UX benefits.

### 17.8 Memoization — React Compiler & Strategic Caching

The default rule: **don't memoize**. Enable `babel-plugin-react-compiler` and let it handle automatic memoization. Only after profiling proves a boundary needs it, manually cache.

#### The rule

- **Enable `babel-plugin-react-compiler`** via the Vite plugin. Turn on `eslint-plugin-react-compiler` to flag patterns that break it.
- **Don't write `useMemo` / `useCallback` / `memo()` by default** — remove them when you see them.
- Only re-introduce **after profiling** shows render time is a real bottleneck (Chrome DevTools Profiler, measure 60 fps compliance).

#### Where memoization actually matters in this app

| Case                                    | Pattern                                         | Why                                                                                                                                                | Where                                                                                                                              |
| --------------------------------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Player sync loop**                    | Refs + `requestAnimationFrame`, NOT state       | Hot values (`currentTime`, `isPlaying`) update 60×/s; state-driven rerenders = jank. Use refs + imperative DOM updates.                            | `useMediaSync.hook.ts` — video/audio elements stored as refs, sync loop doesn't touch React state.                                 |
| **AudioContext graph**                  | Singleton per asset, memoized via context + ref | `AudioContext`, `GainNode`s, `MediaElementAudioSourceNode`s are expensive to recreate. Create once, store in a ref, share via context.             | `useAudioContext.hook.ts` creates once per page mount; `audio-graph.context.tsx` shares it without rebuilding on props.            |
| **Large list virtualization** (stretch) | `memo()` on row component only                  | If rendering 1000+ assets, memoize the row (but first implement virtualization — that's the real win).                                             | `AssetTableRow.component.tsx` — if lists grow, wrap with `memo()` and ensure parent doesn't pass new object refs on every render.  |
| **Heavy calculations**                  | Memoize the result, not the function            | If a selector or transform runs expensive logic (e.g., sorting/filtering 10k+ items), cache the output. Don't cache the transform function itself. | Redux selectors via `createSelector` (from Redux Toolkit) — automatically memoized. TanStack Query mutations already cache by key. |
| **Cross-module provider contexts**      | Memo the provider value object                  | If a context value is a large object used by many children, memoize it so children don't re-render when siblings update.                           | Rarely needed; typically only for theme/language contexts if they change frequently.                                               |

#### How to profile and decide

1. **Measure first:** Chrome DevTools → Profiler tab → record while interacting → look for yellow/red bars (long render times).
2. **React DevTools Profiler:** Install extension, Profiler tab → record, see which components re-render and how often.
3. **Timeline:** If player sync loop (60 fps) drops below 50 fps, dig into `useMediaSync`. If asset table scrolling is janky, profile the row render.
4. **Decision:** If a component re-renders frequently (>10/sec) and has no state changes, consider `memo()`. If a calculation takes >5ms, consider `useMemo`.

#### Anti-patterns to avoid

- ❌ `useMemo` on primitives (strings, numbers) — wasteful.
- ❌ `useCallback` on event handlers passed to one child — just define inline.
- ❌ `memo()` on a component whose parent always passes new objects (`{ id: item.id }`) — doesn't help, still rerenders.
- ❌ Memoizing before measuring — you'll add complexity and not know if it helped.

#### Special case: Redux selectors + TanStack Query keys

These are **already memoized** by their libraries — don't double-memoize:

- `createSelector` from Redux Toolkit returns a **memoized selector**. Use it, don't wrap it in `useMemo`.
- TanStack Query's `queryOptions(...)` returns a **memoized query key**. Define it once at module scope, don't rebuild it.

Example (correct):

```ts
// ✅ Correct — selector is memoized by Redux
const selectAssetTitle = createSelector([selectAsset], (asset) => asset?.title);

export default function AssetTitle() {
  const title = useAppSelector(selectAssetTitle);  // selector handles memoization
  return <h1>{title}</h1>;
}
```

Example (wrong):

```ts
// ❌ Wrong — useMemo wrapping an already-memoized selector
const title = useMemo(() => useAppSelector(selectAssetTitle), [selectAssetTitle]);
// ❌ Also wrong — rebuilding the selector on every render
const title = useAppSelector((state) => state.assets.byId[id]?.title);
```

### 17.9 Imports

- Path alias `@/` → `src/`. Configured in `vite.config.ts` + `tsconfig.json`.
- Imports ordered: node built-ins → third-party → `@/app/core` → `@/app/shared` → `@/app/modules/...` → relative. Enforced by `eslint-plugin-import` + `sort-imports`.
- Never import from a sibling module's internals — only via its module entry (`modules/auth` re-exports through its `auth.routes.ts` + slice exports; components stay private to their module).

### 17.10 Internationalization (i18n)

All UI strings are **translatable via i18next**. English is the default; additional languages live in separate TypeScript files under `src/i18n/`.

#### Translation files structure — modular per-directory

**Each directory** (core, shared, and every module) has its own `i18n/` folder. This keeps translations colocated with the code that uses them:

```
src/
  core/
    i18n/
      en/
        translation.ts      # Common/infrastructure strings
      he/
        translation.ts      # Hebrew (right-to-left)
  shared/
    i18n/
      en/translation.ts
      he/translation.ts
  modules/
    auth/
      i18n/
        en/
          translation.ts    # Auth-specific strings
        he/
          translation.ts
    assets/
      i18n/
        en/translation.ts
        he/translation.ts
    user/
      i18n/
        en/translation.ts
        he/translation.ts
    landing/
      i18n/
        en/translation.ts
        he/translation.ts
  i18n/
    index.ts                # Aggregator: imports & merges all module translations
```

**Example: `src/core/i18n/en.ts`**

```ts
export const coreEnTranslation = {
	common: {
		buttons: {
			save: 'Save',
			cancel: 'Cancel',
			delete: 'Delete',
			logout: 'Logout',
		},
		errors: {
			networkError: 'Network error. Please try again.',
			notFound: 'Not found.',
		},
	},
} as const;

export type CoreEnTranslation = typeof coreEnTranslation;
```

**Example: `src/modules/auth/i18n/en.ts`**

```ts
export const authEnTranslation = {
	auth: {
		login: {
			email: 'Email address',
			password: 'Password',
			title: 'Sign in to your account',
			button: 'Sign in',
		},
		signup: {
			email: 'Email address',
			password: 'Password',
			confirmPassword: 'Confirm password',
			displayName: 'Display name',
			button: 'Create account',
		},
	},
} as const;

export type AuthEnTranslation = typeof authEnTranslation;
```

**Root aggregator (`src/i18n/index.ts`)** — merges all module translations:

```ts
import { coreEnTranslation } from '@/app/core/i18n/en';
import { coreHeTranslation } from '@/app/core/i18n/he';
import { sharedEnTranslation } from '@/app/shared/i18n/en';
import { sharedHeTranslation } from '@/app/shared/i18n/he';
import { authEnTranslation } from '@/app/modules/auth/i18n/en';
import { authHeTranslation } from '@/app/modules/auth/i18n/he';
import { assetsEnTranslation } from '@/app/modules/assets/i18n/en';
import { assetsHeTranslation } from '@/app/modules/assets/i18n/he';
// ... import other modules

export const resources = {
	en: { translation: { ...coreEnTranslation, ...sharedEnTranslation, ...authEnTranslation, ...assetsEnTranslation } },
	he: { translation: { ...coreHeTranslation, ...sharedHeTranslation, ...authHeTranslation, ...assetsHeTranslation } },
} as const;

export type Resources = typeof resources;
```

#### Using translations in components

- Import the typed `useTranslation` from the shared hook: `import { useTranslation } from "@/app/shared/hooks/i18n.hook";`
- Call it once per component: `const { t } = useTranslation();`
- Reference keys in JSX: `<button>{t('common.buttons.save')}</button>` — **full autocomplete and type checking**.
- Avoid storing translation keys in state/Redux — translate at render time.
- For interpolation, use i18next formatting: `t('items.count', { count: 5 })`.

#### Organizing translations

- **Module ownership:** Each module's translations live in `modules/<name>/locales/`. Core utilities go in `core/i18n/`. Reusable UI strings in `shared/i18n/`.
- **Top-level keys per module:**
    - `auth`: auth-specific strings (login, signup, forgot password).
    - `assets`: upload, list, player, waveform.
    - `user`: profile, account settings.
    - `common`: buttons, errors, placeholders (in `core/` or `shared/`).
- **Nested structure:** Group related strings (`buttons: { save, cancel }`, `errors: { network, validation }`).
- **One translation per UI string** — no duplicates. If a string is used in multiple modules, decide which module owns it (prefer the module that uses it most).
- **Type-safe from source** — TypeScript catches missing keys and structure mismatches at compile time.
- **RTL support (Hebrew):** Layout-related strings (`buttons.next`, `labels.from`) are automatically mirrored by CSS `dir="rtl"`; no special handling needed in translations.

#### Adding a new language (e.g., Spanish)

1. For **each module** (core, shared, auth, assets, etc.), create a new language folder:
    - `src/modules/auth/i18n/es/translation.ts` with all auth-related strings in Spanish.
    - Mirror the English structure exactly for type safety.
2. Export the translation constant (e.g., `authEsTranslation`).
3. Import all new language files in `src/i18n/index.ts` and add them to the `resources` object:
    ```ts
    export const resources = {
      en: { translation: { ...coreEn, ...sharedEn, ...authEn, ... } },
      he: { translation: { ...coreHe, ...sharedHe, ...authHe, ... } },
      es: { translation: { ...coreEs, ...sharedEs, ...authEs, ... } },
    } as const;
    ```
4. i18next automatically detects via browser language preference; falls back to English if no match.
5. (Optional) Add a language switcher component in the UI for manual override.

#### Example

```tsx
// modules/auth/pages/login.page.tsx
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

export default function LoginPage() {
	const { t } = useTranslation();
	return (
		<form>
			<label>{t('auth.login.email')}</label>
			<input type="email" />
			<button>{t('common.buttons.login')}</button>
			{/* TypeScript error if key doesn't exist: t('nonexistent.key') */}
		</form>
	);
}
```

#### i18n service setup (example)

```ts
// src/core/services/i18n.service.ts
import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { resources } from '@/i18n';

export const initializeI18n = async () => {
	await i18next
		.use(LanguageDetector)
		.use(initReactI18next)
		.init({
			resources,
			fallbackLng: 'en',
			interpolation: { escapeValue: false },
		});
};
```

#### Hook wrapper (example)

```ts
// src/shared/hooks/i18n.hook.ts
import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { Resources } from '@/i18n';

type TranslationKeys = keyof Resources['en']['translation'];

export const useTranslation = () => {
	const { t, i18n } = useI18nTranslation();
	return {
		t: t as (key: TranslationKeys) => string,
		language: i18n.language as keyof typeof i18n.options.resources,
		changeLanguage: (lang: string) => i18n.changeLanguage(lang),
	};
};
```

#### Persistence pattern: i18n + theme

**On app boot** (`src/main.tsx` → `src/core/hooks/auth-bootstrap.hook.ts`):

```ts
// src/core/hooks/auth-bootstrap.hook.ts
export const useAuthBootstrap = () => {
	const dispatch = useAppDispatch();
	const { i18n } = useTranslation();

	useEffect(() => {
		// 1. Restore language from localStorage
		const savedLanguage = localStorage.getItem('app:language');
		if (savedLanguage && ['en', 'he'].includes(savedLanguage)) {
			i18n.changeLanguage(savedLanguage);
		}

		// 2. Restore theme from localStorage
		const savedTheme = localStorage.getItem('app:theme');
		if (savedTheme === 'light' || savedTheme === 'dark') {
			dispatch(setTheme(savedTheme));
		}

		// 3. Restore auth token (if exists)
		const refreshToken = true; // from cookie
		if (refreshToken) {
			dispatch(refreshAuthToken());
		}
	}, []);
};
```

**On preference change** (listener middleware):

```ts
// src/core/stores/listener-middleware.ts
listenerMiddleware.startListening({
	actionCreator: setLanguage,
	effect: (action) => {
		localStorage.setItem('app:language', action.payload);
		i18n.changeLanguage(action.payload);
	},
});

listenerMiddleware.startListening({
	actionCreator: setTheme,
	effect: (action) => {
		localStorage.setItem('app:theme', action.payload);
		document.documentElement.setAttribute('data-theme', action.payload);
	},
});
```

**In components:**

```tsx
// Shared theme toggle component
import { useAppDispatch, useAppSelector } from '@/app/core/stores/hooks';
import { setTheme } from '@/app/shared/stores/ui.slice';

export function ThemeToggle() {
	const dispatch = useAppDispatch();
	const theme = useAppSelector((state) => state.ui.theme);

	const handleToggle = () => {
		dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
		// Listener middleware handles localStorage + DOM update
	};

	return <button onClick={handleToggle}>Toggle theme</button>;
}
```

### 17.11 Smart & Dumb Components

We follow a **presentation layer / business logic split** — dumb (presentational) components stay data-agnostic; smart (container) components fetch, manage state, and orchestrate side effects.

#### Dumb components (presentational)

- **Responsibility:** Render UI, accept data and callbacks as props, handle only UI-local state (e.g., hover, form input before submit).
- **Props:** TypeScript `type PropsType = { ... }` with no `required` fields unless data is truly necessary.
- **No `useEffect`, hooks beyond `useState`**, no API calls, no Redux/Query.
- **Location:** `modules/<name>/components/`, no dependencies on services or stores from the same module.
- **Example:** `AssetTableRow.tsx` receives `asset: Asset`, `onDelete: () => void`, renders a row, handles hover/click locally.
- **Testing:** Easy to test in isolation with RTL — no mocking, just pass props.

#### Smart components (container)

- **Responsibility:** Fetch data (TanStack Query), manage state (Redux), call APIs, handle side effects, orchestrate child dumb components.
- **Often hooks, sometimes components:** If logic-heavy and rarely reused, keep it a hook (`useAssets`, `useMediaSync`); if it's a layout wrapping children, it's a `.component.tsx`.
- **Location:** Pages (`<name>.page.tsx`), module root (`<name>.component.tsx`), or standalone hooks (`<name>.hook.ts`).
- **Example:** `AssetListPage.tsx` calls `useAssets()`, renders `AssetTable` (dumb) passing `assets` + `onDelete`, handles deletion + invalidation.

#### Decision tree

| Question                                | Smart        | Dumb |
| --------------------------------------- | ------------ | ---- |
| Does it call an API or use Redux/Query? | ✅           | ❌   |
| Does it manage its own async state?     | ✅           | ❌   |
| Does it accept **all** data as props?   | ❌           | ✅   |
| Is it reused in multiple places?        | Maybe (hook) | ✅   |
| Does it render other components?        | ✅           | ✅   |

### 17.12 State management — Redux vs TanStack Query

We use **two state systems by design**:

- **Redux** — pure client state (auth, UI toggles, in-progress uploads, theme).
- **TanStack Query** — server state (assets, user profile, processing status).

This separation keeps data flow predictable: Redux never holds stale server data, Query never tries to sync auth.

#### Decision matrix: where does new state go?

| Data type                                                               | Owner                             | Why                                                                                                                         | Example                                                     |
| ----------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Server data** (current, fetched recently)                             | **TanStack Query**                | Built-in caching, invalidation, stale-while-revalidate, automatic refetch. Query is the source of truth.                    | Asset list, user profile, processing status                 |
| **Auth session** (access token, user ID, login status)                  | **Redux** (`auth` slice)          | Needed by request interceptors before any Query fires. Cleared on logout. Not a server value — derived from login response. | `{ user, accessToken, status }`                             |
| **UI state** (toggles, open modals, theme)                              | **Redux** (`ui` slice in shared/) | Cross-component, not tied to any server fetch. Survives navigation.                                                         | `{ theme, activeModal, toastQueue }`                        |
| **In-progress operations** (upload file, upload percent, cancel handle) | **Redux** (`assets` slice)        | Not a server value; shared across upload page + progress indicator. Lives until upload completes or fails.                  | `{ currentUpload: { file, percent, xhr } }`                 |
| **Player state** (active track, volume, playback rate)                  | **Redux** (`player` slice)        | UI toggles, not server data. Persist across asset switches.                                                                 | `{ activeTrack: 'original', volume: 0.8, playbackRate: 1 }` |
| **Hot/60-fps values** (currentTime, isPlaying, duration)                | Component **refs + local state**  | Updates 60×/s; storing in Redux would thrash the store and rerender the whole tree. Use imperative DOM updates via refs.    | Player sync loop, `video.currentTime`, `audio.play()`       |

#### How Redux and Query interact

**Scenario 1: User deletes an asset**

```ts
// Smart component (AssetListPage)
const deleteAssetMutation = useMutation({
	mutationFn: (id: string) => assetsApi.delete(id),
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['assets'] }); // Query updates on next fetch
	},
});

const handleDelete = (id: string) => {
	deleteAssetMutation.mutate(id); // No Redux change; Query handles the refetch
};
```

**Scenario 2: User logs out**

```ts
// Smart component (logout handler)
const handleLogout = async () => {
	// 1. Clear Redux auth state
	dispatch(logout()); // Clears accessToken, user

	// 2. Clear Query cache (no point in stale data)
	queryClient.clear();

	// 3. Interceptor sees no token, redirects to /login
	navigate('/login');
};
```

**Scenario 3: Toggle active track in player**

```ts
// Smart component (Player)
const dispatch = useAppDispatch();
const activeTrack = useAppSelector((state) => state.player.activeTrack);

const handleToggle = () => {
	dispatch(setActiveTrack(activeTrack === 'original' ? 'modified' : 'original'));
	// No Query involved; this is pure UI state
};
```

#### Patterns by ownership

##### Redux slices

- Define in the feature module: `modules/auth/stores/auth.slice.ts`.
- Use `createSlice` + `createEntityAdapter` (if multiple entities) + `createSelector`.
- Import into `core/stores/root-reducer.ts`.
- Access via typed hooks: `useAppDispatch`, `useAppSelector`.
- **Actions:** past-tense names (`loggedIn`, `assetDeleted`), not command names.

```ts
// ✅ Correct
const authSlice = createSlice({
	name: 'auth',
	initialState: { user: null, accessToken: null, status: 'idle' as const },
	reducers: {
		loggedIn: (state, action) => {
			state.user = action.payload.user;
			state.accessToken = action.payload.token;
			state.status = 'authenticated';
		},
	},
});
```

##### TanStack Query hooks

- Define once per module: `modules/assets/hooks/asset-list.hook.ts`.
- Use `queryOptions(...)` factory for reusable config.
- Invalidate by key on mutations; never manually update the cache unless you know the shape.
- Mutations are async; wrap them in components that handle pending/error states.

```ts
// ✅ Correct
const assetQueries = {
	all: () =>
		queryOptions({
			queryKey: ['assets'],
			queryFn: () => assetsApi.list(),
		}),
};

export const useAssets = () => useQuery(assetQueries.all());
```

#### Common mistakes

| Mistake                                       | Why it's wrong                                              | Fix                                                     |
| --------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| Storing a server response in Redux            | Duplicates source of truth; Query won't know about updates. | Use Query, not Redux.                                   |
| Calling `queryClient.setQueryData()` manually | Easy to get the shape wrong; cache gets out of sync.        | Prefer mutations + `invalidateQueries`.                 |
| Storing UI state in Query                     | Query is for server data; UI toggles don't belong there.    | Use Redux.                                              |
| Not clearing Query cache on logout            | User A sees stale assets from User B (privacy bug).         | Call `queryClient.clear()` in logout handler.           |
| Storing auth token in `localStorage`          | XSS-stealable.                                              | Redux in-memory only; refresh token in httpOnly cookie. |
| Manually syncing Redux + Query                | Double work, easy to get out of sync.                       | One is source of truth; the other follows.              |

#### Listener middleware for cross-system side effects

If an action in one system should trigger a side effect in the other, use `listener` middleware:

```ts
// core/stores/listener-middleware.ts
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { logout } from '@/app/modules/auth/stores/auth.slice';
import { queryClient } from '@/app/core/services/query-client.service';

export const listenerMiddleware = createListenerMiddleware();

// When user logs out, clear Query cache
listenerMiddleware.startListening({
	actionCreator: logout,
	effect: () => {
		queryClient.clear(); // Side effect: clear all cached server data
	},
});
```

Add to store:

```ts
export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});
```

---

## 18. Implementation roadmap

Build the client in phases, reviewing after each phase. Each phase has clear deliverables; don't merge until code passes linting, type-checking, and manual review.

### Phase 0 — Nx setup & scaffolding (review gate: build + type-check pass, i18n initialized)

Generate the React + Vite app with Nx generators and set up foundational infrastructure.

- [ ] Install `@nx/react`, `@nx/vite`, `@nx/playwright` plugins.
- [ ] Generate `apps/client` as a React 19 + Vite SPA with `--projectNameAndRootFormat=derived`.
- [ ] Set up ESLint:
    - ESLint plugins: `eslint-plugin-react` + `eslint-plugin-react-hooks` + `eslint-plugin-@typescript-eslint`.
    - Add `eslint-plugin-react-compiler` to flag memoization anti-patterns.
    - Add `eslint-plugin-import` + `eslint-plugin-sort-imports` for import ordering.
    - Create `.eslintrc.json` in `apps/client/` with React + TypeScript rules.
    - **Prettier:** Use root `.prettierrc` (monorepo-wide, no app-level override).
- [ ] Set up **i18n** (modular, TypeScript-based, English + Hebrew):
    - Install `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
    - Create modular locale directories:
        - `src/core/i18n/en.ts` + `src/core/i18n/he.ts` (common strings).
        - `src/shared/i18n/en.ts` + `src/shared/i18n/he.ts` (UI components).
        - `src/modules/auth/i18n/en.ts` + `src/modules/auth/i18n/he.ts` (auth-specific).
        - Repeat for each module (`assets/`, `user/`, `landing/`).
    - Create `src/i18n/index.ts` — aggregates all module translations into a single `resources` object.
    - Create `src/core/services/i18n.service.ts` — i18next init with browser language detection (English default, Hebrew supported).
    - Create `src/shared/hooks/i18n.hook.ts` — typed `useTranslation` hook wrapper with full autocomplete.
    - i18n initializes before React renders (in `main.tsx`).
- [ ] Scaffold folder structure: `src/core/`, `src/shared/`, `src/modules/` (empty for now).
- [ ] Create empty module folders with locales subdirectories:
    - `modules/auth/i18n/{en,he}/`, `modules/assets/i18n/{en,he}/`, etc.
    - `core/i18n/{en,he}/`, `shared/i18n/{en,he}/`.
- [ ] Update `tsconfig.app.json` with path alias `@/*` → `src/*`.
- [ ] Configure Vite for **code-splitting**:
    - Module routes use `React.lazy()` for automatic chunking.
    - Auth routes load synchronously (small, needed early).
    - Suspense fallback component for lazy boundaries.
- [ ] Create `src/main.tsx` entry point (no rendering yet, just imports; i18n init here).
- [ ] Run `nx build client` and `nx lint client` — must pass, no warnings. Check bundle size (target: <150 KB initial JS).
- [ ] Manual test: app loads, dev console shows i18n initialized, language detected from browser preference.
- [ ] Commit: "scaffold(client): Nx React + Vite SPA with i18n (en+he), ESLint + Prettier, code-splitting setup".

### Phase 1 — Core infrastructure (review gate: providers + error boundary work, app skeleton renders)

Bootstrap providers, error handling, Redux store, and app shell — everything the app hangs on before auth.

- [ ] `core/contexts/root-providers.context.tsx` — compose Redux, TanStack Query, theme providers.
- [ ] `core/stores/store.ts` + `root-reducer.ts` — Redux store with `configureStore` (empty reducers initially).
- [ ] `core/stores/hooks.ts` — typed `useAppDispatch` / `useAppSelector`.
- [ ] `core/stores/listener-middleware.ts` — placeholder for cross-slice side effects (will add theme + auth sync).
- [ ] `core/components/app-layout.component.tsx` — shell with header, `<Outlet />`, footer stub.
- [ ] `core/components/error-boundary.component.tsx` — catch render errors, display fallback.
- [ ] `core/components/protected-route.component.tsx` — guard protected routes (will integrate auth in Phase 3).
- [ ] `core/services/axios.service.ts` — axios instance (auth interceptor added in Phase 3).
- [ ] `core/services/query-client.service.ts` — TanStack QueryClient factory.
- [ ] `core/utils/i18n.utils.ts` — i18next init with browser language detection (English default, Hebrew supported).
- [ ] `core/hooks/auth-bootstrap.hook.ts` — restore language + theme from localStorage on app boot (auth token added in Phase 3).
- [ ] **UI slice** (`shared/stores/ui.slice.ts`) — `{ theme, language, toastQueue, modals }` with actions.
- [ ] **Listener middleware** for UI (`core/stores/listener-middleware.ts`) — sync theme + language to localStorage on change.
- [ ] Update `root-reducer.ts` to import ui slice.
- [ ] `src/app.component.tsx` — root, composes providers + router (no routes yet, just the shell).
- [ ] `src/main.tsx` — render to DOM; initialize i18n before React renders.
- [ ] Manual test: app loads, providers in React DevTools, theme toggle works, language detection from browser.
- [ ] Commit: "feat(core): Infrastructure — Redux store, QueryClient, error boundary, i18n, UI slice, app shell".

### Phase 2 — Basic pages (review gate: all three pages render, 404 catches unknown routes)

Public-facing pages and error handling before any auth or feature work.

- [ ] `modules/landing/pages/landing.page.tsx` + `landing.page.css` — marketing home page at `/`.
    - Header with logo + login/signup CTAs (no auth state yet, links only).
    - Hero section, feature highlights.
    - Footer.
- [ ] `modules/landing/i18n/en.ts` + `modules/landing/i18n/he.ts` — landing strings.
- [ ] `modules/landing/landing.component.tsx` — module layout wrapper.
- [ ] `modules/landing/landing.routes.ts` — exports `[{ path: '/', element: <LandingPage /> }]`.
- [ ] **Not-found page** (`core/components/not-found.component.tsx`) — 404 fallback matched by `path="*"` in the root router.
    - "Page not found" message + back-to-home link.
    - i18n strings in `core/i18n/en.ts` + `he.ts`.
- [ ] **Status page** (`core/components/status.component.tsx`) — simple service-health / coming-soon page at `/status`.
    - Displays app version (`env.MODE`) and a static status indicator.
    - i18n strings in `core/i18n/en.ts` + `he.ts`.
- [ ] Wire all three routes into the root router in `app.component.tsx`.
- [ ] Manual test: `/` renders landing, `/status` renders status, any unknown path renders 404.
- [ ] Commit: "feat(pages): Landing page, status page, 404 not-found".

### Phase 3 — Auth module & login/signup (review gate: forms work, tokens persist, mock-refresh works)

Implement login, signup, token management, and auth state.

- [ ] **Auth slice** (`modules/auth/stores/auth.slice.ts`) — `{ user, accessToken, status }` with actions (`loggedIn`, `loggedOut`, `refreshing`, `tokenSet`).
- [ ] **Auth selectors** (`modules/auth/stores/auth.selectors.ts`) — `selectCurrentUser`, `selectIsAuthenticated`, `selectAuthStatus`.
- [ ] Update `root-reducer.ts` to import auth slice.
- [ ] **Axios interceptor** (`core/services/axios.service.ts`):
    - On request: attach `Authorization: Bearer <token>` from auth slice.
    - On 401: pause requests, call `/auth/refresh`, retry or redirect to `/login?next=...`.
    - On refresh success: update token in Redux, resume queue.
    - On refresh failure: logout, redirect.
- [ ] **Auth bootstrap** (`core/hooks/auth-bootstrap.hook.ts`): call `/auth/refresh` once on app boot to restore session from httpOnly cookie.
- [ ] **Protected route** (`core/components/protected-route.component.tsx`): check `selectAuthStatus`, redirect if needed, show spinner if refreshing.
- [ ] **Listener middleware** — logout action → clear Query cache + clear tokens.
- [ ] `modules/auth/schemas/login.schema.ts` — zod with email + password validation.
- [ ] `modules/auth/schemas/signup.schema.ts` — zod with email, password, displayName.
- [ ] `modules/auth/services/auth-api.service.ts` — `login()`, `signup()`, `refresh()`, `logout()` (mock responses for now).
- [ ] `modules/auth/pages/login.page.tsx` — form with zod + react-hook-form, submit → `useLogin` hook.
- [ ] `modules/auth/pages/signup.page.tsx` — similar.
- [ ] `modules/auth/hooks/login.hook.ts` — call API + dispatch `loggedIn` + redirect to `/assets`.
- [ ] `modules/auth/hooks/signup.hook.ts` — call API + auto-login.
- [ ] `modules/auth/hooks/logout.hook.ts` — dispatch `loggedOut` + redirect.
- [ ] `modules/auth/hooks/require-guest.hook.ts` — redirect authed users away from `/login`.
- [ ] `modules/auth/components/auth-card.component.tsx` — card wrapper (dumb).
- [ ] `modules/auth/i18n/en.ts` + `modules/auth/i18n/he.ts` — auth strings (login, signup, errors).
- [ ] `modules/auth/auth.component.tsx` — module layout.
- [ ] `modules/auth/auth.routes.ts` — export routes (login, signup, public).
- [ ] Update `root router` in `app.component.tsx` to compose auth routes + protected routes.
- [ ] Manual test: sign up → token in Redux, log in → redirect → logout → clear Redux, 401 retry flow works.
- [ ] Commit: "feat(auth): Auth slice, login/signup forms, token persistence, interceptor + refresh flow".

### Phase 4 — User profile (review gate: profile loads, header shows user avatar + dropdown, update + delete work)

Account management immediately after auth so the app shell header can display the authenticated user and the profile dropdown from the start.

- [ ] `modules/user/schemas/update-profile.schema.ts` — zod for display name + email.
- [ ] `modules/user/services/user-api.service.ts` — API stubs (`getMe`, `updateMe`, `deleteMe`).
- [ ] `modules/user/hooks/current-user.hook.ts` — `useCurrentUser()` TanStack Query (wraps `/auth/me`).
- [ ] `modules/user/hooks/update-me.hook.ts` — mutation + cache invalidation.
- [ ] `modules/user/hooks/delete-me.hook.ts` — mutation + dispatch `loggedOut` + redirect.
- [ ] `modules/user/pages/profile.page.tsx` — display current user, edit form.
- [ ] `modules/user/components/update-details-form.component.tsx` — dumb form.
- [ ] `modules/user/components/delete-account-dialog.component.tsx` — dumb confirmation dialog.
- [ ] `modules/user/user.component.tsx` — module layout.
- [ ] `modules/user/user.routes.ts` — `/profile`.
- [ ] **Header user button/dropdown** (`core/components/app-layout.component.tsx`) — when authenticated, show avatar + dropdown (Profile / Logout); when guest, show Login / Sign up links. Consumes `useCurrentUser()`.
- [ ] Update root router to compose user routes.
- [ ] Manual test: logged-in user sees their avatar in the header; dropdown navigates to `/profile`; edit saves; delete logs out.
- [ ] Commit: "feat(user): Profile page, account updates + deletion, header user dropdown".

### Phase 5 — Asset list & upload infrastructure (review gate: list renders, upload form validates)

Asset CRUD UI before the player.

- [ ] `modules/assets/schemas/upload-asset.schema.ts` — zod validation (file, title, description).
- [ ] `modules/assets/services/assets-api.service.ts` — API stubs for `list()`, `upload()`, `get()`, `delete()`.
- [ ] `modules/assets/hooks/asset-list.hook.ts` — `useAssets()` TanStack Query hook.
- [ ] `modules/assets/pages/asset-list.page.tsx` — table + search + sort (dumb `AssetTable` component).
- [ ] `modules/assets/components/asset-table.component.tsx` — dumb table, columns.
- [ ] `modules/assets/components/asset-table-row.component.tsx` — dumb row.
- [ ] `modules/assets/pages/asset-upload.page.tsx` — two-step form (file picker + metadata).
- [ ] `modules/assets/components/upload-dropzone.component.tsx` — dumb dropzone.
- [ ] `modules/assets/components/upload-metadata-form.component.tsx` — dumb form.
- [ ] `modules/assets/components/upload-progress-bar.component.tsx` — dumb progress.
- [ ] `modules/assets/hooks/upload-asset.hook.ts` — `useUploadAsset()` mutation with XHR progress.
- [ ] `modules/assets/assets.component.tsx` — module layout.
- [ ] `modules/assets/assets.routes.ts` — `/assets`, `/assets/upload`.
- [ ] Update root router to compose assets routes.
- [ ] Manual test: navigate list, upload form validates, progress bar updates (mock upload).
- [ ] Commit: "feat(assets): Upload form, asset list, table + mutations".

### Phase 6 — Processing status (SSE) (review gate: EventSource connects, status updates in real-time)

Add real-time processing feedback.

- [ ] `modules/assets/services/assets-events.service.ts` — SSE subscriber wrapper.
- [ ] `modules/assets/hooks/asset-events.hook.ts` — `useAssetEvents(assetId)` hook.
- [ ] `modules/assets/components/processing-indicator.component.tsx` — dumb status badge + progress.
- [ ] `modules/assets/pages/asset-view.page.tsx` — asset detail page (stub player for now).
- [ ] Add `asset-detail.hook.ts` — `useAsset(id)` TanStack Query.
- [ ] Hook up `useAssetEvents()` to show status changes as they arrive.
- [ ] Manual test: upload a file, watch status stream (mock server responses).
- [ ] Commit: "feat(assets): Processing status via SSE, asset detail page".

### Phase 7 — Player (the hard part) (review gate: video + audio play, sync loop runs, no desync after seek)

The audio/video sync engine.

- [ ] `modules/assets/hooks/audio-context.hook.ts` — `useAudioContext()` singleton factory.
- [ ] `modules/assets/contexts/audio-graph.context.tsx` — share `AudioContext` + gain nodes.
- [ ] `modules/assets/hooks/media-sync.hook.ts` — `useMediaSync(video, audios)` — the sync loop.
- [ ] `modules/assets/hooks/crossfade.hook.ts` — `useCrossfade(gainA, gainB)` — ramp helpers.
- [ ] `modules/assets/components/player.component.tsx` — `<video muted>` + `<audio>` × 2 + transport bar.
- [ ] `modules/assets/components/transport-bar.component.tsx` — play/pause, seek, volume, rate (dumb).
- [ ] `modules/assets/components/track-switch.component.tsx` — toggle original/modified (dumb).
- [ ] Update `asset-view.page.tsx` to mount player when status is ready.
- [ ] Manual test: video plays, audios follow (via sync loop), toggle track, seek, no console warnings.
- [ ] Commit: "feat(player): Audio/video sync engine, crossfade, transport controls".

### Phase 8 — Polish & stretch (review gate: dark mode works, landing visible, form errors surfaced)

UX refinements.

- [ ] `modules/landing/` — landing page with header (login/signup if guest, profile if authed).
- [ ] Theme toggle (`shared/contexts/theme.context.tsx`) — system preference + override.
- [ ] Toast / error notifications (`shared/stores/ui.slice.ts`) — global error surface.
- [ ] Keyboard shortcuts documentation.
- [ ] Form error messages (red text, real-time validation feedback).
- [ ] Skeleton loaders for async states.
- [ ] Waveform component (bonus) — `modules/assets/components/waveform.component.tsx`.
- [ ] Manual test: dark mode toggle, error toast on failed action, landing page loads.
- [ ] Commit: "feat(polish): Dark mode, error toasts, landing page, skeleton loaders".

### Phase 9 — Testing (review gate: unit tests pass, E2E happy path passes)

Comprehensive test coverage.

- [ ] Unit tests (Vitest + RTL):
    - Auth store reducers.
    - Zod schemas (login, signup, upload).
    - Sync math helpers.
    - Utility functions.
- [ ] Integration tests:
    - `useMediaSync` with mocked `<video>` + `<audio>`.
    - Auth interceptor on 401 + token refresh.
- [ ] E2E (Playwright):
    - Signup → upload video → poll until ready → play → toggle track → seek → verify no console errors.
    - Login → navigate assets → delete → verify list updates.
- [ ] Run `nx test client` and `nx e2e client-e2e` — all green.
- [ ] Commit: "test: Unit, integration, and E2E test suite".

### Phase 10 — Final review & deployment prep (review gate: no lint warnings, all tests pass, bundle size reasonable)

- [ ] `nx run-many -t lint,typecheck,test` — all projects pass.
- [ ] `nx build client` — production bundle, check size.
- [ ] Environment variables documentation (`.env.example`).
- [ ] README with dev / build / test / e2e commands.
- [ ] Commit: "docs: Deployment-ready client, README, env docs".

---

## 19. Open items (defer to Phase 10 or future)

- Server integration: swap mock API responses for real backend endpoints (needs `server.md` finalized).
- iOS Safari testing: manual check on hardware or via BrowserStack.
- Performance profiling: measure 60 fps on player sync loop, optimize if needed.
- Accessibility audit: axe-core in E2E, ARIA labels on all interactive elements.
