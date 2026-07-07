const generateOrderNumber = () => {
  const magicNumber = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const orderNumber = `CA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${magicNumber}`;
  return orderNumber;
};

const isValidOrderStatusTransition = (currentStatus, newStatus) => {
  if (
    currentStatus === "cancelled" ||
    currentStatus === "returned" ||
    currentStatus === "delivered"
  ) {
    return false;
  }
  if (currentStatus === "pending") {
    if (newStatus !== "confirmed") {
      return false;
    }
  } else if (currentStatus === "confirmed") {
    if (newStatus !== "processing") {
      return false;
    }
  } else if (currentStatus === "processing") {
    if (newStatus !== "shipped") {
      return false;
    }
  } else if (currentStatus === "shipped") {
    if (newStatus !== "out_for_delivery") {
      return false;
    }
  } else if (currentStatus === "out_for_delivery") {
    if (newStatus !== "delivered") {
      return false;
    }
  }
  return true;
};

module.exports = { generateOrderNumber, isValidOrderStatusTransition };
