package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) GetEntryDate(c *gin.Context, req *GetEntryDateRequest) *GetEntryDateResponse {
	dates, err := model.FindDates(config.DB, gin.H{
		model.Entry_CreatorId: middleware.GetUserId(c),
	})
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &GetEntryDateResponse{
		EntryDates: dates,
	}
}

type GetEntryDateRequest struct {
}

type GetEntryDateResponse struct {
	EntryDates []string `json:"entryDates"`
}
