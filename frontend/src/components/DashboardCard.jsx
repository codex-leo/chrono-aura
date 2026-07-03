import { Users } from "lucide-react"; 
const DashboardCard = (props) => {
  return (
    <div className="w-full flex flex-col h-70 border-2 rounded-2xl items-center p-4 bg-linear-120 from-[#0087C0] to-[#003F5A]">
      <div className="outline-2 rounded-full w-20 h-20 flex justify-center items-center text-white bg-white/40 backdrop-blur-md">
        {props.icon}
      </div>
      <div className="m-1">
        <span className="font-bold text-xl text-white">{props.title}</span>
      </div>
      <div className="w-full text-center p-1 m-1 font-semibold text-3xl outline-1 rounded-xl text-white bg-white/40 backdrop-blur-md">
        <span>{props.info}</span>
      </div>
      <button className="text-center bg-black p-2 text-white rounded-xl mt-5 w-full border-white border-2 cursor-pointer">View Details</button>
    </div>
  );
};

export default DashboardCard;