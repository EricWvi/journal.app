package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) GetEntries(c *gin.Context, req *GetEntriesRequest) *GetEntriesResponse {
	entries, err := model.FindEntries(config.DB, nil)
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &GetEntriesResponse{
		entries,
	}
}

type GetEntriesRequest struct {
}

type GetEntriesResponse struct {
	Entries []*model.Entry `json:"entries"`
}
