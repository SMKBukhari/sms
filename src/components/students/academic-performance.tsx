"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const data = [
  { name: "Jul", Grade7: 85, Grade8: 78, Grade9: 90 },
  { name: "Aug", Grade7: 88, Grade8: 82, Grade9: 85 },
  { name: "Sep", Grade7: 92, Grade8: 80, Grade9: 88 },
  { name: "Oct", Grade7: 89, Grade8: 85, Grade9: 91 },
  { name: "Nov", Grade7: 94, Grade8: 88, Grade9: 93 },
  { name: "Dec", Grade7: 90, Grade8: 86, Grade9: 92 },
];

export function AcademicPerformance() {
  return (
    <Card className='shadow-sm border-none bg-white dark:bg-card h-full'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <div className='space-y-1'>
          <CardTitle className='text-base font-semibold'>
            Academic Performance
          </CardTitle>
        </div>
        <Select defaultValue='semester'>
          <SelectTrigger className='w-[130px] h-8 text-xs bg-sky-100/50 border-none text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'>
            <SelectValue placeholder='Period' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='semester'>Last Semester</SelectItem>
            <SelectItem value='year'>Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className='h-[200px] w-full pt-2'>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart data={data} barGap={4}>
            <Legend
              iconType='circle'
              layout='horizontal'
              verticalAlign='top'
              align='left'
              wrapperStyle={{ paddingBottom: "20px", fontSize: "10px" }}
            />
            <XAxis
              dataKey='name'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              dy={10}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
            />
            <Bar
              dataKey='Grade7'
              fill='#cbd5e1'
              radius={[4, 4, 4, 4]}
              barSize={8}
              name='Grade 7'
            />
            <Bar
              dataKey='Grade8'
              fill='#334155'
              radius={[4, 4, 4, 4]}
              barSize={8}
              name='Grade 8'
            />
            <Bar
              dataKey='Grade9'
              fill='#f472b6'
              radius={[4, 4, 4, 4]}
              barSize={8}
              name='Grade 9'
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
