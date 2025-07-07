package migration

import (
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
	}
}

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
