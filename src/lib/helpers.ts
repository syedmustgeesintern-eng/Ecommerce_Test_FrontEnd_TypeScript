export const setLocalStorage = (key: string, value: any) => {
    if (!key) {
        return;
    }
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error while setting value of ${key} in local storage. `, e);
    }
};
