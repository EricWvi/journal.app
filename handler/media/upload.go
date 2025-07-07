package media

import (
	"os"

	"github.com/EricWvi/journal/config"
	"github.com/EricWvi/journal/middleware"
	"github.com/EricWvi/journal/model"
	"github.com/EricWvi/journal/service"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

// Upload handles the media upload request from form data.
func Upload(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(400, gin.H{"message": "Failed to parse multipart form: " + err.Error()})
		return
	}

	files := form.File["photos"]
	if len(files) == 0 {
		c.JSON(400, gin.H{"message": "No files found in form data"})
		return
	}

	client, err := NewMinIOClient()
	if err != nil {
		c.JSON(500, gin.H{"message": err.Error()})
		return
	}

	var fileIds []string
	for _, file := range files {
		fileKey, err := client.UploadMultipartFile(c, file)
		if err != nil {
			c.JSON(500, gin.H{"message": "Failed to save " + file.Filename + ": " + err.Error()})
			return
		}
		presignedUrl, err := client.PresignObject(c, fileKey)
		if err != nil {
			c.JSON(500, gin.H{"message": "Failed to presign url. " + err.Error()})
			return
		}
		m := &model.Media{
			CreatorId:    middleware.GetUserId(c),
			Key:          fileKey,
			PresignedURL: presignedUrl,
		}
		err = m.Create(config.DB)
		if err != nil {
			c.JSON(500, gin.H{"message": err.Error()})
			return
		}
		fileIds = append(fileIds, m.Link.String())
	}

	c.JSON(200, gin.H{
		"message": fileIds,
	})
}

func NewMinIOClient() (*service.MinIOUploader, error) {
	return service.NewMinIOUploader(service.MinIOConfig{
		Bucket:          viper.GetString("minio.bucket"),
		AccessKeyID:     viper.GetString("minio.accessKeyID"),
		SecretAccessKey: os.Getenv("JOURNAL_MINIO_KEY"),
		Endpoint:        viper.GetString("minio.endpoint"),
		UseSSL:          viper.GetBool("minio.secure"),
		Expiry:          viper.GetDuration("minio.expiry"),
	})
}
