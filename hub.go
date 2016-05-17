package main

import (
	l "github.com/chmelevskij/HNDGradedProject/logging"
)

// hub maintains the set of active connections and broadcasts the
// messages to active connections.
type hub struct {
	// Registered connections
	clients map[*client]bool

	// Inbound messages from the connections
	broadcast chan *Message

	// Register clients
	register chan *client

	// Unregister clients
	unregister chan *client

	// Latest message
	content *Message
}

var h = hub{
	broadcast:  make(chan *Message),
	register:   make(chan *client),
	unregister: make(chan *client),
	clients:    make(map[*client]bool),
	content:    &Message{},
}

// Run sends last message to new users,
// informs about disconnected connections
// and sends message to all of the clients
// if new message comes any of clients.
func (h *hub) run() {
	for {
		select {
		// new client connected
		case c := <-h.register:
			h.clients[c] = true
			l.Info.Println("New user connected", c)
			c.send <- h.content
			break

		// client disconnected
		case c := <-h.unregister:
			_, ok := h.clients[c]
			if ok {
				l.Info.Println("User disconnected", c)
				msg := &Message{-1, "disconnected", -1}
				h.content = msg
				l.Info.Println(msg)
				h.broadcastMessage()
				delete(h.clients, c)
				close(c.send)
			}
			break

		// incoming message
		case m := <-h.broadcast:
			h.content = m
			h.broadcastMessage()
		}
	}
}

// broadcastMessage send message to all available clients.
func (h *hub) broadcastMessage() {
	for c := range h.clients {
		select {
		// Message sent succesfully
		case c.send <- h.content:
			break
		// We can't reach the client
		default:
			close(c.send)
			delete(h.clients, c)
		}
	}
}
