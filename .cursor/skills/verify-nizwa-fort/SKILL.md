# Verify NizwaFort
Nizwa - A Fortified Experience: static guided tour of Nizwa Fort.
## Launch
Any static file server from the repo root.
## Doctor
`python3 .cursor/skills/verify-nizwa-fort/verify.py`
## Drive
Serves the static site and renders it in headless Chromium asserting the boot marker, tour entry point, and zero JS console errors.
## Evidence
`.cursor/skills/verify-nizwa-fort/evidence.json`
## Cleanup
Static server terminated after the render.
## Known boundaries
Render smoke only; scene quality and e2e suites not exercised here.
