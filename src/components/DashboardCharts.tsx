"use client"

import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

interface ChartProps {
  data: any[]
  labels: string[]
  values: number[]
}

export function BarChart({ data, labels, values }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Vendas',
          data: values,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })

    return () => chart.destroy()
  }, [data, labels, values])

  return <canvas ref={chartRef} />
}

export function LineChart({ data, labels, values }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!chartRef.current) return

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Vendas',
          data: values,
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    })

    return () => chart.destroy()
  }, [data, labels, values])

  return <canvas ref={chartRef} />
}