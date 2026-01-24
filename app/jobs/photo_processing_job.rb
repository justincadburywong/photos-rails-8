class PhotoProcessingJob < ApplicationJob
  queue_as :default

  def perform(album_id, files_data)
    album = Album.find(album_id)
    created_photos = []
    failed_uploads = []

    files_data.each do |file_data|
      begin
        # Create a StringIO object from the base64 decoded content
        io = StringIO.new(file_data[:content])
        
        # Create a new ActiveStorage::Blob from the file data
        blob = ActiveStorage::Blob.create_and_upload!(
          io: io,
          filename: file_data[:filename],
          content_type: file_data[:content_type],
          identify: true
        )

        # Create the photo with the attached blob
        photo = album.photos.build(image: blob)
        
        if photo.save
          created_photos << photo
          # Broadcast individual photo as it's processed
          broadcast_photo_update(album, photo)
        else
          failed_uploads << { filename: file_data[:filename], errors: photo.errors.full_messages }
        end
      rescue => e
        Rails.logger.error "Error processing photo #{file_data[:filename]}: #{e.message}"
        failed_uploads << { filename: file_data[:filename], errors: [e.message] }
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
