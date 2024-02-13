package utils

import (
  "os"
	"fmt"

	"github.com/joho/godotenv"
)

func GetEnvVar(key string) string {
	err := godotenv.Load(".env")
  Logger.Info(
    fmt.Sprintf("getting %s", key),
  )

	if err != nil {
    Logger.Error(
      err.Error(),
      GetSlogStackTrace(err),
    );
    os.Exit(1)
	}

	return os.Getenv(key)
}
