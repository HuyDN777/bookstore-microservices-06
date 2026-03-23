from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Staff
from .serializers import StaffSerializer


class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all()
    serializer_class = StaffSerializer

    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        """Trả về danh sách nhân viên đang sẵn sàng giao hàng."""
        available_staff = Staff.objects.filter(is_available=True).first()
        if available_staff:
            serializer = self.get_serializer(available_staff)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'error': 'No available staff at the moment'}, status=status.HTTP_404_NOT_FOUND)
