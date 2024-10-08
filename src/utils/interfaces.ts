import {QueryClient} from '@tanstack/react-query';

export type PropertyPath = string[];
export type ValidationState = 'accepted' | 'rejected' | 'uncertain' | 'unchecked' | 'disputed';

export interface RootContext {
    lastActiveJob: BasicJobMetadata | null;
    setLastActiveJob: (activeJob: Job | null) => void;
    authenticate: (callback: (userInfo: UserInfo | null, isAuthEnabled: boolean) => void) => Promise<void>;
}

export interface BasicJobMetadata {
    id: string;
    title: string;
}

export interface UserInfo {
    sub: string;
    email: string;
    nickname: string;
}

export interface RouterContext extends RootContext {
    queryClient: QueryClient;
}

export interface Methods {
    filter_functions: Map<string, FilterFunction>;
    matching_methods: Map<string, MatchingMethod>;
    transformers: Map<string, Transformer>;
}

export interface FilterFunction {
    label: string;
    type?: 'string' | 'number' | 'date';
    order: number;
    help_text?: string;
}

export interface MatchingMethod {
    label: string;
    description: string;
    type: 'filter' | 'similarity' | 'normalizer';
    order: number;
    items: Map<string, ConfigItem>;
}

export interface Transformer {
    label: string;
    order: number;
    items: Map<string, ConfigItem>;
}

export interface ConfigItem {
    label: string;
    type: 'string' | 'number' | 'boolean' | 'range' | 'tags' | 'choices' | 'entity_type_selection' | 'property';
    size?: 'small' | 'large';
    default_value?: string | number | boolean;
    step?: number;
    min_excl_value?: number;
    max_excl_value?: number;
    min_incl_value?: number;
    max_incl_value?: number;
    choices?: { [choice: string]: string };
    entity_type_selection_key?: string;
}

export interface StringTagsConfigItem extends ConfigItem {
    type: 'string' | 'tags';
    default_value?: string;
    step: undefined;
    min_excl_value: undefined;
    max_excl_value: undefined;
    min_incl_value: undefined;
    max_incl_value: undefined;
    choices: undefined;
    entity_type_selection_key: undefined;
}

export interface NumberRangeConfigItem extends ConfigItem {
    type: 'number' | 'range';
    default_value?: number;
    step?: number;
    min_excl_value?: number;
    max_excl_value?: number;
    min_incl_value?: number;
    max_incl_value?: number;
    choices: undefined;
    entity_type_selection_key: undefined;
}

export interface BooleanConfigItem extends ConfigItem {
    type: 'boolean';
    default_value?: boolean;
    step: undefined;
    min_excl_value: undefined;
    max_excl_value: undefined;
    min_incl_value: undefined;
    max_incl_value: undefined;
    choices: undefined;
    entity_type_selection_key: undefined;
}

export interface ChoicesConfigItem extends ConfigItem {
    type: 'choices';
    default_value?: string;
    step: undefined;
    min_excl_value: undefined;
    max_excl_value: undefined;
    min_incl_value: undefined;
    max_incl_value: undefined;
    choices: { [choice: string]: string };
    entity_type_selection_key: undefined;
}

export interface EntityTypeSelectionConfigItem extends ConfigItem {
    type: 'entity_type_selection';
    default_value: undefined;
    step: undefined;
    min_excl_value: undefined;
    max_excl_value: undefined;
    min_incl_value: undefined;
    max_incl_value: undefined;
    choices: undefined;
    entity_type_selection_key: undefined;
}

export interface PropertyConfigItem extends ConfigItem {
    type: 'property';
    default_value: undefined;
    step: undefined;
    min_excl_value: undefined;
    max_excl_value: undefined;
    min_incl_value: undefined;
    max_incl_value: undefined;
    choices: undefined;
    entity_type_selection_key: string;
}

export interface Downloads {
    downloaded: Download[];
    downloading: Download[];
}

export interface Download {
    graphql_endpoint: string;
    dataset_id: string;
    collection_id: string;
    rows_count: number;
    total: number;
}

export interface Dataset {
    uri: string;
    name: string;
    title: string;
    description: string | null;
    prefixMappings: { [prefix: string]: string };
    collections: { [id: string]: Collection };
}

export interface Collection {
    uri: string;
    title: string | null;
    shortenedUri: string;
    total: number;
    downloaded: boolean;
    properties: { [id: string]: Property };
}

export interface Property {
    name: string;
    prefix: string;
    uri: string;
    prefixUri: string;
    shortenedUri: string;
    density: number;
    isInverse: boolean;
    isLink: boolean;
    isList: boolean;
    isValueType: boolean;
    referencedCollections: string[];
}

export interface PropertyValues {
    graphql_endpoint: string;
    dataset_id: string;
    collection_id: string;
    property: PropertyPath;
    values: string[];
}

export interface Sample {
    uri: string;
    count: number;
    properties: PropertyValues[];
}

export interface Link {
    count: number;
    valid: ValidationState;
    similarity: number;
    motivation: string | null,
    cluster_id: number;
    cluster_hash_id: string;
    link_order: 'source_target' | 'target_source' | 'both';
    source: string;
    source_collections: number[];
    source_intermediates: number[] | null,
    source_values: PropertyValues[];
    target: string,
    target_collections: number[];
    target_intermediates: number[] | null,
    target_values: PropertyValues[];
}

export interface LinksTotals {
    accepted: number;
    disputed: number;
    rejected: number;
    uncertain: number;
    unchecked: number;
}

export interface Cluster {
    id: number;
    hash_id: string;
    links: LinksTotals;
    links_filtered: LinksTotals;
    size: number;
    size_filtered: number;
    nodes: null;
    extended: boolean;
    reconciled: boolean;
    values: PropertyValues[];
}

export interface ClustersTotals {
    total: number;
    cluster_ids: number[];
}

export interface ClusterGraph {
    cluster_graph: ClusterGraphData;
    cluster_graph_compact: ClusterGraphData;
    reconciliation_graph: ClusterGraphData;
}

export interface ClusterGraphData {
    links: ClusterGraphLink[];
    nodes: ClusterGraphNode[];
}

export interface ClusterGraphLink {
    color: string;
    count: number;
    dash: string;
    distance: number;
    source: string;
    strength: number;
    target: string;
    value: number;
    dist_factor?: number[];
}

export interface ClusterGraphNode {
    id: string;
    group: string;
    investigated: boolean;
    satellite: boolean;
    size: number;
}

export interface ClusterGraphEntityNode extends ClusterGraphNode {
    dataset: string;
    entity: string;
    label: string;
    local_id: string;
}

export interface ClusterGraphGroupNode extends ClusterGraphNode {
    child: ClusterGraphData;
    missing_links: number;
    nodes: number;
    strength: number;
}

export interface BasicRef {
    id: number;
    created: string;
}

export interface BasicMetadata extends BasicRef {
    label: string;
    description: string;
}

export type LogicTree<K extends string, E extends object, P extends {} = {}> = {
    type: string;
} & P & {
    [name in K]: (LogicTree<K, E, P> | E)[];
};

export interface Job {
    job_id: string;
    job_title: string;
    job_description: string;
    job_link: string | null;
    created_at: Date;
    updated_at: Date;
    entity_type_selections: EntityTypeSelection[];
    linkset_specs: LinksetSpec[];
    lens_specs: LensSpec[];
    views: View[];
}

export interface JobUpdateData {
    job_id: string;
    job_title?: string;
    job_description?: string;
    job_link?: string | null;
    entity_type_selections?: EntityTypeSelection[];
    linkset_specs?: LinksetSpec[];
    lens_specs?: LensSpec[];
    views?: View[];
}

export interface EntityTypeSelection extends BasicMetadata {
    limit: number;
    random: boolean;
    dataset: DatasetRef;
    filter: Filter;
    properties: PropertyPath[];
}

export interface DatasetRef {
    timbuctoo_graphql: string;
    dataset_id: string;
    collection_id: string;
}

export interface Filter extends LogicTree<'conditions', FilterCondition> {
}

export interface FilterCondition {
    property: PropertyPath;
    type: string;
    value?: string;
    format?: string;
}

export interface LinksetSpec extends BasicMetadata {
    use_counter: boolean;
    sources: number[];
    targets: number[];
    methods: MatchingMethods;
}

export interface MatchingMethods extends LogicTree<'conditions', MatchingMethodSpec, {
    threshold?: number;
}> {
}

export interface MatchingMethodSpec {
    method: MatchingMethodConfig;
    sim_method: SimMatchingMethodConfig;
    list_matching: ListMatching;
    fuzzy: Fuzzy;
    sources: Conditions;
    targets: Conditions;
}

export interface SharedMatchingMethodConfig {
    name: string | null;
    config: { [key: string]: any };
}

export interface MatchingMethodConfig extends SharedMatchingMethodConfig {
    name: string;
}

export interface SimMatchingMethodConfig extends SharedMatchingMethodConfig {
    normalized: boolean;
}

export interface ListMatching {
    threshold: number;
    is_percentage: boolean;
}

export interface Fuzzy {
    threshold: number;
    s_norm: string;
    t_norm: string;
}

export interface Conditions {
    properties: { [ets: number]: PropertyCondition[] };
    transformers: AppliedTransformer[];
}

export interface PropertyCondition {
    property: PropertyPath;
    transformers: AppliedTransformer[];
}

export interface AppliedTransformer {
    name: string;
    parameters: { [key: string]: any };
}

export interface LensSpec extends BasicMetadata {
    specs: LensElements;
}

export interface LensElements extends LogicTree<'elements', SpecRef, {
    s_norm?: string;
    threshold?: number;
}> {
}

export interface SpecRef {
    id: number;
    type: 'linkset' | 'lens';
}

export interface View extends BasicRef {
    type: 'linkset' | 'lens';
    prefix_mappings: { [uri: string]: string };
    filters: ViewFilter[];
    properties: ViewProperty[];
}

export interface ViewFilter extends DatasetRef {
    filter: Filter;
}

export interface ViewProperty extends DatasetRef {
    properties: PropertyPath[];
}

export interface Processing {
    job_id: string;
    spec_id: number;
    status: string;
    status_message: string | null;
    requested_at: Date;
    processing_at: Date;
    finished_at: Date;
    kill: boolean;
    links_count: number;
    prefix_mappings: { [key: string]: string };
    uri_prefix_mappings: { [key: string]: string };
    dynamic_uri_prefix_mappings: { [key: string]: string };
}

export interface ProcessingWithMappings extends Processing {
    prefix_mappings: { [key: string]: string };
    uri_prefix_mappings: { [key: string]: string };
    dynamic_uri_prefix_mappings: { [key: string]: string };
}

export interface Linkset extends ProcessingWithMappings {
    links_progress: number | null;
    linkset_entities_count: number | null;
    linkset_sources_count: number | null;
    linkset_targets_count: number | null;
    sources_count: number | null;
    targets_count: number | null;
    entities_count: number | null;
}

export interface Lens extends ProcessingWithMappings {
    lens_entities_count: number;
    lens_sources_count: number;
    lens_targets_count: number;
}

export interface Clustering extends Processing {
    spec_type: 'linkset' | 'lens';
    clustering_type: string;
    clusters_count: number | null;
    cycles_count: number | null;
    resources_size: number;
    extended_count: number | null;
    smallest_count: number
    largest_count: number;
    smallest_size: number;
    largest_size: number;
}

export interface UnsavedData {
    entityTypeSelections: EntityTypeSelection[];
    linksetSpecs: LinksetSpec[];
    lensSpecs: LensSpec[];
    views: View[];
}

export interface JobUpdate {
    job_id: string;
    updated_at: Date;
    is_title_update: boolean;
    is_description_update: boolean;
    is_link_update: boolean;
    is_entity_type_selections_update: boolean;
    is_linkset_specs_update: boolean;
    is_lens_specs_update: boolean;
    is_views_update: boolean;
}

export interface AlignmentUpdate {
    job_id: string;
    spec_type: 'linkset' | 'lens';
    spec_id: number;
    status: string;
    status_message: string;
    links_progress: number;
}

export interface AlignmentDelete {
    job_id: string;
    spec_type: 'linkset' | 'lens';
    spec_id: number;
}

export interface ClusteringUpdate {
    job_id: string;
    spec_type: 'linkset' | 'lens';
    spec_id: number;
    clustering_type: string;
    status: string;
    status_message: string;
    links_count: number;
    clusters_count: number;
}

export interface ClusteringDelete {
    job_id: string;
    spec_type: 'linkset' | 'lens';
    spec_id: number;
    clustering_type: string;
}
