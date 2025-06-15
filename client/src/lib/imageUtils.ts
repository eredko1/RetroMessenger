// Image compression and processing utilities for AIM chat
export interface CompressedImage {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  mimeType: string;
  width: number;
  height: number;
}

export async function compressImage(file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx!.drawImage(img, 0, 0, width, height);
      
      // For GIFs, preserve as PNG to maintain quality
      const outputFormat = file.type === 'image/gif' ? 'image/png' : file.type;
      const dataUrl = canvas.toDataURL(outputFormat, quality);
      
      // Calculate compression ratio
      const originalSize = file.size;
      const compressedSize = Math.round((dataUrl.length * 3) / 4); // Approximate base64 size

      resolve({
        dataUrl,
        originalSize,
        compressedSize,
        mimeType: outputFormat,
        width: Math.round(width),
        height: Math.round(height)
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isSupportedImageType(file: File): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp'
  ];
  return supportedTypes.includes(file.type.toLowerCase());
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Parse and render formatted text with HTML support
export function renderFormattedText(content: string, formatting?: any): string {
  if (!content) return '';
  
  let formattedContent = content;
  
  if (formatting) {
    // Apply text formatting
    if (formatting.bold) {
      formattedContent = `<strong>${formattedContent}</strong>`;
    }
    if (formatting.italic) {
      formattedContent = `<em>${formattedContent}</em>`;
    }
    if (formatting.underline) {
      formattedContent = `<u>${formattedContent}</u>`;
    }
    if (formatting.color) {
      formattedContent = `<span style="color: ${formatting.color}">${formattedContent}</span>`;
    }
    if (formatting.fontSize) {
      formattedContent = `<span style="font-size: ${formatting.fontSize}px">${formattedContent}</span>`;
    }
  }
  
  // Convert URLs to clickable links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formattedContent = formattedContent.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  
  // Convert newlines to <br> tags
  formattedContent = formattedContent.replace(/\n/g, '<br>');
  
  return formattedContent;
}

// Extract formatting from rich text editor content
export function extractFormatting(htmlContent: string): any {
  const formatting: any = {};
  
  // Check for bold
  if (htmlContent.includes('<strong>') || htmlContent.includes('<b>')) {
    formatting.bold = true;
  }
  
  // Check for italic
  if (htmlContent.includes('<em>') || htmlContent.includes('<i>')) {
    formatting.italic = true;
  }
  
  // Check for underline
  if (htmlContent.includes('<u>')) {
    formatting.underline = true;
  }
  
  // Extract color
  const colorMatch = htmlContent.match(/color:\s*([^;"]+)/);
  if (colorMatch) {
    formatting.color = colorMatch[1].trim();
  }
  
  // Extract font size
  const fontSizeMatch = htmlContent.match(/font-size:\s*(\d+)px/);
  if (fontSizeMatch) {
    formatting.fontSize = parseInt(fontSizeMatch[1]);
  }
  
  return Object.keys(formatting).length > 0 ? formatting : null;
}