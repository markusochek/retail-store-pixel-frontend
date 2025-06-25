import Filter from "@/app/filter";
import ProductContainer from "@/app/product-container";

export default function Home() {
  return (
    <>
      <div style={{ width: "100%",height: "100%", display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Filter></Filter>
          <ProductContainer></ProductContainer>
      </div>
    </>
  );
}
