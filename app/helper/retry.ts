export const retry = async <T>(fn: () => Promise<T>, attempts: number = 3, delayMs: number = 0): Promise<T> => {
    let lastError: any;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await fn();
        } catch (err) {
            console.warn(err);
            lastError = err;
            if (attempt < attempts) {
                await new Promise(res => setTimeout(res, delayMs));
            }
        }
    }
    throw lastError || new Error('Retry attempts exhausted');
}