package main

// Server which acts as middle man when passing messages
type Server struct {
	players    [*Player]bool
	register   chan *Player
	unregister chan *Player
	send       chan *Message
}

func (s *Server) run() {
	for {
		select {
		case player := <-server.register:
			server.players[*player] = true
		case player := <-server.unregister:
			if _, ok := server.players[player]; ok {
			}
		}
	}
}
