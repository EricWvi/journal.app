package entry

import (
	"time"

	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/handler"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/gin-gonic/gin"
)

func (b Base) CreateEntryFromDraft(c *gin.Context, req *CreateEntryFromDraftRequest) *CreateEntryFromDraftResponse {
	entry := &model.Entry{}
	err := entry.Get(config.DB, gin.H{
		model.Entry_Visibility: model.Visibility_Draft,
		model.Entry_CreatorId:  middleware.GetUserId(c),
	})
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}
	entry.EntryField = req.EntryField
	entry.CreatedAt = time.Now()
	entry.UpdatedAt = time.Now()
	err = entry.Update(config.DB, nil)
	if err != nil {
		handler.Errorf(c, "%s", err.Error())
		return nil
	}

	return &CreateEntryFromDraftResponse{
		entry,
	}
}

type CreateEntryFromDraftRequest struct {
	model.EntryField
}

type CreateEntryFromDraftResponse struct {
	*model.Entry
}
