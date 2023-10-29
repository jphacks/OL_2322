class CreateUsers < ActiveRecord::Migration[6.1]
  def change
    create_table :users do |t|

      t.text :user_id
      t.text :email
      t.text :image
      t.text :real_name
      t.text :display_name
      t.boolean :is_admin
      t.boolean :is_owner
      t.boolean :is_primary_owner
      t.boolean :is_restricted
      t.boolean :is_ultra_restricted
      t.boolean :is_bot
      t.boolean :is_app_user
      t.timestamps
    end
  end
end
