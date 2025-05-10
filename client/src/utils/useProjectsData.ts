// Custom hook for data fetching with pagination and filtering
import { useState, useEffect, useCallback } from 'react';
import mainInstance from '../services/networkAdapters/mainAxiosInstance';
import type { Projects } from '../interface/types';

// This hook now handles two role groups:
// 1. isAdmin=true - Projects where the user is an admin
// 2. isAdmin=false - Projects where the user is a member or manager (non-admin roles)
export const useProjectsData = (isAdmin = true) => {
    const [projects, setProjects] = useState<Projects[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [filters, setFilters] = useState({
        searchTerm: '',
        roleGroup: isAdmin ? 'admin' : 'non-admin', // 'admin' or 'non-admin'
        sortBy: 'created_at',
        sortDirection: 'desc'
    });
    
    const PAGE_SIZE = 5;
  
    useEffect(() => {
        setPage(1);
        setProjects([]);
        setHasMore(true);
        fetchProjects(true);
    }, [filters]);
  
    const fetchProjects = useCallback(async (resetPagination = false) => {
        try {
            setIsLoading(true);
            setError(null);
            
            // Build query parameters
            const params = new URLSearchParams({
                page: (resetPagination ? 1 : page).toString(),
                pageSize: PAGE_SIZE.toString(),
                roleGroup: filters.roleGroup
            });
            
            if (filters.searchTerm) {
                params.append('search', filters.searchTerm);
            }
            
            if (filters.sortBy) {
                params.append('sortBy', filters.sortBy);
                params.append('sortDirection', filters.sortDirection);
            }
            
            const response = await mainInstance.get(`/projects?${params.toString()}`);
            
            if (response.data && response.data.status === 200) {
                const newProjects = response.data.data.data || [];
                
                if (resetPagination) {
                    setProjects(newProjects);
                    setPage(1);
                } else {
                    setProjects(prev => [...prev, ...newProjects]);
                }
                
                setHasMore(response.data.data.totalCount > projects.length);
            }
        } catch (err) {
            console.error(`Error fetching ${filters.roleGroup} projects:`, err);
            setError(`Failed to load projects. ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [page, filters.roleGroup, filters.searchTerm, filters.sortBy, filters.sortDirection]);
  
    useEffect(() => {
        fetchProjects(true);
    }, []);
  
    const loadMore = useCallback(() => {
        if (!isLoading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    }, [isLoading, hasMore]);
  
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    useEffect(() => {
        if (page > 1) {
            fetchProjects(); // Only fetch more when page > 1
        }
    }, [page]);
  
    return {
        projects,
        isLoading,
        error,
        hasMore,
        loadMore,
        updateFilters,
        currentFilters: filters,
        refreshProjects: () => fetchProjects(true)
    };
};