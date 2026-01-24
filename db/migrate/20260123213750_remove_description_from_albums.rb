class RemoveDescriptionFromAlbums < ActiveRecord::Migration[8.1]
  def change
    remove_column :albums, :description, :string
  end
end
