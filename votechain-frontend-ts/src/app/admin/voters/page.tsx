"use client"

import { useEffect, useState } from "react"
import { columns } from "@/components/admin/voters/columns"
import { DataTable } from "@/components/admin/voters/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Voter } from "@/types/voter"

export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await fetch("/api/voters")
        const data = await response.json()
        setVoters(data)
      } catch (error) {
        console.error("Error fetching voters:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVoters()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Voters</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Voter
        </Button>
      </div>
      <DataTable columns={columns} data={voters} />
    </div>
  )
} 