package routes

import (
	. "collect3/backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

type UriToFilePayload struct {
	UID string `json:"uid"`
	CID string `json:"cid"`
}

func SetUriToFile(c *gin.Context) {
	var payload UriToFilePayload
	var err error

	err = c.BindJSON(&payload)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusBadRequest, "Invalid Request Body")
		return
	}

	content, err := DB.GetContentByCID(payload.CID)

	if err != nil {
		c.String(http.StatusBadRequest, "Failed to Find Content")
		return
	}

	if content == (Content{}) {
		c.String(http.StatusNotFound, "Content Not Found")
		return
	}

	err = DB.SetNftUid(payload.UID, content.CID)

	if err != nil {
		c.String(http.StatusBadRequest, "Failed to Save UID")
		return
	}

	c.String(http.StatusOK, "UID Saved Correctly")
}
