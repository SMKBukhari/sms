"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnrollmentTrendProps {
  data: {
    labels: string[];
    data: number[];
  };
}

export function EnrollmentTrends({ data }: EnrollmentTrendProps) {
  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.data[index],
  }));

  return (
    <Card className='shadow-sm border-none'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='space-y-1'>
          <CardTitle className='text-base font-semibold'>
            Enrollment Trends
          </CardTitle>
          <CardDescription>Student enrollment over time</CardDescription>
        </div>
        <Select defaultValue='5years'>
          <SelectTrigger className='w-[120px] h-8 text-xs'>
            <SelectValue placeholder='Period' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='5years'>Last 5 Years</SelectItem>
            <SelectItem value='10years'>Last 10 Years</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='h-[200px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id='colorValue' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey='name'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              dy={10}
            />
            <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              cursor={{ stroke: "#e5e7eb", strokeWidth: 2 }}
            />
            <Area
              type='monotone'
              dataKey='value'
              stroke='#3b82f6'
              strokeWidth={3}
              fillOpacity={1}
              fill='url(#colorValue)'
            />
            {/* Dot on the latest point - hard to do dynamically with simple Area, but default dot is fine */}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
