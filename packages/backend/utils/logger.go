package utils

import (
  "os"
  "log/slog"
)

var handler *slog.JSONHandler = slog.NewJSONHandler(os.Stdout, nil)
var Logger *slog.Logger = slog.New(handler)

