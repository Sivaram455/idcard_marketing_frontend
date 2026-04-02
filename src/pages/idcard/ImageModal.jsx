import { X, Download, Maximize2 } from "lucide-react";

export default function ImageModal({ isOpen, onClose, imageUrl, title }) {
    if (!isOpen || !imageUrl) return null;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = title || "image";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center animate-in zoom-in-95 duration-300">
                {/* Header/Controls */}
                <div className="absolute -top-12 right-0 flex items-center gap-3">
                    <button 
                        onClick={handleDownload}
                        className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all border border-white/10 group"
                        title="Download Image"
                    >
                        <Download size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-2.5 bg-white/10 hover:bg-rose-500 text-white rounded-xl backdrop-blur-sm transition-all border border-white/10 group"
                        title="Close"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Image Container */}
                <div className="w-full h-full bg-white/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center relative group">
                    <img 
                        src={imageUrl} 
                        alt={title || "Preview"} 
                        className="max-w-full max-h-[80vh] object-contain shadow-2xl"
                    />
                    
                    {/* Title Overlay */}
                    {title && (
                        <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                            <p className="text-white text-sm font-black uppercase tracking-[0.2em] italic">{title}</p>
                        </div>
                    )}
                </div>
                
                {/* Hint */}
                <p className="mt-4 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                    <Maximize2 size={12} /> Click outside to close
                </p>
            </div>
        </div>
    );
}
