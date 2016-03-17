package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	fmt.Println("Collab Edit Running")
	go h.run()
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.HandleFunc("/ws", serveWs)
	log.Fatal(http.ListenAndServe("0.0.0.0:9090", nil))
}
