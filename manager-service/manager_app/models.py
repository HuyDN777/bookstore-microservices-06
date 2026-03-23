from django.db import models


class OrderReport(models.Model):
    order_id = models.IntegerField()
    customer_id = models.IntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20)
    shipping_status = models.CharField(max_length=20)
    reported_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for Order {self.order_id} (Customer {self.customer_id})"
