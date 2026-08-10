const API_BASE_URL =
  "https://ascent-halt-glorify.ngrok-free.dev";

export async function apiFetch(path, options = {}) {
  const isFormData =
    options.body instanceof FormData;

  const headers = {
    // IMPORTANT:
    // Do not set Content-Type for FormData.
    // The browser creates multipart/form-data + boundary.
    ...(isFormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    // Required to bypass ngrok's browser warning page
    "ngrok-skip-browser-warning": "true",

    // Preserve headers supplied by components
    ...(options.headers || {}),
  };

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  const contentType =
    response.headers.get("content-type") || "";

  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `API ${response.status}: ${text.substring(
        0,
        500
      )}`
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON but received ${contentType}: ${text.substring(
        0,
        500
      )}`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid JSON response: ${text.substring(
        0,
        500
      )}`
    );
  }
}
