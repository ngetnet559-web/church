import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const COLORS = [
    "#4f46e5",
    "#06b6d4",
    "#22c55e",
    "#f97316",
];

export default function RolePieChart({
    data,
}) {
    return (
        <ResponsiveContainer
            width="100%"
            height={350}
        >
            <PieChart>

                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                >

                    {data.map((entry, index) => (
                        <Cell
                            key={index}
                            fill={
                                COLORS[
                                index %
                                COLORS.length
                                ]
                            }
                        />
                    ))}

                </Pie>

                <Tooltip />

            </PieChart>
        </ResponsiveContainer>
    );
}