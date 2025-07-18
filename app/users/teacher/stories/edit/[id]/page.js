"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const LANGUAGES = ["Français", "Anglais", "Arabe", "Espagnol"];

export default function EditStoryPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [language, setLanguage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [category, setCategory] = useState("");
  const [classIds, setClassIds] = useState([]);
  const [classes, setClasses] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snap = await getDocs(collection(db, "class"));
        setClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        const storyDoc = await getDoc(doc(db, "story", id));
        if (storyDoc.exists()) {
          const data = storyDoc.data();
          setTitle(data.title || "");
          setSummary(data.summary || "");
          setLanguage(data.language || "");
          setIsActive(data.isActive ?? true);
          setCategory(data.category || "");
          setClassIds(data.classIds || []);
          setCurrentImage(data.illustrationUrl || null);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleClassSelect = (e) => {
    const options = Array.from(e.target.options);
    setClassIds(options.filter(o => o.selected).map(o => o.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError("");
    try {
      let illustrationUrl = currentImage;
      if (imageFile) {
        console.log('Uploading image to Firebase Storage...');
        const storage = getStorage();
        const storageRef = ref(storage, `story_illustrations/${Date.now()}_${imageFile.name}`);
        try {
          await uploadBytes(storageRef, imageFile);
          console.log('Image uploaded, getting download URL...');
          illustrationUrl = await getDownloadURL(storageRef);
          console.log('Download URL:', illustrationUrl);
        } catch (uploadErr) {
          console.error('Error during uploadBytes or getDownloadURL:', uploadErr);
          setError('Erreur lors de l\'upload de l\'image: ' + uploadErr.message);
          setUploading(false);
          return;
        }
      }
      await updateDoc(doc(db, "story", id), {
        title,
        summary,
        language,
        isActive,
        category,
        classIds,
        illustrationUrl,
      });
      router.push(`/users/teacher/stories/${id}`);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center px-4 py-2 text-indigo-600 hover:text-indigo-800 font-medium rounded-xl hover:bg-white/50 transition-all duration-200 mb-4"
          >
            <span className="mr-2">←</span>
            Retour
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">
            <span className="mr-3">📚</span>
            Modifier l'histoire
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">📖</span>
                  Titre
                </span>
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                required 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 placeholder-slate-400 text-black"
                placeholder="Titre de l'histoire"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">📝</span>
                  Résumé
                </span>
              </label>
              <textarea 
                value={summary} 
                onChange={e => setSummary(e.target.value)} 
                required 
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 placeholder-slate-400 text-black"
                placeholder="Résumé de l'histoire"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">🏷️</span>
                  Catégorie (optionnel)
                </span>
              </label>
              <input 
                type="text" 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 placeholder-slate-400 text-black"
                placeholder="Catégorie (ex: Conte, Fable...)"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">🌐</span>
                  Langue
                </span>
              </label>
              <select 
                value={language} 
                onChange={e => setLanguage(e.target.value)} 
                required 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black"
              >
                <option value="" className="text-black">Sélectionner une langue</option>
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang} className="text-black">{lang}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">🏫</span>
                  Classes concernées (optionnel)
                </span>
              </label>
              <select 
                multiple 
                value={classIds} 
                onChange={handleClassSelect} 
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none transition-all duration-200 bg-white/80 text-black"
                size={Math.min(4, classes.length)}
              >
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id} className="text-black">{cls.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">Astuce : Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs classes</p>
            </div>
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm">
                <span className="flex items-center">
                  <span className="mr-2">🖼️</span>
                  Illustration
                </span>
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                ref={fileInputRef}
                className="w-full px-4 py-2 rounded-2xl border border-slate-200 bg-white/80 text-black"
              />
              {(imagePreview || currentImage) && (
                <div className="mt-2 flex items-center gap-4">
                  <img src={imagePreview || currentImage} alt="Aperçu" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                  {(imagePreview || imageFile) && (
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); fileInputRef.current.value = null; }} className="text-red-500 hover:underline text-sm">Supprimer</button>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-slate-700 font-medium text-sm mb-3">
                <span className="flex items-center">
                  <span className="mr-2">⚡</span>
                  Statut
                </span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={isActive === true} 
                    onChange={() => setIsActive(true)}
                    className="sr-only"
                  />
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                    isActive === true 
                      ? 'border-green-400 bg-green-50 text-green-700' 
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${isActive === true ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <span className="font-medium">Active</span>
                  </div>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="status" 
                    checked={isActive === false} 
                    onChange={() => setIsActive(false)}
                    className="sr-only"
                  />
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                    isActive === false 
                      ? 'border-gray-400 bg-gray-50 text-gray-700' 
                      : 'border-slate-200 bg-white/60 text-slate-600 hover:border-slate-300'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${isActive === false ? 'bg-gray-500' : 'bg-slate-300'}`}></div>
                    <span className="font-medium">Inactive</span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">Par défaut, les nouvelles histoires sont actives</p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center text-red-700">
                  <span className="mr-2">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button 
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
              >
                <span className="mr-2">✕</span>
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 