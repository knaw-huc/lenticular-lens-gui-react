import {useEffect, useRef} from 'react';
import {FetchNextPageOptions, InfiniteQueryObserverResult} from '@tanstack/react-query';

type FetchNextPage = (options?: FetchNextPageOptions) => Promise<InfiniteQueryObserverResult<unknown, unknown>>;

export default function useInfiniteLoading(fetchNextPage: FetchNextPage) {
    const prevTimeRef = useRef(0);
    const endOfTheListRef = useRef<HTMLDivElement | null>(null);

    async function observerCallback(entries: IntersectionObserverEntry[]) {
        const target = entries[0];
        if (target.isIntersecting && target.time > prevTimeRef.current) {
            prevTimeRef.current = target.time;
            await fetchNextPage();
        }
    }

    useEffect(() => {
        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: '20px',
            threshold: 0
        });

        if (endOfTheListRef.current)
            observer.observe(endOfTheListRef.current);
    }, []);

    return {endOfTheListRef};
}
