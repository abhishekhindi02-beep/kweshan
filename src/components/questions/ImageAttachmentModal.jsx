import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon, Check, AlertCircle, X } from 'lucide-react';
import Modal from '../common/Modal';

export default function ImageAttachmentModal({
  isOpen,
  onClose,
  onSave
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [previewData, setPreviewData] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setImageUrl('');
      setPreviewData('');
      setError('');
      setActiveTab('upload');
    }
  }, [isOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewData(reader.result);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url) => {
    setImageUrl(url);
    setPreviewData(url.trim());
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalImage = previewData || imageUrl.trim();
    if (!finalImage) {
      setError('Please provide or upload an image.');
      return;
    }
    onSave(finalImage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Image Attachment"
      subtitle="Attach a diagram, textbook figure, or visual reference"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-[#0a0f1d] p-1 border border-[#1f2d47]">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#0df2c9] text-slate-950 shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#0df2c9] text-slate-950 shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Image URL</span>
          </button>
        </div>

        {activeTab === 'upload' ? (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Choose Local Image
            </label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#223252] hover:border-[#0df2c9]/60 rounded-xl bg-[#0a0f1d] cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-[#64748b] group-hover:text-[#0df2c9] mb-2 transition-colors" />
              <span className="text-xs text-[#94a3b8] group-hover:text-white font-medium">Click to select image</span>
              <span className="text-[10px] text-[#64748b] mt-1">PNG, JPG, SVG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/diagram.png"
              className="w-full px-4 py-2.5 bg-[#0a0f1d] border border-[#1f2d47] focus:border-[#0df2c9] rounded-xl text-sm text-white placeholder-[#64748b] focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* Image Preview */}
        {previewData && (
          <div className="relative rounded-xl overflow-hidden border border-[#223252] bg-[#090d16] p-2 flex items-center justify-center max-h-48">
            <img
              src={previewData}
              alt="Preview"
              className="max-h-44 w-auto object-contain rounded-lg"
              onError={() => setError('Unable to load image from provided source.')}
            />
            <button
              type="button"
              onClick={() => {
                setPreviewData('');
                setImageUrl('');
              }}
              className="absolute top-3 right-3 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1c273e]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#152037] hover:bg-[#1a2640] text-[#94a3b8] hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!previewData}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#0df2c9] to-[#00bfa5] text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-[#0df2c9]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Attach Image</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
