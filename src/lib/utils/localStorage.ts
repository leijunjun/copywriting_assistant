/**
 * localStorage utilities with event triggering
 */

/**
 * Set localStorage item and trigger custom event
 */
export function setLocalStorageItem(key: string, value: string | null) {
  if (value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value);
  }
  
  // Trigger custom event for same-window listeners
  const event = new CustomEvent('localStorageChange', {
    detail: { key, newValue: value }
  });
  window.dispatchEvent(event);
}

/**
 * Remove localStorage item and trigger custom event
 */
export function removeLocalStorageItem(key: string) {
  setLocalStorageItem(key, null);
}

/**
 * Clear multiple localStorage items and trigger events
 */
export function clearLocalStorageItems(keys: string[]) {
  keys.forEach(key => {
    removeLocalStorageItem(key);
  });
}
