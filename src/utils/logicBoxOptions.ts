export const defaultOptions = {
    and: {
        label: 'All conditions must be met',
        shortLabel: 'AND'
    },
    or: {
        label: 'At least one of the conditions must be met',
        shortLabel: 'OR'
    }
};

export const tNormOptions = {
    minimum_t_norm: {
        label: 'Minimum t-norm',
        shortLabel: '⊤min',
        group: 'All conditions must be met (AND)'
    },
    product_t_norm: {
        label: 'Product t-norm',
        shortLabel: '⊤prod',
        group: 'All conditions must be met (AND)'
    },
    lukasiewicz_t_norm: {
        label: 'Łukasiewicz t-norm',
        shortLabel: '⊤Luk',
        group: 'All conditions must be met (AND)'
    },
    drastic_t_norm: {
        label: 'Drastic t-norm',
        shortLabel: '⊤D',
        group: 'All conditions must be met (AND)'
    },
    nilpotent_minimum: {
        label: 'Nilpotent minimum',
        shortLabel: '⊤nM',
        group: 'All conditions must be met (AND)'
    },
    hamacher_product: {
        label: 'Hamacher product',
        shortLabel: '⊤H0',
        group: 'All conditions must be met (AND)'
    }
};

export const sNormOptions = {
    maximum_s_norm: {
        label: 'Maximum s-norm',
        shortLabel: '⊥max',
        group: 'At least one of the conditions must be met (OR)'
    },
    probabilistic_sum: {
        label: 'Probabilistic sum',
        shortLabel: '⊥sum',
        group: 'At least one of the conditions must be met (OR)'
    },
    bounded_sum: {
        label: 'Bounded sum',
        shortLabel: '⊥Luk',
        group: 'At least one of the conditions must be met (OR)'
    },
    drastic_s_norm: {
        label: 'Drastic s-norm',
        shortLabel: '⊥D',
        group: 'At least one of the conditions must be met (OR)'
    },
    nilpotent_maximum: {
        label: 'Nilpotent maximum',
        shortLabel: '⊥nM',
        group: 'At least one of the conditions must be met (OR)'
    },
    einstein_sum: {
        label: 'Einstein sum',
        shortLabel: '⊥H2',
        group: 'At least one of the conditions must be met (OR)'
    }
};

export const fuzzyOptions = {
    ...tNormOptions,
    ...sNormOptions
};

export const lensOptions = {
    union: {
        label: 'Union',
        shortLabel: '⋃',
        group: 'Operations on links',
        description: 'All links of both linksets/lenses'
    },
    intersection: {
        label: 'Intersection',
        shortLabel: '⋂',
        group: 'Operations on links',
        description: 'Only links that appear in both linksets/lenses'
    },
    difference: {
        label: 'Difference',
        shortLabel: '−',
        group: 'Operations on links',
        description: 'Only links from the first linkset/lens, not from the second linkset/lens'
    },
    sym_difference: {
        label: 'Symmetric difference',
        shortLabel: '∆',
        group: 'Operations on links',
        description: 'Only links which appear in either one linkset/lens, but not both'
    },
    in_set_and: {
        label: 'Source and target resources match',
        shortLabel: 'AND ST',
        group: 'Operations on link resources',
        description: 'Both the source and target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens'
    },
    in_set_or: {
        label: 'Source or target resources match',
        shortLabel: 'OR ST',
        group: 'Operations on link resources',
        description: 'Either the source or the target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens'
    },
    in_set_source: {
        label: 'Source resources match',
        shortLabel: 'AND S',
        group: 'Operations on link resources',
        description: 'The source resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens'
    },
    in_set_target: {
        label: 'Target resources match',
        shortLabel: 'AND T',
        group: 'Operations on link resources',
        description: 'The target resource from the first linkset/lens must appear in the the set of resources from the second linkset/lens'
    }
};
