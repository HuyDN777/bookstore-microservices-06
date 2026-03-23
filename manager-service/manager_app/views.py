from rest_framework import viewsets
from .models import OrderReport
from .serializers import OrderReportSerializer


class OrderReportViewSet(viewsets.ModelViewSet):
    queryset = OrderReport.objects.all().order_by('-reported_at')
    serializer_class = OrderReportSerializer
    http_method_names = ['get', 'post', 'head', 'options']
