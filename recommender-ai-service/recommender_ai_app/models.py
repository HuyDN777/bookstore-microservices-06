from django.db import models


class ViewHistory(models.Model):
    customer_id = models.IntegerField()
    book_id = models.IntegerField()
    viewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Customer {self.customer_id} viewed Book {self.book_id}"


class Recommendation(models.Model):
    customer_id = models.IntegerField()
    book_id = models.IntegerField()
    score = models.FloatField(default=1.0)
    reason = models.CharField(max_length=255, default='Based on your view history')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recommendation for Customer {self.customer_id}: Book {self.book_id}"
