# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2023_09_30_173502) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "channels", force: :cascade do |t|
    t.text "channel_id"
    t.text "name"
    t.text "creator"
    t.boolean "is_private"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "members", force: :cascade do |t|
    t.text "channel_id"
    t.text "user_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "messages", force: :cascade do |t|
    t.text "channel_id"
    t.text "user_id"
    t.text "ts"
    t.text "thread_ts"
    t.text "text"
    t.text "url"
    t.text "image_name"
    t.text "image_url"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "users", force: :cascade do |t|
    t.text "user_id"
    t.text "email"
    t.text "image"
    t.text "real_name"
    t.text "display_name"
    t.boolean "is_admin"
    t.boolean "is_owner"
    t.boolean "is_primary_owner"
    t.boolean "is_restricted"
    t.boolean "is_ultra_restricted"
    t.boolean "is_bot"
    t.boolean "is_app_user"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

end
