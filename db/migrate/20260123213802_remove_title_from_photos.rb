class RemoveTitleFromPhotos < ActiveRecord::Migration[8.1]
  def change
    remove_column :photos, :title, :string
  end
end
