class Api::V1::UsersController < ApplicationController
    def index
        @users = User.all
        render json: @users
    end

    def show
        user = User.find_by(user_id: params[:id])
        if user
            render json: { display_name: user.display_name, image: user.image }
        else
            render json: { error: 'User not found' }, status: :not_found
        end
    end
end
