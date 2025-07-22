package meta

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) GetEntriesCount(c *gin.Context, req *GetEntriesCountRequest) *GetEntriesCountResponse {
	count, err := model.CountEntries(config.DB, gin.H{
		model.Entry_CreatorId: middleware.GetUserId(c),
		"year":                req.Year,
	})
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &GetEntriesCountResponse{
		Count: count,
	}
}

type GetEntriesCountRequest struct {
	Year int `json:"year"`
}

type GetEntriesCountResponse struct {
	Count int64 `json:"count"`
}
