package main

import (
	// Standard library
	"net/http"

	// My packages
	l "github.com/chmelevskij/HNDGradedProject/logging"
)

func main() {
	addr := "0.0.0.0:9090"
	l.Info.Println("Websocket Running", addr)
	go h.run()
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.HandleFunc("/ws", serveWs)
	l.Error.Fatal(http.ListenAndServe(addr, nil))
}
