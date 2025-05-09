import { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectItem = memo(({ project, isAdmin, onEdit, onDelete }) => {
    const getRoleBadge = () => {
        const role = project.role || (isAdmin ? 'admin' : 'member');
        
        switch(role.toLowerCase()) {
        case 'admin':
            return {
            text: 'Admin',
            className: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
            };
        case 'manager':
            return {
            text: 'Manager',
            className: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
            };
        case 'member':
        default:
            return {
            text: 'Member',
            className: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
            };
        }
    };
    
    const roleBadge = getRoleBadge();
    const navigate = useNavigate();
  
    return (
        <div className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-750 border-b dark:border-gray-700" onClick={() => {
            navigate(`/project/${project.project_id}`);
        }}>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                <h3 className="font-medium">{project.name}</h3>
                <span className={`${roleBadge.className} px-2 py-1 rounded-full text-xs`}>
                    {roleBadge.text}
                </span>
                </div>

                <div className="mt-1 flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
                {project.description && (
                    <span className="truncate max-w-xs">{project.description}</span>
                )}
                </div>

                <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Owner: <strong>{project.owner_name || 'Unknown'}</strong></span> •{' '}
                <span><strong>{project.owner_email || 'No email'}</strong></span>
                </div>
            </div>

            <div className="ml-4 flex items-center space-x-2">
                <button 
                onClick={() => onEdit(project)} 
                className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-600 rounded-md"
                >
                <Edit className="h-4 w-4" />
                </button>
                {isAdmin && (
                <button 
                    onClick={() => onDelete(project.project_id)} 
                    className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-gray-600 rounded-md"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
                )}
            </div>
        </div>
    );
});

const VirtualizedProjectList = ({ 
  projects, 
  hasMore, 
  isLoading, 
  loadMore, 
  isAdmin,
  onEdit,
  onDelete,
  emptyMessage = "No projects found."
}) => {
  const itemCount = hasMore ? projects.length + 1 : projects.length;
  const loadMoreItems = loadMore;
  const isItemLoaded = index => !hasMore || index < projects.length;
  
  if (projects.length === 0 && !isLoading && !hasMore) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  const Row = ({ index, style }) => {
    if (!isItemLoaded(index)) {
      return (
        <div style={style} className="p-4 text-center">
          <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      );
    }
    
    const project = projects[index];
    return (
      <div style={style} key={project.project_id}>
        <ProjectItem 
          project={project}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    );
  };

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      threshold={5}
    >
      {({ onItemsRendered, ref }) => (
        <List
          className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          height={400} 
          itemCount={itemCount}
          itemSize={100} 
          onItemsRendered={onItemsRendered}
          ref={ref}
          width="100%"
        >
          {Row}
        </List>
      )}
    </InfiniteLoader>
  );
};

export default VirtualizedProjectList;