class Api::V1::MessagesController < ApplicationController
    def all
        messages = Message.all.order(:ts)  # すべてのメッセージを取得し、tsで並べ替え
        render json: messages  # JSONとしてレンダリング
    end

    def allmessage
        user_id = params[:user_id]
    
        # user_id からそのユーザーだけの message をすべて取る
        user_messages = Message.where(user_id: user_id)
        puts "Retrieved messages: #{user_messages}"
    
        # すべての message の ts から、月と日を出す
        message_dates = user_messages.map do |message|
            # エポックタイムスタンプの小数点以下を切り捨て
            epoch_timestamp = message.ts.to_i
    
            # タイムスタンプをTimeオブジェクトに変換
            time_object = Time.at(epoch_timestamp).utc
    
            # Tokyoタイムゾーンに変換
            tokyo_time = time_object.in_time_zone('Tokyo')
    
            # 日付のみを取得
            date = tokyo_time.to_date
    
            puts "Converted ts: #{message.ts} to date: #{date}"
            date
        end.uniq

        # 一番新しい月と日を取得
        latest_date = message_dates.max
        puts "Latest date: #{latest_date}"

        start_date = latest_date - 6.days
        one_week_dates = (start_date..latest_date)
        puts "Date range: #{start_date} to #{latest_date}"

        # 過去1週間の日付ごとにメッセージをグループ化し、その数をカウント
        grouped_messages = user_messages.group_by do |message|
          Time.at(message.ts.to_f).in_time_zone("Tokyo").to_date  # タイムゾーンを Tokyo に設定
        end

        date_message_counts = one_week_dates.map do |date|
          messages_count = grouped_messages.fetch(date, []).size
          puts "Date: #{date}, Messages count: #{messages_count}"
          {
            date: date.strftime('%Y-%m-%d'),
            messages_count: messages_count
          }
        end

        # 結果を JSON として返す
        response = {
          user_messages_count: date_message_counts.sum { |data| data[:messages_count] },
          user_messages: date_message_counts
        }

        puts "Response: #{response}"

        render json: response
      end

    def index
        channel_id = params[:channel_id]
        messages = Message.where(channel_id: channel_id).order(:ts)
        grouped_messages = group_messages(messages)
        user_ids = Member.where(channel_id: channel_id).pluck(:user_id)
        users = User.where(user_id: user_ids).select(:user_id, :email, :image, :real_name)
        response = {
            grouped_messages: grouped_messages,
            users: users
        }
        render json: response
    end
    
    private

    def group_messages(messages)
        grouped = {}
    
        messages.each do |message|
            ts = message.ts
            thread_ts = message.thread_ts

            new_created_at = convert_ts_to_created_at(ts)
            message.update(created_at: new_created_at)  # created_atを更新
    
            # thread_ts が nil または空で、ts がグループ化されていない場合、新しい親メッセージ
            if (thread_ts.nil? || thread_ts.empty?) && !grouped.key?(ts)
                grouped[ts] = { parent: message, children: [], thread: [] }
            end
    
            # thread_ts が nil または空で、ts がすでにグループ化されている場合、それは同じ ts を持つ親メッセージの子
            if (thread_ts.nil? || thread_ts.empty?) && grouped.key?(ts)
                # 親メッセージの子でないことを確認してから追加
                unless grouped[ts][:parent].id == message.id
                    grouped[ts][:children] << message
                end
            end
    
            # thread_ts が nil または空ではなく、親メッセージ ts と一致する場合、親のスレッドメッセージ
            unless (thread_ts.nil? || thread_ts.empty?)
                if grouped.key?(thread_ts)
                    grouped[thread_ts][:thread] << message
                end
            end
        end
        grouped.values
    end

    private

    def convert_ts_to_created_at(ts)
        ts_parts = ts.split('.')
        seconds = ts_parts[0].to_i
        milliseconds = ts_parts[1][0,3]  # 最初の3文字を取得

        datetime = Time.at(seconds).utc.strftime('%Y-%m-%dT%H:%M:%S')
        new_created_at = "#{datetime}.#{milliseconds}Z"
        new_created_at
    end
end
