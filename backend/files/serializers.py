from rest_framework import serializers
from .models import File
import logging

logger = logging.getLogger(__name__)

class FileSerializer(serializers.ModelSerializer):
    reference_count = serializers.IntegerField(read_only=True)
    is_reference = serializers.BooleanField(default=False)
    original_file_id = serializers.UUIDField(source='original_file.id', read_only=True)
    file = serializers.FileField(required=False)
    
    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'size', 'uploaded_at', 
                 'hash', 'reference_count', 'is_reference', 'original_file_id', 'original_file']
        read_only_fields = ['id', 'uploaded_at', 'reference_count', 'original_file_id']
    
    def to_representation(self, instance):
        """Convert the instance to a representation that includes the original_file field"""
        representation = super().to_representation(instance)
        if instance.original_file:
            representation['original_file'] = {
                'id': str(instance.original_file.id),
                'original_filename': instance.original_file.original_filename,
                'file_type': instance.original_file.file_type,
                'size': instance.original_file.size,
                'uploaded_at': instance.original_file.uploaded_at,
                'hash': instance.original_file.hash,
                'reference_count': instance.original_file.reference_count
            }
        return representation
    
    def validate(self, data):
        """Validate the data before creating the file"""
        if data.get('is_reference', False):
            # For references, we don't need to validate the hash uniqueness
            return data
        return super().validate(data)
    
    def create(self, validated_data):
        try:
            logger.info(f"Creating file with data: {validated_data}")
            # If this is a reference, we don't need to handle the file field
            if validated_data.get('is_reference', False):
                logger.info("Creating reference file")
                validated_data.pop('file', None)
                validated_data.pop('hash', None)  # Remove hash for references
                # Ensure original_file is set
                if 'original_file' not in validated_data:
                    raise ValueError("original_file is required when creating a reference")
                # Convert original_file from ID to instance
                original_file_id = validated_data.pop('original_file')
                original_file = File.objects.get(id=original_file_id)
                validated_data['original_file'] = original_file
                # Increment reference count
                original_file.reference_count += 1
                original_file.save()
                # Set is_reference to True
                validated_data['is_reference'] = True
            else:
                logger.info("Creating new file")
                validated_data['is_reference'] = False
            
            return super().create(validated_data)
        except Exception as e:
            logger.error(f"Error in serializer create: {str(e)}", exc_info=True)
            raise 