class PhotoProcessingJob < ApplicationJob
  queue_as :default

  def perform(album_id, files_data)
    Rails.logger.info "=== PhotoProcessingJob Started ==="
    Rails.logger.info "Album ID: #{album_id}"
    Rails.logger.info "Files to process: #{files_data.length}"
    
    album = Album.find(album_id)
    created_photos = []
    failed_uploads = []

    files_data.each_with_index do |file_data, index|
      Rails.logger.info "Processing file #{index + 1}/#{files_data.length}: #{file_data['filename']}"
      
      begin
        # Find the blob by key (already uploaded)
        blob = ActiveStorage::Blob.find_by!(key: file_data['blob_key'])
        Rails.logger.info "Found blob: #{blob.key}, size: #{blob.byte_size}"
        
        # Create the photo with the attached blob
        photo = album.photos.build(image: blob)
        Rails.logger.info "Built photo: #{photo.inspect}"
        
        if photo.save
          created_photos << photo
          Rails.logger.info "✅ Photo saved successfully: #{photo.id}"
          
          # Pre-generate image variants in background to avoid first-load lag
          ImageProcessingJob.perform_later(photo.id)
          
          # Broadcast individual photo as it's processed
          broadcast_photo_update(album, photo)
        else
          Rails.logger.error "❌ Photo save failed: #{photo.errors.full_messages.join(', ')}"
          failed_uploads << { filename: file_data['filename'], errors: photo.errors.full_messages }
        end
      rescue => e
        Rails.logger.error "❌ Error processing photo #{file_data['filename']}: #{e.message}"
        Rails.logger.error e.backtrace.first(5).join("\n")
        failed_uploads << { filename: file_data['filename'], errors: [e.message] }
      end
    end

    # Broadcast completion status
    broadcast_processing_complete(album, created_photos.length, failed_uploads.length)
    
    Rails.logger.info "Photo processing completed: #{created_photos.length} created, #{failed_uploads.length} failed"
  end

  private

  def broadcast_photo_update(album, photo)
    # Create HTML for the new photo
    photo_html = ApplicationController.render(
      partial: 'photos/photo_item',
      locals: { photo: photo, album: album },
      layout: false
    )

    # Broadcast to the album show page
    Turbo::StreamsChannel.broadcast_to(
      album,
      target: 'photo-grid',
      html: photo_html
    )
  end

  def broadcast_processing_complete(album, created_count, failed_count)
    # Update photo count
    Turbo::StreamsChannel.broadcast_to(
      album,
      target: 'photo-count',
      html: "#{album.photos.count} photos"
    )

    # Show completion message if there were failures
    if failed_count > 0
      Turbo::StreamsChannel.broadcast_to(
        album,
        target: 'upload-status',
        html: "<div class='bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4'>#{created_count} photos uploaded, #{failed_count} failed</div>"
      )
    end
  end
end
