from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import File
from .serializers import FileSerializer
from .utils import compute_file_hash
import logging

logger = logging.getLogger(__name__)

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    # def create(self, request, *args, **kwargs):
    #     try:
    #         logger.info(f"Received file upload request: {request.data}")
    #         file_obj = request.data.get('file')
    #         if not file_obj:
    #             return Response(
    #                 {"error": "No file was submitted"}, 
    #                 status=status.HTTP_400_BAD_REQUEST
    #             )

    #         # Compute hash of the uploaded file
    #         file_hash = compute_file_hash(file_obj)
    #         logger.info(f"Computed hash: {file_hash}")

    #         # Check if file with this hash already exists
    #         existing_file = File.objects.filter(hash=file_hash).first()
    #         if existing_file:
    #             logger.info(f"File with hash {file_hash} already exists")
    #             # Create a reference to the existing file
    #             reference_data = {
    #                 'original_filename': file_obj.name,
    #                 'file_type': file_obj.content_type,
    #                 'size': file_obj.size,
    #                 'hash': file_hash,
    #                 'is_reference': True,
    #                 'original_file': existing_file.id
    #             }
    #             serializer = self.get_serializer(data=reference_data)
    #             serializer.is_valid(raise_exception=True)
    #             self.perform_create(serializer)
    #             headers = self.get_success_headers(serializer.data)
    #             return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    #         # If no existing file, proceed with normal upload
    #         data = {
    #             'file': file_obj,
    #             'original_filename': file_obj.name,
    #             'file_type': file_obj.content_type,
    #             'size': file_obj.size,
    #             'hash': file_hash,
    #             'is_reference': False
    #         }
    #         serializer = self.get_serializer(data=data)
    #         serializer.is_valid(raise_exception=True)
    #         self.perform_create(serializer)
    #         headers = self.get_success_headers(serializer.data)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    #     except Exception as e:
    #         logger.error(f"Error in create: {str(e)}", exc_info=True)
    #         return Response(
    #             {"error": str(e)}, 
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
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
