class AlbumsController < ApplicationController
  include PhotoPerformanceHelper
  before_action :set_album, only: [:show, :edit, :update, :destroy]
  before_action :add_performance_headers, only: [:show]

  def index
    @albums = Album.includes(:photos).recent # Preload photos count
  end

  def show
    page = params[:page] || 1
    per_page = 24 # Load 24 photos at a time like Wallhaven
    
    # Cache the photo count to avoid repeated COUNT queries
    @photo_count = Rails.cache.fetch("album_#{@album.id}_photo_count", expires_in: 5.minutes) do
      @album.photos.count
    end
    
    # Use includes to preload image attachments and avoid N+1 queries
    @photos = @album.photos.includes(:image_attachment, :image_blob)
                      .order(created_at: :desc)
                      .offset((page.to_i - 1) * per_page)
                      .limit(per_page)
    
    # Add performance headers
    response.headers['Cache-Control'] = 'public, max-age=300' # 5 minutes cache
    
    # Check if this is an AJAX request for lazy loading
    if request.xhr?
      render partial: 'photos/photo_grid', locals: { photos: @photos }, layout: false
    end
  end

  def new
    @album = Album.new
  end

  def edit
  end

  def create
    @album = Album.new(album_params)

    if @album.save
      redirect_to @album, notice: 'Album was successfully created.'
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @album.update(album_params)
      redirect_to @album, notice: 'Album was successfully updated.'
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @album.destroy
    redirect_to albums_url, notice: 'Album was successfully deleted.'
  end

  private

  def set_album
    @album = Album.friendly.find(params[:id])
  end

  def album_params
    params.require(:album).permit(:name)
  end
end
