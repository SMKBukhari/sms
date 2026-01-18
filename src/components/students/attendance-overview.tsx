"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceOverviewProps {
  data: {
    labels: string[];
    data: number[];
  };
}

export function AttendanceOverview({ data }: AttendanceOverviewProps) {
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.data[index],
  }));

  return (
    <Card className='shadow-sm border-none'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-base font-semibold'>
          Attendance Overview
        </CardTitle>
        <Select defaultValue='week'>
          <SelectTrigger className='w-[110px] h-8 text-xs'>
            <SelectValue placeholder='Period' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='week'>This Week</SelectItem>
            <SelectItem value='month'>This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='h-[200px] w-full pt-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={chartData} barSize={30}>
            <XAxis
              dataKey='name'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#6b7280" }}
              dy={10}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: "8px" }}
            />
            <Bar
              dataKey='value'
              fill='#fca5a5'
              radius={[4, 4, 4, 4]}
              background={{ fill: "#f3f4f6", radius: 4 }}
            />
            {/* Note: The design has a line on top of bars, simpler to separate or just use bar for now */}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
