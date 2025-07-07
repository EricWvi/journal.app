package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) GetEntries(c *gin.Context, req *GetEntriesRequest) *GetEntriesResponse {
	entries, hasMore, err := model.FindEntries(config.DB, map[string]any{
		model.Entry_CreatorId: middleware.GetUserId(c),
	}, req.Page)
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &GetEntriesResponse{
		entries,
		hasMore,
	}
}

type GetEntriesRequest struct {
	Page uint `json:"page"`
}

type GetEntriesResponse struct {
	Entries []*model.Entry `json:"entries"`
	HasMore bool           `json:"hasMore"`
}
