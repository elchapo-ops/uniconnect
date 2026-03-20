import { useState, useEffect, useCallback } from "react";
import {
  jobsApi,
  studentApi,
  employerApi,
  adminApi,
  notificationsApi,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

// Generic hook for data fetching with loading and error states
function useApiData<T>(
  fetchFn: () => Promise<{ data?: T; error?: string }>,
  deps: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// Jobs hooks
export function useJobs(params?: {
  search?: string;
  location?: string;
  type?: string;
}) {
  return useApiData(
    () => jobsApi.list(params),
    [params?.search, params?.location, params?.type],
  );
}

export function useJob(id: string) {
  return useApiData(() => jobsApi.getById(id), [id]);
}

// Student hooks
export function useStudentProfile() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  return useApiData(() => {
    // Don't make request while auth is still loading
    if (authLoading) return Promise.resolve({ data: null });
    // Only make request if authenticated as student
    if (isAuthenticated && user?.role === "student") {
      return studentApi.getProfile();
    }
    return Promise.resolve({ data: null });
  }, [isAuthenticated, user?.role, authLoading]);
}

export function useStudentApplications(status?: string) {
  const { isAuthenticated, user } = useAuth();
  return useApiData(
    () =>
      isAuthenticated && user?.role === "student"
        ? studentApi.getApplications(status)
        : Promise.resolve({ data: [] }),
    [isAuthenticated, user?.role, status],
  );
}

// Employer hooks
export function useEmployerProfile() {
  const { isAuthenticated, user } = useAuth();
  return useApiData(
    () =>
      isAuthenticated && user?.role === "employer"
        ? employerApi.getProfile()
        : Promise.resolve({ data: null }),
    [isAuthenticated, user?.role],
  );
}

export function useEmployerJobs(status?: string) {
  const { isAuthenticated, user } = useAuth();
  return useApiData(
    () =>
      isAuthenticated && user?.role === "employer"
        ? employerApi.getJobs(status)
        : Promise.resolve({ data: [] }),
    [isAuthenticated, user?.role, status],
  );
}

export function useJobApplications(jobId: string) {
  const { isAuthenticated, user } = useAuth();
  return useApiData(
    () =>
      isAuthenticated && user?.role === "employer"
        ? employerApi.getJobApplications(jobId)
        : Promise.resolve({ data: [] }),
    [isAuthenticated, user?.role, jobId],
  );
}

export function useCandidates() {
  const { isAuthenticated, user } = useAuth();
  return useApiData(
    () =>
      isAuthenticated && user?.role === "employer"
        ? employerApi.getCandidates()
        : Promise.resolve({ data: [] }),
    [isAuthenticated, user?.role],
  );
}

// Admin hooks
export function useAdminStudents(params?: {
  search?: string;
  status?: string;
}) {
  const { isAuthenticated, user } = useAuth();
  return useApiData(
    () =>
      isAuthenticated && user?.role === "admin"
        ? adminApi.getStudents(params)
        : Promise.resolve({ data: { students: [], pagination: {} } }),
    [isAuthenticated, user?.role, params?.search, params?.status],
  );
}

export function useAdminEmployers(params?: {
  search?: string;
  verified?: boolean;
}) {
  const { isAuthenticated, user } = useAuth();
  return useApiData(
    () =>
      isAuthenticated && user?.role === "admin"
        ? adminApi.getEmployers(params)
        : Promise.resolve({ data: { employers: [], pagination: {} } }),
    [isAuthenticated, user?.role, params?.search, params?.verified],
  );
}

export function useAnalytics() {
  const { isAuthenticated, user } = useAuth();
  return useApiData(
    () =>
      isAuthenticated && user?.role === "admin"
        ? adminApi.getAnalytics()
        : Promise.resolve({ data: null }),
    [isAuthenticated, user?.role],
  );
}

// Action hooks
export function useApplyToJob() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async (jobId: string, coverLetter?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await studentApi.applyToJob(jobId, coverLetter);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (err) {
      setError("Failed to apply");
      return { success: false, error: "Failed to apply" };
    } finally {
      setIsLoading(false);
    }
  };

  return { apply, isLoading, error };
}

export function useAcceptApplication() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = async (applicationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await studentApi.acceptApplication(applicationId);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (err) {
      setError("Failed to accept application");
      return { success: false, error: "Failed to accept application" };
    } finally {
      setIsLoading(false);
    }
  };

  return { accept, isLoading, error };
}

export function useWithdrawApplication() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withdraw = async (applicationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await studentApi.withdrawApplication(applicationId);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (err) {
      setError("Failed to withdraw application");
      return { success: false, error: "Failed to withdraw application" };
    } finally {
      setIsLoading(false);
    }
  };

  return { withdraw, isLoading, error };
}

export function useCreateJob() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createJob = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await employerApi.createJob(data);
      if (response.error) {
        setError(response.error);
        return { success: false, error: response.error };
      }
      return { success: true, data: response.data };
    } catch (err) {
      setError("Failed to create job");
      return { success: false, error: "Failed to create job" };
    } finally {
      setIsLoading(false);
    }
  };

  return { createJob, isLoading, error };
}

export function useUpdateApplicationStatus() {
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async (applicationId: string, status: string) => {
    setIsLoading(true);
    try {
      const response = await employerApi.updateApplicationStatus(
        applicationId,
        status,
      );
      if (response.error) {
        return { success: false, error: response.error };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: "Failed to update status" };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateStatus, isLoading };
}

// Notifications hooks
export function useNotifications(unreadOnly?: boolean) {
  const { isAuthenticated } = useAuth();
  return useApiData(
    () =>
      isAuthenticated
        ? notificationsApi.list(unreadOnly)
        : Promise.resolve({ data: [] }),
    [isAuthenticated, unreadOnly],
  );
}

export function useUnreadNotificationCount() {
  const { isAuthenticated } = useAuth();
  return useApiData(
    () =>
      isAuthenticated
        ? notificationsApi.getUnreadCount()
        : Promise.resolve({ data: { count: 0 } }),
    [isAuthenticated],
  );
}
