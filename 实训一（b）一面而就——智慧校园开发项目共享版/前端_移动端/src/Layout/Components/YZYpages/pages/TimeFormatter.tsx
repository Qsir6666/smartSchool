import React from 'react';
import dayjs from 'dayjs';

interface TimeFormatterProps {
    date: string;
    format: string;
}

const TimeFormatter: React.FC<TimeFormatterProps> = ({ date, format }) => {
    const formattedDate = dayjs(date).format(format);
    // console.log(formattedDate,'格式化后的时间');
    
    return <span>{formattedDate}</span>;
};

export default TimeFormatter;