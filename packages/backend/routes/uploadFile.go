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
	"net/textproto"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

type UploadFilePayload struct {
	AuthToken string `json:"auth_token"`
	File      string `json:"file"`
}

type UploadFileResponse struct {
	Cid string `json:"cid"`
}

func UploadFile(c *gin.Context) {
	var payload UploadFilePayload
	var response UploadFileResponse
	var body bytes.Buffer
	var err error
	metadata := `{"name": "filename.c3"}`
	metadataHeader := textproto.MIMEHeader{}
	metadataHeader.Set("Content-Type", "application/json; charset=UTF-8")

	writer := multipart.NewWriter(&body)
	metadataPart, err := writer.CreatePart(metadataHeader)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Internal Server Error")
		return
	}
	_, err = metadataPart.Write([]byte(metadata))
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Internal Server Error")
		return
	}

	err = c.BindJSON(&payload)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusBadRequest, "Invalid Request Body")
		// c.AbortWithError(http.StatusBadRequest, err);
		return
	}

	file := strings.NewReader(payload.File)
	fileHeader := textproto.MIMEHeader{}
	fileHeader.Set("Content-Type", "text/c3; charset=UTF-8")
	filePart, err := writer.CreatePart(fileHeader)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Internal Server Error")
		return
	}
	_, err = io.Copy(filePart, file)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Internal Server Error")
		return
	}
	writer.Close()

	url := fmt.Sprintf("http://localhost:5050/s5/upload?auth_token=%s", payload.AuthToken)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body.Bytes()))
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed To Upload File")
		return
	}
	//contentType := fmt.Sprintf("multipart/form-data; boundary=%s", writer.Boundary());
	//req.Header.Set("Content-Type", contentType)
  //Content-Length must be the total number of bytes in the request body.
	//req.Header.Set("Content-Length", fmt.Sprintf("%d", body.Len()))

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
		}
		c.String(res.StatusCode, "Something Went Wrong")
		return
	}

	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(res.StatusCode, "Something Went Wrong")
		return
	}

	c.JSON(http.StatusOK, gin.H{"cid": response.Cid})
}
