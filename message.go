package main

import (
	"fmt"
)

// Message for clients to communicate.
type Message struct {
	UserId  int    `json:"id"`
	Type    string `json:"type"`
	Y       int    `json:"y"`
	Channel int    `json:"channel"`
}

// String allows object to be printed in human readable format
// by any function which accepts string.
func (m Message) String() string {
	msg := fmt.Sprintf("%s message from user %d y: %d", m.Type, m.UserId, m.Y)
	return msg
}
