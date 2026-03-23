from django.urls import path
from .views import OrderCreationView

urlpatterns = [
    path('create/', OrderCreationView.as_view(), name='order-create'),
]
