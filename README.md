# Photos - Modern Photo Management Application

A sophisticated photo album management system built with Rails 8.1.2, featuring asynchronous uploads, dark mode, and an immersive fullscreen photo viewer.

## 🌟 Features

### Core Functionality
- **Album Management** - Create, organize, and manage photo albums
- **Photo Upload** - Drag-and-drop and file input uploads with progress tracking
- **Async Processing** - Background job processing for large files
- **Fullscreen Viewer** - Immersive carousel with keyboard navigation
- **Photo Deletion** - Individual photo management with confirmation

### Advanced Features
- **Dark Mode** - System-aware dark mode with smooth transitions and persistent preferences
- **Lazy Loading** - Efficient pagination and on-demand photo loading
- **Responsive Design** - Mobile-first design that works on all devices
- **Real-time Updates** - Turbo-powered UI updates without page reloads
- **Performance Optimized** - Image variants, caching, and optimized database queries

### User Experience
- **Keyboard Navigation** - Arrow keys for photo navigation, ESC to close
- **Touch Gestures** - Mobile-friendly touch interactions
- **Progress Indicators** - Visual feedback for all operations
- **Error Handling** - Graceful error recovery and user notifications

## 🎯 User Stories

### Album Management
- As a user, I want to create new photo albums to organize my photos
- As a user, I want to view all my albums in a grid layout
- As a user, I want to navigate to a specific album to see its photos

### Photo Upload
- As a user, I want to upload multiple photos at once using drag-and-drop
- As a user, I want to see upload progress for each photo
- As a user, I want photos to be processed in the background without blocking the UI
- As a user, I want to see newly uploaded photos appear immediately in the album

### Photo Viewing
- As a user, I want to click any photo to view it in fullscreen
- As a user, I want to navigate between photos using arrow keys
- As a user, I want smooth transitions between photos
- As a user, I want to close the viewer using ESC key or by clicking outside

### Theme & Accessibility
- As a user, I want to toggle between light and dark themes
- As a user, I want my theme preference to be remembered across sessions
- As a user, I want the app to respect my system's theme preference initially

## 🛠 Technology Stack

### Backend
- **Ruby on Rails 8.1.2** - Web framework
- **PostgreSQL** - Primary database
- **Active Storage** - File uploads and image processing
- **Solid Queue** - Background job processing
- **Solid Cache** - Performance caching

### Frontend
- **Hotwire (Turbo + Stimulus)** - Modern SPA-like experience
- **Tailwind CSS** - Utility-first styling with dark mode support
- **Owl Carousel** - Photo viewer carousel
- **JavaScript ES6+** - Modern browser features

### Image Processing
- **ImageProcessing gem** - Image variants and optimization
- **MiniMagick** - Image manipulation
- **Lazy Loading** - Performance optimization

## 📋 Prerequisites

- Ruby 3.4.0+
- Rails 8.1.2+
- PostgreSQL 14+
- Node.js 18+ (for asset pipeline)
- Redis (optional, for advanced caching)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd photos
```

### 2. Install Dependencies
```bash
# Ruby gems
bundle install

# Node.js packages (if using asset pipeline)
npm install
```

### 3. Database Setup
```bash
# Create databases
rails db:create

# Run migrations
rails db:migrate

# (Optional) Seed with sample data
rails db:seed
```

### 4. Environment Configuration
```bash
# Copy environment files
cp config/database.example.yml config/database.yml
cp config/master.key.example config/master.key

# Edit configuration as needed
```

### 5. Start Development Server
```bash
rails server
```

Visit `http://localhost:3000` to see the application.

## 🏗 Development

### Running Tests
```bash
# Run all tests
rails test

# Run specific test types
rails test:units
rails test:functionals
rails test:integration

# Run with coverage
rails test:coverage
```

### Asset Pipeline
```bash
# Compile assets
rails assets:precompile

# Clean assets
rails assets:clobber

# Watch for changes
rails assets:watch
```

### Background Jobs
```bash
# Start background worker
bundle exec bin/jobs start

# Process queued jobs
rails jobs:work
```

## 🚀 Production Deployment

### 1. Server Setup
```bash
# Install production dependencies
bundle install --without development test

# Create production database
RAILS_ENV=production rails db:create
RAILS_ENV=production rails db:schema:load

# Precompile assets
RAILS_ENV=production rails assets:precompile
```

### 2. Environment Variables
Set the following environment variables:
- `RAILS_ENV=production`
- `SECRET_KEY_BASE` (generate with `rails secret`)
- Database credentials
- Redis configuration (if used)

### 3. Start Production Server
```bash
# Using Procfile
foreman start

# Or manually
RAILS_ENV=production rails server -p 3000 -b 0.0.0.0
```

### 4. Process Management (Recommended)
```bash
# Using systemd or similar process manager
sudo systemctl start photos
sudo systemctl enable photos
```

## 📁 Project Structure

```
app/
├── controllers/          # Request handling
│   ├── albums_controller.rb
│   ├── photos_controller.rb
│   └── application_controller.rb
├── models/              # Business logic
│   ├── album.rb
│   └── photo.rb
├── views/               # Templates
│   ├── albums/
│   ├── photos/
│   └── shared/
├── javascript/          # Stimulus controllers
│   ├── album_edit_controller.js
│   ├── dark_mode_controller.js
│   └── dropzone_controller.js
└── jobs/               # Background jobs
    └── photo_processing_job.rb

config/                 # Configuration files
db/                    # Database schema and migrations
public/                # Static assets
test/                  # Test files
```

## 🔧 Configuration

### Database Configuration
Edit `config/database.yml` for your environment:

```yaml
development:
  adapter: postgresql
  database: photos_development
  username: your_username
  password: your_password

production:
  adapter: postgresql
  database: photos_production
  username: photos
  password: <%= ENV['DATABASE_PASSWORD'] %>
```

### Image Storage
Configure Active Storage in `config/storage.yml`:

```yaml
local:
  service: Disk
  root: <%= Rails.root.join("storage") %>

amazon:
  service: S3
  access_key_id: <%= ENV['AWS_ACCESS_KEY_ID'] %>
  secret_access_key: <%= ENV['AWS_SECRET_ACCESS_KEY'] %>
  bucket: your-bucket-name
  region: us-east-1
```

## 🎨 Customization

### Adding New Image Sizes
Edit `app/models/photo.rb`:

```ruby
def extra_large_url
  return unless image.attached?
  if image.variable?
    rails_representation_url(image.variant(resize_to_limit: [1920, 1920]))
  else
    rails_blob_url(image)
  end
end
```

### Custom Dark Mode Colors
Edit `app/javascript/controllers/dark_mode_controller.js` to modify theme colors.

### Carousel Customization
Modify `app/views/albums/show.html.erb` to change carousel behavior and styling.

## 🐛 Troubleshooting

### Common Issues

**Photos not uploading**
- Check background worker is running
- Verify Active Storage configuration
- Check file permissions

**Dark mode not persisting**
- Clear browser localStorage
- Check JavaScript console for errors
- Verify Stimulus controller is loaded

**Carousel not working**
- Ensure Owl Carousel CSS and JS are loaded
- Check photo URLs are accessible
- Verify JavaScript event handlers

**Performance issues**
- Enable image variants
- Check database queries with `rails console`
- Monitor background job queue

### Debug Mode
Enable detailed logging in development:

```ruby
# config/environments/development.rb
config.log_level = :debug
```

## 📈 Performance

### Optimization Features
- **Image Variants** - Multiple sizes for different use cases
- **Lazy Loading** - Load photos as needed
- **Database Caching** - Query result caching
- **Asset Compression** - Minified CSS/JS
- **Background Processing** - Non-blocking uploads

### Monitoring
Monitor these metrics:
- Photo upload times
- Database query performance
- Asset load times
- Background job queue size

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow Rails conventions
- Use RuboCop for code formatting
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Rails team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Owl Carousel for the photo viewer
- All contributors and users

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

---

Built with ❤️ using Rails 8.1.2
