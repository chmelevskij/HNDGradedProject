package main

import (
	"fmt"
	"time"
)

func main() {
	ticker := time.NewTicker(time.Duration(1) * time.Second)
	for {
		select {
		case r := <-ticker.C:
			fmt.Println(r)
		}
	}
}
