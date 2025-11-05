// Centralized order calculation helpers
export function computeOrderTotals(orderItems = []) {
  let subtotal = 0;
  let totalDiscount = 0;
  let cgst = 0;
  let sgst = 0;

  orderItems.forEach(item => {
    const itemDiscountPercent = item.discount || 0;
    const totalGstPercent = (item.cgst || 0) + (item.sgst || 0);

    // MRP includes GST, extract base price
    const basePrice = item.price / (1 + (totalGstPercent / 100));
    const basePriceTotal = basePrice * (item.quantity || 1);

    const discountAmount = (basePriceTotal * itemDiscountPercent) / 100;
    const afterDiscount = basePriceTotal - discountAmount;

    const cgstAmount = (afterDiscount * (item.cgst || 0)) / 100;
    const sgstAmount = (afterDiscount * (item.sgst || 0)) / 100;

    subtotal += basePriceTotal;
    totalDiscount += discountAmount;
    cgst += cgstAmount;
    sgst += sgstAmount;
  });

  const totalTax = cgst + sgst;
  const total = subtotal - totalDiscount + totalTax;

  return { subtotal, totalDiscount, cgst, sgst, totalTax, total };
}

export function computeItemBasePrice(item) {
  const totalGstPercent = (item.cgst || 0) + (item.sgst || 0);
  const basePrice = item.price / (1 + (totalGstPercent / 100));
  return basePrice;
}
