import {QueryClient, queryOptions, useSuspenseQuery} from '@tanstack/react-query';
import {Methods, FilterFunction, MatchingMethodConfig, Transformer} from 'utils/interfaces.ts';
import {api} from 'utils/config.ts';

const methodsQueryOptions = queryOptions({
    queryKey: ['methods'],
    staleTime: 60 * 1000 * 15, // 15 minutes
    queryFn: loadMethods
});

export function useMethods() {
    return useSuspenseQuery(methodsQueryOptions);
}

export function prefetchMethods(queryClient: QueryClient) {
    queryClient.prefetchQuery(methodsQueryOptions); // Just prefetch without awaiting
}

export function resetMethods(queryClient: QueryClient) {
    queryClient.invalidateQueries({queryKey: ['methods']});
}

async function loadMethods(): Promise<Methods> {
    const response = await fetch(`${api}/methods`);
    if (!response.ok)
        throw new Error('Unable to fetch all available methods!');

    const methods = await response.json();
    return {
        filter_functions: methods.filter_functions_order.reduce((acc: Map<string, FilterFunction>, key: string) => {
            acc.set(key, methods.filter_functions[key]);
            return acc;
        }, new Map<string, FilterFunction>()),
        matching_methods: methods.matching_methods_order.reduce((acc: Map<string, MatchingMethodConfig>, key: string) => {
            const matchingMethodInfo = {
                ...methods.matching_methods[key],
                items: methods.matching_methods[key].items_order.reduce((acc: Map<string, object>, itemsKey: string) => {
                    acc.set(itemsKey, methods.matching_methods[key].items[itemsKey]);
                    return acc;
                }, new Map<string, object>())
            };
            delete matchingMethodInfo.items_order;
            acc.set(key, matchingMethodInfo);
            return acc;
        }, new Map<string, MatchingMethodConfig>()),
        transformers: methods.transformers_order.reduce((acc: Map<string, Transformer>, key: string) => {
            const transformerInfo = {
                ...methods.transformers[key],
                items: methods.transformers[key].items_order.reduce((acc: Map<string, object>, itemsKey: string) => {
                    acc.set(itemsKey, methods.transformers[key].items[itemsKey]);
                    return acc;
                }, new Map<string, object>())
            };
            delete transformerInfo.items_order;
            acc.set(key, transformerInfo);
            return acc;
        }, new Map<string, Transformer>()),
    };
}
