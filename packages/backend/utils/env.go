package utils

import (
  "os"
	"fmt"

	"github.com/joho/godotenv"
	"github.com/mdobak/go-xerrors"
)

func GetEnvVar(key string) string {
	err := godotenv.Load(".env")
  Logger.Info(
    fmt.Sprintf("getting %s", key),
  )

	if err != nil {
    Logger.Error(
      xerrors.WithStackTrace(err, 0).Error(),
    );
    os.Exit(1)
	}

	return os.Getenv(key)
}
