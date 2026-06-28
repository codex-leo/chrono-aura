import ProductCard from "../components/ProductCard";

const Home = (props) => {
  return (
    <>
      <div className="font-bold text-center text-3xl flex flex-col justify-center items-center mt-45">
        <div className="h-50">
          <h1>
            The World of Premium Timepieces,
            <br /> All in One Place.
          </h1>
        </div>
        <div className="flex flex-wrap">
          {props.products.length === 0 ? (
            <div>Opps! No products to show sorry!</div>
          ) : (
            props.products.map((product) => {
              return (
                <div className="w-1/2" key={product._id}>
                  <ProductCard
                    name={product.name}
                    brandName={product.brand["name"]}
                    price={product.price["$numberDecimal"]}
                    imgSrc={product.thumbnailURI}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
