package main

import (
	"fmt"
	"mime/multipart"
	"net/http"
  "strings"
  "bytes"
  "net/textproto"
  "io"
  "log/slog"
  "os"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
	"github.com/joho/godotenv"
);

type CreateAccountPayload struct {
	Id string `json:"id"`;
}

type UploadFilePayload struct {
	AuthToken   string `json:"auth_token"`;
  File        string `json:"file"`;
}

var handler *slog.JSONHandler = slog.NewJSONHandler(os.Stdout, nil)
var logger *slog.Logger = slog.New(handler)

func getStackTrace(err error) (xerrors.Frame) {
  stack := xerrors.StackTrace(
    err,
  )
  frame := stack.Frames()
  if len(frame) > 0 {
    return frame[0]
  }
  return xerrors.Frame{}
}
func getSlogStackTrace(err error) slog.Attr {
  return slog.Any("StackTrace", getStackTrace(err))
}

func getEnvVar(key string) string {
	err := godotenv.Load(".env")
  logger.Info(
    fmt.Sprintf("getting %s", key),
  )

	if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    );
    os.Exit(1)
	}

	return os.Getenv(key)
}

func main() {
  slog.SetDefault(logger)
	router := gin.Default();
	router.GET("/ping", ping);
  router.POST("/create_account", createAccount);
  router.POST("/upload", uploadFile);

  err := router.Run("localhost:8080");
	if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    );
    os.Exit(1)
	}
}

func ping(c *gin.Context) {
	c.String(http.StatusOK, "pong");
}

func createAccount(c *gin.Context) {
  var payload CreateAccountPayload;

	err := c.BindJSON(&payload);
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusBadRequest, "Invalid Request Body");
		return;
	}

  var url = fmt.Sprintf(
    "http://localhost:5050/s5/admin/accounts?email=%s@hotmail.com",
    payload.Id,
  );

  req, err := http.NewRequest(http.MethodPost, url, nil);
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Failed To Create Account");
		return;
	}

  req.Header.Add(
    "Authorization",
    fmt.Sprintf(
      "Bearer %s",
      getEnvVar("ADMIN_S5_KEY"),
    ),
  );
  res, err := http.DefaultClient.Do(req);
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Failed To Create Account");
		return;
	}

  if res.StatusCode != http.StatusOK {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(res.StatusCode, "Something Went Wrong");
    return;
  }

  c.String(http.StatusOK, "Account Created");
}

func uploadFile(c *gin.Context) {
  var payload UploadFilePayload;
  var body bytes.Buffer;
  var err error;
  metadata := `{"name": "filename.c3"}`;
  metadataHeader := textproto.MIMEHeader{};
  metadataHeader.Set("Content-Type", "application/json; charset=UTF-8");

  writer := multipart.NewWriter(&body);
  metadataPart, err := writer.CreatePart(metadataHeader);
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Internal Server Error");
    return;
  }
  _, err = metadataPart.Write([]byte(metadata));
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Internal Server Error");
    return;
  }

  err = c.BindJSON(&payload);
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusBadRequest, "Invalid Request Body");
    // c.AbortWithError(http.StatusBadRequest, err);
    return;
  }

  file := strings.NewReader(payload.File)
  fileHeader := textproto.MIMEHeader{}
	fileHeader.Set("Content-Type", "text/c3; charset=UTF-8")
  filePart, err := writer.CreatePart(fileHeader);
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Internal Server Error");
    return;
  }
  _, err = io.Copy(filePart, file);
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Internal Server Error");
    return;
  }
  writer.Close();

  url := fmt.Sprintf("http://localhost:5050/s5/upload?auth_token=%s", payload.AuthToken);
  req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body.Bytes()));
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Failed To Create Account");
		return;
	}
  contentType := fmt.Sprintf("multipart/form-data; boundary=%s", writer.Boundary());
  req.Header.Set("Content-Type", contentType)
	// Content-Length must be the total number of bytes in the request body.
	req.Header.Set("Content-Length", fmt.Sprintf("%d", body.Len()))

  res, err := http.DefaultClient.Do(req);
  if err != nil {
    logger.Error(
      err.Error(),
      getSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Failed To Upload File");
		return;
	}
  if res.StatusCode != http.StatusOK {
    defer res.Body.Close()
    bodyBytes, err := io.ReadAll(res.Body)
    var bodyString = ""
    if err == nil {
        bodyString = string(bodyBytes)
    }
    logger.Error(
      fmt.Sprintf("Failed To Upload File, Status %d", res.StatusCode),
      getSlogStackTrace(
        xerrors.New("Error"),
      ),
      slog.String(
        "Response.Body",
        bodyString,
      ),
    )
    if (res.StatusCode == 400) {
      c.String(res.StatusCode, "This File May Already Exist");
    }
    c.String(res.StatusCode, "Something Went Wrong");
    return;
  }

  c.String(http.StatusOK, "File Uploaded");
}
