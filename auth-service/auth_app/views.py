import jwt
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import datetime

CUSTOMER_SERVICE_URL = "http://customer-service:8000/api/customers/verify/"

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)

        # Call customer service to verify credentials
        try:
            resp = requests.post(
                CUSTOMER_SERVICE_URL, 
                json={"email": email, "password": password}, 
                timeout=5
            )
            if resp.status_code == 200:
                customer_data = resp.json()
                customer_id = customer_data.get('id')
                
                # Generate JWT
                payload = {
                    'customer_id': customer_id,
                    'email': email,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
                    'iat': datetime.datetime.utcnow()
                }
                token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
                
                return Response({'token': token}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        except requests.exceptions.RequestException:
            return Response({"error": "Could not reach customer service for verification"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

class ValidateTokenView(APIView):
    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Token required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            return Response({"valid": True, "customer_id": payload['customer_id']}, status=status.HTTP_200_OK)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token expired"}, status=status.HTTP_401_UNAUTHORIZED)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
