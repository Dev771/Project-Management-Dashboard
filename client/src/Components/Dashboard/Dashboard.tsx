import { useState, useCallback, useMemo } from 'react';
import { Plus, X, Search, ChevronDown, ChevronRight } from 'lucide-react';
import VirtualizedProjectList from './VirtualizedProjectList';
import mainInstance from '../../services/networkAdapters/mainAxiosInstance';
import { debounce } from 'lodash';
import { useProjectsData } from '../../utils/useProjectsData';

const Dashboard = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [adminExpanded, setAdminExpanded] = useState(true);
  const [memberExpanded, setMemberExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });
  
  const {
    projects: adminProjects,
    isLoading: adminLoading,
    error: adminError,
    hasMore: adminHasMore,
    loadMore: loadMoreAdminProjects,
    updateFilters: updateAdminFilters,
    refreshProjects: refreshAdminProjects
  } = useProjectsData(true);
  
  const {
    projects: nonAdminProjects,
    isLoading: nonAdminLoading,
    error: nonAdminError,
    hasMore: nonAdminHasMore,
    loadMore: loadMoreNonAdminProjects,
    updateFilters: updateNonAdminFilters,
    refreshProjects: refreshNonAdminProjects
  } = useProjectsData(false); 

  const debouncedSearch = useMemo(
    () => debounce((term) => {
      updateAdminFilters({ searchTerm: term });
      updateNonAdminFilters({ searchTerm: term });
    }, 300),
    [updateAdminFilters, updateNonAdminFilters]
  );
  
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };
  
  const handleOpenAddModal = useCallback((edit = false, project = null) => {
    if (edit && project) {
      setIsEditMode(true);
      setCurrentProject(project);
      setNewProject({
        name: project.name,
        description: project.description || ''
      });
    } else {
      setIsEditMode(false);
      setNewProject({
        name: '',
        description: ''
      });
    }
    setIsAddModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setNewProject({
      name: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject({
      ...newProject,
      [name]: value
    });
  };

  const handleAddProject = async () => {
    try {
      if (!newProject.name.trim()) {
        alert("Project name is required");
        return;
      }
      
      const payload = {
        name: newProject.name,
        description: newProject.description
      };
      
      if (isEditMode && currentProject) {
        await mainInstance.put(`/projects/${currentProject.project_id}`, payload);
      } else {
        await mainInstance.post("/projects", payload);
      }
      
      refreshAdminProjects();
      refreshNonAdminProjects();
      handleCloseModal();
    } catch (err) {
      console.error("Error saving project:", err);
      alert(isEditMode ? "Failed to update project" : "Failed to create project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await mainInstance.delete(`/projects/${projectId}`);
        refreshAdminProjects();
      } catch (err) {
        console.error("Error deleting project:", err);
        alert("Failed to delete project");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Projects</h1>
          <button 
            onClick={() => handleOpenAddModal()} 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Project
          </button>
        </div>

        <div className="mb-6 w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 pr-4 py-3 w-full border rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600"
              placeholder="Search projects by name..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {adminError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {adminError}
          </div>
        )}
        
        {nonAdminError && !adminError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {nonAdminError}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b dark:border-gray-700">
            <button
              className="w-full flex items-center justify-between p-4 text-left font-medium bg-gray-100 dark:bg-gray-700"
              onClick={() => setAdminExpanded(!adminExpanded)}
            >
              <span className="flex items-center">
                {adminExpanded ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
                Projects You Administer ({adminProjects.length})
                {adminLoading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
              </span>
            </button>
            
            {adminExpanded && (
              <div>
                <VirtualizedProjectList
                  projects={adminProjects}
                  hasMore={adminHasMore}
                  isLoading={adminLoading}
                  loadMore={loadMoreAdminProjects}
                  isAdmin={true}
                  onEdit={handleOpenAddModal.bind(null, true)}
                  onDelete={handleDeleteProject}
                  emptyMessage={adminLoading ? "Loading projects..." : "No projects found where you are an admin."}
                />
              </div>
            )}
          </div>

          <div>
            <button
              className="w-full flex items-center justify-between p-4 text-left font-medium bg-gray-100 dark:bg-gray-700"
              onClick={() => setMemberExpanded(!memberExpanded)}
            >
              <span className="flex items-center">
                {memberExpanded ? <ChevronDown className="h-5 w-5 mr-2" /> : <ChevronRight className="h-5 w-5 mr-2" />}
                Projects You're Part Of ({nonAdminProjects.length})
                {nonAdminLoading && <span className="ml-2 text-sm text-gray-500">(Loading...)</span>}
              </span>
            </button>
            
            {memberExpanded && (
              <div>
                <VirtualizedProjectList
                  projects={nonAdminProjects}
                  hasMore={nonAdminHasMore}
                  isLoading={nonAdminLoading}
                  loadMore={loadMoreNonAdminProjects}
                  isAdmin={false}
                  onEdit={null}
                  onDelete={null}
                  emptyMessage={nonAdminLoading ? "Loading projects..." : "No projects found where you are a member or manager."}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium">
                {isEditMode ? 'Edit Project' : 'Add New Project'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  name="name"
                  value={newProject.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Project Description</label>
                <textarea
                  name="description"
                  value={newProject.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md mr-2 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;