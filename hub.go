package main

// hub maintains the set of active connections and broadcasts the
// messages to active connections
type hub struct {
	// Registered connections
	clients map[*client]bool

	// Inbound messages from the connections
	broadcast chan string

	// Register clients
	register chan *client

	// Unregister clients
	unregister chan *client

	// Coloboration bit
	content string
}

var h = hub{
	broadcast:  make(chan string),
	register:   make(chan *client),
	unregister: make(chan *client),
	clients:    make(map[*client]bool),
	content:    "",
}

func (h *hub) run() {
	for {
		select {
		case c := <-h.register:
			h.clients[c] = true
			c.send <- []byte(h.content)
			break
		case c := <-h.unregister:
			_, ok := h.clients[c]
			if ok {
				delete(h.clients, c)
				close(c.send)
			}
			break
		case m := <-h.broadcast:
			h.content = m
			h.broadcastMessage()
		}
	}
}

func (h *hub) broadcastMessage() {
	for c := range h.clients {
		select {
		case c.send <- []byte(h.content):
			break
		// We can't reach the client
		default:
			close(c.send)
			delete(h.clients, c)
		}
	}
}
