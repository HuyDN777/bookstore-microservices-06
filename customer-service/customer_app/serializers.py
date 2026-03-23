from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'name', 'email', 'password', 'address', 'created_at']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        customer = Customer.objects.create(**validated_data)
        return customer
