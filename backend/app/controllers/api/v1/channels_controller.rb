class Api::V1::ChannelsController < ApplicationController
    def index
        @channels = Channel.all
        render json: @channels
    end
end

  