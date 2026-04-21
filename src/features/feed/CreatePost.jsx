import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { Image, X, Loader2, Send } from 'lucide-react';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();
  const queryClient = useQueryClient();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const mutation = useMutation({
    mutationFn: (formData) => client.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      setContent('');
      removeImage();
      queryClient.invalidateQueries(['feed']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);
    
    mutation.mutate(formData);
  };

  const charCount = content.length;
  const isOverLimit = charCount > 500;

  return (
    <div className="premium-card p-6 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What's happening?"
          className="w-full bg-transparent text-lg resize-none min-h-[120px] focus:outline-none scrollbar-hide"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={550}
        />

        {preview && (
          <div className="relative mb-4 rounded-2xl overflow-hidden border dark:border-slate-800 animate-in zoom-in duration-300">
            <img src={preview} alt="Preview" className="w-full h-auto max-h-[300px] object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-slate-900/60 text-white rounded-full hover:bg-slate-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t dark:border-slate-800 pt-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 text-brand hover:bg-brand/10 rounded-full transition-all"
            >
              <Image size={22} />
            </button>
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-sm font-medium ${isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>
              {charCount}/500
            </span>
            <button
              type="submit"
              disabled={mutation.isPending || (!content.trim() && !image) || isOverLimit}
              className="bg-brand text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-brand/20 active:scale-95"
            >
              {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              <span>Post</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
