package main

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"log"
	"net/http"
)

type Message struct {
	Message string `json:"message,omitempty"`
}

func Greetings(response http.ResponseWriter, request *http.Request) {
	// response.write()
	json.NewEncoder(response).Encode(Message{Message: "OK"})
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/", Greetings).Methods("Get")

	port := "8080"

	log.Println("Starting server on port: " + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
