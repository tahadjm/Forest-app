"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Edit, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActivityService } from "@/services/activity-service"
import type { Activity } from "@/types/activity"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const response = await ActivityService.getAllActivities()

        // Handle different response structures
        let activitiesData: Activity[] = []

        if (Array.isArray(response)) {
          activitiesData = response
        } else if (response && typeof response === "object") {
          // Check if response has a data property that's an array
          if (Array.isArray(response.data)) {
            activitiesData = response.data
          } else if (response.activities && Array.isArray(response.activities)) {
            activitiesData = response.activities
          } else {
            // If we can't find an array, convert the object to an array if possible
            const keys = Object.keys(response)
            if (keys.length > 0 && typeof response[keys[0]] === "object") {
              activitiesData = Object.values(response)
            }
          }
        }

        console.log("Activities data:", activitiesData)
        setActivities(activitiesData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch activities:", err)
        setError("Failed to load activities. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await ActivityService.deleteActivity(id)
      setActivities(activities.filter((activity) => activity._id !== id))
    } catch (err) {
      console.error("Failed to delete activity:", err)
      setError("Failed to delete activity. Please try again later.")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading activities...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  // Ensure activities is an array before rendering
  const activitiesList = Array.isArray(activities) ? activities : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activitiesList.length === 0 ? (
          <div className="text-center py-4">No activities found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Park</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activitiesList.map((activity) => (
                <TableRow key={activity._id}>
                  <TableCell className="font-medium">{activity.name}</TableCell>
                  <TableCell>
                    {activity.description ? activity.description.substring(0, 50) + "..." : "No description"}
                  </TableCell>
                  <TableCell>{activity.parkId}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${activity.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {activity.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/activities/${activity._id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon" className="text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the activity.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(activity._id)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
