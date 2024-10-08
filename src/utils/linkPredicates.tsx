export interface LinkPredicates {
    prefix: string;
    uri: string;
    predicates: string[];
}

const skos: LinkPredicates = {
    prefix: 'skos',
    uri: 'http://www.w3.org/2004/02/skos/core#',
    predicates: [
        'broadMatch',
        'closeMatch',
        'exactMatch',
        'narrowMatch',
        'relatedMatch',
    ]
};

const owl: LinkPredicates = {
    prefix: 'owl',
    uri: 'http://www.w3.org/2002/07/owl#',
    predicates: [
        'sameAs'
    ]
};

const linkPredicates: { [prefix: string]: LinkPredicates } = {
    skos: skos,
    owl: owl
};

export default linkPredicates;
