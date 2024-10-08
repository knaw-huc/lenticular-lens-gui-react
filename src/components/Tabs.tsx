import {ReactNode, useEffect, useState} from 'react';
import * as RadixTabs from '@radix-ui/react-tabs';
import clsx from 'clsx';
import classes from './Tabs.module.css';

export default function Tabs({tabs, childTheme = false, value, onTabChange}: {
    tabs: {
        [key: string]: {
            title: ReactNode,
            content: ReactNode,
            disabled?: boolean
        }
    },
    childTheme?: boolean,
    value?: string,
    onTabChange?: (activeTab: string) => void
}) {
    const [activeTab, setActiveTab] = useState(value || Object.keys(tabs)[0]);

    function onValueChange(tabKey: string) {
        setActiveTab(tabKey);
        if (onTabChange)
            onTabChange(tabKey);
        else
            window.location.hash = tabKey;
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
    }, []);

    return (
        <RadixTabs.Root className={clsx(classes.root, childTheme && classes.child)}
                        value={activeTab} onValueChange={onValueChange}>
            <RadixTabs.List className={classes.list}>
                {Object.keys(tabs).map(tabKey =>
                    <RadixTabs.Trigger key={tabKey} value={tabKey}
                                       className={classes.tab} disabled={tabs[tabKey].disabled}>
                        {!onTabChange && !tabs[tabKey].disabled && <a href={`#${tabKey}`}>
                            {tabs[tabKey].title}
                        </a>}
                        {(onTabChange || tabs[tabKey].disabled) && tabs[tabKey].title}
                    </RadixTabs.Trigger>
                )}
            </RadixTabs.List>

            {Object.keys(tabs).map(tabKey =>
                <RadixTabs.Content key={tabKey} value={tabKey}
                                   className={classes.tabContent}>
                    {tabs[tabKey].content}
                </RadixTabs.Content>
            )}
        </RadixTabs.Root>
    );
}
