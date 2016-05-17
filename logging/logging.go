// Package logging is utility package which creates
// log files in logging directory. It's mainly used
// for debugging so files only hold logs from the last
// execution of the app.
package logging

import (
	"log"
	"os"
)

// Different levels of loggers.
var (
	// General info of the system.
	Info *log.Logger

	// This will be used if something goes wrong.
	Error *log.Logger
)

func init() {
	// Create and assign file for INFO logs
	infoLog, err := os.Create("./logging/info.log")
	check(err)
	Info = log.New(infoLog, "[INFO]: ", log.Ltime|log.Lshortfile)

	// Create and assign file for ERROR logs
	errorLog, err := os.Create("./logging/error.log")
	check(err)
	Error = log.New(errorLog, "[ERROR]: ", log.Ltime|log.Lshortfile)
}

// check if error occured, if yes log to stdout and exit.
func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
