package main

import (
	"net/http"

	"github.com/EricWvi/journal/config"
	"github.com/gin-gonic/gin"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func main() {
	// init
	config.Init()

	// gin
	g := gin.New()
	Load(g, gin.LoggerWithWriter(log.StandardLogger().Out))

	addr := viper.GetString("addr")

	log.Infof("Start to listening the incoming requests on http address: %s", addr)
	log.Info(http.ListenAndServe(addr, g).Error())
}
