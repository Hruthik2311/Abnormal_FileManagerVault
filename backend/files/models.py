from django.db import models
import uuid
import os
import logging

logger = logging.getLogger(__name__)

def file_upload_path(instance, filename):
    """Generate file path for new file upload"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', filename)

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=file_upload_path)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    hash = models.CharField(max_length=64)  # Removed unique=True
    uploaded_at = models.DateTimeField(auto_now_add=True)
    reference_count = models.PositiveIntegerField(default=1)
    is_reference = models.BooleanField(default=False)
    original_file = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='references')
    
    class Meta:
        ordering = ['-uploaded_at']
        constraints = [
            models.UniqueConstraint(
                fields=['hash'],
                condition=models.Q(is_reference=False),
                name='unique_hash_for_non_reference'
            )
        ]
    
    def increment_reference_count(self):
        """Increment the reference count of the original file"""
        if self.is_reference and self.original_file:
            original_file = self.original_file
            original_file.reference_count += 1
            original_file.save()
            logger.info(f"Incremented reference count for file {original_file.id} to {original_file.reference_count}")
    
    def __str__(self):
        return self.original_filename
