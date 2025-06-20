from django.shortcuts import render
from rest_framework import viewsets, status, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.response import Response
from .models import File
from .serializers import FileSerializer
from .utils import compute_file_hash
from .filters import FileFilter
import logging
from django.http import HttpResponse

logger = logging.getLogger(__name__)

def root_view(request):
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>File Hub</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
            .links {
                margin-top: 20px;
            }
            a {
                display: inline-block;
                margin: 10px;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
            }
            a:hover {
                background-color: #0056b3;
            }
        </style>
    </head>
    <body>
        <h1>Welcome to File Hub</h1>
        <div class="links">
            <a href="/admin/">Admin Interface</a>
            <a href="/api/">API Endpoints</a>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = FileFilter
    search_fields = ['original_filename', 'file_type']
    ordering_fields = ['uploaded_at', 'size', 'reference_count', 'original_filename']
    ordering = ['-uploaded_at']  # Default ordering

    def list(self, request, *args, **kwargs):
        logger.info(f"Received filter parameters: {request.query_params}")
        queryset = self.filter_queryset(self.get_queryset())
        logger.info(f"Filtered queryset count: {queryset.count()}")
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Received file upload request: {request.data}")
            file_obj = request.data.get('file')
            if not file_obj:
                return Response(
                    {"error": "No file was submitted"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Compute hash of the uploaded file
            file_hash = compute_file_hash(file_obj)
            logger.info(f"Computed hash: {file_hash}")
            
            # Check if file with this hash already exists
            existing_file = File.objects.filter(hash=file_hash, is_reference=False).first()
            if existing_file:
                # Increment reference count and save
                existing_file.reference_count += 1
                existing_file.save()
                logger.info(f"Incremented reference count for file with hash {file_hash}")
                serializer = self.get_serializer(existing_file)
                return Response({
                    "message": "File already exists. Reference count incremented.",
                    "file": serializer.data
                }, status=status.HTTP_200_OK)

            # If no existing file, proceed with normal upload
            data = {
                'file': file_obj,
                'original_filename': file_obj.name,
                'file_type': file_obj.content_type,
                'size': file_obj.size,
                'hash': file_hash,
                'is_reference': False
            }
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as e:
            logger.error(f"Error in create: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            logger.info(f"Deleting file: {instance.id}, reference_count: {instance.reference_count}")
            
            # If reference_count > 1, just decrement the count
            if instance.reference_count > 1:
                logger.info(f"Decrementing reference count from {instance.reference_count}")
                instance.reference_count -= 1
                instance.save()
                logger.info(f"New reference count: {instance.reference_count}")
                return Response(
                    {"message": "Reference count decremented"}, 
                    status=status.HTTP_200_OK
                )
            else:
                # If reference_count is 1, delete the file completely
                logger.info("Deleting file as it has no more references")
                self.perform_destroy(instance)
                return Response(status=status.HTTP_204_NO_CONTENT)
                
        except Exception as e:
            logger.error(f"Error in destroy: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )