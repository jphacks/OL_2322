# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

require 'csv'
require 'json'

def create_message(channel_id, user, ts, thread_ts, text, url, image_name, image_url)
  Message.create(
    channel_id: channel_id,
    user_id: user,
    ts: ts,
    thread_ts: thread_ts,
    text: text,
    url: url,
    image_name: image_name,
    image_url: image_url
  )
end

# path設定
user_path = Rails.root.join('db', 'seeds', 'user.csv')
channel_path = Rails.root.join('db', 'seeds', 'channel.csv')
member_path = Rails.root.join('db', 'seeds', 'member.csv')
# message_path = Rails.root.join('db', 'seeds', 'message.csv')

# 配列定義
user_array = []
channel_array = []
member_array = []
# message_array = []

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
# CSV.foreach(message_path, headers: true) do |row|
#   message_array << { channel_id: row['channel_id'], user_id: row['user_id'], ts: row['ts'], thread_ts: row['thread_ts'], text: row['text'], url: row['url'], image_name: row['image_name'], image_url: row['image_url'] }
# end

# インポート
User.create!(user_array)
Channel.create!(channel_array)
Member.create!(member_array)
# Message.create!(message_array)

file_names = Dir.glob("./db/231028_slack-message-finder/*")
file_names.each do |json_file_path|

  channel_id = "C05TRD65BK8"

  file_data = File.read(json_file_path)
  json_data = JSON.parse(file_data)

  json_data_length = json_data.length

  # jsonデータは上に新しいデータが入っているので逆順にする
  json_data_reverse = json_data.reverse

  json_data_length.times do |i|
    body = json_data_reverse[i]

    channel = "C05TRD65BK8"
    user = body.fetch("user", "")
    ts = body.fetch("ts", "")
    thread_ts = body.fetch("thread_ts", "")
    puts JSON.pretty_generate(body)

    elements = body.fetch("blocks", [{}])[0].fetch("elements", [{}]).reject { |el| el.empty? }
    ## 配列からからの要素を除外する ##
    elements_length = elements.count()
    files = body.fetch("files", [{}]).reject { |el| el.empty? }
    files_length = files.length

    # puts elements
    puts "elements length", elements_length
    # puts files
    puts "files length", files_length
    # puts

    text = ""
    url = ""
    image_name = ""
    image_url = ""

    elements_length.times do |el_cnt|
      text = elements[el_cnt].dig("elements", 0, "text") || ""
      url = elements[el_cnt].dig("elements", 0, "url") || ""
      puts text, url
      create_message(channel, user, ts, thread_ts, text, url, image_name, image_url)

    end

    files_length.times do |f_cnt|
      image_name = files[f_cnt].dig("name") || ""
      image_url = files[f_cnt].dig("url_private") || ""
      puts image_name, image_url
      create_message(channel, user, ts, thread_ts, text, url, image_name, image_url)
    end
    # data = JSON.parse(File.read(json_file_path))  # your_json_dataには提供されたJSONデータを代入する

    # # データベースモデルに対応したクラスと仮定して、ActiveRecordを使用する場合
    # data.each do |message|
    #   # channel_id = message['channel_id'] || ''
    #   channel_id = "C05TRD65BK8"
    #   user_id = message['user']
    #   ts = message['ts']
    #   text = message['text'] || ''

    #   attachments = message['attachments']
    #   url = attachments&.dig(0, 'title_link') || ''
    #   image_name = attachments&.dig(0, 'title') || ''
    #   image_url = attachments&.dig(0, 'image_url') || ''
  end
end

