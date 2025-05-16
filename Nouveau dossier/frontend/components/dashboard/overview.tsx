"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type BookingData = {
  name: string
  total: number
}

export function Overview() {
  const [data, setData] = useState<BookingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching data from API
    const fetchData = async () => {
      setLoading(true)
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          setData([
            {
              name: "Jan",
              total: 1200,
            },
            {
              name: "Feb",
              total: 1900,
            },
            {
              name: "Mar",
              total: 2400,
            },
            {
              name: "Apr",
              total: 1800,
            },
            {
              name: "May",
              total: 2800,
            },
            {
              name: "Jun",
              total: 3800,
            },
            {
              name: "Jul",
              total: 4300,
            },
            {
              name: "Aug",
              total: 3900,
            },
            {
              name: "Sep",
              total: 3200,
            },
            {
              name: "Oct",
              total: 2800,
            },
            {
              name: "Nov",
              total: 2100,
            },
            {
              name: "Dec",
              total: 1900,
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Failed to fetch chart data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="h-[300px] w-full animate-pulse rounded-md bg-muted"></div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`€${value}`, "Revenue"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
