import React from 'react';
import { ImageIcon } from 'lucide-react';
import { getCategoryStyles } from '../../utils/categoryStyles';

const ImagePlaceholder = ({ category }) => (
  <div className={`w-full h-full flex flex-col items-center justify-center opacity-40 group-hover:scale-110 transition-transform duration-1000 ${getCategoryStyles(category)}`}>
    <ImageIcon className="w-12 h-12 mb-2" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">No Image Asset</span>
  </div>
);

export default ImagePlaceholder;