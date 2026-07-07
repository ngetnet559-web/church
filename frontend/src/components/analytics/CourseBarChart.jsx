import {
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    Tooltip,
    Bar,
    CartesianGrid,
} from "recharts";

export default function CourseBarChart({
    data,
}) {
    return (
        <ResponsiveContainer
            width="100%"
            height={350}
        >
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3"/>

                <XAxis dataKey="course"/>

                <YAxis/>

                <Tooltip/>

                <Bar
                    dataKey="students"
                    fill="#6366f1"
                />
            </BarChart>
        </ResponsiveContainer>
    );
}