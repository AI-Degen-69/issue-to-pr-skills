# Agent Detail Page Captures Recipe

This directory contains visual captures for the agent detail pages under `site/agents/`.
All captures are stored in agent-specific subdirectories and referenced via depth-2 relative paths (`../../assets/agents/<agent-id>/capture-1.png`).

---

## Portability & Privacy Audit

In accordance with `AGENTS.md` and repository guidelines:
- **Zero machine or user credentials**: No usernames, home directories (`/Users/...`, `/home/...`), internal tokens, or SSH hosts.
- **Path hygiene**: All demonstrated file paths are project-root relative (e.g. `src/auth/webhook.ts`, `src/api/users.py`, `src/services/billing.ts`, `src/components/UserProfile.tsx`, `src/models/async-state.ts`).
- **No private or proprietary code**: All evaluated code samples are minimal, self-contained demonstration cases created specifically for this purpose.

---

## Capture Inventory & Reproduction Recipes

### 1. `code-reviewer` (`site/assets/agents/code-reviewer/capture-1.png`)
- **Target File**: `src/auth/webhook.ts`
- **Case**: Payment webhook handler without HMAC signature verification and an empty `catch` block that returns HTTP 200 upon failure.
- **Reviewer Command**:
  ```bash
  gh pr diff | agent-review --persona code-reviewer
  ```
- **Demo Diff**:
  ```diff
  --- a/src/auth/webhook.ts
  +++ b/src/auth/webhook.ts
  @@ -8,6 +8,11 @@ export async function handlePaymentWebhook(req: any, res: any) {
  +  try {
  +    const event = req.body;
  +    await processPayment(event);
  +    return res.status(200).json({ received: true });
  +  } catch (err) {
  +    return res.status(200).json({ received: true });
  +  }
  ```
- **Outcome / Findings**:
  - `[CRITICAL] Security / Auth Verification`: Missing HMAC signature check allows unauthenticated payment spoofing.
  - `[CRITICAL] Correctness / Error Handling`: Silently returning HTTP 200 falsely acknowledges failed webhook processing.
  - `VERDICT: REQUEST_CHANGES` (2 critical issues).
- **Asset Specifications**: 960x410 px PNG, 79.4 KB (budget limit: 256 KB).

---

### 2. `python-reviewer` (`site/assets/agents/python-reviewer/capture-1.png`)
- **Target File**: `src/api/users.py`
- **Case**: Database query endpoint using f-string string interpolation (SQL injection) and a bare `except:` block.
- **Reviewer Command**:
  ```bash
  ruff check src/api/users.py && agent-review --persona python-reviewer
  ```
- **Demo Diff**:
  ```diff
  --- a/src/api/users.py
  +++ b/src/api/users.py
  @@ -5,8 +5,10 @@ def get_user_by_email(db: sqlite3.Connection, user_email: str):
  +    try:
  +        query = f"SELECT * FROM users WHERE email = '{user_email}'"
  +        cursor.execute(query)
  +        return cursor.fetchone()
  +    except:
  +        return None
  ```
- **Outcome / Findings**:
  - `[CRITICAL] S608`: SQL injection vector through string-based query construction (CWE-89).
  - `[CRITICAL] E722`: Bare `except:` intercepts `BaseException`, masking `KeyboardInterrupt` and `SystemExit`.
  - `VERDICT: BLOCK` (2 critical issues).
- **Asset Specifications**: 960x390 px PNG, 76.7 KB (budget limit: 256 KB).

---

### 3. `typescript-reviewer` (`site/assets/agents/typescript-reviewer/capture-1.png`)
- **Target File**: `src/services/billing.ts`
- **Case**: Untrusted payload cast with double assertion (`as any as SubscriptionPlan`) and unhandled floating promise in analytics dispatcher.
- **Reviewer Command**:
  ```bash
  tsc --noEmit && agent-review --persona typescript-reviewer
  ```
- **Demo Diff**:
  ```diff
  --- a/src/services/billing.ts
  +++ b/src/services/billing.ts
  @@ -10,6 +10,8 @@ export function applyPlanUpgrade(rawPayload: unknown): void {
  +  const plan = rawPayload as any as SubscriptionPlan;
  +  dispatchAnalyticsEvent({ planId: plan.id, timestamp: Date.now() });
  ```
- **Outcome / Findings**:
  - `[CRITICAL] @typescript-eslint/no-floating-promises`: Promise returned by `dispatchAnalyticsEvent` is not awaited or caught.
  - `[HIGH] Unsound Type Assertion`: `as any as T` disables compiler type-checking at untrusted boundary.
  - `VERDICT: REQUEST_CHANGES`.
- **Asset Specifications**: 960x390 px PNG, 76.8 KB (budget limit: 256 KB).

---

### 4. `react-reviewer` (`site/assets/agents/react-reviewer/capture-1.png`)
- **Target File**: `src/components/UserProfile.tsx`
- **Case**: Component with conditional `useEffect` hook called after an early `return` check, plus unsanitized `dangerouslySetInnerHTML`.
- **Reviewer Command**:
  ```bash
  eslint src/components/UserProfile.tsx && agent-review --persona react-reviewer
  ```
- **Demo Diff**:
  ```diff
  --- a/src/components/UserProfile.tsx
  +++ b/src/components/UserProfile.tsx
  @@ -8,6 +8,8 @@ export function UserProfile({ userId, comment }: Props) {
  +  if (!userId) return <div>User not found</div>;
  +  useEffect(() => { fetchUserData(userId).then(setData); }, [userId]);
  +  return <div>{comment && <div dangerouslySetInnerHTML={{ __html: comment.body }} />}</div>;
  ```
- **Outcome / Findings**:
  - `[CRITICAL] react-hooks/rules-of-hooks`: Hook called after early return statement, violating React fiber order invariants.
  - `[CRITICAL] React Security`: Direct injection of unsanitized HTML via `dangerouslySetInnerHTML` allows stored XSS.
  - `VERDICT: BLOCK`.
- **Asset Specifications**: 960x390 px PNG, 78.9 KB (budget limit: 256 KB).

---

### 5. `type-design-analyzer` (`site/assets/agents/type-design-analyzer/capture-1.png`)
- **Target File**: `src/models/async-state.ts`
- **Case**: Refactoring an ambiguous "bag-of-optionals" state interface into an explicit discriminated union.
- **Reviewer Command**:
  ```bash
  agent-review --persona type-design-analyzer src/models/async-state.ts
  ```
- **Demo Diff**:
  ```diff
  --- a/src/models/async-state.ts
  +++ b/src/models/async-state.ts
  @@ -1,7 +1,6 @@
  -export interface LegacyAsyncState<T> {
  -  data?: T;
  -  error?: Error;
  -  isLoading?: boolean;
  -  isIdle?: boolean;
  -}
  +export type AsyncState<T> =
  +  | { status: 'idle' }
  +  | { status: 'loading' }
  +  | { status: 'success'; data: T }
  +  | { status: 'error'; error: Error };
  ```
- **Outcome / Findings**:
  - `Encapsulation`: EXCELLENT
  - `Invariant Expression`: EXCELLENT (impossible state `loading: true && error: Error` is prevented at compile time)
  - `Invariant Usefulness`: HIGH (exhaustive TypeScript narrowing)
  - `Enforcement`: COMPILE-TIME
  - `VERDICT: DESIGN APPROVED (Model Quality: Excellent)`.
- **Asset Specifications**: 960x380 px PNG, 83.4 KB (budget limit: 256 KB).

---

## Maintenance & Refresh Policy

- Captures represent deterministic evaluation outputs against defined test diffs.
- When an agent persona in `agents/<agent-id>.md` evolves its review rubric, re-run the respective test case in `scratch/demos/` and refresh the raster asset using the reproduction script.
