 // src/api.js

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://quizappbackend-xngu.onrender.com";

// --------------------------------------------------
// Build URL
// --------------------------------------------------
export const apiUrl = (path = "") => {
  if (!path) return API_BASE;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
};

// --------------------------------------------------
// Common request helper
// --------------------------------------------------
async function request(path, options = {}) {
  const url = apiUrl(path);

  const response = await fetch(url, {
    ...options,

    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),

      ...(options.headers || {}),
    },
  });

  // Get content type before deciding how to parse
  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

  // ------------------------------------------------
  // Handle errors
  // ------------------------------------------------
  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      if (contentType.includes("application/json")) {
        const data = await response.json();
        message = data.message || data.error || message;
      } else {
        const text = await response.text();

        // ngrok sometimes returns HTML instead of your API response
        if (text.includes("ngrok")) {
          message =
            "Backend is unreachable through the current tunnel. " +
            "Please check that the backend/ngrok server is running.";
        } else if (text) {
          message = text.substring(0, 300);
        }
      }
    } catch {
      // Keep default message
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
    return response.json();
  }

  // ------------------------------------------------
  // PDF
  // ------------------------------------------------
  if (contentType.includes("application/pdf")) {
    return response.blob();
  }

  // ------------------------------------------------
  // CSV / Excel
  // ------------------------------------------------
  if (
    contentType.includes("text/csv") ||
    contentType.includes("application/csv") ||
    contentType.includes("application/vnd.ms-excel") ||
    contentType.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
  ) {
    return response.blob();
  }

  // ------------------------------------------------
  // Images
  // ------------------------------------------------
  if (contentType.startsWith("image/")) {
    return response.blob();
  }

  // ------------------------------------------------
  // Other files
  // ZIP, DOCX, etc.
  // ------------------------------------------------
  if (
    contentType.includes("application/octet-stream") ||
    contentType.includes("application/zip") ||
    contentType.includes("application/msword") ||
    contentType.includes(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
  ) {
    return response.blob();
  }

  // ------------------------------------------------
  // HTML / text
  // ------------------------------------------------
  if (
    contentType.includes("text/html") ||
    contentType.includes("text/plain")
  ) {
    const text = await response.text();

    // Don't silently treat ngrok HTML as API JSON
    if (text.trim().startsWith("<!DOCTYPE html") || text.includes("<html")) {
      throw new Error(
        "Backend returned an HTML page instead of an API response. " +
          "Check the API URL and backend/ngrok configuration."
      );
    }

    return text;
  }

  // ------------------------------------------------
  // Fallback
  // ------------------------------------------------
  return response.blob();
}

// ==================================================
// GET
// ==================================================
export const apiGet = (path, options = {}) => {
  return request(path, {
    method: "GET",
    ...options,
  });
};

// ==================================================
// POST JSON
// ==================================================
export const apiPost = (path, body = {}, options = {}) => {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });
};

// ==================================================
// PUT JSON
// ==================================================
export const apiPut = (path, body = {}, options = {}) => {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
};

// ==================================================
// PATCH JSON
// ==================================================
export const apiPatch = (path, body = {}, options = {}) => {
  return request(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });
};

// ==================================================
// DELETE
// ==================================================
export const apiDelete = (path, options = {}) => {
  return request(path, {
    method: "DELETE",
    ...options,
  });
};

// ==================================================
// POST FormData
// Useful for image/file uploads
// ==================================================
export const apiUpload = (path, formData, options = {}) => {
  if (!(formData instanceof FormData)) {
    throw new Error("apiUpload requires a FormData object.");
  }

  return request(path, {
    method: "POST",
    body: formData,
    ...options,
  });
};

// ==================================================
// Download helper
// ==================================================
export async function downloadFile(path, filename, options = {}) {
  const blob = await request(path, options);

  if (!(blob instanceof Blob)) {
    throw new Error("Server did not return a downloadable file.");
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "download";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);

  return blob;
}

// ==================================================
// Download PDF
// ==================================================
export const downloadPdf = (path, filename = "registration-card.pdf") => {
  return downloadFile(path, filename);
};

// ==================================================
// Download CSV
// ==================================================
export const downloadCsv = (path, filename = "export.csv") => {
  return downloadFile(path, filename);
};

// ==================================================
// Download Excel
// ==================================================
export const downloadExcel = (
  path,
  filename = "export.xlsx"
) => {
  return downloadFile(path, filename);
};

// ==================================================
// Download generic file
// ==================================================
export const download = downloadFile;

// ==================================================
// Export API base
// ==================================================
export { API_BASE };

// Default export
const api = {
  API_BASE,
  apiUrl,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  upload: apiUpload,
  download,
  downloadFile,
  downloadPdf,
  downloadCsv,
  downloadExcel,
};

export default api;
