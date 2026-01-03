package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

// root safe main.go
// The Go server exists only to serve static frontend files and provide a minimal API for demonstrating HTTP functionality.
//  All application logic lives in the JavaScript framework.

type Todo struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Active    bool   `json:"active"`
	Completed bool   `json:"completed"`
	Deleted   bool   `json:"deleted"`
}

var todos = []Todo{
	{ID: 1, Title: "Take dog for a walk", Active: true, Completed: false, Deleted: false},
	{ID: 2, Title: "Buy groceries", Active: true, Completed: false, Deleted: false},
}

func main() {
	mux := http.NewServeMux()

	// API
	mux.HandleFunc("/api/todos", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(todos)
	})

	// Static serving
	mux.Handle("/example/",
		http.StripPrefix("/example/",
			http.FileServer(http.Dir("./example")),
		),
	)

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
