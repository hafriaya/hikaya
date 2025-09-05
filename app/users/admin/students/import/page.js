"use client";

import { useState, useRef, useEffect } from 'react';
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

  // Load classes and teachers on component mount - Fixed useEffect instead of useState
  useEffect(() => {
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

        // Find the header row (skip empty rows)
        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          if (jsonData[i] && jsonData[i].length > 0) {
            // Check if this row contains expected headers
            const row = jsonData[i].map(cell => cell?.toString().toLowerCase().trim());
            if (row.includes('nom') || row.includes('prénom') || row.includes('name')) {
              headerRowIndex = i;
              break;
            }
          }
        }

        if (headerRowIndex === -1) {
          alert('Impossible de trouver la ligne d\'en-tête dans le fichier');
          return;
        }

        const headers = jsonData[headerRowIndex].map(h => h?.toString().toLowerCase().trim());
        const dataRows = jsonData.slice(headerRowIndex + 1).filter(row => row && row.length > 0);
        
        if (dataRows.length === 0) {
          alert('Aucune donnée trouvée après la ligne d\'en-tête');
          return;
        }

        const parsedData = dataRows.map((row, index) => {
          const student = {};
          headers.forEach((header, colIndex) => {
            if (row[colIndex] !== undefined && row[colIndex] !== null) {
              student[header] = row[colIndex].toString().trim();
            }
          });
          student.rowNumber = headerRowIndex + index + 2; // +2 for 1-based indexing and header row
          return student;
        });

        processData(parsedData);
      } catch (error) {
        console.error('Excel read error:', error);
        alert('Erreur lors de la lecture du fichier Excel: ' + error.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const processData = (data) => {
    const validatedStudents = data.map((student) => {
      // Extract name - handle both French and English headers
      let name = '';
      if (student['nom'] && student['prénom']) {
        name = `${student['prénom']} ${student['nom']}`.replace(/\s+/g, ' ').trim();
      } else if (student['nom']) {
        name = student['nom'].trim();
      } else if (student['name']) {
        name = student['name'].trim();
      } else if (student['prénom']) {
        name = student['prénom'].trim();
      }

      // Calculate age from birth date
      let age = null;
      const birthDateField = student['date de naissance'] || student['date_de_naissance'] || student['birthdate'];
      
      if (birthDateField) {
        const dateStr = birthDateField.toString().trim();
        let birthDate = null;
        
        // Try different date formats
        if (dateStr.includes('/')) {
          // DD/MM/YYYY or MM/DD/YYYY
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            // Assume DD/MM/YYYY format (European standard)
            const [day, month, year] = parts;
            birthDate = new Date(year, month - 1, day);
          }
        } else if (dateStr.includes('-')) {
          // YYYY-MM-DD or DD-MM-YYYY
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            if (parts[0].length === 4) {
              // YYYY-MM-DD
              birthDate = new Date(dateStr);
            } else {
              // DD-MM-YYYY
              const [day, month, year] = parts;
              birthDate = new Date(year, month - 1, day);
            }
          }
        } else {
          // Try parsing as-is
          birthDate = new Date(dateStr);
        }

        // Calculate age if date is valid
        if (birthDate && !isNaN(birthDate.getTime())) {
          const today = new Date();
          let calculatedAge = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            calculatedAge--;
          }
          
          if (calculatedAge >= 0 && calculatedAge <= 100) {
            age = calculatedAge;
          }
        }
      }

      // If no birth date, try to get age directly
      if (age === null && (student['age'] || student['âge'])) {
        const ageStr = (student['age'] || student['âge']).toString().trim();
        const parsedAge = parseInt(ageStr);
        if (!isNaN(parsedAge) && parsedAge > 0 && parsedAge <= 100) {
          age = parsedAge;
        }
      }

      const mappedStudent = {
        name,
        age,
        classId: selectedClass,
        teacherId: selectedTeacher,
        isActive: true,
        rowNumber: student.rowNumber
      };

      const errors = validateStudent(mappedStudent);
      return {
        ...mappedStudent,
        errors,
        isValid: errors.length === 0
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
    
    if (!student.name || student.name.length < 2) {
      errors.push('Nom invalide (minimum 2 caractères)');
    }
    
    if (student.age === null || student.age === undefined || isNaN(student.age)) {
      errors.push('Âge manquant ou invalide');
    } else if (student.age < 3 || student.age > 20) {
      errors.push('Âge doit être entre 3 et 20 ans');
    }
    
    if (!selectedClass) {
      errors.push('Classe requise');
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
          classId: student.classId,
          isActive: student.isActive,
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
    // Create sample data with French headers matching your Excel format
    const sampleData = [
      ['N.O', 'Code', 'Nom', 'Prénom', 'Genre', 'Date de naissance', 'Lieu naissance'],
      [1, 'ST001', 'Ben Ali', 'Ahmed', 'M', '15/06/2019', 'Casablanca'],
      [2, 'ST002', 'El Mansouri', 'Fatima', 'F', '23/04/2020', 'Rabat'],
      [3, 'ST003', 'Benali', 'Mohammed', 'M', '12/09/2018', 'Fes'],
      [4, 'ST004', 'Zahra', 'Amina', 'F', '30/11/2021', 'Marrakech'],
      [5, 'ST005', 'Hassan', 'Youssef', 'M', '07/02/2019', 'Tanger']
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sampleData);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },  // N.O
      { wch: 12 }, // Code
      { wch: 15 }, // Nom
      { wch: 15 }, // Prénom
      { wch: 8 },  // Genre
      { wch: 18 }, // Date de naissance
      { wch: 15 }  // Lieu naissance
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Liste des élèves');

    // Generate and download file
    XLSX.writeFile(wb, 'modele_liste_eleves.xlsx');
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
              Le fichier doit contenir les colonnes: <code className="bg-blue-100 px-2 py-1 rounded">Nom, Prénom, Date de naissance</code> (format DD/MM/YYYY)
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
                            {student.name || 'Non défini'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Âge</label>
                          <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-800">
                            {student.age !== null ? `${student.age} ans` : 'Non défini'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Classe</label>
                          <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-800">
                            {classes.find(c => c.id === student.classId)?.name || 'Sélectionner une classe'}
                          </div>
                        </div>
                      </div>
                      {student.errors.length > 0 && (
                        <div className="mt-2 text-red-600 text-sm">
                          Ligne {student.rowNumber}: {student.errors.join(', ')}
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
                disabled={importing || results.success === 0 || !selectedTeacher || !selectedClass}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  importing || results.success === 0 || !selectedTeacher || !selectedClass
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