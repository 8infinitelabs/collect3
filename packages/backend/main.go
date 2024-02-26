package main

import (
	. "collect3/backend/routes"
	. "collect3/backend/utils"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
);

func main() {
  slog.SetDefault(Logger)
	router := gin.Default();
  //TODO: Handle properly the 401 errors
	router.GET("/ping", ping);
	router.POST("/account_exist", AccountExist);
  router.POST("/create_account", CreateAccount);
  router.POST("/create_token", CreateToken);
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
    err = db.CreateUser(1, "admin", "")
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

