from rest_framework import serializers
from .models import ViewHistory, Recommendation


class ViewHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewHistory
        fields = ['id', 'customer_id', 'book_id', 'viewed_at']


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ['id', 'customer_id', 'book_id', 'score', 'reason', 'created_at']
