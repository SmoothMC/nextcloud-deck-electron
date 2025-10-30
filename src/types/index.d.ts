export {};

declare global {
    interface Window {
        api: {
            getDomain: () => Promise<string | undefined>;
            saveDomain: (domain: string) => Promise<void>;
        };
    }
}