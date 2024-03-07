package storage

import (
	"bytes"
	. "collect3/backend/utils"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
)

type s5 struct {
	api_key string
}

func GetS5(apiKey string) s5 {
	return s5{api_key: apiKey}
}

func (storage s5) UploadFile(payload UploadFilePayload) (UploadFileResponse, error) {
	var response UploadFileResponse
	var body bytes.Buffer
	var writer *multipart.Writer
	var err error

	writer = multipart.NewWriter(&body)
	part, err := writer.CreateFormFile("file", "article.txt")
	if err != nil {
		return UploadFileResponse{}, ErrorFailedToParseFile
	}
	_, err = io.Copy(part, bytes.NewBufferString(payload.File))

	if err != nil {
		return UploadFileResponse{}, ErrorFailedToReadFile
	}

	writer.Close()

	url := fmt.Sprintf("http://localhost:5050/s5/upload?auth_token=%s", payload.AuthToken)
	req, err := http.NewRequest(http.MethodPost, url, &body)
	if err != nil {
		return UploadFileResponse{}, ErrorFailedToCreateClient
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	res, err := http.DefaultClient.Do(req)

	if err != nil {
		return UploadFileResponse{}, ErrorFailedToUploadFile
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
		if res.StatusCode == http.StatusBadRequest {
			return UploadFileResponse{}, ErrorBadRequest
		}
		if res.StatusCode == http.StatusUnauthorized {
			return UploadFileResponse{}, ErrorUnauthorized
		}
		return UploadFileResponse{}, ErrorNonOkay
	}

	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		return UploadFileResponse{}, ErrorFailedToReadResponse
	}
	return response, nil
}

func (storage s5) DownloadFile(payload DownloadFilePayload) (string, error) {
	url := fmt.Sprintf("http://localhost:5050/s5/download/%s?auth_token=%s", payload.CID, payload.AuthToken)
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return "", ErrorFailedToCreateClient
	}

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", ErrorFailedToDownloadFile
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
		if res.StatusCode == http.StatusUnauthorized {
			return "", ErrorUnauthorized
		}
		if res.StatusCode == http.StatusNotFound {
			return "", ErrorNotFound
		}
		return "", ErrorNonOkay
	}

	defer res.Body.Close()

	file, err := io.ReadAll(res.Body)

	if err != nil {
		return "", ErrorFailedToReadFile
	}

	return string(file), nil
}
