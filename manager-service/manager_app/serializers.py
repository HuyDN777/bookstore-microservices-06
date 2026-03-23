from rest_framework import serializers
from .models import OrderReport


class OrderReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderReport
        fields = ['id', 'order_id', 'customer_id', 'total_amount',
                  'payment_status', 'shipping_status', 'reported_at']
