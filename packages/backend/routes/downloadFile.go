package routes

import (
  "fmt"
	"net/http"
  "io"
  //"encoding/json"
  "log/slog"
  . "collect3/backend/utils"

  "github.com/mdobak/go-xerrors"
	"github.com/gin-gonic/gin"
)

type DownloadFilePayload struct {
  Cid string `json:"cid"`;
  AuthToken string `json:"auth_token"`;
}

func DownloadFile(c *gin.Context) {
  var payload DownloadFilePayload;
  var err error;

  err = c.BindJSON(&payload);
  if err != nil {
    Logger.Error(
      xerrors.WithStackTrace(err, 0).Error(),
    )
    c.String(http.StatusBadRequest, "Invalid Request Body");
    return;
  }

  url := fmt.Sprintf("http://localhost:5050/s5/download/%s?auth_token=%s", payload.Cid, payload.AuthToken);
  req, err := http.NewRequest(http.MethodGet, url, nil);
  if err != nil {
    Logger.Error(
      xerrors.WithStackTrace(err, 0).Error(),
    )
    c.String(http.StatusInternalServerError, "Failed To Download File");
		return;
	}

  res, err := http.DefaultClient.Do(req);
  if err != nil {
    Logger.Error(
      xerrors.WithStackTrace(err, 0).Error(),
    )
    c.String(http.StatusInternalServerError, "Failed To Download File");
		return;
	}
  if res.StatusCode != http.StatusOK {
    defer res.Body.Close()
    bodyBytes, err := io.ReadAll(res.Body)
    var bodyString = ""
    if err == nil {
        bodyString = string(bodyBytes)
    }
    Logger.Error(
      fmt.Sprintf("Failed To Download File, Status %d", res.StatusCode),
      slog.String(
        "Response.Body",
        bodyString,
      ),
    )
    c.String(res.StatusCode, "Failed To Download File");
    return;
  }

  defer res.Body.Close();

  file, err := io.ReadAll(res.Body);
  

  //err = json.NewDecoder(res.Body).Decode(&response);
  if err != nil {
    Logger.Error(
      xerrors.WithStackTrace(err, 0).Error(),
    )
    c.String(res.StatusCode, "Something Went Wrong");
    return
  }

  //c.JSON(http.StatusOK, gin.H{"cid": response.Cid});
  c.String(http.StatusAccepted, string(file));
}
