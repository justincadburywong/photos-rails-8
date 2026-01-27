# Performance monitoring and caching utilities
module PhotoPerformanceHelper
  # Cache photo URLs to avoid repeated URL generation
  def cached_photo_url(photo, size = :thumbnail)
    Rails.cache.fetch("photo_url_#{photo.id}_#{size}", expires_in: 1.hour) do
      case size
      when :thumbnail
        photo.thumbnail_url
      when :medium
        photo.medium_url
      when :large
        photo.large_url
      when :original
        photo.original_url
      end
    end
  end
  
  # Preload photos with eager loading
  def photos_with_preloading(album, page = 1, per_page = 24)
    album.photos
        .includes(:image_attachment) # Preload Active Storage attachments
        .order(created_at: :desc)
        .offset((page - 1) * per_page)
        .limit(per_page)
  end
  
  # Generate optimized image srcset
  def responsive_image_srcset(photo)
    "#{cached_photo_url(photo, :thumbnail)} 1x, #{cached_photo_url(photo, :medium)} 2x"
  end
  
  # Add performance headers
  def add_performance_headers
    response.headers['Cache-Control'] = 'public, max-age=31536000' if request.path.include?('/rails/active_storage/')
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
  end
end
