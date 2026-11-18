# Privacy Policy — Modellkatalog

**Last updated:** 18 November 2026 (America/Asuncion)

## What this extension does

Modellkatalog is a local reference tool. It shows a fixed five-category catalog of AI models in a browser popup and options page. It also opens a bundled PDF catalog.

## Data collection

This extension does **not** collect, sell, or transmit personal data.

It does **not**:

- read browsing history
- read page content
- inject scripts into websites
- use analytics or advertising SDKs
- contact remote servers for catalog data

## Data stored on your device

Preferences are stored with `chrome.storage.sync` (falling back to `chrome.storage.local`):

- selected category filter
- callable-scope filter
- search query
- favorite model ids
- language override

You can clear favorites in the options page. Removing the extension deletes this storage.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save filters and favorites |
| `alarms` | Optional lightweight weekly maintenance tick in the service worker |

No host permissions are requested.

## Contact

If you redistribute this extension, replace this contact section with your support channel before publishing to the Chrome Web Store.
