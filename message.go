package main

import (
	"fmt"
)

type Message struct {
	UserId int    `json:"id"`
	Type   string `json:"type"`
	Y      int    `json:"y"`
}

// Print human readable representation of the message
func (m Message) String() string {
	msg := fmt.Sprintf("%s message from user %d y: %d", m.Type, m.UserId, m.Y)
	return msg
}
