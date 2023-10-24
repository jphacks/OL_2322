class CreateMessages < ActiveRecord::Migration[6.1]
  def change
    create_table :messages do |t|

      t.text :channel_id
      t.text :user_id
      t.text :ts
      t.text :thread_ts
      t.text :text
      t.text :url
      t.text :image_name
      t.text :image_url
      t.timestamps
    end
  end
end
