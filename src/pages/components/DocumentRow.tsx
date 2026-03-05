import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadDocument } from "../../app/clientSlice";
import type { UserDocument } from "../../app/clientSlice";
import { Upload, Loader2, CheckCircle2, Paperclip } from "lucide-react";
import type { AppDispatch } from "../../app/store";
import type { RootState } from "../../app/store";
import StatusBadge from "./StatusBadge";
import { API_URL } from "../../service/env";

// ── DocumentRow ────────────────────────────────────────
const DocumentRow = ({ doc }: { doc: UserDocument }) => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => state.auth.token);
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(
    doc.pj ? doc.pj.split('/').pop() || 'Fichier joint' : null
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    // Validation côté client
    if (file.type !== 'application/pdf') {
      setUploadError('Seuls les fichiers PDF sont acceptés.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Le fichier ne doit pas dépasser 10 Mo.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const result = await dispatch(
      uploadDocument({ token, documentId: doc.id, file })
    );

    setUploading(false);

    if (uploadDocument.fulfilled.match(result)) {
      setUploadedName(file.name);
    } else {
      setUploadError(result.payload as string);
    }

    // Reset input pour permettre de re-sélectionner le même fichier
    e.target.value = '';
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">

      {/* Ligne principale */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">{doc.nomDoc}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Ajouté le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      {/* Fichier joint existant */}
        {uploadedName && (
        <a
            href={`${API_URL}${doc.pj}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 bg-white border border-gray-200 hover:border-blue-300 rounded-lg px-3 py-2 transition"
        >
            <Paperclip size={13} className="shrink-0" />
            <span className="truncate">{uploadedName}</span>
            <CheckCircle2 size={13} className="text-green-500 shrink-0 ml-auto" />
        </a>
        )}

      {/* Erreur upload */}
      {uploadError && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {uploadError}
        </p>
      )}

      {/* Bouton upload */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {uploading ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Upload size={13} />
            {uploadedName ? 'Remplacer le PDF' : 'Ajouter un PDF'}
          </>
        )}
      </button>

    </div>
  );
};

export default DocumentRow;
