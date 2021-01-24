package main

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

type Message struct {
	Message string `json:"message,omitempty"`
}

func Greetings(response http.ResponseWriter, request *http.Request) {
	// response.write()
	json.NewEncoder(response).Encode(Message{Message: "OK"})
}

func loadEnv() {
	err := godotenv.Load(".env")

	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	router := mux.NewRouter()
	router.HandleFunc("/", Greetings).Methods("Get")

	log.Println("loading environment")
	loadEnv()

	var port string = os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("Starting server on port: " + port)
	log.Fatal(http.ListenAndServe(":"+port, router))
}
