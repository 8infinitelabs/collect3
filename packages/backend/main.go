package main

import (
	. "collect3/backend/routes"
	. "collect3/backend/storage"
	. "collect3/backend/utils"
	"log/slog"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

var db_connection = GetEnvVar("DB_CONNECTION")
var host = GetEnvVar("HOST")
var port = GetEnvVar("PORT")
var gin_realease = GetEnvVar("GIN_RELEASE")

func main() {
	slog.SetDefault(Logger)
	if gin_realease == "true" {
		gin.SetMode(gin.ReleaseMode)
	}
	key := GetEnvVar("NFT_STORAGE_API_KEY")
	if key != "" {
		SetFileCoinApiKey(key)
	}
	key = GetEnvVar("ADMIN_S5_KEY")

	if key == "" {
		Logger.Error("No S5 Key")
		panic("No S5 Key")
	}
	SetS5ApiKey(key)

	router := gin.Default()
	//TODO: Handle properly the 401 errors
	router.GET("/ping", ping)
	router.GET("/:storage/available", IsStorageAvailable)
	router.POST("/account_exist", AccountExist)
	router.POST("/create_account", CreateAccount)
	router.POST("/create_token", CreateToken)
	router.POST("/:storage/upload", UploadFile)
	router.POST("/:storage/download", DownloadFile)
	router.POST("/delete", DeleteForUser)

	db, err := OpenDB("sqlite3", db_connection)
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

	err = router.Run(host + ":" + port)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		os.Exit(1)
	}
}

func ping(c *gin.Context) {
	c.String(http.StatusOK, "pong")
}
