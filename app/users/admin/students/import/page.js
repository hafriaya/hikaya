"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { getAuth } from 'firebase/auth';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function ImportStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState({ success: 0, errors: 0, details: [] });
  const fileInputRef = useRef(null);
  const router = useRouter();

  // Load classes and teachers on component mount
  useState(() => {
    const loadData = async () => {
      try {
        // Load classes
        const classesSnapshot = await getDocs(collection(db, "class"));
        const classesData = classesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClasses(classesData);

        // Load teachers
        const teachersSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "teacher")));
        const teachersData = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          alert('Le fichier Excel doit contenir au moins une ligne d\'en-tête et une ligne de données');
          return;
        }

        const headers = jsonData[0].map(h => h?.toString().toLowerCase().trim());
        const dataRows = jsonData.slice(1);

        const parsedData = dataRows.map(row => {
          const student = {};
          headers.forEach((header, index) => {
            student[header] = row[index]?.toString().trim() || '';
          });
          return student;
        });

        processData(parsedData);
      } catch (error) {
        alert('Erreur lors de la lecture du fichier Excel: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processData = (data) => {
    const validatedStudents = data.map((student, index) => {
      // Combine Nom and Prenom
      const name = `${student['nom'] || ''} ${student['prenom'] || ''}`.trim();

      // Calculate age from Date de naissance
      let age = '';
      if (student['date de naissance']) {
        const birthDate = new Date(student['date de naissance']);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      const mappedStudent = {
        name,
        age,
        classid: selectedClass, // from dropdown
        teacherId: selectedTeacher, // from dropdown
        isactive: true
      };

      const errors = validateStudent(mappedStudent);
      return {
        ...mappedStudent,
        errors,
        isValid: errors.length === 0,
        rowNumber: index + 2
      };
    });

    setStudents(validatedStudents);
    setResults({
      success: validatedStudents.filter(s => s.isValid).length,
      errors: validatedStudents.filter(s => !s.isValid).length,
      details: validatedStudents
    });
  };

  const validateStudent = (student) => {
    const errors = [];

    if (!student.name || student.name.trim().length < 2) {
      errors.push('Nom invalide');
    }

    if (!student.age || isNaN(student.age) || student.age < 3 || student.age > 20) {
      errors.push('Âge doit être entre 3 et 20 ans');
    }

    if (!selectedClass) {
      errors.push('Classe requise');
    } else {
      const classExists = classes.find(c => c.id === selectedClass);
      if (!classExists) {
        errors.push('Classe non trouvée');
      }
    }

    if (!selectedTeacher) {
      errors.push('Enseignant requis');
    }

    return errors;
  };

  const importStudents = async () => {
    if (!selectedTeacher) {
      alert('Veuillez sélectionner un enseignant');
      return;
    }

    const validStudents = students.filter(s => s.isValid);
    if (validStudents.length === 0) {
      alert('Aucun étudiant valide à importer');
      return;
    }

    setImporting(true);
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      alert('Vous devez être connecté pour importer des étudiants');
      setImporting(false);
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const importResults = [];

    for (const student of validStudents) {
      try {
        const studentData = {
          name: student.name.trim(),
          age: parseInt(student.age),
          classId: student.classid,
          isActive: student.isactive === 'true' || student.isactive === '1' || student.isactive === 'oui' || student.isactive === true,
          teacherId: selectedTeacher,
          booksRead: 0,
          createdAt: new Date()
        };

        await addDoc(collection(db, "students"), studentData);
        successCount++;
        importResults.push({
          name: student.name,
          status: 'success',
          message: 'Importé avec succès'
        });
      } catch (error) {
        errorCount++;
        importResults.push({
          name: student.name,
          status: 'error',
          message: error.message
        });
      }
    }

    setResults({
      success: successCount,
      errors: errorCount,
      details: importResults
    });
    setImporting(false);

    if (successCount > 0) {
      alert(`${successCount} étudiant(s) importé(s) avec succès!`);
      router.push('/users/admin/dashboard');
    }
  };

  const downloadTemplate = () => {
    // Create sample data
    const sampleData = [
      ['name', 'age', 'classid', 'isactive'],
      ['Ahmed Ben Ali', 5, 'CLASS_ID_HERE', true],
      ['Fatima Zahra', 4, 'CLASS_ID_HERE', true],
      ['Mohammed Hassan', 6, 'CLASS_ID_HERE', true],
      ['Amina El Khadra', 3, 'CLASS_ID_HERE', true],
      ['Youssef Ben Salem', 5, 'CLASS_ID_HERE', true],
      ['Layla Ben Amor', 4, 'CLASS_ID_HERE', true],
      ['Karim Ben Mansour', 6, 'CLASS_ID_HERE', true],
      ['Nour Ben Hamed', 3, 'CLASS_ID_HERE', true],
      ['Sara Ben Youssef', 5, 'CLASS_ID_HERE', true],
      ['Adam Ben Ali', 4, 'CLASS_ID_HERE', true]
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sampleData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Étudiants');

    // Generate and download file
    XLSX.writeFile(wb, 'template_etudiants.xlsx');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/users/admin/dashboard" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord Admin
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Importer des Étudiants</h1>
          <p className="text-slate-600">Importez une liste d'étudiants depuis un fichier Excel</p>
        </div>

        {/* Teacher Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Sélectionner l'Enseignant</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Enseignant responsable *
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black"
              required
            >
              <option value="">Sélectionner un enseignant</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName || teacher.email}
                </option>
              ))}
            </select>
            <p className="text-sm text-slate-500 mt-1">
              Tous les étudiants importés seront assignés à cet enseignant
            </p>
          </div>

          {/* Class Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Classe *
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-black"
              required
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-slate-500 mt-1">
              Tous les étudiants importés seront assignés à cette classe
            </p>
          </div>
        </div>

        {/* Excel Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Import depuis un fichier Excel</h2>
          
          {/* Template Download */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">📋 Format requis pour Excel</h3>
            <p className="text-blue-700 text-sm mb-3">
              Le fichier doit contenir les colonnes: <code className="bg-blue-100 px-2 py-1 rounded">name,age,classid,isactive</code>
            </p>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger le modèle Excel
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sélectionner un fichier Excel (.xlsx)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Choisir un fichier Excel
              </button>
              <p className="text-slate-500 text-sm mt-2">
                ou glissez-déposez votre fichier Excel ici
              </p>
            </div>
          </div>
        </div>

        {/* Students List */}
        {students.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                Étudiants à importer ({students.length})
              </h2>
              <div className="flex gap-2">
                <span className="text-green-600 text-sm">
                  ✓ {results.success} valide(s)
                </span>
                <span className="text-red-600 text-sm">
                  ✗ {results.errors} erreur(s)
                </span>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {students.map((student, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    student.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {student.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                          <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-800">
                            {student.name}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Âge</label>
                          <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-800">
                            {student.age}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Classe</label>
                          <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-800">
                            {classes.find(c => c.id === student.classid)?.name || student.classid}
                          </div>
                        </div>
                      </div>
                      {student.errors.length > 0 && (
                        <div className="mt-2 text-red-600 text-sm">
                          {student.errors.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Import Button */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                {results.success > 0 && (
                  <span className="text-green-600 font-medium">
                    {results.success} étudiant(s) prêt(s) à être importé(s)
                  </span>
                )}
              </div>
              <button
                onClick={importStudents}
                disabled={importing || results.success === 0 || !selectedTeacher}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  importing || results.success === 0 || !selectedTeacher
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {importing ? 'Import en cours...' : `Importer ${results.success} étudiant(s)`}
              </button>
            </div>
          </div>
        )}

        {/* Import Results */}
        {results.details.length > 0 && !importing && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Résultats de l'import</h2>
            <div className="space-y-2">
              {results.details.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded ${
                    result.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {result.status === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {result.name}: {result.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}