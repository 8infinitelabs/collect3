package main

import (
	"net/http"
  "log/slog"
  "os"
  . "collect3/backend/routes"
  . "collect3/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
);

func main() {
  slog.SetDefault(Logger)
	router := gin.Default();
	router.GET("/ping", ping);
  router.POST("/create_account", CreateAccount);
  router.POST("/upload", UploadFile);
  router.GET("/download", DownloadFile);

  err := router.Run("localhost:8080");
	if err != nil {
    Logger.Error(
      xerrors.WithStackTrace(err, 0).Error(),
    );
    os.Exit(1)
	}
}

func ping(c *gin.Context) {
	c.String(http.StatusOK, "pong");
}

