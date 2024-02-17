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
  router.POST("/download", DownloadFile);

  db, err := OpenDB("sqlite3", "./db/local.db")
  if err != nil {
    Logger.Error(
      "Failed To Open DB",
      slog.String(
        "Details",
        err.Error(),
      ),
    )
    os.Exit(1)
  }

  //this can panic on error
  db.Migrate()

  user, err := db.GetUserByID(1)
  if err != nil {
    Logger.Error(
      "Failed to get the id 1 account",
      slog.String(
        "Details",
        err.Error(),
      ),
    )
    os.Exit(1)
  }

  if user == (User{}) {
    //s5-node admin account
    err = db.CreateUser(User{ID: 1, UID: "admin"})
    if err != nil {
      Logger.Error(
        "Failed to create the id 1 account",
        slog.String(
          "Details",
          err.Error(),
        ),
      )
      os.Exit(1)
    }
  }

  err = router.Run("localhost:8080");
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
