# Multipart Upload Configuration for Rails 8
# 
# NOTE: Rack::Multipart middleware configuration is incompatible with Rails 8
# Alternative solutions for handling large file uploads:
#
# 1. Client-side: Implement chunked uploads using JavaScript libraries
# 2. Server-side: Use Active Storage direct uploads
# 3. Environment variables: Set RAILS_MULTIPART_LIMIT=1024 in production
# 4. Nginx/Apache: Configure client_max_body_size at web server level
#
# Current default limit: ~128-256 files (varies by system)
# For production deployment, set environment variable: RAILS_MULTIPART_LIMIT=1024
