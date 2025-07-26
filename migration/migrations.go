package migration

import (
	"github.com/EricWvi/journal/model"
	"gorm.io/gorm"
)

// GetAllMigrations returns all defined migrations in order
func GetAllMigrations() []MigrationStep {
	return []MigrationStep{
		{
			Version: "v0.1.0",
			Name:    "Create user+entry+migration",
			Up:      InitTables,
			Down:    DropInitTables,
		},
		{
			Version: "v0.2.0",
			Name:    "Create media table",
			Up:      CreateMediaTable,
			Down:    DropMediaTable,
		},
		{
			Version: "v0.3.0",
			Name:    "Add presigned url to media table",
			Up:      CreatePresignedURL,
			Down:    DropPresignedURL,
		},
		{
			Version: "v0.4.0",
			Name:    "modify default value of content and payload in entry table",
			Up:      AlterContentAndPayloadDefault,
			Down:    DropContentAndPayloadDefault,
		},
		{
			Version: "v0.5.0",
			Name:    "Add word count to entry table",
			Up:      CreateWordCountColumn,
			Down:    DropWordCountColumn,
		},
		{
			Version: "v0.6.0",
			Name:    "Modify default value of payload in entry table",
			Up:      AlterPayloadDefault,
			Down:    DropPayloadDefault,
		},
	}
}

// ------------------- v0.1.0 -------------------
func InitTables(db *gorm.DB) error {
	return db.Exec(`
		CREATE TABLE public.j_user (
			id SERIAL PRIMARY KEY,
			email VARCHAR(100) NOT NULL UNIQUE,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
			deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
		);

		CREATE TABLE public.entry (
			id SERIAL PRIMARY KEY,
			creator_id integer NOT NULL,
			content jsonb DEFAULT '{}'::jsonb NOT NULL,
			visibility VARCHAR(10) DEFAULT 'PUBLIC'::VARCHAR(10) NOT NULL,
			payload jsonb DEFAULT '{}'::jsonb NOT NULL,
			created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
			deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
		);
	`).Error
}

func DropInitTables(db *gorm.DB) error {
	return db.Exec(`
		DROP TABLE IF EXISTS public.j_user CASCADE;
		DROP TABLE IF EXISTS public.entry CASCADE;
	`).Error
}

// ------------------- v0.2.0 -------------------
func CreateMediaTable(db *gorm.DB) error {
	return db.Exec(`
		CREATE TABLE public.j_media (
			id SERIAL PRIMARY KEY,
			creator_id integer NOT NULL,
			link uuid DEFAULT gen_random_uuid(),
			key VARCHAR(1024) NOT NULL UNIQUE,
			last_presigned_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
			created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
			updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
			deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
		);
	`).Error
}

func DropMediaTable(db *gorm.DB) error {
	return db.Exec(`
		DROP TABLE IF EXISTS public.j_media CASCADE;
	`).Error
}

// ------------------- v0.3.0 -------------------
func CreatePresignedURL(db *gorm.DB) error {
	return db.Exec(`
		ALTER TABLE public.j_media
		ADD COLUMN presigned_url VARCHAR(2048) DEFAULT NULL;
	`).Error
}

func DropPresignedURL(db *gorm.DB) error {
	return db.Exec(`
		ALTER TABLE public.j_media
		DROP COLUMN IF EXISTS presigned_url;
	`).Error
}

// ------------------- v0.4.0 -------------------
func AlterContentAndPayloadDefault(db *gorm.DB) error {
	return db.Exec(`
		ALTER TABLE public.entry
		ALTER COLUMN content SET DEFAULT '[]'::jsonb,
		ALTER COLUMN payload SET DEFAULT '[]'::jsonb
	`).Error
}

func DropContentAndPayloadDefault(db *gorm.DB) error {
	return db.Exec(`
		ALTER TABLE public.entry
		ALTER COLUMN content SET DEFAULT '{}'::jsonb,
		ALTER COLUMN payload SET DEFAULT '{}'::jsonb
	`).Error
}

// ------------------- v0.5.0 -------------------
func CreateWordCountColumn(db *gorm.DB) error {
	if err := db.Exec(`
		ALTER TABLE public.entry
		ADD COLUMN word_count INTEGER DEFAULT 0 NOT NULL;
	`).Error; err != nil {
		return err
	}
	// fetch all rows with limit size as 100 and count words
	offset := 0
	limit := 100
	e := &model.Entry{}
	for {
		var batch []model.Entry
		if err := db.Offset(offset).Limit(limit).Find(&batch).Error; err != nil {
			return err
		}

		if len(batch) == 0 {
			break
		}

		for i := range batch {
			e.WordCount = batch[i].CountWords()
			if err := e.Update(db, map[string]any{"id": batch[i].ID}); err != nil {
				return err
			}
		}

		offset += limit
	}
	return nil
}

func DropWordCountColumn(db *gorm.DB) error {
	return db.Exec(`
		ALTER TABLE public.entry
		DROP COLUMN IF EXISTS word_count;
	`).Error
}

// ------------------- v0.6.0 -------------------
func AlterPayloadDefault(db *gorm.DB) error {
	return db.Exec(`
		ALTER TABLE public.entry
		ALTER COLUMN payload SET DEFAULT '{}'::jsonb
	`).Error
}

func DropPayloadDefault(db *gorm.DB) error {
	return db.Exec(`
		ALTER TABLE public.entry
		ALTER COLUMN payload SET DEFAULT '[]'::jsonb
	`).Error
}
