class ImageProcessingJob < ApplicationJob
  queue_as :default

  def perform(photo_id)
    photo = Photo.find(photo_id)
    return unless photo.image.attached?
    
    # Pre-generate variants to avoid first-load lag
    Rails.logger.info "Pre-generating variants for photo #{photo_id}"
    
    begin
      # Generate thumbnail
      photo.image.variant(resize_to_fill: [300, 300], quality: 80).processed
      Rails.logger.info "Generated thumbnail for photo #{photo_id}"
      
      # Generate medium
      photo.image.variant(resize_to_limit: [1200, 800], quality: 85).processed
      Rails.logger.info "Generated medium for photo #{photo_id}"
      
      # Generate large
      photo.image.variant(resize_to_limit: [1920, 1080], quality: 90).processed
      Rails.logger.info "Generated large for photo #{photo_id}"
      
    rescue => e
      Rails.logger.error "Error processing variants for photo #{photo_id}: #{e.message}"
    end
  end
end
