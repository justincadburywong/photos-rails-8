require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.enable_reloading = false

  # Eager load code on boot for better performance and memory savings (ignored by Rake tasks).
  config.eager_load = true

  # Full error reports are disabled.
  config.consider_all_requests_local = false

  # Turn on fragment caching in view templates.
  config.action_controller.perform_caching = true

  # Cache assets for far-future expiry since they are all digest stamped.
  config.public_file_server.headers = { "cache-control" => "public, max-age=#{1.year.to_i}" }

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # Uncomment and configure for CDN
  # config.asset_host = "https://cdn.yourdomain.com"
  
  # Add cache headers for Active Storage
  config.active_storage.routes_prefix = "/rails/active_storage"

  # Compress CSS using a preprocessor.
  config.assets.css_compressor = :sass

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false

  # Enable asset pipeline digests.
  config.assets.digest = true

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :local

  # Configure SSL for both local and Cloudflare access
  config.force_ssl = false  # Disable global SSL forcing to allow HTTP locally
  
  # Use HTTP URLs for both local and Cloudflare (Cloudflare handles SSL termination)
  config.action_controller.default_url_options = { 
    protocol: 'http',
    host: '192.168.11.49',
    port: 4000
  }

  # Log to STDOUT with the current request id as a default log tag.
  config.log_tags = [ :request_id ]
  config.logger   = ActiveSupport::TaggedLogging.logger(STDOUT)

  # Change to "debug" to log everything (including potentially personally-identifiable information!).
  config.log_level = ENV.fetch("RAILS_LOG_LEVEL", "warn")

  # === PERFORMANCE OPTIMIZATIONS ===
  
  # Enable caching for Active Storage variants
  config.active_storage.variant_processor = :mini_magick
  
  # Increase concurrent workers for better performance
  config.active_job.queue_adapter = :solid_queue
  
  # Optimize middleware stack (removed problematic deletions for now)
  # config.middleware.delete ActionDispatch::Executor
  # config.middleware.delete ActionDispatch::Reloader
  
  # Cache store configuration
  config.cache_store = :solid_cache_store
  
  # Enable Rails cache for better performance
  config.action_controller.enable_fragment_cache_logging = true
  
  # Optimize session store for Cloudflare SSL termination (like Epicer)
 # config.session_store :cookie_store, key: '_photos_session', secure: true, httponly: true, same_site: :strict
  
  # Enable query cache
  config.active_record.cache_versioning = true

  # Allow requests from local origins for development
  config.hosts.clear
  config.hosts << "photos.justincadburywong.com"
  config.hosts << "192.168.11.49"
  config.hosts << "localhost"
  config.hosts << "127.0.0.1"
  config.hosts << "0.0.0.0"

  # Configure Action Cable for local development
  config.action_cable.allowed_request_origins = [
    "http://192.168.11.49:4000",
    "http://192.168.11.49:8080",
    "http://localhost:4000",
    "http://localhost:8080",
    "http://127.0.0.1:4000",
    "http://127.0.0.1:8080"
  ]

  # Prevent health checks from clogging up the logs.
  config.silence_healthcheck_path = "/up"

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Replace the default in-process and non-durable queuing backend for Active Job.
  config.active_job.queue_adapter = :solid_queue
  config.solid_queue.connects_to = { database: { writing: :queue } }

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  # Set host to be used by links generated in mailer templates.
  config.action_mailer.default_url_options = { host: "example.com" }

  # Specify outgoing SMTP server. Remember to add smtp/* credentials via bin/rails credentials:edit.
  # config.action_mailer.smtp_settings = {
  #   user_name: Rails.application.credentials.dig(:smtp, :user_name),
  #   password: Rails.application.credentials.dig(:smtp, :password),
  #   address: "smtp.example.com",
  #   port: 587,
  #   authentication: :plain
  # }

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  # Only use :id for inspections in production.
  config.active_record.attributes_for_inspect = [ :id ]

  #
  # Skip DNS rebinding protection for the default health check endpoint.
  # config.host_authorization = { exclude: ->(request) { request.path == "/up" } }
end
