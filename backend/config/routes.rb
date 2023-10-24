Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :members, only: [:index]
      resources :users, only: [:index, :show]  
      resources :channels, only: [:index] do
        resources :messages, only: [:index]
      end
    end
  end
end
