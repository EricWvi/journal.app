package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (b Base) UpdateEntry(c *gin.Context, req *UpdateEntryRequest) *UpdateEntryResponse {
	entry := &model.Entry{
		Content: req.Content,
		Model: gorm.Model{
			ID: req.Id,
		},
	}
	err := entry.Update(config.DB)
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &UpdateEntryResponse{}
}

type UpdateEntryRequest struct {
	Id      uint   `json:"id"`
	Content string `json:"content"`
}

type UpdateEntryResponse struct {
}
