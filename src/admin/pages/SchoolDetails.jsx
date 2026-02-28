import { useParams } from "react-router-dom"
import AdminLayout from "../components/AdminLayout"

export default function SchoolDetails() {
  const { id } = useParams()

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">School Details</h2>

      <div className="bg-white p-6 rounded shadow mb-6">
        <p><strong>School ID:</strong> {id}</p>
        <p><strong>Name:</strong> ABC School</p>
        <p><strong>Email:</strong> abc@gmail.com</p>
        <p><strong>Total Orders:</strong> 12</p>
        <p><strong>Total Students:</strong> 850</p>
        <p><strong>Status:</strong> Active</p>
      </div>

      <h3 className="text-xl font-semibold mb-4">School Orders</h3>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3">Order ID</th>
            <th className="p-3">Status</th>
            <th className="p-3">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t text-center">
            <td className="p-3">ORD001</td>
            <td className="p-3">Printing</td>
            <td className="p-3">12 Feb 2026</td>
          </tr>
        </tbody>
      </table>
    </AdminLayout>
  )
}