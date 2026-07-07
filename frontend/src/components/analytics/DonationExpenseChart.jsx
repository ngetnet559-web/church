import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Legend,
} from "recharts";

export default function DonationExpenseChart({
    data,
}) {
    return (
        <ResponsiveContainer
            width="100%"
            height={350}
        >
            <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3"/>

                <XAxis dataKey="month"/>

                <YAxis/>

                <Tooltip/>

                <Legend/>

                <Area
                    type="monotone"
                    dataKey="donations"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                />

                <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}
