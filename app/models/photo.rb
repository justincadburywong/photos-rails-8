class Photo < ApplicationRecord
  belongs_to :album
  has_one_attached :image
  
  validates :image, presence: true
  
  scope :recent, -> { order(created_at: :desc) }
  
  def thumbnail_url
    return unless image.attached?
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
  rescue => e
    Rails.logger.error "Error generating thumbnail: #{e.message}"
    nil
  end
  
  def medium_url
    return unless image.attached?
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
  rescue => e
    Rails.logger.error "Error generating medium: #{e.message}"
    nil
  end
  
  def large_url
    return unless image.attached?
    Rails.application.routes.url_helpers.rails_blob_url(image, only_path: true)
  rescue => e
    Rails.logger.error "Error generating large: #{e.message}"
    nil
  end
end
