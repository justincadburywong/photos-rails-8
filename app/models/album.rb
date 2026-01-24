class Album < ApplicationRecord
  has_many :photos, dependent: :destroy
  extend FriendlyId
  friendly_id :name, use: :slugged

  validates :name, presence: true, length: { maximum: 100 }
  
  scope :recent, -> { order(created_at: :desc) }
end
