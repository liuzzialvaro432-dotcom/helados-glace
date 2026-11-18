import type { RuntimeMessage, RuntimeResponse, UserPreferences } from "../types/catalog";
import { log } from "../utils/logger";
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  toggleFavoriteId,
} from "../utils/storage";

const PDF_PATH = "Modellkatalog.pdf";

/**
 * Initializes defaults once on install/update.
 */
const ensureDefaults = async (): Promise<void> => {
  const preferences = await loadPreferences();
  await savePreferences(preferences);
  log("info", "preferences ready", {
    favorites: preferences.favoriteIds.length,
  });
};

chrome.runtime.onInstalled.addListener((details) => {
  void ensureDefaults();
  log("info", "extension installed", { reason: details.reason });

  if (details.reason === "install") {
    chrome.alarms.create("weekly-reminder", {
      delayInMinutes: 60 * 24 * 7,
      periodInMinutes: 60 * 24 * 7,
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== "weekly-reminder") {
    return;
  }

  log("info", "weekly catalog reminder tick");
});

chrome.action.onClicked.addListener(() => {
  // Popup is declared in the manifest; this is a no-op safety net.
  log("debug", "action clicked");
});

/**
 * Opens the bundled PDF catalog in a new tab.
 */
const openPdf = async (): Promise<RuntimeResponse> => {
  try {
    const url = chrome.runtime.getURL(PDF_PATH);
    await chrome.tabs.create({ url });
    return { ok: true, preferences: await loadPreferences() };
  } catch (error) {
    log("error", "failed to open PDF", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return {
      ok: false,
      error: error instanceof Error ? error.message : "failed to open PDF",
    };
  }
};

const respondWithPreferences = async (
  preferences: UserPreferences,
): Promise<RuntimeResponse> => ({
  ok: true,
  preferences,
});

chrome.runtime.onMessage.addListener(
  (
    message: RuntimeMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: RuntimeResponse) => void,
  ): boolean => {
    const handle = async (): Promise<RuntimeResponse> => {
      switch (message.type) {
        case "PING":
          return { ok: true, pong: true };

        case "GET_PREFERENCES":
          return respondWithPreferences(await loadPreferences());

        case "SET_PREFERENCES": {
          const current = await loadPreferences();
          const next = await savePreferences({ ...current, ...message.payload });
          return respondWithPreferences(next);
        }

        case "TOGGLE_FAVORITE": {
          const current = await loadPreferences();
          const next = await savePreferences(
            toggleFavoriteId(current, message.payload.modelId),
          );
          return respondWithPreferences(next);
        }

        case "OPEN_PDF":
          return openPdf();

        case "COPY_SLUG":
          // Clipboard access is handled in the popup page context.
          return { ok: true, copied: true };

        default:
          return { ok: false, error: "Unknown message type" };
      }
    };

    void handle()
      .then(sendResponse)
      .catch((error: unknown) => {
        log("error", "message handler failed", {
          error: error instanceof Error ? error.message : "unknown",
        });
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "unknown",
        });
      });

    return true;
  },
);

void ensureDefaults().catch((error: unknown) => {
  log("error", "startup failed", {
    error: error instanceof Error ? error.message : "unknown",
  });
  void savePreferences(DEFAULT_PREFERENCES);
});
