
import React from "react";

interface Props {
  imageUrl: string;
  onClear: () => void;
}

const ImagePreview: React.FC<Props> = ({ imageUrl, onClear }) => (
  <div className="relative mb-4">
    <div className="relative rounded-xl overflow-hidden group">
      <img
        src={imageUrl}
        alt="Preview"
        className="w-full h-48 object-cover rounded-xl"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button
          onClick={onClear}
          className="bg-red-500 bg-opacity-80 text-white p-2 rounded-full hover:bg-opacity-100 transition-all"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
);
export default ImagePreview;
