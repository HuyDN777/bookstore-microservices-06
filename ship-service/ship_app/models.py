from django.db import models

class Shipment(models.Model):
    order_id = models.IntegerField()
    customer_address = models.TextField()
    status = models.CharField(max_length=50, default='Pending')
    assigned_staff_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Shipment for Order {self.order_id}"
