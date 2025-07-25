package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) GetEntry(c *gin.Context, req *GetEntryRequest) *GetEntryResponse {
	e := &model.Entry{}
	err := e.Get(config.DB, gin.H{
		model.Entry_CreatorId: middleware.GetUserId(c),
		model.Entry_Id:        req.Id,
	})
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &GetEntryResponse{
		e,
	}
}

type GetEntryRequest struct {
	Id uint `json:"id"`
}

type GetEntryResponse struct {
	*model.Entry
}
