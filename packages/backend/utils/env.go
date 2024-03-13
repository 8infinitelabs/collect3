package utils

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/mdobak/go-xerrors"
)

var isEnvLoaded = false

func GetEnvVar(key string) string {
	var err error
	if !isEnvLoaded {
		err = godotenv.Load(".env")
		if err != nil {
			Logger.Error(
				xerrors.WithStackTrace(err, 0).Error(),
			)
			os.Exit(1)
		}
		isEnvLoaded = true
	}
	Logger.Info(
		fmt.Sprintf("getting %s", key),
	)

	return os.Getenv(key)
}
