import {ReactNode, Suspense, useEffect, useState} from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import clsx from 'clsx';
import classes from './Tabs.module.css';
import {Spinner} from 'utils/components.tsx';

export default function Tabs({tabs, childTheme = false, defaultValue, onTabChange}: {
    tabs: {
        [key: string]: {
            title: ReactNode,
            content: ReactNode,
            disabled?: boolean
        }
    },
    childTheme?: boolean,
    defaultValue?: string,
    onTabChange?: (activeTab: string) => void
}) {
    const tabEntries = Object.entries(tabs);
    const [activeTab, setActiveTab] = useState(defaultValue || Object.keys(tabs)[0]);

    function onValueChange(tabKey: string) {
        setActiveTab(tabKey);
        if (onTabChange)
            onTabChange(tabKey);
        else
            history.replaceState(null, '', `#${tabKey}`);
    }

    useEffect(() => {
        if (!onTabChange) {
            function setActiveTabFromHash() {
                const hash = window.location.hash;
                if (hash && hash.slice(1) in tabs)
                    setActiveTab(hash.slice(1));
            }

            setActiveTabFromHash();
            window.addEventListener('hashchange', setActiveTabFromHash);

            return () => window.removeEventListener('hashchange', setActiveTabFromHash);
        }
    }, [tabs, onTabChange]);

    return (
        <RadixTabs.Root className={clsx(classes.root, childTheme && classes.child)}
                        value={activeTab} onValueChange={onValueChange}>
            <RadixTabs.List className={classes.list}>
                {tabEntries.map(([tabKey, tab]) =>
                    <TabTrigger key={`trigger_${tabKey}`} id={tabKey} title={tab.title}
                                disabled={tab.disabled} onTabChange={onTabChange}/>)}
            </RadixTabs.List>

            {tabEntries.map(([tabKey, tab]) =>
                <TabContent key={`content_${tabKey}`} id={tabKey} content={tab.content}
                            isActive={activeTab === tabKey}/>)}
        </RadixTabs.Root>
    );
}

function TabTrigger({id, title, disabled, onTabChange}: {
    id: string,
    title: ReactNode,
    disabled?: boolean,
    onTabChange?: (activeTab: string) => void
}) {
    return (
        <RadixTabs.Trigger value={id} className={classes.tab} disabled={disabled}>
            {!onTabChange && !disabled && <a href={`#${id}`}>
                {title}
            </a>}
            {(onTabChange || disabled) && title}
        </RadixTabs.Trigger>
    );
}

function TabContent({id, content, isActive}: { id: string, content: ReactNode, isActive: boolean }) {
    return (
        <RadixTabs.Content value={id} className={classes.tabContent}>
            <Suspense fallback={<Spinner/>}>
                {isActive && content}
            </Suspense>
        </RadixTabs.Content>
    );
}
