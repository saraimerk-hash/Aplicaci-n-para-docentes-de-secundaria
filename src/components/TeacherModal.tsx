import React, { useState } from 'react';
import { WordItem, WordCategory, Difficulty } from '../types';
import { X, Plus, Trash2, Edit2, RotateCcw, Download, Upload, Check, BookOpen } from 'lucide-react';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordBank: WordItem[];
  onUpdateWordBank: (newBank: WordItem[]) => void;
  onResetProgress: () => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  wordBank,
  onUpdateWordBank,
  onResetProgress,
}) => {
  const [editingWord, setEditingWord] = useState<WordItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportArea, setShowImportArea] = useState(false);

  // Form fields for editing/adding
  const [formData, setFormData] = useState<Partial<WordItem>>({
    word: '',
    translation: '',
    category: 'colores',
    difficulty: 'fácil',
    hint: '',
    exampleEn: '',
    exampleEs: '',
  });

  if (!isOpen) return null;

  const handleStartEdit = (item: WordItem) => {
    setEditingWord(item);
    setFormData(item);
    setIsAdding(false);
  };

  const handleStartAdd = () => {
    setEditingWord(null);
    setFormData({
      id: 'w_' + Date.now(),
      word: '',
      translation: '',
      category: 'colores',
      difficulty: 'fácil',
      hint: '',
      exampleEn: '',
      exampleEs: '',
    });
    setIsAdding(true);
  };

  const handleSaveWord = () => {
    if (!formData.word?.trim() || !formData.translation?.trim()) {
      alert('Por favor completa al menos la palabra en inglés y la traducción.');
      return;
    }

    const cleanedWord: WordItem = {
      id: formData.id || 'w_' + Date.now(),
      word: formData.word.trim().toLowerCase(),
      translation: formData.translation.trim(),
      category: (formData.category as WordCategory) || 'cotidiano',
      difficulty: (formData.difficulty as Difficulty) || 'fácil',
      hint: formData.hint?.trim() || `Palabra en inglés: ${formData.word}`,
      exampleEn: formData.exampleEn?.trim() || `Sample: ${formData.word}`,
      exampleEs: formData.exampleEs?.trim() || `Traducción: ${formData.translation}`,
    };

    if (isAdding) {
      onUpdateWordBank([...wordBank, cleanedWord]);
    } else if (editingWord) {
      onUpdateWordBank(wordBank.map((w) => (w.id === cleanedWord.id ? cleanedWord : w)));
    }

    setEditingWord(null);
    setIsAdding(false);
  };

  const handleDeleteWord = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta palabra del banco?')) {
      onUpdateWordBank(wordBank.filter((w) => w.id !== id));
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(wordBank, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'banco_palabras_spelling_mova.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onUpdateWordBank(parsed);
        setShowImportArea(false);
        setImportJsonText('');
        alert(`¡Banco de palabras actualizado exitosamente! ${parsed.length} palabras cargadas.`);
      } else {
        alert('El JSON ingresado no es válido o está vacío.');
      }
    } catch {
      alert('Error al leer el archivo JSON. Verifica la sintaxis.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-700 text-white p-4 sm:p-6 flex items-center justify-between border-b border-sky-400/30">
          <div>
            <span className="bg-white/20 text-sky-50 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
              I.E. MOVA • Panel Docente
            </span>
            <h2 className="text-xl font-black mt-1 flex items-center gap-2 text-white">
              <BookOpen className="w-5 h-5 text-amber-300" />
              Gestión del Banco de Palabras - José Jorge Muñoz
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-sky-50/70 p-4 rounded-xl border border-sky-100">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleStartAdd}
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Agregar Nueva Palabra
              </button>

              <button
                onClick={handleExportJson}
                className="bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Exportar JSON
              </button>

              <button
                onClick={() => setShowImportArea(!showImportArea)}
                className="bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Importar JSON
              </button>
            </div>

            <button
              onClick={() => {
                if (confirm('¿Seguro que deseas reiniciar el progreso del estudiante?')) {
                  onResetProgress();
                  onClose();
                }
              }}
              className="bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Reiniciar Progreso Alumno
            </button>
          </div>

          {/* Import JSON Area */}
          {showImportArea && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-amber-900">Importar Banco de Palabras (JSON)</h4>
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Pega aquí el JSON de palabras en formato [{ "id": "w1", "word": "cat", "translation": "gato", "category": "animales", "difficulty": "fácil" }]'
                className="w-full h-32 p-3 border border-amber-300 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImportArea(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportJson}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Cargar Palabras
                </button>
              </div>
            </div>
          )}

          {/* Form for Add/Edit */}
          {(isAdding || editingWord) && (
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-indigo-900 border-b border-indigo-200 pb-2">
                {isAdding ? '➕ Añadir Nueva Palabra' : '✏️ Editar Palabra'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Palabra en Inglés</label>
                  <input
                    type="text"
                    value={formData.word || ''}
                    onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                    placeholder="ej. teacher"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Traducción en Español</label>
                  <input
                    type="text"
                    value={formData.translation || ''}
                    onChange={(e) => setFormData({ ...formData, translation: e.target.value })}
                    placeholder="ej. Profesor / Docente"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
                  <select
                    value={formData.category || 'colores'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as WordCategory })}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="colores">Colores</option>
                    <option value="animales">Animales</option>
                    <option value="familia">Familia</option>
                    <option value="colegio">Colegio</option>
                    <option value="números">Números</option>
                    <option value="cotidiano">Cotidiano</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dificultad</label>
                  <select
                    value={formData.difficulty || 'fácil'}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="fácil">Fácil (3-4 letras)</option>
                    <option value="medio">Medio (5-6 letras)</option>
                    <option value="difícil">Difícil (7+ letras)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pista visual / Contexto</label>
                  <input
                    type="text"
                    value={formData.hint || ''}
                    onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                    placeholder="ej. Persona que guía tus clases en el colegio"
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ejemplo en Inglés</label>
                  <input
                    type="text"
                    value={formData.exampleEn || ''}
                    onChange={(e) => setFormData({ ...formData, exampleEn: e.target.value })}
                    placeholder="Our teacher is helpful."
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ejemplo en Español</label>
                  <input
                    type="text"
                    value={formData.exampleEs || ''}
                    onChange={(e) => setFormData({ ...formData, exampleEs: e.target.value })}
                    placeholder="Nuestro profesor es atento."
                    className="w-full p-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingWord(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveWord}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 shadow-sm"
                >
                  <Check className="w-4 h-4" /> Guardar Palabra
                </button>
              </div>
            </div>
          )}

          {/* Word List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Lista Actual de Vocabulario ({wordBank.length} palabras)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {wordBank.map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-extrabold text-indigo-950 text-base">{w.word}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          w.difficulty === 'fácil'
                            ? 'bg-emerald-100 text-emerald-800'
                            : w.difficulty === 'medio'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {w.difficulty}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-600">{w.translation}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {w.category}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleStartEdit(w)}
                      className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteWord(w.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
          >
            Cerrar Panel Docente
          </button>
        </div>

      </div>
    </div>
  );
};
