package main

import (
	// Standard library
	"encoding/json"
	"log"
	"net/http"

	// Third party packages
	"github.com/gorilla/websocket"
)

var maxId = 0
var upgrader = websocket.Upgrader{}

var server = Server{
	make(map[*Player]bool),
	make(chan *Player),
	make(chan *Player),
	make(chan *Message),
}

func main() {
}

// Message which represents snapshot of the player
type Message struct {
	id           int `json:"id"`
	acceleration int `json:"acceleration"`
}

// Player structure on the server side
type Player struct {
	id int
	ws *websocket.Conn
	ch chan *Message
}

func NewPlayer(ws *websocket.Conn) *Player {
	maxId++
	channel := make(chan *Message)
	return &Player{maxId, ws, channel}
}

func serveWebSocket(w http.ResponseWriter, r *http.Request) error {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
	}
	player := NewPlayer(ws)
	server.register <- player
}
