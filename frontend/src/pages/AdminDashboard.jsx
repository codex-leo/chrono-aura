import { useContext, useEffect, useState } from "react";
import { AuthData } from "../context/AuthContext";
import DashboardCard from "../components/DashboardCard";
import { Handshake, Package, Users } from "lucide-react";
import axios from "axios";

const AdminDashboard = () => {
  const [, , accessToken, isAdmin] = useContext(AuthData);
  const [stats, setStats] = useState({});
  const [lowStock,setlowStock] = useState([]);

  const getLowStockProducts = () => {
    axios.get("http://localhost:5000/api/admin/dashboard/low-stock", {
      headers : {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then((res) => {
      setlowStock(res.data.LowStockProducts);
    }).catch((error)=> {
      console.log(error);
    })
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${accessToken} `
        },
      })
      .then((res) => {
        console.log(res.data.stats);
        setStats(res.data.stats);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [accessToken]);

  return (
    <div className="min-h-screen p-4 mt-20">
      {isAdmin ? (
        <>
          <div className="grid grid-cols-2 gap-1">
            <DashboardCard
              icon={<Users size={34} />}
              title={"Users"}
              info={stats.totalUsers}
            />
            <DashboardCard
              icon={<Handshake size={34} />}
              title={"Brands"}
              info={stats.brandsListed}
            />
            <DashboardCard
              icon={<Package size={34} />}
              title={"Products"}
              info={stats.productsListed}
            />
          </div>
          <div className="w-full mt-5">
            <h2 className="font-bold text-2xl">More Stats</h2>
            <div className="flex flex-col gap-5 text-lg">
              <span>Low Stock Products</span>
              <div className="min-h-80 flex items-center justify-center">

                {  
                 lowStock.length === 0
                ? 
                <button 
                className="bg-linear-120 from-[#0087C0] to-[#003F5A] p-4 rounded-2xl text-white font-bold border border-black shadow-2xl active:scale-98 transition-all cursor-pointer"
                onClick={getLowStockProducts}
                >
                  Fetch Low Stock
                </button> 
                :
                <div className="border border-default">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-default bg-muted/30">
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">
                          No.
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">
                          Brand
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold uppercase tracking-wider">
                          Stock
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {lowStock.map((product,i)=>{
                        return (
                        <tr className="border-b border-default transition-colors hover:bg-blue-400/10">
                        <td className="px-6 py-4 font-medium">{i+1}</td>

                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm">
                              {product.description}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-medium">{product.brand.name}</span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="bg-yellow-500/10 px-3 py-1 font-medium text-yellow-600">
                            {product.stock}
                          </span>
                        </td>
                      </tr>)
                      })}
                    </tbody>
                  </table>
                </div> }
              </div>
            </div>
          </div>
        </>
      ) : (
        <h1>Your're not admin.</h1>
      )}
    </div>
  );
};

export default AdminDashboard;
