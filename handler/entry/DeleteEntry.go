package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (b Base) DeleteEntry(c *gin.Context, req *DeleteEntryRequest) *DeleteEntryResponse {
	entry := &model.Entry{
		Model: gorm.Model{
			ID: req.Id,
		},
	}
	err := entry.Delete(config.DB, map[string]any{
		model.Entry_CreatorId: middleware.GetUserId(c),
	})
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &DeleteEntryResponse{}
}

type DeleteEntryRequest struct {
	Id uint `json:"id"`
}

type DeleteEntryResponse struct {
}
