package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"time"

	l "github.com/chmelevskij/HNDGradedProject/logging"
)

var maxId int = 0

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this perioc. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 1024 * 1024
)

// client class is initiated for
// every new user connected.
type client struct {
	// user id
	id int

	// Connection.
	ws *websocket.Conn

	// Receiving channel.
	send chan *Message

	// id of the room
	channel int
}

// upgrader upgrades HTTP to WebSocket.
var upgrader = websocket.Upgrader{
	ReadBufferSize:  maxMessageSize,
	WriteBufferSize: maxMessageSize,
}

// NewClient constructor for new client.
func NewClient(ws *websocket.Conn) *client {
	maxId++
	ch := make(chan *Message, maxMessageSize)
	return &client{
		id:   maxId,
		ws:   ws,
		send: ch,
	}
}

// serveWs handles upgrade requests to the server.
func serveWs(w http.ResponseWriter, r *http.Request) {

	// only GET requests can be upgraded
	if r.Method != "GET" {
		// return http response code 405
		http.Error(w, "Method not allowed", 405)
		return
	}

	// upgrade connection
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		l.Error.Println(err)
		return
	}

	// if connection was upgraded
	// create new instance of client,
	// register it with the hub and
	// launch coroutines for reading and writting
	c := NewClient(ws)

	h.register <- c
	go c.writePump()
	c.readPump()
}

// readPump listens for new messages comming through websocket.
//
// If new message is ping message it will extend deadline time of
// the connection.
// If it's a data connection it will read it and convert incoming
// JSON object to message struct which then is passed to the hub.
func (c *client) readPump() {
	// this will be executed on function exit
	defer func() {
		h.unregister <- c
		c.ws.Close()
	}()

	c.ws.SetReadLimit(maxMessageSize)
	c.ws.SetReadDeadline(time.Now().Add(pongWait))
	c.ws.SetPongHandler(func(string) error {
		c.ws.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	// empty message to be populated with incoming json
	message := Message{}

	// loop running in coroutine
	for {
		err := c.ws.ReadJSON(&message)
		message.UserId = c.id
		if err != nil {
			l.Error.Println(err)
			break
		}
		l.Info.Println(&message)
		h.broadcast <- &message
	}
}

// writePump writes message from the hub to the browser.
// Also it will send ping messages to keep connections alive
func (c *client) writePump() {
	ticker := time.NewTicker(pingPeriod)

	// this will be executed on function exit
	defer func() {
		ticker.Stop()
		c.ws.Close()
	}()

	// loop running in coroutine
	for {
		select {
		case message, ok := <-c.send:
			// if something was wrong with message close connection
			if !ok {
				c.write(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.ws.WriteJSON(message); err != nil {
				return
			}
			// if everything went fine increase life time of connection
			c.ws.SetWriteDeadline(time.Now().Add(writeWait))

		// send ping messages to connection
		case <-ticker.C:
			if err := c.write(websocket.PingMessage, []byte{}); err != nil {
				return
			}
		}
	}
}

// write convinience function to send messages.
func (c *client) write(mt int, message []byte) error {
	c.ws.SetWriteDeadline(time.Now().Add(writeWait))
	return c.ws.WriteMessage(mt, message)
}

// String allows object to be printed in human readable format
// by any function which accepts string.
func (c client) String() string {
	msg := fmt.Sprintf("Id: %d", c.id)
	return msg
}
