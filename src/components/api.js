 // src/api.js

export const API_BASE =
  "https://ascent-halt-glorify.ngrok-free.dev" ||
  "https://quizappbackend-k09m.onrender.com";

// --------------------------------------------------
// Build API URL
// --------------------------------------------------
export const apiUrl = (path = "") => {
  if (!path) return API_BASE;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

// --------------------------------------------------
// Main API fetch function
//
// Handles:
// JSON
// PDF
// CSV
// Excel
// Images
// Text
// Other blobs
// --------------------------------------------------
export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);

  const fetchOptions = {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, fetchOptions);

  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

  // ------------------------------------------------
  // Handle HTTP errors
  // ------------------------------------------------
  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      if (contentType.includes("application/json")) {
        const data = await response.json();

        message =
          data.message ||
          data.error ||
          message;
      } else {
        const text = await response.text();

        if (text.includes("ngrok")) {
          message =
            "The backend returned an ngrok page instead of the API response.";
        } else if (text) {
          message = text.substring(0, 500);
        }
      }
    } catch {
      // Keep default error
    }

    throw new Error(message);
  }

  // ------------------------------------------------
  // Empty response
  // ------------------------------------------------
  if (response.status === 204) {
    return null;
  }

  // ------------------------------------------------
  // JSON
  // ------------------------------------------------
  if (
    contentType.includes("application/json") ||
    contentType.includes("application/problem+json")
  ) {
    return await response.json();
  }

  // ------------------------------------------------
  // PDF
  // ------------------------------------------------
  if (contentType.includes("application/pdf")) {
    return await response.blob();
  }

  // ------------------------------------------------
  // CSV
  // ------------------------------------------------
  if (
    contentType.includes("text/csv") ||
    contentType.includes("application/csv")
  ) {
    return await response.blob();
  }

  // ------------------------------------------------
  // Excel
  // ------------------------------------------------
  if (
    contentType.includes("application/vnd.ms-excel") ||
    contentType.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
  ) {
    return await response.blob();
  }

  // ------------------------------------------------
  // Images
  // ------------------------------------------------
  if (contentType.startsWith("image/")) {
    return await response.blob();
  }

  // ------------------------------------------------
  // Other files
  // ------------------------------------------------
  if (
    contentType.includes("application/octet-stream") ||
    contentType.includes("application/zip") ||
    contentType.includes("application/msword") ||
    contentType.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
  ) {
    return await response.blob();
  }

  // ------------------------------------------------
  // Text
  // ------------------------------------------------
  if (
    contentType.includes("text/plain") ||
    contentType.includes("text/html")
  ) {
    const text = await response.text();

    // Prevent accidentally treating ngrok HTML as API data
    if (
      text.trim().startsWith("<!DOCTYPE html") ||
      text.trim().startsWith("<html")
    ) {
      throw new Error(
        "Expected API response but received HTML. Check the backend URL."
      );
    }

    return text;
  }

  // ------------------------------------------------
  // Fallback
  // ------------------------------------------------
  return await response.blob();
}

// ==================================================
// GET
// ==================================================

export const apiGet = (path, options = {}) =>
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
// Download helper
// ==================================================

export async function downloadFile(
  path,
  filename = "download"
) {
  const blob = await apiFetch(path);

  if (!(blob instanceof Blob)) {
    throw new Error(
      "Server did not return a downloadable file."
    );
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);

  return blob;
};

// ==================================================
// Specific downloads
// ==================================================

export const downloadPdf = (
  path,
  filename = "document.pdf"
) =>
  downloadFile(path, filename);

export const downloadCsv = (
  path,
  filename = "export.csv"
) =>
  downloadFile(path, filename);

export const downloadExcel = (
  path,
  filename = "export.xlsx"
) =>
  downloadFile(path, filename);

// ==================================================
// Default export
// ==================================================

const api = {
  API_BASE,
  apiUrl,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  apiUpload,
  downloadFile,
  downloadPdf,
  downloadCsv,
  downloadExcel,
};

export default api;
