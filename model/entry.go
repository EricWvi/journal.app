package model

import (
	"errors"
	"fmt"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Entry struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index"  json:"deletedAt"`
	CreatorId uint           `gorm:"column:creator_id;not null" json:"creatorId"`
	EntryField
}

type EntryField struct {
	Content    datatypes.JSON `gorm:"type:jsonb;default:'{}';not null" json:"content"`
	Visibility string         `gorm:"size:10;default:'PUBLIC';not null" json:"visibility"`
	Payload    datatypes.JSON `gorm:"type:jsonb;default:'{}';not null" json:"payload"`
}

const (
	Entry_Table      = "entry"
	Entry_Visibility = "visibility"
	Entry_CreatorId  = "creator_id"
	Entry_Id         = "id"
)

const (
	Visibility_Public = "PUBLIC"
	Visibility_Draft  = "DRAFT"
)

const PageSize = 6

func (e *Entry) TableName() string {
	return Entry_Table
}

func (e *Entry) Get(db *gorm.DB, where map[string]any) error {
	rst := db.Where(where).Find(&e)
	if rst.Error != nil {
		return rst.Error
	}
	if rst.RowsAffected == 0 {
		return fmt.Errorf("can not find entry with id %d", e.ID)
	}
	return nil
}

func (e *Entry) Create(db *gorm.DB) error {
	return db.Create(e).Error
}

func (e *Entry) Update(db *gorm.DB, where map[string]any) error {
	return db.Where(where).Updates(e).Error
}

func (e *Entry) Delete(db *gorm.DB, where map[string]any) error {
	return db.Where(where).Delete(e).Error
}

func FindDates(db *gorm.DB, where map[string]any) ([]string, error) {
	var dates []string
	if err := db.Model(&Entry{}).
		Select("DATE(created_at) as date").
		Where(where).
		Where("visibility != ?", Visibility_Draft).
		Pluck("date", &dates).Error; err != nil {
		return nil, err
	}
	return dates, nil
}

func FindEntries(db *gorm.DB, where map[string]any, page uint) ([]*Entry, bool, error) {
	if page < 1 {
		return nil, false, errors.New("page number must be greater than 0")
	}
	entries := make([]*Entry, 0, PageSize+1)
	offset := (page - 1) * PageSize

	// Retrieve one extra to check if there are more entries
	if err := db.Where(where).
		Where("visibility != ?", Visibility_Draft).
		Order("created_at DESC").
		Offset(int(offset)).
		Limit(PageSize + 1).
		Find(&entries).Error; err != nil {
		return nil, false, err
	}

	hasMore := false
	if len(entries) > PageSize {
		hasMore = true
		entries = entries[:PageSize]
	}

	return entries, hasMore, nil
}
