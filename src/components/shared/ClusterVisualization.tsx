import {Suspense, useEffect, useRef, useState} from 'react';
import {drag, D3DragEvent} from 'd3-drag';
import {scaleOrdinal} from 'd3-scale';
import {select, pointer, Selection} from 'd3-selection';
import {schemeCategory10} from 'd3-scale-chromatic';
import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    ForceLink,
    SimulationNodeDatum,
    SimulationLinkDatum
} from 'd3-force';
import {useClusterGraph} from 'queries/clusters.ts';
import Checkbox from 'components/Checkbox.tsx';
import {ButtonGroup, Spinner} from 'utils/components.tsx';
import {
    ClusterGraphData,
    ClusterGraphEntityNode,
    ClusterGraphGroupNode,
    ClusterGraphLink
} from 'utils/interfaces.ts';
import classes from './ClusterVisualization.module.css';

interface Graph {
    links: Link[];
    nodes: Node[];
}

type VisualizationType = 'visualize' | 'visualize-compact' | 'visualize-reconciled';
type Node = EntityNode | GroupNode;
type EntityNode = ClusterGraphEntityNode & SimulationNodeDatum;
type GroupNode = ClusterGraphGroupNode & SimulationNodeDatum;
type Link = ClusterGraphLink & SimulationLinkDatum<Node>;

const color = scaleOrdinal(schemeCategory10);
const factor = (x: number) => Math.log2(x + 1) * 16;
const radius = (node: Node) => isGroupNode(node) ? factor(node.nodes) + 2 : node.size * 1.2;

const isGroupNode = (node: Node): node is GroupNode => 'nodes' in node;

export default function ClusterVisualization({jobId, type, id, graphId}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    graphId: number
}) {
    const [visualization, setVisualization] = useState<VisualizationType>('visualize');

    return (
        <div className={classes.visualization}>
            <div className={classes.menu}>
                <ButtonGroup>
                    <Checkbox asButton checked={visualization === 'visualize'}
                              onCheckedChange={checked => setVisualization(checked ? 'visualize' : 'visualize-compact')}>
                        Cluster
                    </Checkbox>

                    <Checkbox asButton checked={visualization === 'visualize-compact'}
                              onCheckedChange={checked => setVisualization(checked ? 'visualize-compact' : 'visualize')}>
                        Compact
                    </Checkbox>
                </ButtonGroup>
            </div>

            <Suspense fallback={<Spinner/>}>
                <Visualization jobId={jobId} type={type} id={id} graphId={graphId} visualization={visualization}/>
            </Suspense>
        </div>
    );
}

function Visualization({jobId, type, id, graphId, visualization}: {
    jobId: string,
    type: 'linkset' | 'lens',
    id: number,
    graphId: number,
    visualization: VisualizationType
}) {
    const ref = useRef<HTMLDivElement>(null);
    const {data} = useClusterGraph(jobId, type, id, graphId);

    useEffect(() => {
        if (ref.current) {
            for (const canvas of ref.current.getElementsByTagName('canvas'))
                canvas.remove();

            switch (visualization) {
                case 'visualize-compact':
                    data.cluster_graph_compact && draw(ref.current, data.cluster_graph_compact);
                    break;
                case 'visualize-reconciled':
                    data.reconciliation_graph && draw(ref.current, data.reconciliation_graph);
                    break;
                case 'visualize':
                default:
                    data.cluster_graph && draw(ref.current, data.cluster_graph);
            }
        }
    }, [ref, data, visualization]);

    return (
        <div className={classes.plot} ref={ref}></div>
    );
}

function draw(canvasContainer: HTMLDivElement, graphData: ClusterGraphData) {
    const container = select(canvasContainer);
    const canvas: Selection<HTMLCanvasElement, unknown, null, undefined> =
        container.select('canvas').size() ? container.select('canvas') : container.append('canvas');
    const ctx = canvas.node()!.getContext('2d')!;

    let rect = container.node()!.getBoundingClientRect();
    let currentChild: Graph | undefined;
    let selectedNode: Node | undefined;
    let clickedNode: Node | undefined;

    const root = () => currentChild || (graphData as Graph);
    const isSelected = (node: Node) => selectedNode && (selectedNode === node);
    const isClicked = (node: Node) => clickedNode && (clickedNode === node);

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const simulation = forceSimulation<Node>()
        .force('link', forceLink<Node, Link>()
            .id(link => link.id)
            .distance(link => link.dist_factor
                ? factor(link.dist_factor[0]) + factor(link.dist_factor[1]) + link.distance * 0.8
                : link.distance))
        .force('charge', forceManyBody())
        .force('center', forceCenter(rect.width / 2, rect.height / 2));

    const dragEvent = drag()
        .subject(findNode as any)
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded);

    canvas.call(dragEvent as any);
    canvas.on('dblclick', onDblClick);

    updateSimulation();

    function resizeCanvas() {
        rect = container.node()!.getBoundingClientRect();
        canvas.attr('width', 0).attr('height', 0);
        canvas.attr('width', rect.width).attr('height', rect.height);
        draw();
    }

    function updateSimulation() {
        simulation.nodes(root().nodes).on('tick', draw);
        simulation.force<ForceLink<Node, Link>>('link')!.links(root().links);
    }

    function draw() {
        ctx.save();
        ctx.clearRect(0, 0, rect.width, rect.height);

        ctx.fillStyle = '#FFFFE0';
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.fill();

        for (const link of root().links)
            drawLink(link);

        for (const node of root().nodes)
            drawNode(node);

        ctx.restore();
    }

    function findNode(e: MouseEvent | D3DragEvent<Element, unknown, Node>, position?: [number, number]) {
        const x = (position ? position[0] : e.x);
        const y = (position ? position[1] : e.y);

        return root().nodes.find(node => {
            const dx = x - node.x!;
            const dy = y - node.y!;
            const r = radius(node);

            return (dx * dx + dy * dy) < (r * r);
        });
    }

    function drawLink(link: Link) {
        ctx.beginPath();

        ctx.moveTo((link.source as Node).x!, (link.source as Node).y!);
        ctx.lineTo((link.target as Node).x!, (link.target as Node).y!);

        ctx.lineWidth = Math.sqrt(link.value) + 1;
        ctx.strokeStyle = link.strength < 1 ? 'red' : link.color || 'black';
        ctx.setLineDash(link.dash ? link.dash.split(',').map(no => parseInt(no)) : [3, 20 * (1 - link.strength)]);

        ctx.stroke();
    }

    function drawNode(node: Node) {
        drawNodeOuterCircle(node);
        drawNodeInnerCircle(node);
        drawNodeMissingLinks(node);
        drawNodeLabels(node);
    }

    function drawNodeOuterCircle(node: Node) {
        if (node.investigated && (isGroupNode(node) || node.size > 5)) {
            ctx.beginPath();

            ctx.arc(node.x!, node.y!, radius(node), 0, 2 * Math.PI);

            ctx.fillStyle = 'white';
            ctx.lineWidth = 4;
            ctx.strokeStyle = isSelected(node) || isClicked(node) ? 'red' : 'black';
            ctx.setLineDash(node.satellite ? [10, 3] : [10, 0]);

            ctx.stroke();
            ctx.fill();
        }
    }

    function drawNodeInnerCircle(node: Node) {
        ctx.beginPath();

        const radius = isGroupNode(node) ? factor(node.nodes) : node.size || 5;
        ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI);

        ctx.fillStyle = isSelected(node) ? 'red' : color(node.group);
        ctx.lineWidth = 2;
        ctx.strokeStyle = (node.investigated || (!isGroupNode(node) && node.size > 5)) ? 'white' : 'black';
        ctx.setLineDash(node.satellite ? [10, 3] : [10, 0]);

        ctx.stroke();
        ctx.fill();
    }

    function drawNodeMissingLinks(node: Node) {
        if (!isGroupNode(node)) return;

        ctx.beginPath();
        ctx.moveTo(node.x!, node.y!);

        const radius = node.nodes ? factor(node.nodes) * 0.7 : 0;
        ctx.arc(node.x!, node.y!, radius, 0, 2 * Math.PI * -node.missing_links, true);
        ctx.fillStyle = 'white';

        ctx.lineTo(node.x!, node.y!);
        ctx.fill();
    }

    function drawNodeLabels(node: Node) {
        const defaultFont = '12px sans-serif';
        ctx.fillStyle = 'black';

        const labelPosition = node.x! + (isGroupNode(node) ? factor(node.nodes) : node.size) * 0.9 + 8;

        ctx.font = defaultFont;
        ctx.fillText(isGroupNode(node) ? node.id : node.label, labelPosition, node.y! + 3);

        if (isGroupNode(node)) {
            const nodeSizeLabelPosition = node.x! + (node.nodes > 2 ? -factor(node.nodes) / 3 : -10);

            ctx.font = 'bold ' + defaultFont;
            ctx.fillText('N:' + node.nodes, nodeSizeLabelPosition, node.y! + 3);

            if (node.nodes > 2) {
                const noLinks = node.nodes * (node.nodes - 1) / 2;
                const linkLabel = node.missing_links! > 0
                    ? 'L:' + Math.round(noLinks * (1 - node.missing_links!)) + '/' + noLinks
                    : 'L:' + noLinks;
                const linkSizeLabelPosition = node.x! + (-factor(node.nodes) / 3);

                ctx.font = defaultFont;
                ctx.fillText(linkLabel, linkSizeLabelPosition, node.y! + 15);
            }

            if (node.strength && node.nodes > 1) {
                const strengthLabel = Number.parseFloat(String(node.strength))
                    ? 'S:' + Math.round(node.strength * 1000) / 1000
                    : 'S:' + node.strength;

                ctx.font = 'bold ' + defaultFont;
                ctx.fillText(strengthLabel, node.x! - 8, node.y! + factor(node.nodes) + 13);
            }
        }
    }

    function dragStarted(e: D3DragEvent<Element, unknown, Node>) {
        if (!e.active) simulation.alphaTarget(0.2).restart();

        e.subject.fx = e.x;
        e.subject.fy = e.y;
    }

    function dragged(e: D3DragEvent<Element, unknown, Node>) {
        e.subject.fx = e.x;
        e.subject.fy = e.y;
    }

    function dragEnded(e: D3DragEvent<Element, unknown, Node>) {
        if (!e.active) simulation.alphaTarget(0);
    }

    function onDblClick(e: MouseEvent) {
        const xy = pointer(e)
        const node = findNode(e, xy);
        if (!node) return;

        currentChild = isGroupNode(node) ? (node.child as Graph) : undefined;
        updateSimulation();
    }
}
