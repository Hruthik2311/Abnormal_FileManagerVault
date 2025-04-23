import axios from 'axios';
import { File as FileType } from '../types/file';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const fileService = {
  async uploadFile(file: File): Promise<FileType> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_URL}/files/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If the error has a response from the server
        if (error.response) {
          // Handle specific error cases
          if (error.response.status === 400) {
            const errorData = error.response.data;
            if (errorData.hash && errorData.hash[0].code === 'unique') {
              // If it's a duplicate file, we still want to return the response data
              // as the backend will have created a reference
              if (error.response.data.id) {
                return error.response.data;
              }
              throw new Error('This file already exists in the system. A reference will be created.');
            }
            throw new Error(errorData.error || 'Invalid request. Please check your input.');
          }
          throw new Error(error.response.data.error || 'Failed to upload file');
        }
        // If there was no response (network error)
        else if (error.request) {
          throw new Error('Network error. Please check your connection.');
        }
      }
      // For any other type of error
      throw new Error('Failed to upload file. Please try again.');
    }
  },

  async getFiles(): Promise<FileType[]> {
    const response = await axios.get(`${API_URL}/files/`);
    return response.data;
  },

  async deleteFile(id: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/files/${id}/`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 400) {
            const errorData = error.response.data;
            if (errorData.error === "Cannot delete original file while references exist") {
              throw new Error("Cannot delete original file while references exist");
            }
            throw new Error(errorData.error || 'Failed to delete file');
          }
          throw new Error(error.response.data.error || 'Failed to delete file');
        }
        throw new Error('Network error. Please check your connection.');
      }
      throw new Error('Failed to delete file. Please try again.');
    }
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  },
}; 