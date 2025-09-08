// Mock navigation helper for pages that don't use React Router
export function useMockNavigate() {
  return (path: string) => {
    console.log('Navigate to:', path);
    // In a real implementation, this would call a view change handler
    // or dispatch a state update to change the current view
  };
}