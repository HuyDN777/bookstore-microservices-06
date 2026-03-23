import requests
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer

CATALOG_SERVICE_URL = "http://catalog-service:8000/api/catalog/"
RECOMMENDER_SERVICE_URL = "http://recommender-ai-service:8000/api/recommendations/history/"


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def retrieve(self, request, *args, **kwargs):
        """Lấy chi tiết sách: kèm theo tên danh mục từ catalog-service,
        đồng thời ghi lịch sử xem vào recommender-ai-service."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Lấy thông tin category từ catalog-service
        if instance.category_id:
            try:
                cat_resp = requests.get(
                    f"{CATALOG_SERVICE_URL}{instance.category_id}/",
                    timeout=3
                )
                if cat_resp.status_code == 200:
                    data['category'] = cat_resp.json()
            except requests.exceptions.RequestException:
                data['category'] = None  # catalog-service không sẵn sàng, bỏ qua

        # Ghi lịch sử xem vào recommender-ai-service
        customer_id = request.META.get('HTTP_X_CUSTOMER_ID')
        if customer_id:
            try:
                requests.post(
                    RECOMMENDER_SERVICE_URL,
                    json={'customer_id': customer_id, 'book_id': instance.id},
                    timeout=3
                )
            except requests.exceptions.RequestException:
                pass  # Không ảnh hưởng đến response chính

        return Response(data, status=status.HTTP_200_OK)
