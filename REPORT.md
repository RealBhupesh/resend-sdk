# Resend SDK: my experience with the Voxgig SDK generator

**Author:** Bhupesh Cholake
**Date:** 2026-10-06
**Repository:** https://github.com/RealBhupesh/resend-sdk
**API:** [Resend](https://resend.com) (email sending), using the official OpenAPI 3.1.2 spec from
[resend/resend-openapi](https://github.com/resend/resend-openapi) (72 paths)
**Tools:** `@voxgig/create-sdkgen` 0.30.6, `@voxgig/sdkgen` 4.34.1, `@voxgig/apidef` 8.23.0
**My setup:** macOS (Apple Silicon), Node 26.0.0 (and Node 24.21.0 for comparison), Python 3.12
(via uv) and the Mac's built-in Python 3.9.6
**Targets:** TypeScript and Python, with the `test` feature. I skipped Go because it isn't
installed on my machine.

## A note before you read

I'm new to this tool, so some of what I describe below may be my own mistakes or something
about my setup. For every issue I've said what I saw, why I think it happened, and how sure I
am. Where I haven't checked, I say so.

## How it went overall

Generating the SDK was fast (7 seconds, 63 entities), and the generated client worked with my
real API key: `client.Domain().list()` and `client.ApiKey().list()` returned the right data
from my Resend account. Most of my trouble was with the setup and the tests, not with the
generated client code.

| Stage | Result |
| --- | --- |
| Scaffold | Stopped at `npm install` (version conflict). I fixed it with a one-line change. |
| Generate | Finished fine in 7 s, with 18 warnings |
| TypeScript offline tests (Node 24) | 650 tests: 577 passed, 5 failed, 68 skipped |
| TypeScript offline tests (Node 26) | 576 passed, 6 failed (one extra failure, see issue 8) |
| Python offline tests (3.12) | 437 passed, 5 failed, 147 skipped |
| TypeScript live tests (real key) | 498 passed, 76 failed, 76 skipped, 222 s |

## What I think is on the tool's side

These are the ones I'm fairly confident about, because I saw the evidence directly.

### 1. The scaffold stopped at the first step

The scaffolded `.sdk/package.json` pins `@voxgig/apidef ~8.22.1` and `@voxgig/sdkgen ~4.34.0`.
The `~` range picks up sdkgen 4.34.1, which needs `@voxgig/apidef >=8.23.0`, so `npm install`
stopped with an `ERESOLVE` error and the scaffold quit. I was using the latest published
`create-sdkgen` (0.30.6), so I don't think I caused this.

Because it stopped early, my `-t ts,py -f test` options were skipped too, and nothing told me
so. I only noticed when the target and feature lists were empty. I changed the pin to
`~8.23.0`, ran `npm install`, then added the targets and the test feature by hand.

### 2. Python version mismatch

The generated `pyproject.toml` says `requires-python = ">=3.8"`, but it depends on
`requests>=2.33`, which needs Python 3.10 or newer. On my Mac's built-in Python 3.9.6 the
install failed. My old Python showed it up, but the mismatch is in the generated file.

### 3. The `from` field is missing from the Python types

The generator warned me about this itself: the sender field `from` is left out of 16 typed
models (`Email`, `EmailCreateData`, `Broadcast`, `Template` and others), because `from` is a
Python keyword. It is still reachable as a plain dict key, but for an email API it is probably
the most important field, so I'd like it typed. A `from_` alias might work.

### 4. A small disagreement about the `log/` folder

The scaffold's `.sdk/.gitignore` ignores `log/`, and every generate then prints a warning
saying to delete that line. I deleted it as the warning said.

### 5. Generated tests drop the parent id on nested resources

*(Checked after my first draft. I originally listed this under "not sure".)*

Some calls on sub-resources fail because the parent id is missing:

- `AutomationRun.load`: "URL path has no value for {automation_id}"
- `RetrievedAttachment.load`: "missing: email_id"
- In the `RemoveSuppressionResponseSuccess` basic flow, the item still shows in the list after
  it was removed. I didn't dig into this one.

I wondered whether I should have added something to `guide.aontu`, so I looked at the model.
I don't think I needed to:

- The model already knows the parent. `.sdk/model/entity/automation_run.aontu` lists
  `automation_id` as a required path parameter, with `automation` as an ancestor.
- The test data has it too: every record in `AutomationRunTestData.json` has
  `"automation_id": "AUTOMATION01"`, and the flow step's match has both `automation_id` and `id`.
- The generated test still builds the match with `id` only:
  `automation_run_ref01_match_dt0.id = automation_run_ref01_data.id`, then calls
  `load(...)`. So the parent id is dropped when the test code is written.

The docs are mixed. The README example for `AutomationRun` correctly passes `automation_id`.
The one for `RetrievedAttachment` is `load({ id: 'retrieved_attachment_id' })` with no
`email_id`, in both TypeScript and Python. The doc-example check catches it. My guess is that
attachments are harder because the entity has two routes, `/emails/{email_id}/attachments/...`
and `/emails/receiving/{email_id}/attachments/...`, but that's only a guess.

## Things that were partly my mistake, or that I'm not sure about

### 6. Live tests couldn't find my API key (mostly my mistake)

I put `.env.local` in the top folder of the repository, and every live request failed with
401. When I looked again, the TypeScript tests read `ts/.env.local`. The instructions are in
`ts/README.md`, so "the project root" there most likely means `ts/`. I misread it. With the
file in `ts/`, the tests load the key correctly (I checked with a dummy value).

Two small things might still be worth improving:

- When live mode is on and no key is found, the tests carry on silently and every request goes
  out without a key. A warning like "no API key found" would have saved me some time.
- The Python tests read `open("../../.env.local")`, relative to where they're run from. With
  the documented `cd py && pytest test/`, that is two folders up from `py/`, outside the
  repository, not `py/.env.local`. So TypeScript and Python look in different places. I only
  checked this by reading `py/test/runner.py`, not by running it.

### 7. Test data left in my account

After the live run I found a webhook, a contact and a suppression entry in my Resend account,
including `steve.wozniak@gmail.com`, an address that appears in the spec's examples. The log
showed 13 successful write requests and no DELETE requests. I removed the three items by hand.

Why I think it happened: I'm not sure. Cleanup may only run when certain steps succeed, and
in my brand-new account many steps were skipped or blocked, so this may be a side effect. I
haven't checked. I mention the address because for an email API, a real-looking third-party
address in a suppression list stood out to me. An address on `example.com` might be safer.

### 8. Node 26

The doc-example tests crash on Node 26 (`stripTypeScriptTypes` only accepts `'strip'` there).
They run on Node 24. The guide says "Node.js 24 or later", so I mention it for completeness,
but Node 26 is very new and I chose to use it.

## Smaller notes

- **Entity names.** Clean schemas gave good names (`Email`, `Domain`, `Contact`, `Broadcast`,
  `Template`, `Webhook`). Others are named after the response wrapper, such as
  `RemoveAudienceResponseSuccess`, so I'd write
  `client.RemoveAudienceResponseSuccess().remove(...)`. I think the guide file can fix this,
  but I didn't try.
- **The command in AGENTS.md.** It says to run `create-sdkgen`, but npm has no package with
  that name. `npx @voxgig/create-sdkgen` worked for me.
- **Author and links.** The scaffold put `"author": "Resend"` in `.sdk/package.json`, and the
  generated files pointed to `github.com/voxgig-sdk/resend-sdk`. Setting `author`, `publisher`
  and `repo` in `project.aontu` fixed everything after one regenerate. Finding those options
  in `sdkgen.aontu` took me a while, and I'd have liked them in the tutorial.
- **Live test failures.** Of the 76, 36 said "Required input needs a guide recipe or validated
  example" and about 21 said my account has no record of that kind (no templates, emails or
  broadcasts yet). Both are reasonable for a brand-new account, and the messages were clear.

## What I liked

- Generation is quick, and regenerating after a model change was smooth.
- The check that runs every code example in the docs caught a broken example in my SDK's
  README, which is a great safety net.
- The live test output (`LIVE STEP` and `LIVE SUMMARY`) tells you why each step passed,
  failed or was skipped.
- `project.aontu` keeps my decisions across regenerates.

## Time and AI use

My own time was well under the 30 minutes: picking the API, creating the repo and API key,
and reviewing. I used Claude Code (an AI coding assistant) to run the tools and read through
the logs, which the task allowed. I checked the findings above against the logs, and I've been
open about which ones I haven't confirmed.

Thank you for the opportunity. I'm happy to re-run or double-check anything that helps.
