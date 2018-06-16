package main

import (
	l "github.com/chmelevskij/HNDGradedProject/logging"
)

var maxChId int = 0

// channel, abastraction of the room
type channel struct {
	id            int
	clients       map[*client]bool
	activeClients map[int]*client
	content       *Message
}

func newChannel(activeClients map[int]*client) *channel {
	maxChId++
	return &channel{
		id:            maxChId,
		clients:       make(map[*client]bool),
		activeClients: activeClients,
		content:       &Message{},
	}
}

// hub maintains the set of active connections and broadcasts the
// messages to active connections.
type hub struct {
	// Registered connections
	clients map[int]*client

	// Inbound messages from the connections
	broadcast chan *Message

	// Register clients
	register chan *client

	// Unregister clients
	unregister chan *client

	// Latest message
	content *Message

	// Rooms
	channels map[int]*channel
}

var h = hub{
	broadcast:  make(chan *Message),
	register:   make(chan *client),
	unregister: make(chan *client),

	clients:  make(map[int]*client),
	channels: make(map[int]*channel),
}

// Run sends last message to new users,
// informs about disconnected connections
// and sends message to all of the clients
// if new message comes any of clients.
func (h *hub) run() {
	h.channels[0] = newChannel(h.clients)
	for {
		select {
		// new client connected
		case c := <-h.register:
			h.clients[c.id] = c
			l.Info.Println("New user connected", c)
			c.send <- h.channels[c.channel].content
			break

		// client disconnected
		case c := <-h.unregister:
			_, ok := h.clients[c.id]
			if ok {
				l.Info.Println("User disconnected", c)
				ch := h.channels[c.id]
				msg := &Message{-1, "disconnected", -1, ch.id}
				ch.content = msg
				l.Info.Println(msg)
				h.broadcastMessage()
				delete(h.clients, c.id)
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
	for _, c := range h.clients {
		select {
		// Message sent succesfully
		case c.send <- h.content:
			break
		// We can't reach the client
		default:
			close(c.send)
			delete(h.clients, c.id)
		}
	}
}
