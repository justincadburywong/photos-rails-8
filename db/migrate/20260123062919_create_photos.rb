class CreatePhotos < ActiveRecord::Migration[8.1]
  def change
    create_table :photos do |t|
      t.references :album, null: false, foreign_key: true
      t.string :title
      t.text :description

      t.timestamps
    end
  end
end
