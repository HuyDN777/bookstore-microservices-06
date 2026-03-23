from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ViewHistory, Recommendation
from .serializers import ViewHistorySerializer, RecommendationSerializer


class ViewHistoryView(APIView):
    """
    POST: Ghi lại lượt xem sách của customer.
    Sau khi ghi, tự sinh Recommendation cho các sách khác (book_id + 1, + 2)
    dựa trên lịch sử xem (logic đơn giản, có thể thay bằng ML sau).
    """
    def post(self, request):
        customer_id = request.data.get('customer_id')
        book_id = request.data.get('book_id')

        if not customer_id or not book_id:
            return Response({'error': 'customer_id and book_id are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Ghi lịch sử xem
        history = ViewHistory.objects.create(customer_id=customer_id, book_id=book_id)

        # Tạo recommendation đơn giản: recommend sách liền kề (simulate AI logic)
        viewed_books = ViewHistory.objects.filter(customer_id=customer_id).values_list('book_id', flat=True)
        recommended_book_id = int(book_id) + 1  # Logic đơn giản: gợi ý sách kế tiếp

        if recommended_book_id not in viewed_books:
            Recommendation.objects.get_or_create(
                customer_id=customer_id,
                book_id=recommended_book_id,
                defaults={
                    'score': 0.85,
                    'reason': f'Customers who viewed book {book_id} also liked this'
                }
            )

        serializer = ViewHistorySerializer(history)
        return Response({'message': 'View recorded', 'history': serializer.data}, status=status.HTTP_201_CREATED)


class RecommendationListView(APIView):
    """
    GET ?customer_id=X : Trả về danh sách sách được gợi ý cho customer.
    """
    def get(self, request):
        customer_id = request.META.get('HTTP_X_CUSTOMER_ID')
        if not customer_id:
            return Response({'error': 'customer_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        recommendations = Recommendation.objects.filter(customer_id=customer_id).order_by('-score')
        serializer = RecommendationSerializer(recommendations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
