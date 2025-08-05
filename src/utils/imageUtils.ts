// Utility functions for image validation and Cloudinary integration

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
    };
  }
  
  // Check file size (limit to 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size must be less than 5MB'
    };
  }
  
  return { isValid: true };
};

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  if (folder) {
    formData.append('folder', folder);
  }

  // Note: Transformations should be configured in the upload preset
  // since we're using unsigned uploads

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const result = await response.json();
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
  }
};

// Upload PDF invoices to Cloudinary
export const uploadInvoiceToCloudinary = async (invoiceData: string, orderId: string, format: 'pdf' | 'html' = 'pdf'): Promise<CloudinaryUploadResult> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
  }

  const formData = new FormData();
  
  // Handle different formats
  if (format === 'pdf') {
    // For PDF files, expect data:application/pdf;base64,... format
    formData.append('file', invoiceData);
    formData.append('resource_type', 'raw');
    formData.append('public_id', `invoice_${orderId}_${Date.now()}.pdf`);
  } else {
    // For HTML files, convert to base64 and upload as raw with public access
    const htmlBase64 = `data:text/html;base64,${Buffer.from(invoiceData).toString('base64')}`;
    formData.append('file', htmlBase64);
    formData.append('resource_type', 'raw');
    formData.append('public_id', `invoice_${orderId}_${Date.now()}.html`);
    formData.append('access_mode', 'public'); // Ensure public access
  }
  
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'servenow/invoices');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Invoice upload failed');
    }

    const result = await response.json();
    
    // For HTML files, also store the content in database as backup

    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: 0, // Raw files don't have width/height
      height: 0,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to upload invoice');
  }
};

export const getImageDimensions = (imageUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to get image dimensions'));
    };
    
    img.src = imageUrl;
  });
};