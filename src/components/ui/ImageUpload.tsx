import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, uploadToCloudinary, CloudinaryUploadResult } from '@/utils/imageUtils';

interface ImageUploadProps {
  value?: string | null; // Image URL (Cloudinary URL)
  onChange: (imageUrl: string | null, publicId?: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  onUploadStart?: () => void;
  onUploadComplete?: (result: CloudinaryUploadResult) => void;
  onUploadError?: (error: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = "Click to upload image or drag and drop",
  className = "",
  disabled = false,
  onUploadStart,
  onUploadComplete,
  onUploadError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (disabled) return;
    
    setError(null);
    setIsUploading(true);
    setUploadProgress('Validating file...');
    onUploadStart?.();

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file');
        onUploadError?.(validation.error || 'Invalid file');
        return;
      }

      setUploadProgress('Uploading to Cloudinary...');
      
      // Upload to Cloudinary
      const result = await uploadToCloudinary(file);
      
      setUploadProgress('Upload complete!');
      
      // Call the onChange with the secure URL and public ID
      onChange(result.secure_url, result.public_id);
      onUploadComplete?.(result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {value ? (
        // Image preview
        <div className="relative group">
          <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Replace button */}
          <button
            onClick={handleClick}
            className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100"
            type="button"
          >
            <div className="bg-white rounded-full p-2 shadow-lg">
              <Upload className="w-5 h-5 text-gray-700" />
            </div>
          </button>
        </div>
      ) : (
        // Upload area
        <div
          onClick={disabled ? undefined : handleClick}
          onDrop={disabled ? undefined : handleDrop}
          onDragOver={disabled ? undefined : handleDragOver}
          onDragLeave={disabled ? undefined : handleDragLeave}
          className={`
            w-full h-48 border-2 border-dashed rounded-lg transition-all duration-200
            flex flex-col items-center justify-center gap-3
            ${disabled 
              ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60' 
              : isDragging 
                ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer'
            }
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">{uploadProgress || 'Processing image...'}</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {disabled ? 'Image upload temporarily disabled' : placeholder}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {disabled ? 'Cloudinary integration coming soon' : 'PNG, JPG, GIF up to 5MB • Powered by Cloudinary'}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};