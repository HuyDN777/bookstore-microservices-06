from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    book_id = models.IntegerField()
    customer_id = models.IntegerField()
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('book_id', 'customer_id')

    def __str__(self):
        return f"Review {self.rating}/5 for Book {self.book_id} by Customer {self.customer_id}"
