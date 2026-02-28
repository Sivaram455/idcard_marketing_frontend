export default function UploadSection({ orderData, setOrderData }) {
  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Upload Data</h2>

      <div className="mb-4">
        <label className="block font-medium mb-2">
          Upload Excel / CSV
        </label>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) =>
            setOrderData({
              ...orderData,
              excelFile: e.target.files[0]?.name,
            })
          }
        />
      </div>

      <div>
        <label className="block font-medium mb-2">
          Upload Photos (ZIP or Images)
        </label>
        <input
          type="file"
          multiple
          onChange={(e) =>
            setOrderData({
              ...orderData,
              photos: Array.from(e.target.files).map(f => f.name),
            })
          }
        />
      </div>
    </div>
  );
}