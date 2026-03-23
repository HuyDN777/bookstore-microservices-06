import requests
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Shipment
from .serializers import ShipmentSerializer

STAFF_SERVICE_URL = "http://staff-service:8000/api/staff/"


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all()
    serializer_class = ShipmentSerializer

    def create(self, request, *args, **kwargs):
        """Tạo shipment và tự động phân công nhân viên đang sẵn sàng từ staff-service."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Tìm nhân viên đang sẵn sàng
        assigned_staff_id = None
        try:
            staff_resp = requests.get(f"{STAFF_SERVICE_URL}available/", timeout=3)
            if staff_resp.status_code == 200:
                staff_data = staff_resp.json()
                assigned_staff_id = staff_data.get('id')
                # Đánh dấu nhân viên đó là bận
                requests.patch(
                    f"{STAFF_SERVICE_URL}{assigned_staff_id}/",
                    json={'is_available': False},
                    headers={'Content-Type': 'application/json'},
                    timeout=3
                )
        except requests.exceptions.RequestException:
            pass  # Không có staff-service, vẫn tạo shipment bình thường

        shipment = serializer.save(assigned_staff_id=assigned_staff_id)
        headers = self.get_success_headers(serializer.data)

        response_data = serializer.data
        response_data['assigned_staff_id'] = assigned_staff_id
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
