import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const getEcoScoreBadge = (score) => {
    if (score >= 80) {
      return { color: "bg-green-600", label: "Excellent" };
    } else if (score >= 50) {
      return { color: "bg-yellow-500", label: "Moderate" };
    } else {
      return { color: "bg-red-500", label: "Poor" };
    }
  };

  const getCO2Badge = (co2) => {
    if (co2 <= 20) {
      return { color: "bg-green-600", label: "Low CO₂" };
    } else if (co2 <= 50) {
      return { color: "bg-yellow-500", label: "Moderate CO₂" };
    } else {
      return { color: "bg-red-500", label: "High CO₂" };
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "Plastic-Free":
        return "bg-green-200 text-green-800";
      case "Compostable":
        return "bg-yellow-200 text-yellow-800";
      case "Biodegradable":
        return "bg-blue-200 text-blue-800";
      case "Recyclable":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  useEffect(() => {
    applyFilter();
  }, [searchTerm, products]);

  // const fetchProducts = async () => {
  //   try {
  //     const res = await axios.get(
  //       "http://localhost:3000/api/products/my-products",
  //       {
  //         withCredentials: true,
  //       }
  //     );
  //     const userRole = res.data?.user?.role;
  //     setRole(userRole);

  //     // if (userRole === "retailer") {
  //     //   navigate("/retailer/products");
  //     //   return;
  //     // }

  //     const productRes = await axios.get("http://localhost:3000/api/products");
  //     setProducts(productRes.data);
  //   } catch (err) {
  //     console.error("Failed to fetch products:", err);
  //   }
  // };
const fetchProducts = async () => {
  try {
    const res = await axios.get(
      "http://localhost:3000/api/products/my-products",
      {
        withCredentials: true,
      }
    );

    setProducts(res.data.products); // Set the user's own products only
  } catch (err) {
    console.error("Failed to fetch my products:", err);
  }
};

  const handleLike = async (id) => {
    try {
      await axios.post(`http://localhost:3000/api/products/${id}/like`);
      fetchProducts();
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const applyFilter = () => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="px-4 py-6">
      {/* Search Bar */}
      <div className="mb-6 max-w-md">
        <input
          type="text"
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Products Grid */}
      <div>
         {filteredProducts.length === 0 ? (
    <p className="text-center text-gray-500 text-lg">🚫 No products added yet.</p>
  ) : (
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product._id}
            className="shadow-md rounded-xl overflow-hidden"
          >
            <CardContent className="p-4">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-48 w-full object-cover rounded mb-4"
                />
              )}
              <h3 className="text-xl font-bold text-gray-800">
                {product.name}
              </h3>
              <p className="text-gray-600">{product.category}</p>
              {(() => {
                const { color, label } = getEcoScoreBadge(
                  product.sustainabilityScore || 80
                );
                return (
                  <div
                    className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${color} mt-2`}
                  >
                    ♻️ {label} ecoScore : {product.sustainabilityScore || 80}/100
                  </div>
                );
              })()}
              <span
                  className={`px-2 py-1 rounded text-xs ${getBadgeColor(
                    product.packagingType
                  )}`}
                >
                  {product.packagingType}
                </span>

              {(() => {
                const co2 =
                  parseFloat(product.carbonFootprint?.toFixed(2)) || 0;
                const { color, label } = getCO2Badge(co2);
                return (
                  <div
                    className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${color} mt-2`}
                  >
                    🌍 {label}: {co2} kg of CO₂
                  </div>
                );
              })()}

              <div className="flex justify-between items-center mt-4 text-sm">
                <Button
                  onClick={() => handleLike(product._id)}
                  variant="outline"
                >
                  ❤️ {product.likes || 0}
                </Button>
                <Button
                  onClick={() => handleDelete(product._id)}
                  variant="destructive"
                >
                  🗑️ Delete
                </Button>
              </div>

              <div className="mt-3">
                <Link to={`/products/${product._id}`}>
                  <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                    View Details
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>)}
    </div>
        
  </div>
      
  );
}
