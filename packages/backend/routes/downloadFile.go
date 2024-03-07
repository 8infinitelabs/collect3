package routes

import (
	. "collect3/backend/storage"
	. "collect3/backend/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

func DownloadFile(c *gin.Context) {
	var payload DownloadFilePayload
	var err error
	var file string
	storageOption := c.Param("storage")

	err = c.BindJSON(&payload)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusBadRequest, "Invalid Request Body")
		return
	}

	storage := GetStorage(storageOption)

	file, err = storage.DownloadFile(payload)

	if err != nil {
		if errors.Is(err, ErrorFailedToCreateClient) {
			Logger.Error(
				xerrors.WithStackTrace(err, 0).Error(),
			)
			c.String(http.StatusInternalServerError, "Failed To Download File")
			return
		}

		if errors.Is(err, ErrorFailedToDownloadFile) {
			Logger.Error(
				xerrors.WithStackTrace(err, 0).Error(),
			)
			c.String(http.StatusInternalServerError, "Failed To Download File")
			return
		}

		if errors.Is(err, ErrorUnauthorized) {
			c.String(http.StatusUnauthorized, "Unauthorized")
			return
		}
		if errors.Is(err, ErrorNotFound) {
			c.String(http.StatusNotFound, "File Not Found")
			return
		}
		if errors.Is(err, ErrorNonOkay) {
			c.String(http.StatusInternalServerError, "Failed To Download File")
			return
		}

		if errors.Is(err, ErrorFailedToReadFile) {
			Logger.Error(
				xerrors.WithStackTrace(err, 0).Error(),
			)
			c.String(http.StatusInternalServerError, "Failed To Read File")
			return
		}
		c.String(http.StatusInternalServerError, "Failed To Download File")
		return
	}

	c.String(http.StatusAccepted, file)
}
