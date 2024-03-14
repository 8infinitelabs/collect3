package routes

import (
	. "collect3/backend/utils"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/mdobak/go-xerrors"
)

type CreateTokenPayload struct {
	UID string `json:"uid"`
}

type CreateTokenResponse struct {
	AuthToken string `json:"auth_token"`
}

func FetchNewToken(id int64, c *gin.Context) (string, error) {
	var tokenResponse CreateTokenResponse
	s5Key := GetEnvVar("ADMIN_S5_KEY")
	url := fmt.Sprintf(
		"http://localhost:5050/s5/admin/accounts/new_auth_token?id=%d",
		id,
	)

	req, err := http.NewRequest(http.MethodPost, url, nil)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed To Create Auth Token")
		return "", err
	}

	req.Header.Add(
		"Authorization",
		fmt.Sprintf(
			"Bearer %s",
			s5Key,
		),
	)
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Failed To Create Auth Token")
		return "", err
	}

	if res.StatusCode != http.StatusOK {
		defer res.Body.Close()
		bodyBytes, err := io.ReadAll(res.Body)
		var bodyString = ""
		if err == nil {
			bodyString = string(bodyBytes)
		}
		Logger.Error(
			fmt.Sprintf("Failed To Create Auth Token, Status %d", res.StatusCode),
			slog.Any(
				"StackTrace",
				xerrors.WithStackTrace(
					xerrors.New("Error"),
					0,
				).Error(),
			),
			slog.String(
				"Response.Body",
				bodyString,
			),
		)
		c.String(res.StatusCode, "Something Went Wrong")
		fmt.Println(res)
		return "", err
	}

	err = json.NewDecoder(res.Body).Decode(&tokenResponse)
	if err != nil {
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(res.StatusCode, "Something Went Wrong")
		return "", err
	}
	return tokenResponse.AuthToken, nil
}

func CreateToken(c *gin.Context) {
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
		c.String(http.StatusNotFound, "User Not Found")
		return
	}

	token, err := FetchNewToken(user.ID, c)
	if err != nil {
		return
	}

	err = DB.UpdateToken(user.ID, token)
	if err != nil {
		if errors.Is(err, ErrDuplicate) {
			c.JSON(http.StatusOK, gin.H{"id": user.ID, "auth_token": token})
			return
		}
		Logger.Error(
			xerrors.WithStackTrace(err, 0).Error(),
		)
		c.String(http.StatusInternalServerError, "Something Went Wrong")
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": user.ID, "auth_token": token})
}
