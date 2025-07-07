package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) UpdateEntry(c *gin.Context, req *UpdateEntryRequest) *UpdateEntryResponse {
	entry := &model.Entry{
		EntryField: req.EntryField,
	}
	err := entry.Update(config.DB, map[string]any{
		model.Entry_CreatorId: middleware.GetUserId(c),
		model.Entry_Id:        req.Id,
	})
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &UpdateEntryResponse{}
}

type UpdateEntryRequest struct {
	Id uint `json:"id"`
	model.EntryField
}

type UpdateEntryResponse struct {
}
