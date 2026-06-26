const ProductCard = (props) => {
  return (
    <div className="m-2 h-90 rounded-xl overflow-hidden border-[#FFBF00] border-2 shadow-xl">
      <div className="relative h-full">
        <img
          src={props.imgSrc}
          alt="product_img"
          loading="lazy"
          className="h-full object-cover"
        />

        <div
          className="absolute inset-x-0 bottom-0 h-full backdrop-blur-2xl"
          style={{
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 20%, transparent 10%)",
            maskImage:
              "linear-gradient(to top, black 0%, black 20%, transparent 10%)",
          }}
        />

        <div className="absolute inset-x-0 bottom-0 h-full bg-linear-to-t from-black/95 via-black/50 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-3 text-left flex flex-col z-10">
          <div className="text-white flex justify-between">
            <h3 className="text-sm">{props.brandName}</h3>
            <span className="text-lg">Rs.{props.price}</span>
          </div>

          <p className="text-sm text-white font-extralight mb-2">
            {props.name}
          </p>

          <div className="p-1 text-center w-full bg-white/10 text-white flex items-center justify-center backdrop-blur-xl rounded-2xl px-5 border border-white/20 cursor-pointer">
            <button className="text-sm">Buy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
