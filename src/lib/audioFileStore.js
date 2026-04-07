// Simple in-memory store to pass a dropped audio file between pages
let pendingFile = null;

export const audioFileStore = {
  set: (file) => { pendingFile = file; },
  get: () => pendingFile,
  clear: () => { pendingFile = null; },
};