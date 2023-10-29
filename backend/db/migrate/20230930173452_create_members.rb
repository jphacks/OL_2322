class CreateMembers < ActiveRecord::Migration[6.1]
  def change
    create_table :members do |t|

      t.text :channel_id
      t.text :user_id
      t.timestamps
    end
  end
end
