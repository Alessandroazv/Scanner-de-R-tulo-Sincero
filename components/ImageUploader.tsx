import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CameraIcon } from './icons/CameraIcon';

interface ImageUploaderProps {
  onImagesChange: (base64Images: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesChange }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(base64Images => {
      const allPreviews = [...previews, ...base64Images];
      setPreviews(allPreviews);
      // FIX: Pass the full data URL, not just the base64 content. This preserves the MIME type for the API call.
      onImagesChange(allPreviews);
    });
  }, [onImagesChange, previews]);

  const removeImage = (indexToRemove: number) => {
    const updatedPreviews = previews.filter((_, index) => index !== indexToRemove);
    setPreviews(updatedPreviews);
    // FIX: Pass the full data URL, not just the base64 content. This preserves the MIME type for the API call.
    onImagesChange(updatedPreviews);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />
      
      {previews.length === 0 ? (
        <div 
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-800 hover:border-cyan-500 hover:text-cyan-400 transition-all cursor-pointer">
          <UploadIcon />
          <p className="mt-2 text-center">Clique ou arraste as imagens para cá</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((src, index) => (
            <div key={index} className="relative group aspect-square">
              <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <button
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-600/80 rounded-full text-white hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label="Remove image"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
           <button 
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-800 hover:border-cyan-500 hover:text-cyan-400 transition-all">
             <CameraIcon />
             <span className="text-sm mt-1">Adicionar mais</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;