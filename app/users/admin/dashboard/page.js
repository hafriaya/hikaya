"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Import components
import AdminNavigation from "../components/AdminNavigation";
import DashboardStats from "../components/DashboardStats";
import SearchAndActions from "../components/SearchAndActions";
import UsersTable from "../components/UsersTable";
import StudentsTable from "../components/StudentsTable";
import AddUserModal from "../components/AddUserModal";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [admin, setAdmin] = useState(null);
    const [search, setSearch] = useState("");
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const router = useRouter();

    // Add user form state
    const [newUser, setNewUser] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "student",
        isActive: true
    });

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.role === "admin") {
                        setAdmin(userData);
                    } else {
                        router.push("/login");
                    }
                } else {
                    router.push("/login");
                }
            } else {
                router.push("/login");
            }
        });
        return () => unsubscribe();
    }, [router]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setUsers(usersData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentsSnapshot = await getDocs(collection(db, "students"));
                const studentsData = studentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setStudents(studentsData);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const classesSnapshot = await getDocs(collection(db, "class"));
                const classesData = classesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                setClasses(classesData);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };
        fetchClasses();
    }, []);

    // Helper function to get class name
    const getClassName = (classId) => {
        if (!classId) return "Aucune classe";
        const found = classes.find((cls) => cls.id === classId);
        return found ? found.name : "Classe inconnue";
    };

    // Filter users by role and search (exclude admin users from display)
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                             user.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = activeTab === "dashboard" || user.role === activeTab;
        return matchesSearch && matchesRole && user.role !== "admin";
    });

    // Stats calculation
    const stats = {
        total: users.length,
        teachers: users.filter(u => u.role === "teacher").length,
        parents: users.filter(u => u.role === "parent").length,
        students: users.filter(u => u.role === "student").length,
        active: users.filter(u => u.isActive).length
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;
            
            if (newUser.password) {
                const userData = {
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role,
                    isActive: newUser.isActive,
                    createdAt: Timestamp.now(),
                    createdBy: admin?.uid || "admin",
                    hasPassword: true
                };
                
                const docRef = await addDoc(collection(db, "users"), userData);
                setUsers(prev => [...prev, { id: docRef.id, ...userData }]);
                setShowAddUserModal(false);
                setNewUser({ fullName: "", email: "", password: "", role: "student", isActive: true });
                alert("Utilisateur créé avec succès! L'utilisateur devra utiliser 'Mot de passe oublié' pour définir son mot de passe.");
                return;
            } else {
                const userData = {
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role,
                    isActive: newUser.isActive,
                    createdAt: Timestamp.now(),
                    createdBy: admin?.uid || "admin",
                    hasPassword: false
                };
                
                const docRef = await addDoc(collection(db, "users"), userData);
                setUsers(prev => [...prev, { id: docRef.id, ...userData }]);
                setShowAddUserModal(false);
                setNewUser({ fullName: "", email: "", password: "", role: "student", isActive: true });
                alert("Utilisateur créé avec succès! L'utilisateur pourra se connecter avec Google.");
                return;
            }
        } catch (error) {
            alert("Erreur lors de la création de l'utilisateur: " + error.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            alert("Erreur lors de la suppression: " + error.message);
        }
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            await updateDoc(doc(db, "users", userId), {
                isActive: !currentStatus
            });
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, isActive: !currentStatus } : u
            ));
        } catch (error) {
            alert("Erreur lors de la mise à jour: " + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <AdminNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setSearch={setSearch}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                showProfileMenu={showProfileMenu}
                setShowProfileMenu={setShowProfileMenu}
                admin={admin}
                router={router}
            />

            <main className="max-w-7xl mx-auto p-4 sm:p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {activeTab === "dashboard" ? "Tableau de Bord Admin" :
                         activeTab === "teacher" ? "Gestion des Enseignants" :
                         activeTab === "parent" ? "Gestion des Parents" :
                         "Gestion des Élèves"}
                    </h2>
                    <p className="text-slate-500">Administration des utilisateurs Hikaya</p>
                </div>

                <SearchAndActions
                    search={search}
                    setSearch={setSearch}
                    setShowAddUserModal={setShowAddUserModal}
                />

                {activeTab === "dashboard" && (
                    <DashboardStats stats={stats} />
                )}

                {activeTab === "student" ? (
                    <StudentsTable 
                        students={students} 
                        getClassName={getClassName} 
                    />
                ) : (
                    <UsersTable
                        filteredUsers={filteredUsers}
                        handleToggleUserStatus={handleToggleUserStatus}
                        handleDeleteUser={handleDeleteUser}
                    />
                )}
            </main>

            <AddUserModal
                showAddUserModal={showAddUserModal}
                setShowAddUserModal={setShowAddUserModal}
                newUser={newUser}
                setNewUser={setNewUser}
                handleAddUser={handleAddUser}
            />
        </div>
    );
}
