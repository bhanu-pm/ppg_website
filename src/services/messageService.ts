export const fetchMessages = async () => {
  try {
    const response = await fetch('/api/messages');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading messages:', error);
    throw error;
  }
}; 