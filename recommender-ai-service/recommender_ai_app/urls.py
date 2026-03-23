from django.urls import path
from .views import ViewHistoryView, RecommendationListView

urlpatterns = [
    path('history/', ViewHistoryView.as_view(), name='view-history'),
    path('', RecommendationListView.as_view(), name='recommendations'),
]
