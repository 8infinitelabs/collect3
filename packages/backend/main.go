package main

import (
	"net/http"
  "log/slog"
  "os"
  . "collect3/backend/routes"
  . "collect3/backend/utils"

	"github.com/gin-gonic/gin"
);

func main() {
  slog.SetDefault(Logger)
	router := gin.Default();
	router.GET("/ping", ping);
  router.POST("/create_account", CreateAccount);
  router.POST("/upload", UploadFile);

  err := router.Run("localhost:8080");
	if err != nil {
    Logger.Error(
      err.Error(),
      GetSlogStackTrace(err),
    );
    os.Exit(1)
	}
}

func ping(c *gin.Context) {
	c.String(http.StatusOK, "pong");
}

