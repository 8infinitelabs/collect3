package routes

import (
	"bytes"
	. "collect3/backend/storage"
	. "collect3/backend/utils"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

type FullMetadata struct {
	Url      string `json:"url"` //url
	Title    string `json:"title"`
	Byline   string `json:"byline"` //author
	Lang     string `json:"lang"`
	Length   int    `json:"length"` //length in minutes
	Excerpt  string `json:"excerpt"`
	SiteName string `json:"siteName"`
	Content  string `json:"content"`
}

func GetUri(c *gin.Context) {
	var err error

	uid := c.Param("uid")
	nftContent, err := DB.GetNftCidByUid(uid)

	if err != nil {
		c.String(http.StatusBadRequest, "Failed to Find Content")
		return
	}

	if nftContent == (NFTContent{}) {
		c.String(http.StatusNotFound, "Content Not Found")
		return
	}

	adminUser, err := DB.GetUserByID(1)
	if err != nil {
		c.String(http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	content, err := DB.GetContentByCID(nftContent.Content_CID)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusBadRequest, "Failed to Find Content")
		return
	}

	storage, err := GetStorage(content.Storage)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	file, err := storage.DownloadFile(DownloadFilePayload{CID: content.CID, AuthToken: adminUser.Token})

	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed to Get File")
		return
	}

	file = strings.ReplaceAll(file, "\\\\", "\\")

	quote := []byte{'"'}
	trimmedData := bytes.TrimPrefix(bytes.TrimSuffix([]byte(file), quote), quote)

	var metadata FullMetadata
	err = json.Unmarshal(trimmedData, &metadata)

	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed to Get File")
		return
	}

	c.JSON(http.StatusOK, metadata)
}
