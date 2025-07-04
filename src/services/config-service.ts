export const getShowResetFromStorage = (): boolean => {
    let showReset = localStorage.getItem('showReset');
    if (showReset === null) {
        showReset = `${false}`;
        localStorage.setItem('showReset', showReset);
    }
    return JSON.parse(showReset);
};
