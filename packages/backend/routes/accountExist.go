package routes

import (
	. "collect3/backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

func AccountExist(c *gin.Context) {
	var payload CreateAccountPayload

	err := c.BindJSON(&payload)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusBadRequest, "Invalid Request Body")
		return
	}

	user, err := DB.GetUserByUID(payload.UID)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	if user == (User{}) {
		c.JSON(http.StatusOK, gin.H{"exist": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"exist": true})
}
