export interface File {
  id: string;
  original_filename: string;
  file_type: string;
  size: number;
  uploaded_at: string;
  file: string;
  hash: string;
  reference_count: number;
  is_reference: boolean;
  original_file_id?: string;
} 