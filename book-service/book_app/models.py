from django.db import models

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    category_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.author}"
