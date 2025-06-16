package model

import (
	"fmt"

	"gorm.io/gorm"
)

type Entry struct {
	gorm.Model
	CreatorId uint
	Content   string
}

func (e *Entry) TableName() string {
	return "entry"
}

func (e *Entry) Get(db *gorm.DB) error {
	rst := db.Find(&e)
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

func (e *Entry) Update(db *gorm.DB) error {
	return db.Updates(e).Error
}

func (e *Entry) Delete(db *gorm.DB) error {
	return db.Delete(e).Error
}

func FindEntries(db *gorm.DB, where map[string]any) ([]*Entry, error) {
	entries := make([]*Entry, 0)
	if err := db.Where(where).Find(&entries).Error; err != nil {
		return nil, err
	}
	return entries, nil
}
