'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to manage Blob/File object URLs with automatic cleanup.
 * Prevents flickering by returning the same URL for the same object.
 */
export function useObjectUrl(object) {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        if (!object) {
            setUrl(null);
            return;
        }

        const newUrl = URL.createObjectURL(object);
        setUrl(newUrl);

        return () => {
            URL.revokeObjectURL(newUrl);
        };
    }, [object]);

    return url;
}
