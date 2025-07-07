package entry

import (
	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) GetDraft(c *gin.Context, req *GetDraftRequest) *GetDraftResponse {
	userId := middleware.GetUserId(c)
	e := &model.Entry{}
	err := e.Get(config.DB, gin.H{
		model.Entry_Visibility: model.Visibility_Draft,
		model.Entry_CreatorId:  userId,
	})
	if err != nil {
		e.CreatorId = userId
		e.Visibility = model.Visibility_Draft
		err = e.Create(config.DB)
		if err != nil {
			handler.Errorf(c, "%s", err.Error())
			return nil
		}
	}

	return &GetDraftResponse{
		e,
	}
}

type GetDraftRequest struct {
}

type GetDraftResponse struct {
	*model.Entry
}
