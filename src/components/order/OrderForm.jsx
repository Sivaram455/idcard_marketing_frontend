export default function OrderForm({ orderData, setOrderData }) {
  const handleProductChange = (product) => {
    const updatedProducts = orderData.products.includes(product)
      ? orderData.products.filter((p) => p !== product)
      : [...orderData.products, product];

    setOrderData({ ...orderData, products: updatedProducts });
  };

  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Order Details</h2>

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="block font-medium">Products</label>
          <div className="space-y-2 mt-2">
            {["ID Card", "Lanyard", "Card Holder"].map((product) => (
              <label key={product} className="block">
                <input
                  type="checkbox"
                  onChange={() => handleProductChange(product)}
                />{" "}
                {product}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-medium">Quantity</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setOrderData({ ...orderData, quantity: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block font-medium">Urgency</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setOrderData({ ...orderData, urgency: e.target.value })
            }
          >
            <option>Normal</option>
            <option>Urgent</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Delivery Address</label>
          <textarea
            className="w-full p-2 border rounded"
            onChange={(e) =>
              setOrderData({ ...orderData, address: e.target.value })
            }
          />
        </div>

      </div>
    </div>
  );
}