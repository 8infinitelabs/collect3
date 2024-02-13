package routes

import (
	"fmt"
	"net/http"
  . "collect3/backend/utils"

	"github.com/gin-gonic/gin"
)

type CreateAccountPayload struct {
	Id string `json:"id"`;
}

func CreateAccount(c *gin.Context) {
  var payload CreateAccountPayload;

	err := c.BindJSON(&payload);
  if err != nil {
    Logger.Error(
      err.Error(),
      GetSlogStackTrace(err),
    )
    c.String(http.StatusBadRequest, "Invalid Request Body");
		return;
	}

  var url = fmt.Sprintf(
    "http://localhost:5050/s5/admin/accounts?email=%s@hotmail.com",
    payload.Id,
  );

  req, err := http.NewRequest(http.MethodPost, url, nil);
  if err != nil {
    Logger.Error(
      err.Error(),
      GetSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Failed To Create Account");
		return;
	}

  req.Header.Add(
    "Authorization",
    fmt.Sprintf(
      "Bearer %s",
      GetEnvVar("ADMIN_S5_KEY"),
    ),
  );
  res, err := http.DefaultClient.Do(req);
  if err != nil {
    Logger.Error(
      err.Error(),
      GetSlogStackTrace(err),
    )
    c.String(http.StatusInternalServerError, "Failed To Create Account");
		return;
	}

  if res.StatusCode != http.StatusOK {
    Logger.Error(
      err.Error(),
      GetSlogStackTrace(err),
    )
    c.String(res.StatusCode, "Something Went Wrong");
    return;
  }

  c.String(http.StatusOK, "Account Created");
}
