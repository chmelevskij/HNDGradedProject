package main

import (
	"log"
	"os"
)

var (
	Info  *log.Logger
	Error *log.Logger
)

func init() {
	infoLog, err := os.Create("info.log")
	if err != nil {
		log.Println(err)
	}
	Info = log.New(infoLog, "[INFO]: ", log.LstdFlags|log.Lshortfile)

	errorLog, err := os.Create("error.log")
	Error = log.New(errorLog, "[ERROR]: ", log.LstdFlags|log.Lshortfile)
}

func main() {
	log.Println("this is test")
	log.Println("this is test")
	log.Println("this is test")
	log.Println("this is test")
	log.Println("this is test")
	Info.Println("some useful info")
	Info.Println("some useful info")
	Info.Println("some useful info")
	Info.Println("some useful info")
	Error.Println("some error info")
	Error.Println("some error info")
	Error.Println("some error info")
	Error.Println("some error info")
}
