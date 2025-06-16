package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func (b Base) GetEntry(c *gin.Context, req *GetEntryRequest) *GetEntryResponse {
	e := &model.Entry{
		Model: gorm.Model{
			ID: req.Id,
		},
	}
	err := e.Get(config.DB)
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
