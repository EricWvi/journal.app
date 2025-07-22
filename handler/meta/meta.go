package meta

import (
	"github.com/EricWvi/journal/handler"
	"github.com/gin-gonic/gin"
)

type Base struct{}

func DefaultHandler(c *gin.Context) {
	handler.Dispatch(c, Base{})
}
