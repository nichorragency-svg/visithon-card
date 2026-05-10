import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTimes, FaImage } from 'react-icons/fa';
import { apiErrorMessage } from '../../apiClient';
import {
  getWizardState,
  normalizeStep8Images,
  patchStep8,
  uploadGalleryFile,
} from '../../supabase/supabaseWizard';
import CustomButton from '../components/CustomButton';
import GlassShell from '../components/GlassShell';
import { staticUrl } from '../utils/staticUrl';

const MAX_IMAGES = 24;

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `g_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function WizardStep8() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('visithon_card_token');
    if (!token) {
      navigate('/card/login');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getWizardState();
        if (cancelled) return;
        const s8 = data.profile?.step8;
        setImages(normalizeStep8Images(Array.isArray(s8?.images) ? s8.images : []));
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e, 'Could not load gallery.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const atCap = images.length >= MAX_IMAGES;

  const pickFiles = () => {
    if (atCap || uploading) return;
    fileRef.current?.click();
  };

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setError('');
    setUploading(true);
    
    try {
      for (const file of files) {
        const data = await uploadGalleryFile(file, 'image');
        if (!data?.url) continue;

        const entry = { id: data.id || newId(), url: data.url, name: '', price: '' };
        
        setImages((prev) => (prev.length >= MAX_IMAGES ? prev : [...prev, entry]));
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const patchImageMeta = (idx, patch) => {
    setImages((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const onContinue = async () => {
    setError('');
    setSaving(true);
    try {
      // Videos array empty bhejenge kyunke option khatam kar diya hy
      await patchStep8({ images, videos: [] });
      navigate('/card/wizard/step-9'); 
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not save gallery.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassShell>
      {/* File input sirf images ke liye */}
      <input 
        ref={fileRef} 
        type="file" 
        className="hidden" 
        accept="image/*" 
        multiple 
        onChange={onFiles} 
      />

      <div className="shrink-0 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
            <FaImage className="text-violet-400" />
            <h1 className="text-left text-2xl font-bold tracking-tight text-white">Photo Gallery</h1>
        </div>
        <p className="mt-1 text-xs text-white/45">Showcase your products or portfolio images.</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-400 mb-2"></div>
            <p className="text-sm text-white/50">Loading gallery...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-center text-sm text-red-100 backdrop-blur-xl">
                {error}
              </div>
            )}

            {/* Images Grid */}
            <div className="grid grid-cols-3 gap-2">
              {images.map((item, idx) => (
                <div key={item.id || `${item.url}-${idx}`} className="min-w-0">
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] shadow-inner">
                    <img
                      src={staticUrl(item.url)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAt(idx)}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition hover:bg-red-600/90"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                  
                  <div className="mt-1.5 space-y-1">
                    <input
                      type="text"
                      value={item.name || ''}
                      onChange={(e) => patchImageMeta(idx, { name: e.target.value })}
                      placeholder="Title"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] text-white/90 placeholder:text-white/35 focus:border-violet-400/40 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.price || ''}
                      onChange={(e) => patchImageMeta(idx, { price: e.target.value })}
                      placeholder="Price/Rate"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-[11px] text-cyan-200 placeholder:text-white/35 focus:border-cyan-400/40 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={pickFiles}
              disabled={atCap || uploading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] py-3.5 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:border-violet-400/35 hover:bg-white/[0.09] disabled:opacity-40"
            >
              <FaPlus className="text-violet-300" aria-hidden />
              {uploading ? 'Uploading…' : 'Add Photos'}
            </button>
            
            {atCap && (
              <p className="mt-2 text-center text-xs text-white/40">
                Maximum {MAX_IMAGES} images reached.
              </p>
            )}
          </>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 bg-white/[0.06] px-5 pb-8 pt-4 shadow-2xl backdrop-blur-2xl">
        <CustomButton variant="gradient" onClick={onContinue} disabled={saving || loading}>
          {saving ? 'Saving…' : 'Continue'} <span aria-hidden>→</span>
        </CustomButton>
      </div>
    </GlassShell>
  );
}