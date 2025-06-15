package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/EricWvi/journal/handler"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

type bodyLogWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (w bodyLogWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func Logging(c *gin.Context) {
	start := time.Now().UTC()
	path := c.Request.URL.Path
	queries := c.Request.URL.RawQuery
	headers := c.Request.Header
	requestBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Error("failed to read request body")
		handler.ReplyError(c, http.StatusInternalServerError, "failed to read request body")
		c.Abort()
		return
	}

	requestId := uuid.New().String()
	c.Set("RequestId", requestId)
	list := c.Request.URL.Query().Get("Action")
	if len(list) == 0 {
		handler.ReplyError(c, http.StatusBadRequest, "request action is missing")
		c.Abort()
		return
	}
	c.Set("Action", list)

	c.Set("RequestBody", string(requestBody))

	method := c.Request.Method
	ip := c.ClientIP()

	log.Infof("---------------------- %s ----------------------", requestId)
	f := log.Fields{
		"requestId": requestId,
		"method":    method,
		"path":      path,
		"queries":   queries,
		"headers":   headers,
		"ip":        ip,
	}
	if c.ContentType() == "application/json" {
		f["body"] = string(requestBody)
	}
	log.WithFields(f).Info()

	blw := &bodyLogWriter{
		body:           bytes.NewBufferString(""),
		ResponseWriter: c.Writer,
	}
	c.Writer = blw

	c.Next()

	// Calculates the latency.
	end := time.Now().UTC()
	latency := end.Sub(start)

	// get code and message
	rsp := handler.Response{}
	if err := json.Unmarshal(blw.body.Bytes(), &rsp); err != nil {
		log.Errorf("response body can not unmarshal to handler.Response struct, body: `%s`", blw.body.Bytes())
	} else {
		log.WithFields(log.Fields{
			"requestId": rsp.RequestId,
			"code":      rsp.Code,
			"message":   rsp.Message,
			"latency":   latency,
		}).Info()
	}
	log.Info("------------------------------------------------------------------")
}
