from django_filters import rest_framework as filters
from .models import File
import logging
from datetime import datetime, timedelta
from django.utils import timezone
from zoneinfo import ZoneInfo

logger = logging.getLogger(__name__)

class FileFilter(filters.FilterSet):
    min_size = filters.NumberFilter(field_name='size', lookup_expr='gte')
    max_size = filters.NumberFilter(field_name='size', lookup_expr='lte')
    start_date = filters.DateFilter(field_name='uploaded_at', lookup_expr='gte', method='filter_start_date')
    end_date = filters.DateFilter(field_name='uploaded_at', lookup_expr='lte', method='filter_end_date')
    file_type = filters.CharFilter(field_name='file_type', method='filter_file_type')
    is_reference = filters.BooleanFilter(field_name='is_reference')
    min_reference_count = filters.NumberFilter(field_name='reference_count', lookup_expr='gte')
    max_reference_count = filters.NumberFilter(field_name='reference_count', lookup_expr='lte')
    
    class Meta:
        model = File
        fields = {
            'original_filename': ['exact', 'icontains'],
        }

    def filter_file_type(self, queryset, name, value):
        logger.info(f"Filtering file type: {value}")
        if not value:
            return queryset
        # Convert to lowercase for case-insensitive comparison
        value = value.lower()
        # Remove dot if present at the start
        if value.startswith('.'):
            value = value[1:]
        return queryset.filter(file_type__iexact=value)

    def filter_start_date(self, queryset, name, value):
        logger.info(f"Filtering start date (raw value): {value}")
        
        # Create datetime at start of day (00:00:00) in IST
        ist_start = datetime.combine(value, datetime.min.time())
        ist_start = ist_start.replace(tzinfo=ZoneInfo('Asia/Kolkata'))
        logger.info(f"Start datetime in IST: {ist_start}")
        
        # Convert to UTC for database query
        utc_start = ist_start.astimezone(timezone.utc)
        logger.info(f"Start datetime in UTC: {utc_start}")
        
        return queryset.filter(uploaded_at__gte=utc_start)

    def filter_end_date(self, queryset, name, value):
        logger.info(f"Filtering end date (raw value): {value}")
        
        # Create datetime at end of day (23:59:59.999999) in IST
        ist_end = datetime.combine(value, datetime.max.time())
        ist_end = ist_end.replace(tzinfo=ZoneInfo('Asia/Kolkata'))
        logger.info(f"End datetime in IST: {ist_end}")
        
        # Convert to UTC for database query
        utc_end = ist_end.astimezone(timezone.utc)
        logger.info(f"End datetime in UTC: {utc_end}")
        
        return queryset.filter(uploaded_at__lte=utc_end)

    def filter_queryset(self, queryset):
        logger.info(f"Applying filters: {self.form.cleaned_data}")
        return super().filter_queryset(queryset) 