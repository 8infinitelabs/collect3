package utils

import (
  "os"
  "log/slog"

	"github.com/mdobak/go-xerrors"
)

var handler *slog.JSONHandler = slog.NewJSONHandler(os.Stdout, nil)
var Logger *slog.Logger = slog.New(handler)

func GetStackTrace(err error) (xerrors.Frame) {
  stack := xerrors.StackTrace(
    err,
  )
  frame := stack.Frames()
  if len(frame) > 0 {
    return frame[0]
  }
  return xerrors.Frame{}
}
func GetSlogStackTrace(err error) slog.Attr {
  return slog.Any("StackTrace", GetStackTrace(err))
}
