package routes

import (
	. "collect3/backend/utils"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

type DeleteForUserPayload struct {
	UID string `json:"uid"`
	CID string `json:"cid"`
}

func DeleteForUser(c *gin.Context) {
	var payload DeleteForUserPayload
	err := c.BindJSON(&payload)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusBadRequest, "Invalid Request Body")
		return
	}

	err = DB.UnlinkContent(payload.UID, payload.CID)
	if err != nil {
		if errors.Is(err, ErrNotExists) {
			c.String(http.StatusBadRequest, "User Does Not Exist")
			return
		}
		if errors.Is(err, ErrDeleteFailed) {
			c.String(http.StatusBadRequest, "File Does Not Exist")
			return
		}
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Something Went Wrong")
		return
	}
}
