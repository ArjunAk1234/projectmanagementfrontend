import { X, Download, FileText } from 'lucide-react';

export default function PreviewModal({ file, url, onClose }) {
  if (!file || !url) return null;

  const type = file.mime_type || '';
  const isImage = type.startsWith('image/');
  const isVideo = type.startsWith('video/');
  const isAudio = type.startsWith('audio/');
  const isPDF = type === 'application/pdf';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 opacity-70" />
            <h2 className="font-medium truncate max-w-md">{file.name}</h2>
        </div>
        <div className="flex gap-4">
          <a href={url} download className="p-2 hover:bg-white/10 rounded-full transition" title="Download">
            <Download className="w-5 h-5" />
          </a>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center p-4 pt-16">
        {isImage && (
          <img src={url} alt="Preview" className="max-h-full max-w-full object-contain shadow-2xl" />
        )}
        
        {isVideo && (
          <video controls autoPlay className="max-h-full max-w-4xl w-full rounded shadow-2xl">
            <source src={url} type={type} />
            Your browser does not support the video tag.
          </video>
        )}

        {isAudio && (
            <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                <div className="mb-4 text-gray-800 font-medium">{file.name}</div>
                <audio controls className="w-80">
                    <source src={url} type={type} />
                </audio>
            </div>
        )}

        {isPDF && (
          <iframe src={`${url}#toolbar=0`} className="w-full max-w-5xl h-[85vh] bg-white rounded shadow-2xl" />
        )}

        {!isImage && !isVideo && !isAudio && !isPDF && (
          <div className="text-center text-white">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <FileText className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                <p className="text-xl mb-2">No preview available</p>
                <p className="text-gray-400 mb-6 text-sm">This file type cannot be previewed directly.</p>
                <a 
                    href={url} 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-medium transition"
                >
                    Download File
                </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}