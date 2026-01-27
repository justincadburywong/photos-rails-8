class Photo < ApplicationRecord
  belongs_to :album
  has_one_attached :image
  
  validates :image, presence: true
  
  scope :recent, -> { order(created_at: :desc) }
  
  # Thumbnail variant - optimized for gallery grid
  def thumbnail_url
    return unless image.attached?
    begin
      Rails.application.routes.url_helpers.rails_representation_url(
        image.variant(resize_to_fill: [300, 300], quality: 80), 
        only_path: true
      )
    rescue => e
      Rails.logger.error "Error generating thumbnail: #{e.message}"
      # Fallback to original URL if variant fails
      Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
    end
  end
  
  # Medium variant - for lightbox preview
  def medium_url
    return unless image.attached?
    begin
      Rails.application.routes.url_helpers.rails_representation_url(
        image.variant(resize_to_limit: [1200, 800], quality: 85), 
        only_path: true
      )
    rescue => e
      Rails.logger.error "Error generating medium: #{e.message}"
      Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
    end
  end
  
  # Large variant - for full lightbox view
  def large_url
    return unless image.attached?
    begin
      Rails.application.routes.url_helpers.rails_representation_url(
        image.variant(resize_to_limit: [1920, 1080], quality: 90), 
        only_path: true
      )
    rescue => e
      Rails.logger.error "Error generating large: #{e.message}"
      Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
    end
  end
  
  # Original URL - for download purposes
  def original_url
    return unless image.attached?
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
  rescue => e
    Rails.logger.error "Error generating original: #{e.message}"
    nil
  end
end
