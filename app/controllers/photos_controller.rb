class PhotosController < ApplicationController
  before_action :set_album
  before_action :set_photo, only: [:show, :edit, :update, :destroy]

  def index
    @photos = @album.photos.recent
    respond_to do |format|
      format.html
      format.json { 
        render json: @photos.map do |photo| 
          { 
            id: photo.id, 
            title: photo.title,
            image_url: photo.image.attached? ? url_for(photo.image) : nil
          } 
        end 
      }
    end
  end

  def show
    respond_to do |format|
      format.html
      format.json { render json: { large_url: @photo.large_url } }
    end
  end

  def new
    @photo = @album.photos.build
  end

  def edit
  end

  def create
    uploaded_files = params.dig(:photo, :images) || []
    
    # Handle case where uploaded_files might be a string (when no files selected)
    if uploaded_files.is_a?(String)
      uploaded_files = []
    end
    
    if uploaded_files.empty?
      @photo = @album.photos.build
      @photo.errors.add(:images, "must be selected")
      render :new, status: :unprocessable_entity
      return
    end

    # Use async processing for large batches (20+ images)
    if uploaded_files.length >= 20
      process_photos_async(uploaded_files)
      return
    end

    # Process synchronously for smaller batches
    process_photos_sync(uploaded_files)
  end

  # New action for async uploads via DropZone
  def async_upload
    Rails.logger.info "=== Async Upload Debug ==="
    Rails.logger.info "Params: #{params.inspect}"
    Rails.logger.info "Album ID: #{params[:album_id]}"
    Rails.logger.info "Files data: #{params[:files]&.length || 0} files"
    
    files_data = params[:files] || []
    album_id = params[:album_id]
    
    if files_data.empty? || album_id.blank?
      Rails.logger.error "Missing files or album ID"
      render json: { error: 'No files or album ID provided' }, status: :bad_request
      return
    end

    # Try to find album by ID first, then by slug
    begin
      album = Album.find(album_id)
      Rails.logger.info "Found album by ID: #{album.name}"
    rescue ActiveRecord::RecordNotFound
      begin
        album = Album.friendly.find(album_id)
        Rails.logger.info "Found album by slug: #{album.name}"
      rescue ActiveRecord::RecordNotFound => e
        Rails.logger.error "Album not found by ID or slug: #{e.message}"
        render json: { error: 'Album not found' }, status: :not_found
        return
      end
    end

    # Use Active Storage Direct Upload for better performance
    processed_files = []
    
    files_data.each do |file_data|
      Rails.logger.info "Processing file: #{file_data[:filename]}"
      Rails.logger.info "Content type: #{file_data[:content_type]}"
      
      begin
        # Decode Base64 content
        decoded_content = Base64.decode64(file_data[:content])
        
        # Create StringIO from decoded content
        io = StringIO.new(decoded_content)
        
        # Upload directly to Active Storage and get the blob key
        blob = ActiveStorage::Blob.create_and_upload!(
          io: io,
          filename: file_data[:filename],
          content_type: file_data[:content_type],
          identify: false # Skip identification for speed
        )
        
        # Store only the blob key (JSON-safe)
        processed_files << {
          'filename' => file_data[:filename],
          'content_type' => file_data[:content_type],
          'blob_key' => blob.key # Just the key, no binary data
        }
        
        Rails.logger.info "Created blob with key: #{blob.key}"
        
      rescue => e
        Rails.logger.error "Error creating blob for #{file_data[:filename]}: #{e.message}"
        # Add to failed uploads or handle error as needed
      end
    end

    # Enqueue background job
    Rails.logger.info "About to enqueue PhotoProcessingJob with #{processed_files.length} files"
    Rails.logger.info "Processed files data: #{processed_files.inspect}"
    
    job = PhotoProcessingJob.perform_later(album.id, processed_files)
    Rails.logger.info "Enqueued job with ID: #{job.job_id}"
    
    Rails.logger.info "Enqueued PhotoProcessingJob for #{processed_files.length} files"
    
    render json: { 
      message: 'Files are being processed', 
      files_count: files_data.length 
    }
  end

  def update
    if @photo.update(photo_params)
      redirect_to album_photo_path(@album, @photo), notice: 'Photo was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @photo.destroy
    redirect_to album_path(@album), notice: 'Photo was successfully deleted.'
  end

  private

  def set_album
    @album = Album.friendly.find(params[:album_id])
  end

  def set_photo
    @photo = @album.photos.find(params[:id])
  end

  def photo_params
    params.require(:photo).permit(images: [])
  end

  def process_photos_async(uploaded_files)
    # Prepare file data for background job
    files_data = uploaded_files.map do |file|
      {
        content: file.read,
        filename: file.original_filename,
        content_type: file.content_type
      }
    end

    # Enqueue background job
    PhotoProcessingJob.perform_later(@album.id, files_data)
    
    redirect_to album_path(@album), notice: "#{uploaded_files.length} photos are being processed. They will appear shortly."
  end

  def process_photos_sync(uploaded_files)
    created_photos = []
    failed_uploads = []

    uploaded_files.each do |file|
      # Skip if file is not an actual file object
      next unless file.respond_to?(:original_filename)
      
      photo = @album.photos.build(image: file)
      if photo.save
        created_photos << photo
      else
        failed_uploads << { file: file.original_filename, errors: photo.errors.full_messages }
      end
    end

    if failed_uploads.empty?
      redirect_to album_path(@album), notice: "#{created_photos.length} photo#{'s' if created_photos.length > 1} successfully added."
    else
      if created_photos.any?
        redirect_to album_path(@album), alert: "#{created_photos.length} photos added, but #{failed_uploads.length} failed."
      else
        # Show errors for failed uploads
        @photo = @album.photos.build
        failed_uploads.each do |failure|
          failure[:errors].each { |error| @photo.errors.add(:base, "#{failure[:file]}: #{error}") }
        end
        render :new, status: :unprocessable_entity
      end
    end
  end
end
