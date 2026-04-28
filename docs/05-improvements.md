<h1 align="center">Potential Improvements</h1>

<p align="center">
  A forward-looking list of architectural and engineering improvements that would make this system more scalable, observable, and maintainable in production.
</p>

---

## Table of Contents

1. [Client improvements](#client-improvements)
2. [Server improvements](#server-improvements)
3. [DevOps improvements](#devops-improvements)

<p align="left"><a href="#">↑ Back to top</a></p>

---

## Client improvements

### Resumable uploads

**Current state:** The client performs a single presigned PUT to S3. If the connection drops mid-upload the entire file must be re-sent.

**Improvement:** Use S3 multipart upload. The client splits the file into chunks (e.g. 10 MB each), uploads each part independently, and resumes from the last successful part on reconnect. The API would orchestrate `CreateMultipartUpload` → `UploadPart` presigned URLs → `CompleteMultipartUpload`.

### Language switcher UI

**Current state:** The client is fully wired for internationalisation — `react-i18next` is configured, all user-facing strings go through a typed `useTranslation` hook, and both English and Hebrew translation files are maintained. However there is no UI control that lets a user switch languages at runtime; the language is resolved once from the browser locale on load and cannot be changed without editing `localStorage` manually.

**Improvement:** Add a language-switcher control (e.g. a flag/label dropdown in the header or user-settings panel) that calls `i18n.changeLanguage(lang)`. The `SUPPORTED_LANGUAGES` constant and `Language` enum are already exported; the switcher just needs to iterate them and invoke `changeLanguage`. Persist the selection to `localStorage` so it survives a page reload (i18next's `languageDetector` plugin can handle this automatically).

**Why this matters:**

- All translation infrastructure is already in place — this is purely a UI gap, not an architectural one.
- Hebrew is an RTL language; the app already reads `isRTL` from the hook, so a live language switch would also toggle text direction without further changes.

<p align="left"><a href="#">↑ Back to top</a></p>

---

### End-to-end tests

**Current state:** The client has a Playwright setup but no E2E test suite. The full upload-to-playback flow is only exercisable manually.

**Improvement:** Add Playwright E2E tests that drive a real browser against a running stack (API + Worker + MinIO + Postgres + Redis) to verify the complete user journey.

Example scenarios:

- **Happy path** — sign up, upload a valid video, watch the progress bar advance through each pipeline stage, confirm the audio player and waveform render when the `ReadyEvent` arrives.
- **Auth flows** — login, token refresh on expiry, logout invalidates the session.
- **Error surface** — upload a non-video file and assert the UI surfaces a 422 error; simulate a worker failure and assert the error banner appears.
- **Upload edge cases** — large file upload completes without timeout; network interruption during upload shows a retry prompt.

**Why this matters:**

- E2E tests validate the full stack from the browser — including UI rendering, SSE event handling, and media playback setup that server-side tests cannot reach.
- Catches regressions that only appear when the React client, API, and worker run together (e.g. a CORS misconfiguration or a broken SSE reconnect).

<p align="left"><a href="#">↑ Back to top</a></p>

---

## Server improvements

### BDD tests to simulate client behaviour

**Current state:** The test suite covers integration tests (HTTP layer against a real DB) and unit tests (service logic with mocked dependencies). These verify the server behaves correctly in isolation but do not exercise the full client-driven flow.

**Improvement:** Add BDD-style acceptance tests written in Gherkin (`pytest-bdd` or `behave`) that describe the system from the perspective of the client consuming the API.

Example scenarios:

```gherkin
Feature: Video upload and processing

  Scenario: Successful end-to-end upload
    Given a registered user
    When they create an asset with a valid video file
    And they upload the video directly to the presigned S3 URL
    And they signal the upload is complete
    Then the asset status transitions through QUEUED → EXTRACTING → TRANSFORMING → FINALIZING → READY
    And a ReadyEvent is received over the SSE stream with valid download URLs

  Scenario: Upload with unsupported file type
    Given a registered user
    When they attempt to create an asset with MIME type "image/png"
    Then the request is rejected with status 422

  Scenario: Token refresh rotation
    Given a user with a valid refresh token
    When they use the refresh token once
    Then a new token pair is returned
    When they replay the original refresh token
    Then the request is rejected with status 401
    And both token families are revoked
```

**Why this matters:**

- BDD scenarios describe observable behaviour, not implementation details — they survive refactors.
- Scenarios act as living documentation that non-engineers (product, QA) can read and contribute to.
- Running BDD tests against a staging environment validates the deployed system, not just the code in CI.
- The full SSE stream and multi-step upload flow can be exercised as a single coherent scenario, catching integration gaps that isolated tests miss.

<p align="left"><a href="#">↑ Back to top</a></p>

---

### Parallel video chunk processing

**Current state:** One worker handles one video end-to-end: download → extract → transform → peaks → upload. For long videos this is slow and ties up a worker for the full duration.

**Improvement:** Split the video into time-based segments and process each segment on a separate worker in parallel, then merge the results.

```
Original video (e.g. 60 min)
         │
         ▼
  Splitter job (1 worker)
  ffmpeg -ss 0 -t 300 → chunk_0.mp4
  ffmpeg -ss 300 -t 300 → chunk_1.mp4
  ...
         │
    ┌────┴────┐
    ▼         ▼
Worker 0   Worker 1   ...   Worker N
chunk_0    chunk_1          chunk_N
extract    extract          extract
transform  transform        transform
peaks      peaks            peaks
    │         │                │
    └────┬────┘
         ▼
  Merge job (1 worker)
  ffmpeg concat → final audio, peaks aggregation
  Upload merged artifacts → mark READY
```

**Benefits:**

- Processing time scales with the number of available workers rather than video length.
- Workers are kept busy on smaller, bounded units of work — no single worker monopolises the queue for a 2-hour video.
- Failed chunks can be retried independently without reprocessing the entire video.

**Trade-offs to manage:**

- Requires a coordinator/fan-out/fan-in pattern on top of the existing job queue.
- Audio at chunk boundaries may need cross-fade or overlap handling to avoid audible discontinuities after concatenation.
- Waveform peaks from each chunk must be concatenated in correct order during the merge step.

<p align="left"><a href="#">↑ Back to top</a></p>

---

## DevOps improvements

The full target infrastructure for these improvements is described in [Cloud Architecture](04-cloud-architecture.md).

### Replace third-party S3 with native AWS S3

**Improvement:** Move directly to AWS S3.

- Removes the operational burden of running a separate storage service and unlocks native AWS controls — lifecycle policies, server-side encryption, IAM-based access, and VPC Endpoints out of the box.
- Presigned URLs are a first-class S3 feature so no client code changes; only the endpoint URL and credential configuration change.

### SQS-driven job queue instead of client webhook

**Current state:** S3/MinIO fires an `ObjectCreated` bucket notification to `POST /assets/{id}/webhook` on the API, which enqueues the processing job in Redis/arq.

**Problem:** Webhook delivery is fire-and-forget — if the request fails or the API is temporarily down, the notification is lost and the asset stays stuck in `PENDING_UPLOAD` with no job ever queued.

**Improvement:** Use S3 Event Notifications → SQS → Workers.

```
Client → S3 (direct PUT)
         │
         └─ S3 Event Notification (s3:ObjectCreated:*)
                  │
                  ▼
              SQS Queue
                  │
                  ▼
             Worker polls SQS
             pulls message, begins processing
```

- S3 emits an event the moment the object is fully written — no client cooperation required.
- SQS provides at-least-once delivery with configurable visibility timeout and a dead-letter queue for failed jobs.
- Workers become pull-based and stateless; horizontal scaling is just adding more consumer instances.
- The `/assets/{id}/webhook` endpoint and the client-side webhook call are removed entirely.
- The `PENDING_UPLOAD` state still exists briefly, but the transition to `QUEUED` is now driven by S3 natively rather than a fire-and-forget webhook.

<p align="left"><a href="#">↑ Back to top</a></p>
