import { useParams } from "react-router-dom"
import { useState } from "react"
import AdminLayout from "../components/AdminLayout"
import StatusDropdown from "../components/StatusDropdown"

export default function OrderDetails() {
  const { id } = useParams()
  const [status, setStatus] = useState("Submitted")

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Order Details</h2>

      <div className="bg-white p-6 rounded shadow mb-6">
        <p><strong>Order ID:</strong> {id}</p>
        <p><strong>School:</strong> ABC School</p>
        <p><strong>Total Students:</strong> 320</p>

        <div className="mt-4">
          <strong>Status:</strong>
          <div className="mt-2">
            <StatusDropdown value={status} onChange={setStatus} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow mb-6">
        <h3 className="font-semibold mb-4">Excel Preview</h3>
        <div className="border p-4 text-gray-500">
          Excel table preview will appear here.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="font-semibold mb-4">Card Front</h3>
          <div className="h-40 bg-gray-200 flex items-center justify-center">
            Front Preview
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="font-semibold mb-4">Card Back</h3>
          <div className="h-40 bg-gray-200 flex items-center justify-center">
            Back Preview
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}