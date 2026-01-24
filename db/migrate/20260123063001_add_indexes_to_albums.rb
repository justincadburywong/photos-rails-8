class AddIndexesToAlbums < ActiveRecord::Migration[8.1]
  def change
    add_index :albums, :created_at
  end
end
