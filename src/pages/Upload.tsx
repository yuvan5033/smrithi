import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check } from 'lucide-react';
import { useCallback, useRef } from 'react';

// Get the API URL from the environment, fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3002';

function AppleProcessing({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  const phases = [
    "Uploading your photographs",
    "Sequencing your story",
    "Preparing your edition",
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current === phases.length) {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      } else {
        setPhase(current);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      className="flex flex-col items-center justify-center py-32 text-center min-h-[400px]"
    >
      <div className="relative mb-12">
        <div className="w-20 h-20 rounded-full bg-[var(--sienna)] opacity-10 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[var(--sienna)] animate-ping" />
        </div>
      </div>
      <h2 className="font-cormorant text-[clamp(2rem,5vw,3rem)] font-light text-[var(--ink)] mb-6">
        Crafting your <em className="italic text-[var(--sienna)]">edition.</em>
      </h2>
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-[0.9rem] tracking-[0.08em] uppercase text-[var(--ink-35)]"
        >
          {phases[phase]}
        </motion.p>
      </AnimatePresence>
    </motion.div>
  );
}

const TOTAL_STEPS = 12;

const STEP_CONSTRAINTS: Record<number, { max: number }> = {
  3: { max: 4 },
  4: { max: 6 },
  5: { max: 5 },
  6: { max: 6 },
  7: { max: 2 },
  8: { max: 15 },
  9: { max: 3 },
  10: { max: 4 },
};

export function Upload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, { url: string; name: string; id: string; status?: 'pending' | 'uploading' | 'uploaded' | 'error' }[]>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; id: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const uploadQueueRef = useRef<{ id: string; stepId: string; file: File; uploadUrl: string }[]>([]);
  const activeUploadsRef = useRef<number>(0);

  useEffect(() => {
    if (step === 2 && !orderId) {
      fetch(`${API_BASE}/api/orders`, { method: 'POST' })
        .then(res => res.json())
        .then(data => setOrderId(data.orderId))
        .catch(err => console.error('Failed to create order ID', err));
    }
  }, [step, orderId]);

  const processQueue = useCallback(() => {
    while (activeUploadsRef.current < 2 && uploadQueueRef.current.length > 0) {
      const task = uploadQueueRef.current.shift();
      if (!task) continue;

      activeUploadsRef.current += 1;
      setPhotos(prev => ({
        ...prev,
        [task.stepId]: (prev[task.stepId] || []).map(p => p.id === task.id ? { ...p, status: 'uploading' } : p)
      }));

      fetch(task.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': task.file.type },
        body: task.file
      })
        .then(res => {
          if (!res.ok) throw new Error('Upload failed');
          setPhotos(prev => ({
            ...prev,
            [task.stepId]: (prev[task.stepId] || []).map(p => p.id === task.id ? { ...p, status: 'uploaded' } : p)
          }));
        })
        .catch(err => {
          console.error('Upload error:', err);
          setPhotos(prev => ({
            ...prev,
            [task.stepId]: (prev[task.stepId] || []).map(p => p.id === task.id ? { ...p, status: 'error' } : p)
          }));
        })
        .finally(() => {
          activeUploadsRef.current -= 1;
          processQueue();
        });
    }
  }, []);

  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const addFiles = async (stepId: string, files: FileList | null, maxLimit: number) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    const currentCount = photos[stepId]?.length || 0;
    const allowedCount = Math.max(0, maxLimit - currentCount);
    const filesToAdd = imageFiles.slice(0, allowedCount);

    if (filesToAdd.length === 0) return;

    const newPhotos = filesToAdd.map(f => ({
      url: URL.createObjectURL(f),
      name: f.name,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending' as const,
    }));

    setPhotos(prev => ({
      ...prev,
      [stepId]: [...(prev[stepId] || []), ...newPhotos]
    }));

    if (orderId) {
      try {
        const res = await fetch(`${API_BASE}/api/upload-urls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            files: newPhotos.map((f, i) => ({
              id: f.id,
              stepId,
              filename: f.name,
              contentType: filesToAdd[i].type
            }))
          })
        });
        const data = await res.json();

        if (data.urls) {
          const tasks = newPhotos.map((f, i) => {
            const urlData = data.urls.find((u: any) => u.id === f.id);
            return {
              id: f.id,
              stepId,
              file: filesToAdd[i],
              uploadUrl: urlData?.url
            };
          }).filter(t => t.uploadUrl);

          uploadQueueRef.current.push(...(tasks as any[]));
          processQueue();
        }
      } catch (err) {
        console.error('Error fetching signed urls', err);
      }
    } else {
      console.warn('No orderId available for upload.');
    }
  };

  const removePhoto = (stepId: string, idToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotos(prev => ({
      ...prev,
      [stepId]: prev[stepId].filter(p => p.id !== idToRemove)
    }));
  };

  const nextStep = async () => {
    if (step === TOTAL_STEPS) {
      if (orderId) {
        try {
          await fetch(`${API_BASE}/api/orders/${orderId}/metadata`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          });
        } catch (err) {
          console.error('Failed to save metadata', err);
        }
      }
    }

    if (step < TOTAL_STEPS + 2) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setStep(s => s + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      nextStep();
    }
  };

  const getStepConfig = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return {
          title: <>Let's craft your<br />very own <span className="relative inline-block"><em className="italic text-[var(--sienna)] relative z-10 pr-2">edition</em><div className="absolute bottom-[0.1em] left-[-2%] w-[104%] h-[1px] bg-[var(--sienna)] rotate-[-1.5deg] rounded-full z-0 opacity-50"></div></span></>,
          progressText: "getting started",
          content: (
            <div className="flex flex-col gap-10 mt-12 w-full">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-jost text-[var(--ink-80)] mb-1">What's the destination?</label>
                <input
                  type="text"
                  className="bg-transparent border-0 border-b-[1px] border-[var(--border)] py-2 text-[1.1rem] font-jost text-[var(--ink)] outline-none focus:border-[var(--sienna)] transition-colors w-full"
                  value={form.dest || ''}
                  onChange={e => updateForm('dest', e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-jost text-[var(--ink-80)] mb-1">When was it?</label>
                <input
                  type="text"
                  className="bg-transparent border-0 border-b-[1px] border-[var(--border)] py-2 text-[1.1rem] font-jost text-[var(--ink)] outline-none focus:border-[var(--sienna)] transition-colors w-full"
                  value={form.dates || ''}
                  onChange={e => updateForm('dates', e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </motion.div>
            </div>
          )
        };
      case 2:
        return {
          title: <>Let's craft your<br />very own <span className="relative inline-block"><em className="italic text-[var(--sienna)] relative z-10 pr-2">edition</em><div className="absolute bottom-[0.1em] left-[-2%] w-[104%] h-[1px] bg-[var(--sienna)] rotate-[-1.5deg] rounded-full z-0 opacity-50"></div></span></>,
          progressText: "getting started",
          content: (
            <div className="flex flex-col gap-8 mt-12 w-full">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-2">
                <label className="text-[0.8rem] font-jost text-[var(--ink-80)] mb-1">What does the trip mean to you?</label>
                <input
                  type="text"
                  placeholder="A line you'd want to remember"
                  className="bg-transparent border-0 border-b-[1px] border-[var(--border)] py-2 text-[1.1rem] font-jost text-[var(--ink)] outline-none focus:border-[var(--sienna)] transition-colors placeholder:text-[var(--ink-35)] w-full"
                  value={form.meaning || ''}
                  onChange={e => updateForm('meaning', e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-2">
                  <label className="text-[0.8rem] font-jost text-[var(--ink-80)] mb-1">Your mobile number</label>
                  <input
                    type="tel"
                    placeholder="+91 ..."
                    className="bg-transparent border-0 border-b-[1px] border-[var(--border)] py-2 text-[1.1rem] font-jost text-[var(--ink)] outline-none focus:border-[var(--sienna)] transition-colors placeholder:text-[var(--ink-35)] w-full"
                    value={form.mobile || ''}
                    onChange={e => updateForm('mobile', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-2">
                  <label className="text-[0.8rem] font-jost text-[var(--ink-80)] mb-1">Your email address</label>
                  <input
                    type="email"
                    placeholder="For edition updates"
                    className="bg-transparent border-0 border-b-[1px] border-[var(--border)] py-2 text-[1.1rem] font-jost text-[var(--ink)] outline-none focus:border-[var(--sienna)] transition-colors placeholder:text-[var(--ink-35)] w-full"
                    value={form.email || ''}
                    onChange={e => updateForm('email', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </motion.div>
              </div>
            </div>
          )
        };
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10: {
        const titles = {
          3: "How did it begin?",
          4: "What did the first few moments feel like?",
          5: "Who made this trip what it was?",
          6: "When did it start feeling special?",
          7: "What was the best moment?",
          8: "What happened in between?",
          9: "Was there a moment that stayed with you?",
          10: "How did it end?"
        };
        const progressTexts = {
          3: "getting started", 4: "getting started",
          5: "taking shape", 6: "taking shape", 7: "taking shape", 8: "taking shape",
          9: "almost there", 10: "almost there"
        };

        const stepId = `step_${currentStep}`;
        const stepPhotos = photos[stepId] || [];
        const maxLimit = STEP_CONSTRAINTS[currentStep].max;
        const canAddMore = stepPhotos.length < maxLimit;

        return {
          title: titles[currentStep as keyof typeof titles],
          progressText: progressTexts[currentStep as keyof typeof progressTexts],
          content: (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mt-12 w-full">
              {stepPhotos.length === 0 ? (
                <div
                  className={`border border-[var(--border)] w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-400 ease-out relative bg-[rgba(243,237,227,0.3)] ${isDragging ? 'border-[var(--sienna)] bg-[rgba(78,52,32,0.04)] scale-[0.98] shadow-inner' : 'hover:bg-[rgba(243,237,227,0.8)]'
                    }`}
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(stepId, e.dataTransfer.files, maxLimit); }}
                >
                  <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => addFiles(stepId, e.target.files, maxLimit)} />
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[24px] border-b-[var(--ink-60)] mb-5 opacity-90" />
                  <div className="text-[0.65rem] tracking-[0.2em] font-medium uppercase text-[var(--ink-60)]">JPEG, PNG, HEIC</div>
                  <div className="text-[0.55rem] tracking-[0.1em] uppercase text-[var(--ink-60)] mt-2">Up to {maxLimit} photos</div>
                </div>
              ) : (
                <motion.div layout className="flex flex-col gap-6">
                  <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <AnimatePresence>
                      {stepPhotos.map((photo) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          key={photo.id}
                          className="aspect-square relative overflow-hidden group rounded-xl cursor-pointer"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <motion.img layoutId={`photo-${photo.id}`} src={photo.url} alt={photo.name} className="w-full h-full object-cover block" />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                          {photo.status === 'uploading' && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                          )}
                          {photo.status === 'uploaded' && (
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500/80 backdrop-blur-md rounded-full flex items-center justify-center">
                              <Check size={14} color="white" />
                            </div>
                          )}

                          <button
                            className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-md rounded-full border-none cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110"
                            onClick={(e) => removePhoto(stepId, photo.id, e)}
                          >
                            <X size={14} color="white" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {canAddMore && (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <div className="relative overflow-hidden rounded-xl">
                        <input type="file" multiple accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => addFiles(stepId, e.target.files, maxLimit)} />
                        <div className="w-full py-4 border border-dashed border-[var(--ink-35)] rounded-xl text-[var(--ink-80)] text-[0.75rem] font-medium tracking-[0.15em] uppercase flex items-center justify-center gap-3 hover:bg-[rgba(243,237,227,0.8)] transition-all duration-300">
                          <Plus size={16} className="text-[var(--sienna)]" /> Add more photographs
                        </div>
                      </div>
                      <div className="text-center text-[0.6rem] tracking-[0.1em] uppercase text-[var(--ink-60)] mt-3">
                        {maxLimit - stepPhotos.length} slot{maxLimit - stepPhotos.length !== 1 ? 's' : ''} remaining
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )
        };
      }
      case 11:
        return {
          title: "What would you want to remember years from now?",
          progressText: "almost there",
          content: (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-10 mt-12 w-full">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="A note to your future self"
                  className="bg-transparent border-0 border-b-[1px] border-[var(--border)] py-2 text-[1.1rem] font-jost text-[var(--ink)] outline-none focus:border-[var(--sienna)] transition-colors placeholder:text-[var(--ink-35)] w-full"
                  value={form.remember || ''}
                  onChange={e => updateForm('remember', e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
            </motion.div>
          )
        };
      case 12:
        return {
          title: "A song for this memory?",
          progressText: "last one!",
          content: (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col gap-10 mt-12 w-full">
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="If this trip had a soundtrack"
                  className="bg-transparent border-0 border-b-[1px] border-[var(--border)] py-2 text-[1.1rem] font-jost text-[var(--ink)] outline-none focus:border-[var(--sienna)] transition-colors placeholder:text-[var(--ink-35)] w-full"
                  value={form.song || ''}
                  onChange={e => updateForm('song', e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
            </motion.div>
          )
        };
      default:
        return null;
    }
  };

  if (step === TOTAL_STEPS + 1) {
    return <AppleProcessing onComplete={() => setStep(TOTAL_STEPS + 2)} />;
  }

  if (step === TOTAL_STEPS + 2) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="min-h-[100dvh] py-20 px-[max(24px,5vw)] flex flex-col items-center justify-center">
        <div className="w-17 h-17 border border-[var(--gold)] rounded-full flex items-center justify-center mb-10">
          <svg className="w-[26px] h-[26px] stroke-[var(--gold)]" viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="font-cormorant text-[clamp(2rem,4vw,3.5rem)] font-light text-[var(--ink)] mb-4">
          You're all <span className="relative inline-block"><em className="italic text-[var(--sienna)] relative z-10 pr-2">set.</em><div className="absolute bottom-[0.1em] left-[-2%] w-[104%] h-[1px] bg-[var(--sienna)] rotate-[-1.5deg] rounded-full z-0 opacity-50"></div></span>
        </h2>
        <p className="text-[0.92rem] leading-[1.95] text-[var(--ink-60)] max-w-[500px] text-center mb-12">
          We've received your photos and stories. Here's what happens next:
        </p>

        <div className="flex flex-col max-w-[460px] mx-auto mb-14 text-left border border-[var(--border)] rounded-xl overflow-hidden bg-[rgba(243,237,227,0.3)]">
          <div className="flex items-start gap-6 p-6 border-b border-[var(--border)]">
            <div className="font-cormorant text-2xl font-light text-[var(--gold)] flex-shrink-0 w-5 pt-px">1</div>
            <div className="text-[0.85rem] leading-[1.65] text-[var(--ink-60)]">
              <strong className="font-normal text-[var(--ink)] block mb-1">We send you a preview</strong>
              A full digital layout lands in your inbox within a few hours.
            </div>
          </div>
          <div className="flex items-start gap-6 p-6 border-b border-[var(--border)]">
            <div className="font-cormorant text-2xl font-light text-[var(--gold)] flex-shrink-0 w-5 pt-px">2</div>
            <div className="text-[0.85rem] leading-[1.65] text-[var(--ink-60)]">
              <strong className="font-normal text-[var(--ink)] block mb-1">We call you</strong>
              A quick 15–20 min call to walk through it together. We want to get this right.
            </div>
          </div>
          <div className="flex items-start gap-6 p-6">
            <div className="font-cormorant text-2xl font-light text-[var(--gold)] flex-shrink-0 w-5 pt-px">3</div>
            <div className="text-[0.85rem] leading-[1.65] text-[var(--ink-60)]">
              <strong className="font-normal text-[var(--ink)] block mb-1">We ship your book</strong>
              Once you approve, your edition is printed, bound, and shipped within two weeks.
            </div>
          </div>
        </div>

        <div className="flex gap-6 justify-center flex-wrap">
          <Button variant="ghost" onClick={() => navigate('/gallery')}>
            See past albums
          </Button>
          <Button onClick={() => navigate('/preview')}>Preview the book</Button>
        </div>
      </motion.div>
    );
  }

  const config = getStepConfig(step);

  const getStepVariants = (stepNumber: number) => {
    // Dynamic entry animations to break fatigue
    if (stepNumber <= 3) {
      return {
        initial: { opacity: 0, x: 20, filter: 'blur(4px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, x: -20, filter: 'blur(4px)' }
      };
    } else if (stepNumber <= 6) {
      return {
        initial: { opacity: 0, y: 20, filter: 'blur(4px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -20, filter: 'blur(4px)' }
      };
    } else if (stepNumber <= 9) {
      return {
        initial: { opacity: 0, scale: 0.95, filter: 'blur(4px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 1.05, filter: 'blur(4px)' }
      };
    } else {
      return {
        initial: { opacity: 0, x: -20, filter: 'blur(4px)' },
        animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, x: 20, filter: 'blur(4px)' }
      };
    }
  };

  const variants = getStepVariants(step);

  return (
    <>
      <div className="min-h-[100dvh] relative flex flex-col pt-32 pb-12 px-8 md:px-12 max-w-[640px] mx-auto z-10 overflow-x-hidden">
        {/* Background overlapping circles */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <motion.svg
            initial={false}
            animate={{
              rotate: step * 3,
              scale: 1 + (step * 0.015),
              x: step * 2,
              y: step * -2
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute right-[-40%] md:right-[-10%] top-[10%] w-[140%] md:w-[80%] h-auto opacity-30 stroke-[var(--border)] origin-center" viewBox="0 0 100 100" fill="none"
          >
            <circle cx="50" cy="50" r="40" strokeWidth="0.15" />
            <circle cx="60" cy="40" r="30" strokeWidth="0.15" />
            <circle cx="45" cy="55" r="45" strokeWidth="0.15" />
            <circle cx="70" cy="60" r="25" strokeWidth="0.15" />
          </motion.svg>
        </div>

        <div className="flex-1 flex flex-col w-full">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="text-[0.65rem] tracking-[0.2em] font-light uppercase font-jost text-[var(--ink-80)] mb-8">
            - the craft engine
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              {config && (
                <>
                  <h1 className="font-cormorant text-[2rem] md:text-4xl font-light text-[var(--ink)] leading-[1.1] max-w-[380px]">
                    {config.title}
                  </h1>
                  {config.content}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-16 pt-10 flex flex-col gap-5 w-full shrink-0">
            <div className="flex justify-end w-full">
              <Button onClick={nextStep} variant="primary" className="text-sm px-7 py-3 w-full md:w-auto font-jost tracking-widest uppercase">
                {step === TOTAL_STEPS ? 'Craft Edition' : 'Next'}
              </Button>
            </div>

            <div className="w-full">
              <div className="relative h-[1px] bg-[var(--border)] w-full overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 h-full bg-[var(--ink)]"
                  initial={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
                  animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={config?.progressText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.4 }}
                  className="text-center text-[0.65rem] tracking-[0.15em] lowercase font-jost text-[var(--ink-80)] mt-4"
                >
                  {config?.progressText}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[999] bg-[rgba(24,21,15,0.95)] backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.img
              layoutId={`photo-${selectedPhoto.id}`}
              src={selectedPhoto.url}
              className="max-w-full max-h-full object-contain rounded-sm shadow-2xl"
            />
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-lg transition-all duration-300"
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}