import { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounce(value: any, delay: any) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);
    return debouncedValue;
}
