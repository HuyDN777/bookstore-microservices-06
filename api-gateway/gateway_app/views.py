from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import requests

SERVICE_REGISTRY = {
    'auth': 'http://auth-service:8000',
    'customers': 'http://customer-service:8000',
    'carts': 'http://cart-service:8000',
    'books': 'http://book-service:8000',
    'orders': 'http://order-service:8000',
    'payments': 'http://pay-service:8000',
    'shipments': 'http://ship-service:8000',
    'reviews': 'http://comment-rate-service:8000',
    'catalog': 'http://catalog-service:8000',
    'manager': 'http://manager-service:8000',
    'recommendations': 'http://recommender-ai-service:8000',
    'staff': 'http://staff-service:8000',
}

@csrf_exempt
def proxy_view(request, service, path):
    if service not in SERVICE_REGISTRY:
        return JsonResponse({'error': 'Service not found in gateway registry'}, status=404)

    is_public = (
        (service == 'auth') or 
        (service == 'customers' and path in ['register/', 'register']) or
        (request.method == 'GET' and service in ['books', 'catalog', 'reviews'])
    )
    
    headers = {
        'Content-Type': request.META.get('CONTENT_TYPE', 'application/json'),
        'Accept': request.META.get('HTTP_ACCEPT', 'application/json'),
    }

    auth_header = request.META.get('HTTP_AUTHORIZATION')
    
    if not is_public:
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Unauthorized: Bearer token missing or improperly formatted'}, status=401)
            
        token = auth_header.split(' ')[1]
        
        # Verify token via auth-service
        try:
            auth_resp = requests.post(
                f"{SERVICE_REGISTRY['auth']}/api/auth/validate/", 
                json={'token': token}, 
                timeout=5
            )
            if auth_resp.status_code != 200:
                resp_data = auth_resp.json() if auth_resp.content else {"error": "Invalid token"}
                return JsonResponse({'error': 'Unauthorized', 'details': resp_data}, status=401)
            
            # Forward customer ID as a header to internal services
            valid_data = auth_resp.json()
            headers['X-Customer-Id'] = str(valid_data.get('customer_id', ''))
        except requests.exceptions.RequestException:
            return JsonResponse({'error': 'Auth service is unavailable'}, status=503)

    if auth_header:
        headers['Authorization'] = auth_header

    target_url = f"{SERVICE_REGISTRY[service]}/api/{service}/{path}"
    
    # Forward query parameters
    querystring = request.META.get('QUERY_STRING', '')
    if querystring:
        target_url = f"{target_url}?{querystring}"

    try:
        if request.method == 'GET':
            response = requests.get(target_url, headers=headers, timeout=10)
        elif request.method == 'POST':
            response = requests.post(target_url, data=request.body, headers=headers, timeout=10)
        elif request.method == 'PUT':
            response = requests.put(target_url, data=request.body, headers=headers, timeout=10)
        elif request.method == 'PATCH':
            response = requests.patch(target_url, data=request.body, headers=headers, timeout=10)
        elif request.method == 'DELETE':
            response = requests.delete(target_url, headers=headers, timeout=10)
        else:
            return JsonResponse({'error': f'Method {request.method} not supported'}, status=405)

        return HttpResponse(
            response.content,
            status=response.status_code,
            content_type=response.headers.get('Content-Type', 'application/json')
        )

    except requests.exceptions.RequestException as e:
        return JsonResponse({'error': 'Failed to reach the target service', 'details': str(e)}, status=503)
