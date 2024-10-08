import {useEffect, useState} from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import classes from './Duration.module.css';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export function Duration({from, until}: { from: Date, until?: Date }) {
    const [now, setNow] = useState(dayjs());

    useEffect(() => {
        if (!until) {
            const interval = setInterval(() => setNow(dayjs()), 1000);
            return () => clearInterval(interval);
        }
    }, [from, until]);

    const fromTime = dayjs(from);
    const untilTime = until ? dayjs(until) : now;
    const duration = dayjs.duration(fromTime.diff(untilTime));

    function getExactDuration() {
        const days = Math.abs(duration.days());
        const hours = Math.abs(duration.hours());
        const minutes = Math.abs(duration.minutes());
        const seconds = Math.abs(duration.seconds());

        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        const secondsStr = String(seconds).padStart(2, '0');

        const prefix = days > 0 ? `${days} ${days === 1 ? 'day' : 'days'} and ` : '';

        if (hours > 0)
            return `${prefix}${hoursStr}:${minutesStr}:${secondsStr}`;

        if (minutes > 0)
            return `${prefix}00:${minutesStr}:${secondsStr}`;

        return `${prefix}00:00:${secondsStr}`;
    }

    return (
        <span>
            {until ? duration.humanize(false) : fromTime.format('MMMM D YYYY, HH:mm')}
            {' '}
            <span className={classes.extraDurationInfo}>
                ({until ? getExactDuration() : duration.humanize(true)})
            </span>
        </span>
    );
}
