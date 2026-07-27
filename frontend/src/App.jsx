import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ClassCard from './components/ClassCard';
import API from './services/api';
import { getSchoolData, enrollStudent, unenrollStudent, updateStudent } from './services/schoolService';
import { BookOpen, Users, UserCheck } from 'lucide-react';

function App() {
  const [toast, setToast] = useState(null);
  const [backendStatus, setBackendStatus] = useState('connecting');
  const [schoolName, setSchoolName] = useState('');
  const [classes, setClasses] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Navigation handler
  const onNavigate = (section) => {
    setActiveSection(section);
  };

  // Form state for student registration
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    studentCode: '',
    data: '',
    classId: ''
  });

  // Edit student modal state
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedEditStudent, setSelectedEditStudent] = useState(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editFormError, setEditFormError] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    data: ''
  });

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEdit(true);
    setEditFormError(null);

    try {
      const response = await updateStudent(selectedEditStudent.id, editFormData);
      if (response.success) {
        showToast("Student details updated successfully!", true);
        setIsOpenEditModal(false);
        await reloadDashboardData();
      } else {
        setEditFormError(response.message || "Failed to update student details.");
      }
    } catch (err) {
      console.error("Error updating student:", err);
      const errMsg = err.response?.data?.message || "Error updating student. Please try again.";
      setEditFormError(errMsg);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const showToast = (text, success = true) => {
    setToast({ text, success });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Authoritative data reload helper
  const reloadDashboardData = async () => {
    try {
      const result = await getSchoolData();
      if (result.success && result.data) {
        setSchoolName(result.data.name);
        setClasses(result.data.classes);
        setError(null);
      } else {
        setError('Unable to load school data.');
      }
    } catch (err) {
      console.error('Error reloading school data:', err);
      setError('Unable to load school data.');
    }
  };

  // Trigger connectivity check and fetch school data exactly once upon initial mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await API.get('/health');
        if (response.data && response.data.success) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      } catch (error) {
        console.error('Error connecting to backend API:', error);
        setBackendStatus('disconnected');
      }
    };

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        await reloadDashboardData();
      } finally {
        setLoading(false);
      }
    };

    checkApiHealth();
    fetchInitialData();
  }, []);

  const [selectedClass, setSelectedClass] = useState(null);

  const handleViewStudents = (classData) => {
    setSelectedClass(classData);
    setActiveSection('class-view');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const response = await enrollStudent(formData);
      if (response.success) {
        showToast("Student registered successfully!", true);
        setIsOpenModal(false);
        setFormData({
          name: '',
          studentCode: '',
          data: '',
          classId: ''
        });
        await reloadDashboardData();
        // If viewing a class, refresh selected class view state
        if (selectedClass) {
          const updatedClass = classes.find(c => c.id === selectedClass.id);
          if (updatedClass) {
            setSelectedClass(updatedClass);
          }
        }
      } else {
        setFormError(response.message || "Failed to register student.");
      }
    } catch (err) {
      console.error("Error registering student:", err);
      const errMsg = err.response?.data?.message || "Error enrolling student. Please try again.";
      setFormError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (classId, studentId) => {
    try {
      const response = await unenrollStudent(classId, studentId);
      if (response.success) {
        showToast("Student unenrolled successfully!", true);
        await reloadDashboardData();
      }
    } catch (err) {
      console.error("Error unenrolling student:", err);
      const errMsg = err.response?.data?.message || "Error unenrolling student.";
      showToast(errMsg, false);
    }
  };

  // Sync selectedClass with fresh API data if it changes in classes array
  useEffect(() => {
    if (selectedClass) {
      const freshClass = classes.find(c => c.id === selectedClass.id);
      if (freshClass) {
        setSelectedClass(freshClass);
      }
    }
  }, [classes]);

  // Calculate stats dynamically based on backend data
  const totalClasses = classes.length;
  const totalEnrollment = classes.reduce((acc, curr) => acc + (curr.students ? curr.students.length : 0), 0);
  
  const uniqueStudentsSet = new Set();
  classes.forEach(c => {
    if (c.students) {
      c.students.forEach(s => uniqueStudentsSet.add(s.name));
    }
  });
  const totalUniqueStudents = uniqueStudentsSet.size;

  // Compute all unique students for Global view
  const allStudentsMap = new Map();
  classes.forEach(cls => {
    (cls.students || []).forEach(st => {
      if (!allStudentsMap.has(st.id)) {
        allStudentsMap.set(st.id, st);
      }
    });
  });
  const allStudents = Array.from(allStudentsMap.values());

  // 1. Loading State: Render a premium skeleton loader
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <Header backendStatus={backendStatus} activeSection={activeSection} onNavigate={onNavigate} />
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
          {/* Banner Skeleton */}
          <div className="animate-pulse bg-slate-200/80 h-[170px] rounded-2xl"></div>
          
          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="animate-pulse bg-slate-200/80 h-[90px] rounded-xl"></div>
            <div className="animate-pulse bg-slate-200/80 h-[90px] rounded-xl"></div>
            <div className="animate-pulse bg-slate-200/80 h-[90px] rounded-xl"></div>
          </div>
          
          {/* Cards Section Skeleton */}
          <div className="flex flex-col gap-5">
            <div className="animate-pulse bg-slate-200/80 h-8 w-48 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="animate-pulse bg-slate-200/80 h-[430px] rounded-2xl"></div>
              <div className="animate-pulse bg-slate-200/80 h-[430px] rounded-2xl"></div>
              <div className="animate-pulse bg-slate-200/80 h-[430px] rounded-2xl"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // 2. Error State: Render a clean visual recovery dialog
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        <Header backendStatus={backendStatus} activeSection={activeSection} onNavigate={onNavigate} />
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 flex items-center justify-center">
          <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-8 max-w-md w-full text-center shadow-xs">
            <div className="w-14 h-14 bg-rose-100/70 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Database Connectivity Error</h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 3. Normal State
  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <Header backendStatus={backendStatus} activeSection={activeSection} onNavigate={onNavigate} />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {activeSection === 'dashboard' && (
          <>
            {/* Banner with modern Indigo/Purple gradient */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-8 md:p-10 shadow-md">
              <div className="relative z-10 max-w-2xl text-left">
                <span className="inline-block bg-white/10 backdrop-blur-md text-indigo-200 text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-3">
                  Academic Control Center
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
                  {schoolName}
                </h1>
                <p className="text-slate-300 text-sm md:text-base font-normal leading-relaxed">
                  Real-time monitoring of classrooms, current enrollment thresholds, and unique student distributions across class profiles.
                </p>
              </div>
              {/* Subtle decorative circles */}
              <div className="absolute right-[-10%] top-[-30%] w-[350px] h-[350px] opacity-10 pointer-events-none">
                <div className="w-full h-full rounded-full border-[40px] border-indigo-500"></div>
              </div>
            </section>

            {/* Premium Dashboard Quick Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Classes</span>
                  <span className="text-2xl font-bold text-slate-800">{totalClasses}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Enrollment</span>
                  <span className="text-2xl font-bold text-slate-800">{totalEnrollment}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-50 text-purple-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Unique Students</span>
                  <span className="text-2xl font-bold text-slate-800">{totalUniqueStudents}</span>
                </div>
              </div>
            </section>

            {/* Classes Card Grid */}
            <section className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-l-4 border-indigo-600 pl-3 text-left">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Classrooms</h2>
                  <p className="text-xs text-slate-400 font-medium">Overview of current cohorts and registered student metrics</p>
                </div>
                <button 
                  onClick={() => setIsOpenModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>+ Register Student</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {classes.map((classItem) => (
                  <ClassCard 
                    key={classItem.id} 
                    classData={classItem} 
                    onViewStudents={handleViewStudents}
                    onRemoveStudent={handleRemoveStudent}
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {activeSection === 'students' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
            <h2 className="text-xl font-bold text-slate-800 mb-2">All Students Directory</h2>
            <p className="text-xs text-slate-400 font-medium mb-6">List of unique students registered across all school classes</p>
            {/* Student Table in Read Only for global directory as requested */}
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">Student ID</th>
                    <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">Name</th>
                    <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm font-mono text-slate-500">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">{st.id}</span>
                      </td>
                      <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm font-semibold text-slate-800">{st.name}</td>
                      <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm text-slate-600">
                        <span className="inline-block text-xs bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-md font-medium">{st.data}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <section className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-left">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Analytics Dashboard</h2>
            <p className="text-slate-500 mb-6">Distribution and enrollment stats overview.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider mb-4">Class Size Analysis</h3>
                <div className="space-y-3">
                  {classes.map(c => (
                    <div key={c.id} className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-600">{c.name}</span>
                      <span className="font-mono text-slate-800">{c.students?.length || 0} students</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider mb-4">Integrity Constraints</h3>
                <div className="space-y-3 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Min students per class:</span>
                    <span className="text-indigo-600">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min shared students per class:</span>
                    <span className="text-indigo-600">2</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'class-view' && selectedClass && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
              <div>
                <button 
                  onClick={() => setActiveSection('dashboard')} 
                  className="mb-4 inline-flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-indigo-200 bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 font-bold text-sm rounded-xl transition-all duration-200 shadow-xs cursor-pointer group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Dashboard</span>
                </button>
                <h2 className="text-2xl font-bold text-slate-800">{selectedClass.name} Students</h2>
                <p className="text-xs text-slate-400 font-medium">All student records enrolled in this class profile</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-center">
                  <span className="block text-2xl font-bold font-mono">{selectedClass.students?.length || 0}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">Students</span>
                </div>
                <button 
                  onClick={() => setIsOpenModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>+ Register Student</span>
                </button>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">Student ID</th>
                    <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">Name</th>
                    <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100">Data</th>
                    <th className="text-[11px] font-bold uppercase text-slate-400 tracking-wider py-2 px-3 border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedClass.students || []).map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm font-mono text-slate-500">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px] font-semibold">{st.id}</span>
                      </td>
                      <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm font-semibold text-slate-800">{st.name}</td>
                      <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-sm text-slate-600">
                        <span className="inline-block text-xs bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-md font-medium">{st.data}</span>
                      </td>
                      <td className="py-2.5 px-3 border-b border-slate-100 border-dashed text-right text-sm">
                        {/* Edit Action Button */}
                        <button
                          onClick={() => {
                            setSelectedEditStudent(st);
                            setEditFormData({ name: st.name, data: st.data || '' });
                            setIsOpenEditModal(true);
                          }}
                          className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 transition-all duration-150 cursor-pointer inline-flex items-center justify-center mr-1"
                          title="Edit Student"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        {/* Trash icon markup inline to avoid extra dependencies/imports */}
                        <button
                          onClick={() => handleRemoveStudent(selectedClass.id, st.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition-all duration-150 cursor-pointer inline-flex items-center justify-center"
                          title="Remove Student"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Student Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl mx-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-lg text-slate-800">Register Student</h3>
              <button 
                onClick={() => {
                  setIsOpenModal(false);
                  setFormError(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              {formError && (
                <div className="bg-rose-50 text-rose-700 border border-rose-100 p-3 rounded-lg text-xs font-semibold mb-4">
                  {formError}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Target Class</label>
                  <select 
                    name="classId" 
                    required 
                    value={formData.classId} 
                    onChange={handleFormChange}
                    className="border border-slate-200 p-2.5 rounded-lg text-sm bg-white"
                  >
                    <option value="">Select a classroom...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Student Code (ID)</label>
                  <input 
                    type="text" 
                    name="studentCode" 
                    required 
                    placeholder="e.g. STD-112"
                    value={formData.studentCode} 
                    onChange={handleFormChange}
                    className="border border-slate-200 p-2.5 rounded-lg text-sm placeholder-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Student Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    placeholder="e.g. John Doe"
                    value={formData.name} 
                    onChange={handleFormChange}
                    className="border border-slate-200 p-2.5 rounded-lg text-sm placeholder-slate-400"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status / Data</label>
                  <input 
                    type="text" 
                    name="data" 
                    placeholder="e.g. Active (Sports Club)"
                    value={formData.data} 
                    onChange={handleFormChange}
                    className="border border-slate-200 p-2.5 rounded-lg text-sm placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenModal(false);
                    setFormError(null);
                  }}
                  className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Student Modal */}
      {isOpenEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-xl mx-4 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-lg text-slate-800">Update Student</h3>
              <button 
                onClick={() => {
                  setIsOpenEditModal(false);
                  setEditFormError(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditFormSubmit}>
              {editFormError && (
                <div className="bg-rose-50 text-rose-700 border border-rose-100 p-3 rounded-lg text-xs font-semibold mb-4">
                  {editFormError}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Student Code (ID)</label>
                  <input 
                    type="text" 
                    disabled
                    value={selectedEditStudent?.id || ''}
                    className="border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Student Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={editFormData.name} 
                    onChange={handleEditFormChange}
                    className="border border-slate-200 p-2.5 rounded-lg text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status / Data</label>
                  <input 
                    type="text" 
                    name="data" 
                    value={editFormData.data} 
                    onChange={handleEditFormChange}
                    className="border border-slate-200 p-2.5 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenEditModal(false);
                    setEditFormError(null);
                  }}
                  className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 text-white p-3 px-5 rounded-xl shadow-lg z-[1000] flex items-center gap-2.5 transition-all duration-300 transform translate-y-0 animate-[bounce_0.2s_ease-out_1] ${
          toast.success ? 'bg-slate-900' : 'bg-rose-950 border border-rose-900 text-rose-200'
        }`}>
          <span className={`${toast.success ? 'bg-emerald-500' : 'bg-rose-600'} w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white`}>
            {toast.success ? '✓' : '✕'}
          </span>
          <span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      <footer className="text-center py-8 border-t border-slate-200 text-slate-400 text-xs bg-slate-50/50 mt-auto">
        <p>© 2026 ABC Public School Management Panel. Powered by Tailwind CSS & React.</p>
      </footer>
    </div>
  );
}

export default App;
