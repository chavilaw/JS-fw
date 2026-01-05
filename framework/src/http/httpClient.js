// framework/src/http/httpClient.jsgi
// A very small HTTP client for the framework.


export function createHTTPClient(options = {}) {
  const baseURL = options.baseURL || "";

  async function request(method, path, data) {
    const response = await fetch(baseURL + path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    // Try to read JSON, fall back to text
    const contentType = response.headers.get("content-type") || "";
    const result =
      contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${JSON.stringify(result)}`
      );
    }

    return result;
  }

  return {
    get(path) {
      return request("GET", path);
    },

    post(path, data) {
      return request("POST", path, data);
    },
  };
}

// It wraps the browser's fetch API so applications do not call fetch directly.
// Instead, applications create an HTTP client with a base URL (for example "/api")
// and use simple methods like get() and post().
/* So basically instead of writing:

fetch("/api/todos")


You write:

api.get("/todos")


This keeps HTTP logic in one place and allows the framework to handle
JSON parsing and errors in a consistent way. */