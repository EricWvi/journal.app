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
