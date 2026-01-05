package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// The Go server exists only to serve static frontend files and provide a minimal API for demonstrating HTTP functionality.
//  All application logic lives in the JavaScript framework.

func main() {
	mux := http.NewServeMux()

	// API
	mux.HandleFunc("/api/todo", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		_ = json.NewEncoder(w).Encode(map[string]any{
			"message":  "Hello from API",
			"features": []string{"HTTP client", "State store", "Routing", "Event delegation"},
		})
	})

	mux.HandleFunc("/example/", func(w http.ResponseWriter, r *http.Request) {
		rel := strings.TrimPrefix(r.URL.Path, "/example/")
		localPath := filepath.Join("example", rel)

		// If requested file exists, serve it
		if _, err := os.Stat(localPath); err == nil {
			http.ServeFile(w, r, localPath)
			return
		}

		// Otherwise serve SPA entry (index.html)
		http.ServeFile(w, r, filepath.Join("example", "index.html"))
	})

	mux.Handle("/framework/",
		http.StripPrefix("/framework/",
			http.FileServer(http.Dir("./framework")),
		),
	)

	// Redirect root to example
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		http.Redirect(w, r, "/example/", http.StatusFound)
	})

	addr := ":8080"
	log.Println("Running on http://localhost" + addr)
	log.Println("Example app: http://localhost:8080/example/")
	log.Println("Framework docs: http://localhost:8080/framework/")
	log.Fatal(http.ListenAndServe(addr, logRequests(mux)))
}

// logs the incoming HTTP requests
func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s (%s)", r.Method, r.URL.Path, time.Since(start))
	})
}
