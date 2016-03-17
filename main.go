package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	addr := "0.0.0.0:9090"
	fmt.Println("Collab Edit Running", addr)
	go h.run()
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.HandleFunc("/ws", serveWs)
	log.Fatal(http.ListenAndServe(addr, nil))
}
