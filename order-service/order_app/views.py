from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import OrderSerializer
from .models import Order
import requests
import json

PAY_SERVICE_URL = "http://pay-service:8000/api/payments/"
SHIP_SERVICE_URL = "http://ship-service:8000/api/shipments/"
MANAGER_SERVICE_URL = "http://manager-service:8000/api/manager/"

class OrderCreationView(APIView):
    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()

            payment_payload = {
                "order_id": order.id,
                "amount": str(order.total_amount)
            }
            shipping_payload = {
                "order_id": order.id,
                "customer_address": request.data.get("address", "Default Address")
            }
            headers = {'Content-type': 'application/json'}

            # Trigger Payment
            payment_status = "Failed"
            try:
                pay_resp = requests.post(PAY_SERVICE_URL, data=json.dumps(payment_payload), headers=headers, timeout=5)
                if pay_resp.status_code == 201:
                    payment_status = "Success"
            except:
                pass

            # Trigger Shipping
            shipping_status = "Failed"
            try:
                ship_resp = requests.post(SHIP_SERVICE_URL, data=json.dumps(shipping_payload), headers=headers, timeout=5)
                if ship_resp.status_code == 201:
                    shipping_status = "Success"
            except:
                pass

            order.status = f"Payment: {payment_status}, Shipping: {shipping_status}"
            order.save()

            # Báo cáo đơn hàng lên manager-service
            try:
                manager_payload = {
                    "order_id": order.id,
                    "customer_id": order.customer_id,
                    "total_amount": str(order.total_amount),
                    "payment_status": payment_status,
                    "shipping_status": shipping_status,
                }
                requests.post(MANAGER_SERVICE_URL, data=json.dumps(manager_payload), headers=headers, timeout=5)
            except:
                pass  # Không ảnh hưởng đến response chính nếu manager-service không sẵn sàng

            return Response({
                "message": "Order processed",
                "order": OrderSerializer(order).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        customer_id = request.META.get('HTTP_X_CUSTOMER_ID')
        if not customer_id:
            return Response({'error': 'customer_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        orders = Order.objects.filter(customer_id=customer_id).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
