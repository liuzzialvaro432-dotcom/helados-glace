import type { RuntimeMessage, RuntimeResponse } from "../types/catalog";
import { log } from "./logger";

/**
 * Sends a typed runtime message to the service worker.
 */
export const sendMessage = async (
  message: RuntimeMessage,
): Promise<RuntimeResponse> => {
  try {
    const response = (await chrome.runtime.sendMessage(message)) as
      | RuntimeResponse
      | undefined;

    if (!response) {
      throw new Error("Empty response from service worker");
    }

    return response;
  } catch (error) {
    log("error", "runtime message failed", {
      type: message.type,
      error: error instanceof Error ? error.message : "unknown",
    });
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    };
  }
};

/**
 * Copies text through the Clipboard API with an execCommand fallback.
 */
export const copyText = async (value: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to legacy path.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const didCopy = document.execCommand("copy");
    textarea.remove();
    return didCopy;
  } catch {
    return false;
  }
};
