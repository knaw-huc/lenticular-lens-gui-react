import {useState} from 'react';
import Checkbox from 'components/Checkbox.tsx';
import linkPredicates from 'utils/linkPredicates.tsx';
import {api} from 'utils/config.ts';
import {Form, ButtonGroup, LinkButton, LabelGroup} from 'utils/components.tsx';
import classes from './Export.module.css';

interface Data {
    metadata: boolean;
    linkset: boolean;
    validationSet: boolean;
    clusterSet: boolean;
}

interface LinksRestrictions {
    all: boolean;
    validated: boolean;
    unchecked: boolean;
    accepted: boolean;
    rejected: boolean;
    disputed: boolean;
    uncertain: boolean;
}

interface LinkPredicate {
    uri: string;
    prefix: string;
    predicate: string;
}

export default function Export({jobId, type, id}: { jobId: string, type: 'linkset' | 'lens', id: number }) {
    const [format, setFormat] = useState<'csv' | 'rdf'>('csv');
    const [data, setData] = useState<Data>({
        metadata: false,
        linkset: true,
        validationSet: false,
        clusterSet: false
    });
    const [restrictions, setRestrictions] = useState<LinksRestrictions>({
        all: true,
        validated: false,
        unchecked: false,
        accepted: false,
        rejected: false,
        disputed: false,
        uncertain: false
    });
    const [reification, setReification] = useState<'none' | 'standard' | 'rdf_star' | 'singleton'>('standard');
    const [linkPredicate, setLinkPredicate] = useState<LinkPredicate>({
        uri: linkPredicates.owl.uri,
        prefix: linkPredicates.owl.prefix,
        predicate: linkPredicates.owl.predicates[0],
    });

    function onFormatChange(format: 'csv' | 'rdf') {
        setFormat(format);
        if (format === 'csv') {
            setData({
                metadata: false,
                linkset: true,
                validationSet: false,
                clusterSet: false
            });
            setReification('none');
        }
    }

    function onDataChange(property: keyof Data, checked: boolean) {
        setData(prev => {
            const data = {...prev, [property]: checked};
            if (!data.linkset && !data.metadata && !data.validationSet && !data.clusterSet) {
                if (property === 'metadata')
                    data.linkset = true;
                else
                    data.metadata = true;
            }

            if (!data.linkset)
                setReification('none');

            return data;
        });
    }

    function onReificationChange(reification: 'none' | 'standard' | 'rdf_star' | 'singleton') {
        setReification(reification);
    }

    function onLinkRestrictionsChange(restriction: keyof LinksRestrictions, checked: boolean) {
        setRestrictions(prev => {
            const restrictions = {...prev, [restriction]: checked};
            if (restriction === 'all') {
                restrictions.validated = restrictions.all;
                restrictions.unchecked = restrictions.all;
                restrictions.accepted = restrictions.all;
                restrictions.rejected = restrictions.all;
                restrictions.disputed = restrictions.all;
                restrictions.uncertain = restrictions.all;
            }
            else if (restriction === 'validated') {
                restrictions.accepted = restrictions.validated;
                restrictions.rejected = restrictions.validated;
                restrictions.disputed = restrictions.validated;
                restrictions.uncertain = restrictions.validated;
                restrictions.all = restrictions.validated && restrictions.unchecked;
                if (!restrictions.validated)
                    restrictions.unchecked = true;
            }
            else if (restriction === 'unchecked') {
                restrictions.all = restrictions.validated && restrictions.unchecked;
                if (!restrictions.all)
                    restrictions.validated = true;
            }
            else {
                restrictions.validated = restrictions.accepted && restrictions.rejected &&
                    restrictions.disputed && restrictions.uncertain;
                if (!restrictions.all)
                    restrictions.unchecked = true;
            }
            return restrictions;
        });
    }

    function getExportCsvLink() {
        const params = [];

        if (restrictions.accepted) params.push('valid=accepted');
        if (restrictions.rejected) params.push('valid=rejected');
        if (restrictions.disputed) params.push('valid=disputed');
        if (restrictions.uncertain) params.push('valid=uncertain');
        if (restrictions.unchecked) params.push('valid=unchecked');

        return `${api}/job/${jobId}/csv/${type}/${id}?${params.join('&')}`;
    }

    function getRdfExportLink() {
        const params = [];

        params.push(`export_linkset=${data.linkset}`);
        params.push(`export_metadata=${data.metadata}`);
        params.push(`export_validation_set=${data.validationSet}`);
        params.push(`export_cluster_set=${data.clusterSet}`);

        if (restrictions.accepted) params.push('valid=accepted');
        if (restrictions.rejected) params.push('valid=rejected');
        if (restrictions.disputed) params.push('valid=disputed');
        if (restrictions.uncertain) params.push('valid=uncertain');
        if (restrictions.unchecked) params.push('valid=unchecked');

        params.push(`reification=${reification}`);

        params.push(`link_pred_namespace=${encodeURIComponent(linkPredicate.uri)}`);
        params.push(`link_pred_shortname=${encodeURIComponent(linkPredicate.prefix + ':' + linkPredicate.predicate)}`);

        return `${api}/job/${jobId}/rdf/${type}/${id}?${params.join('&')}`;
    }

    return (
        <Form className={classes.export}>
            <LabelGroup isForm label="Format" inline>
                <ButtonGroup>
                    <Checkbox asButton checked={format === 'csv'}
                              onCheckedChange={checked => onFormatChange(checked ? 'csv' : 'rdf')}>
                        CSV
                    </Checkbox>

                    <Checkbox asButton checked={format === 'rdf'}
                              onCheckedChange={checked => onFormatChange(checked ? 'rdf' : 'csv')}>
                        RDF (TriG)
                    </Checkbox>
                </ButtonGroup>
            </LabelGroup>

            <LabelGroup isForm label="Data" inline>
                <ButtonGroup>
                    <Checkbox asButton checked={data.metadata} disabled={format === 'csv'}
                              onCheckedChange={checked => onDataChange('metadata', checked)}>
                        Metadata
                    </Checkbox>

                    <Checkbox asButton checked={data.linkset} disabled={format === 'csv'}
                              onCheckedChange={checked => onDataChange('linkset', checked)}>
                        Alignment
                    </Checkbox>

                    <Checkbox asButton checked={data.validationSet} disabled={format === 'csv'}
                              onCheckedChange={checked => onDataChange('validationSet', checked)}>
                        Validation set
                    </Checkbox>

                    <Checkbox asButton checked={data.clusterSet} disabled={format === 'csv'}
                              onCheckedChange={checked => onDataChange('clusterSet', checked)}>
                        Cluster set
                    </Checkbox>
                </ButtonGroup>
            </LabelGroup>

            <LabelGroup isForm label="Restrictions on links" inline>
                <ButtonGroup>
                    <Checkbox asButton checked={restrictions.all}
                              onCheckedChange={checked => onLinkRestrictionsChange('all', checked)}>
                        All
                    </Checkbox>

                    <Checkbox asButton checked={restrictions.validated}
                              onCheckedChange={checked => onLinkRestrictionsChange('validated', checked)}>
                        Validated
                    </Checkbox>

                    <Checkbox asButton checked={restrictions.unchecked}
                              onCheckedChange={checked => onLinkRestrictionsChange('unchecked', checked)}>
                        Unchecked
                    </Checkbox>

                    <Checkbox asButton checked={restrictions.accepted}
                              onCheckedChange={checked => onLinkRestrictionsChange('accepted', checked)}>
                        Accepted
                    </Checkbox>

                    <Checkbox asButton checked={restrictions.rejected}
                              onCheckedChange={checked => onLinkRestrictionsChange('rejected', checked)}>
                        Rejected
                    </Checkbox>

                    <Checkbox asButton checked={restrictions.disputed}
                              onCheckedChange={checked => onLinkRestrictionsChange('disputed', checked)}>
                        Disputed
                    </Checkbox>

                    <Checkbox asButton checked={restrictions.uncertain}
                              onCheckedChange={checked => onLinkRestrictionsChange('uncertain', checked)}>
                        Uncertain
                    </Checkbox>
                </ButtonGroup>
            </LabelGroup>

            <LabelGroup isForm label="RDF reification" inline>
                <ButtonGroup>
                    <Checkbox asButton checked={reification === 'none'} disabled={format === 'csv'}
                              onCheckedChange={checked => onReificationChange(checked ? 'none' : 'standard')}>
                        No links metadata
                    </Checkbox>

                    <Checkbox asButton checked={reification === 'standard'} disabled={format === 'csv'}
                              onCheckedChange={checked => onReificationChange(checked ? 'standard' : 'none')}>
                        Standard RDF reification
                    </Checkbox>

                    <Checkbox asButton checked={reification === 'rdf_star'} disabled={format === 'csv'}
                              onCheckedChange={checked => onReificationChange(checked ? 'rdf_star' : 'none')}>
                        RDF-star
                    </Checkbox>

                    <Checkbox asButton checked={reification === 'singleton'} disabled={format === 'csv'}
                              onCheckedChange={checked => onReificationChange(checked ? 'singleton' : 'none')}>
                        Singleton
                    </Checkbox>
                </ButtonGroup>
            </LabelGroup>

            <LabelGroup isForm label="Link predicate" inline>
                <SelectMapping value={linkPredicate} onChange={setLinkPredicate} disabled={format === 'csv'}/>
            </LabelGroup>

            <LinkButton
                className={classes.exportButton}
                href={format === 'csv' ? getExportCsvLink() : getRdfExportLink()}
                download={`${type}_${id}.${format === 'csv' ? 'csv' : 'ttl'}`}>
                Export
            </LinkButton>
        </Form>
    );
}

function SelectMapping({value, onChange, disabled}: {
    value: LinkPredicate,
    onChange: (linkPredicate: LinkPredicate) => void,
    disabled: boolean
}) {
    const predicates = Object.values(linkPredicates)
        .flatMap(linkPredicate => linkPredicate.predicates.map(pred => ({
            label: `${linkPredicate.prefix}:${pred}`,
            prefix: linkPredicate.prefix,
            uri: linkPredicate.uri,
            predicate: pred
        })))
        .sort((lpA, lpB) => {
            const prefixCmp = lpA.prefix.localeCompare(lpB.prefix);
            if (prefixCmp === 0)
                return lpA.predicate.localeCompare(lpB.predicate);
            return prefixCmp;
        });

    function onPredicateChange(value: string) {
        const [prefix, predicate, ...uriParts] = value.split(':');
        const uri = uriParts.join(':');
        onChange({prefix, predicate, uri});
    }

    return (
        <select value={`${value.prefix}:${value.predicate}:${value.uri}`} disabled={disabled}
                onChange={e => onPredicateChange(e.target.value)}>
            {predicates.map(pred =>
                <option key={pred.label} value={`${pred.prefix}:${pred.predicate}:${pred.uri}`}>
                    {pred.label}
                </option>)}
        </select>
    );
}
