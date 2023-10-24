# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

require 'csv'

# path設定
user_path = Rails.root.join('db', 'seeds', 'user.csv')
channel_path = Rails.root.join('db', 'seeds', 'channel.csv')
member_path = Rails.root.join('db', 'seeds', 'member.csv')
message_path = Rails.root.join('db', 'seeds', 'message.csv')

# 配列定義
user_array = []
channel_array = []
member_array = []
message_array = []

# データ挿入
CSV.foreach(user_path, headers: true) do |row|
  user_array << { user_id: row['user_id'], email: row['email'], image: row['image'], real_name: row['real_name'], display_name: row['display_name'], is_admin: row['is_admin'], is_owner: row['is_owner'], is_primary_owner: row['is_primary_owner'], is_restricted: row['is_restricted'], is_ultra_restricted: row['is_ultra_restricted'], is_bot: row['is_bot'], is_app_user: row['is_app_user'] }
end
CSV.foreach(channel_path, headers: true) do |row|
  channel_array << { channel_id: row['channel_id'], name: row['name'], creator: row['creator'], is_private: row['is_private'] }
end
CSV.foreach(member_path, headers: true) do |row|
  member_array << { channel_id: row['channel_id'], user_id: row['user_id'] }
end
CSV.foreach(message_path, headers: true) do |row|
  message_array << { channel_id: row['channel_id'], user_id: row['user_id'], ts: row['ts'], thread_ts: row['thread_ts'], text: row['text'], url: row['url'], image_name: row['image_name'], image_url: row['image_url'] }
end

# インポート
User.create!(user_array)
Channel.create!(channel_array)
Member.create!(member_array)
Message.create!(message_array)