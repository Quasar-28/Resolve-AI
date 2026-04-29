import { useEffect, useState } from "react";
import { WebContainer } from "@webcontainer/api";

let singletonWebContainer: WebContainer | undefined;
let bootPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
    const [webcontainer, setWebcontainer] = useState<WebContainer>();

    useEffect(() => {
        let isMounted = true;
        async function boot() {
            if (singletonWebContainer) {
                if (isMounted) setWebcontainer(singletonWebContainer);
                return;
            }
            if (!bootPromise) {
                bootPromise = WebContainer.boot().then(instance => {
                    singletonWebContainer = instance;
                    return instance;
                });
            }
            const instance = await bootPromise;
            if (isMounted) setWebcontainer(instance);
        }
        boot();
        return () => { isMounted = false; };
    }, []);

    return webcontainer;
}