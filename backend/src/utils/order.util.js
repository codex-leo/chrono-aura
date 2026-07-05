const generateOrderNumber = () => {
  const magicNumber = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const orderNumber = `CA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${magicNumber}`;
  return orderNumber;
};

module.exports = { generateOrderNumber }