// localStorageUtil.js
const localStorageUtil = {
    // Save an item to localStorage
    setItem: (key: string, value: any) => {
        try {
            const stringValue = JSON.stringify(value);
            localStorage.setItem(key, stringValue);
        } catch (error) {
            console.error("Error saving to localStorage", error);
        }
    },

    // Retrieve an item from localStorage
    getItem: (key: string) => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : null;
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return null;
        }
    },

    // Remove an item from localStorage
    removeItem: (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error("Error removing from localStorage", error);
        }
    },

    // Clear all localStorage data
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error("Error clearing localStorage", error);
        }
    }
};

export default localStorageUtil;
