package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) CreateEntry(c *gin.Context, req *CreateEntryRequest) *CreateEntryResponse {
	entry := &model.Entry{
		CreatorId: middleware.GetUserId(c),
		Content:   req.Content,
	}
	err := entry.Create(config.DB)
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &CreateEntryResponse{
		Id: entry.ID,
	}
}

type CreateEntryRequest struct {
	Content string `json:"content"`
}

type CreateEntryResponse struct {
	Id uint `json:"id"`
}
