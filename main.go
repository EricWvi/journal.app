package main

import (
	"net/http"

	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/migration"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func main() {
	// init
	config.Init()

	// Run migrations
	if err := runMigrations(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// gin
	g := gin.New()
	Load(g, gin.LoggerWithWriter(log.StandardLogger().Out))

	addr := viper.GetString("addr")

	log.Infof("Start to listening the incoming requests on http address: %s", addr)
	log.Info(http.ListenAndServe(addr, g).Error())
}

func runMigrations() error {
	migrator := migration.NewMigrator(config.DB)

	// Add all migrations
	migrations := migration.GetAllMigrations()
	for _, m := range migrations {
		migrator.AddMigration(m)
	}

	// Run migrations
	if err := migrator.Up(); err != nil {
		return err
	}

	return nil
}
