from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import CustomerSerializer
import requests
import json

CART_SERVICE_URL = "http://cart-service:8000/api/carts/"

class CustomerRegistrationView(APIView):
    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            customer = serializer.save()
            
            # Synchronously create cart
            try:
                cart_payload = {"customer_id": customer.id}
                headers = {'Content-type': 'application/json'}
                cart_response = requests.post(CART_SERVICE_URL, data=json.dumps(cart_payload), headers=headers, timeout=5)
                
                if cart_response.status_code == 201:
                    return Response({"message": "Customer registered and cart created.", "customer": serializer.data}, status=status.HTTP_201_CREATED)
                else:
                    return Response({"message": "Customer registered but cart creation failed.", "customer": serializer.data, "cart_error": cart_response.text}, status=status.HTTP_201_CREATED)
            except requests.exceptions.RequestException as e:
                return Response({"message": "Customer registered but cart service is unreachable.", "customer": serializer.data, "error": str(e)}, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from .models import Customer
class CustomerVerifyView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        try:
            customer = Customer.objects.get(email=email, password=password)
            return Response({"valid": True, "id": customer.id}, status=status.HTTP_200_OK)
        except Customer.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_404_NOT_FOUND)

