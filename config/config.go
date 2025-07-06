package config

import (
	"os"

	"github.com/spf13/viper"
)

func Init() {
	// init config
	if err := LoadCfg(); err != nil {
		panic(err)
	}

	InitDB()
}

func LoadCfg() error {
	name := "config.dev"
	if os.Getenv("ENV") == "prod" {
		name = "config.prod"
	}
	viper.SetConfigName(name)
	viper.SetConfigType("yaml")
	viper.AddConfigPath("config")
	viper.AddConfigPath(".")
	if err := viper.ReadInConfig(); err != nil {
		return err
	}

	return nil
}
