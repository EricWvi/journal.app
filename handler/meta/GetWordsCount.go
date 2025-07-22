package meta

import (
	"github.com/gin-gonic/gin"
)

func (b Base) GetWordsCount(c *gin.Context, req *GetWordsCountRequest) *GetWordsCountResponse {
	// count, err := model.CountWords(config.DB, gin.H{
	// 	model.Entry_CreatorId: middleware.GetUserId(c),
	// 	"year":                req.Year,
	// })
	// if err != nil {
	// 	handler.Errorf(c, "%s", err.Error())
	// 	return nil
	// }

	return &GetWordsCountResponse{
		Count: 2345,
	}
}

type GetWordsCountRequest struct {
}

type GetWordsCountResponse struct {
	Count int64 `json:"count"`
}
