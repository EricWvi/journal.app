package service

import (
	"context"
	"fmt"
	"time"

	"github.com/EricWvi/journal/model"
	"github.com/robfig/cron/v3"
	log "github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

// JobScheduler manages scheduled tasks
type JobScheduler struct {
	cron         *cron.Cron
	minioService *MinIOUploader
	db           *gorm.DB
}

// NewJobScheduler creates a new job scheduler instance
func NewJobScheduler(minioService *MinIOUploader, db *gorm.DB) *JobScheduler {
	c := cron.New()
	return &JobScheduler{
		cron:         c,
		minioService: minioService,
		db:           db,
	}
}

// Start begins the job scheduler
func (js *JobScheduler) Start() {
	// Schedule the media re-presigning job to run every day at 2:30 AM
	_, err := js.cron.AddFunc("30 2 * * *", js.RePresignExpiredMedia)
	if err != nil {
		log.Errorf("Failed to schedule media re-presigning job: %v", err)
		return
	}

	log.Info("Job scheduler started successfully")
	js.cron.Start()
}

// Stop gracefully shuts down the job scheduler
func (js *JobScheduler) Stop() {
	js.cron.Stop()
	log.Info("Job scheduler stopped")
}

// RePresignExpiredMedia finds and re-presigns media files that have expired presigned URLs
func (js *JobScheduler) RePresignExpiredMedia() {
	log.Info("Starting media re-presigning job")

	// Find all media files where LastPresignedTime is older than 3 days
	threeDaysAgo := time.Now().AddDate(0, 0, -3)

	var expiredMedia []model.Media
	result := js.db.Where(model.Media_LastPresignedTime+" < ?", threeDaysAgo).Find(&expiredMedia)

	if result.Error != nil {
		log.Errorf("Failed to query expired media: %v", result.Error)
		return
	}

	log.Infof("Found %d media files to re-presign", len(expiredMedia))

	successCount := 0
	failureCount := 0

	for _, media := range expiredMedia {
		if err := js.rePresignSingleMedia(&media); err != nil {
			log.Errorf("Failed to re-presign media ID %d (Key: %s): %v", media.ID, media.Key, err)
			failureCount++
		} else {
			successCount++
		}
	}

	log.Infof("Media re-presigning job completed. Success: %d, Failures: %d", successCount, failureCount)
}

// rePresignSingleMedia re-presigns a single media file
func (js *JobScheduler) rePresignSingleMedia(media *model.Media) error {
	ctx := context.Background()

	// Generate new presigned URL
	presignedURL, err := js.minioService.PresignObject(ctx, media.Key)
	if err != nil {
		return fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	// Update the media record with new presigned URL and timestamp
	now := time.Now()
	updates := map[string]interface{}{
		model.Media_PresignedURL:      presignedURL,
		model.Media_LastPresignedTime: now,
	}

	where := map[string]interface{}{model.Media_Id: media.ID}

	if err := js.db.Model(media).Where(where).Updates(updates).Error; err != nil {
		return fmt.Errorf("failed to update media record: %w", err)
	}

	log.Debugf("Successfully re-presigned media ID %d (Key: %s)", media.ID, media.Key)
	return nil
}
