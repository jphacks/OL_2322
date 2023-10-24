class Api::V1::MessagesController < ApplicationController
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
    
end
  