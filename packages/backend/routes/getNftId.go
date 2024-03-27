package routes

import (
	. "collect3/backend/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetNftId(c *gin.Context) {
	content, err := DB.GetNftIdByCid(c.Param("cid"))

	if err != nil {
		fmt.Println(err)
		c.String(http.StatusInternalServerError, "Failed to Get NFT ID")
		return
	}

	if content == (NFTContent{}) {
		int, err := DB.GetNextNFTId()
		if err != nil {
			fmt.Println(err)
			c.String(http.StatusInternalServerError, "Failed to Get NFT ID")
			return
		}
		c.JSON(http.StatusOK, gin.H{"id": int})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": content.ID})
}
