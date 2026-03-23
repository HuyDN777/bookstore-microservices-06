from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderReportViewSet

router = DefaultRouter()
router.register(r'', OrderReportViewSet, basename='orderreport')

urlpatterns = [
    path('', include(router.urls)),
]
