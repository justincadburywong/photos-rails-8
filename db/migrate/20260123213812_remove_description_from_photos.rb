class RemoveDescriptionFromPhotos < ActiveRecord::Migration[8.1]
  def change
    remove_column :photos, :description, :string
  end
end
