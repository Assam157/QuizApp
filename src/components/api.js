 // ==================================================
// API Configuration
// ==================================================

const API_BASE_URL =
  "https://ascent-halt-glorify.ngrok-free.dev";


// ==================================================
// Build API URL
// ==================================================

export const apiUrl = (path = "") => {
  if (!path) return API_BASE_URL;

  // Allow absolute URLs
  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};


// ==================================================
// Main API Fetch
// ==================================================

export async function apiFetch(path, options = {}) {

  const isFormData =
    options.body instanceof FormData;

  const headers = {

    // IMPORTANT:
    // Do NOT set Content-Type for FormData.
    // The browser automatically sets:
    // multipart/form-data; boundary=...
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    // IMPORTANT:
    // Prevent ngrok from returning its browser warning page.
    "ngrok-skip-browser-warning": "true",

    // Preserve headers supplied by components.
    ...(options.headers || {}),
  };

  const response = await fetch(
    apiUrl(path),
    {
      ...options,
      headers,
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  // Read response once.
  const text = await response.text();


  // ==================================================
  // HTTP ERROR
  // ==================================================

  if (!response.ok) {
    throw new Error(
      `API ${response.status}: ${text.substring(0, 500)}`
    );
  }


  // ==================================================
  // EXPECT JSON
  // ==================================================

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON but received ${contentType}: ${text.substring(
        0,
        500
      )}`
    );
  }


  // ==================================================
  // PARSE JSON
  // ==================================================

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid JSON response: ${text.substring(0, 500)}`
    );
  }
}


// ==================================================
// GET
// ==================================================

export const apiGet = (
  path,
  options = {}
) =>
  apiFetch(path, {
    ...options,
    method: "GET",
  });


// ==================================================
// POST
// ==================================================

export const apiPost = (
  path,
  body = {},
  options = {}
) =>
  apiFetch(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });


// ==================================================
// PUT
// ==================================================

export const apiPut = (
  path,
  body = {},
  options = {}
) =>
  apiFetch(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });


// ==================================================
// PATCH
// ==================================================

export const apiPatch = (
  path,
  body = {},
  options = {}
) =>
  apiFetch(path, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });


// ==================================================
// DELETE
// ==================================================

export const apiDelete = (
  path,
  options = {}
) =>
  apiFetch(path, {
    ...options,
    method: "DELETE",
  });


// ==================================================
// FILE UPLOAD
// ==================================================

export const apiUpload = (
  path,
  formData,
  options = {}
) => {

  if (!(formData instanceof FormData)) {
    throw new Error(
      "apiUpload requires a FormData object"
    );
  }

  return apiFetch(path, {
    ...options,
    method: "POST",
    body: formData,
  });
};


// ==================================================
// Default Export
// ==================================================

const api = {
  API_BASE_URL,
  apiUrl,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
};

export default api;
