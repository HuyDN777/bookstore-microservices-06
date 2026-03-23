from django.urls import path
from .views import CustomerRegistrationView, CustomerVerifyView

urlpatterns = [
    path('register/', CustomerRegistrationView.as_view(), name='customer-register'),
    path('verify/', CustomerVerifyView.as_view(), name='customer-verify'),
]
