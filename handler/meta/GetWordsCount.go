package meta

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) GetWordsCount(c *gin.Context, req *GetWordsCountRequest) *GetWordsCountResponse {
	count := model.CountAllWords(config.DB, gin.H{
		model.Entry_CreatorId: middleware.GetUserId(c),
	})

	return &GetWordsCountResponse{
		Count: count,
	}
}

type GetWordsCountRequest struct {
}

type GetWordsCountResponse struct {
	Count int `json:"count"`
}
