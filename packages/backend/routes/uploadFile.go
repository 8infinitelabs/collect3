package routes

import (
	"bytes"
	. "collect3/backend/utils"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
  "errors"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

type UploadFilePayload struct {
  UID       string `json:"uid"`
	AuthToken string `json:"auth_token"`
	File      string `json:"file"`
}

type UploadFileResponse struct {
	CID string `json:"cid"`
}

func UploadFile(c *gin.Context) {
	var payload UploadFilePayload
	var response UploadFileResponse
	var body bytes.Buffer
	var err error
  var writer *multipart.Writer

	err = c.BindJSON(&payload)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusBadRequest, "Invalid Request Body")
		return
	}
  writer = multipart.NewWriter(&body)
  part, err := writer.CreateFormFile("file", "article.txt")
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed to Parse File")
		return
	}
  _, err = io.Copy(part, bytes.NewBufferString(payload.File))
  if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed to Read File")
		return
	}
	writer.Close()

	url := fmt.Sprintf("http://localhost:5050/s5/upload?auth_token=%s", payload.AuthToken)
	req, err := http.NewRequest(http.MethodPost, url, &body)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed To Upload File")
		return
	}
  req.Header.Set("Content-Type", writer.FormDataContentType())

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed To Upload File")
		return
	}
	if res.StatusCode != http.StatusOK {
		defer res.Body.Close()
		bodyBytes, err := io.ReadAll(res.Body)
		var bodyString = ""
		if err == nil {
			bodyString = string(bodyBytes)
		}
		Logger.Error(
			fmt.Sprintf("Failed To Upload File, Status %d", res.StatusCode),
			slog.String(
				"Response.Body",
				bodyString,
			),
		)
		if res.StatusCode == 400 {
			c.String(res.StatusCode, "This File May Already Exist")
      return
		}
    if res.StatusCode == http.StatusUnauthorized {
			c.String(res.StatusCode, "Invalid Token")
      return
		}
		c.String(res.StatusCode, "Something Went Wrong")
		return
	}

	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(res.StatusCode, "Failed to read response")
		return
	}
  
  err = DB.UploadContent(payload.UID, response.CID);
  if err != nil {
    if errors.Is(err, ErrDuplicate) {
	    c.JSON(http.StatusOK, gin.H{"cid": response.CID})
      return
    }
		Logger.Error(
      "Failed To Insert CID In DB",
      slog.String(
        "Details",
        xerrors.WithStackTrace(err, 0).Error(),
      ),
		)
		c.String(http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	c.JSON(http.StatusOK, gin.H{"cid": response.CID})
}
