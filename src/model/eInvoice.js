const yup = require('yup');

/**
 * Based on e-Invoicing JSON File Format
 * https://eis-cert.bir.gov.ph/#/downloads/18
 * EIS e-invoice JSON File format v2.01_3.25.22_BIR_updated_f.xlsx (218.93 KB)
 */

function padStart(targetLen, padStr, options = {}) {
  const { retainEmpty = true } = options;
  return (val) => {
    if (String(val).length === 0 && retainEmpty) return val;
    return String(val).padStart(targetLen, padStr);
  };
}

function sellerInfo() {
  return yup.object().noUnknown().shape({
    Tin: yup.string().max(9).required().label('Seller TIN'),
    BranchCd: yup.string().max(5).required().label('Branch Code')
      .transform(padStart(5, '0')),
    Type: yup.string().max(1).required().label('Seller Type'),
    RegNm: yup.string().max(200).required().label('Registered Name'),
    BusinessNm: yup.string().max(200).required().label('Business Name/Trade Name'),
    Email: yup.string().max(100).optional().label('Email address')
      .email(),
    RegAddr: yup.string().max(300).required().label('Registered Address'),
  });
}

function buyerInfo(params = {}) {
  const { required = true } = params;
  const isRequired = required ? 'required' : 'optional';

  // Buyer Information
  return yup.object().noUnknown().shape({
    Tin: yup.string().max(9)[isRequired]().label('Buyer TIN'),
    BranchCd: yup.string().max(9)[isRequired]().label('Branch Code')
      .transform(padStart(5, '0')),
    RegNm: yup.string().max(200)[isRequired]().label('Registered Name'),
    BusinessNm: yup.string().max(200)[isRequired]().label('Business Name/Trade Name'),
    Email: yup.string().max(100).optional().label('Email address')
      .email(),
    RegAddr: yup.string().max(300).optional().label('Registered Address'),
  });
}

function proofOfDelivery() {
  // Proof of Delivery/Export
  return yup.object().noUnknown().shape({
    DevAddr: yup.string().max(300).optional().label('Delivery Address'),
    AirNum: yup.string().max(50).optional().label('Airway Bill Number'),
    AirNumDt: yup.string().max(8).optional().label('Airway Bill Number Date'),
    LadNum: yup.string().max(50).optional().label('Bill of Lading Number'),
    LadNumDt: yup.string().max(8).optional().label('Bill of Lading Number Date'),
  });
}

function lineItem() {
  // Line items Information
  return yup.object().noUnknown().shape({
    Nm: yup.string().max(100).required().label('Item Name'),
    Desc: yup.string().max(100).optional().label('Item Description/Service'),
    Qty: yup.number().required().default(0).label('Item Quantity'),
    Unit: yup.string().max(50).optional().label('Item Unit of measure'),
    UnitCost: yup.number().required().default(0).label('Unit Cost'),
    SalesAmt: yup.number().required().default(0).label('Item Sales Amount'),
    RegDscntAmt: yup.number().required().default(0).label('Regular Item Discount Amount'),
    SpeDscntAmt: yup.number().required().default(0).label('Special Item Discount Amount'),
    NetSales: yup.number().required().default(0).label('Net of  Item Sales'),
  });
}

function discountInfo() {
  return yup.object().noUnknown().shape({
    ScAmt: yup.number().required().default(0).label('Senior Citizen Discount Amount'),
    PwdAmt: yup.number().required().default(0).label('PWD Discount Amount'),
    RegAmt: yup.number().required().default(0).label('Regular Discount Amount'),
    SpeAmt: yup.number().required().default(0).label('Special Discount Amount'),
    Rmk2: yup.string().optional().label('Remarks2'),
  });
}

function foreignCurr() {
  return yup.object().noUnknown().shape({
    Currency: yup.string().max(3).required('Currency'),
    ConvRate: yup.number().required().label('Conversion Rate'),
    ForexAmt: yup.number().required().label('Currency Amount'),
  });
}

function casIssuedInvoice() {
  return yup.object().noUnknown().shape({
    // SI/OR/SB/DM/CM Management Information
    CompInvoiceId: yup.string().max(50).required().label('Company SI/OR/SB/DM/CM No.'),
    IssueDtm: yup.string().max(8).required().label('SI/OR/SB/DM/CM Issuance Date'),
    // E-Invoice Basic information
    EisUniqueId: yup.string().max(24).required().label('BIR e-invoice Unique ID'),
    DocType: yup.string().max(2).required().label('Document Type')
      .transform(padStart(2, '0')),
    TransClass: yup.string().max(2).required().label('Transaction Classification')
      .transform(padStart(2, '0')),
    // - Invoice Correction
    CorrYN: yup.string().max(1).required().label('Correction Yes or Not')
      .oneOf(['Y', 'N']),
    CorrectionCd: yup.string().max(2).optional().label('e-Invoice correction code')
      .transform(padStart(2, '0')),
    PrevUniqueId: yup.string().max(24).optional().label('E-Invoice Unique ID of the document to be corrected'),
    Rmk1: yup.string().max(500).optional().label('Remarks1'),
    // Seller Information
    SellerInfo: sellerInfo().required().label('Seller Information'),
    // Buyer Information
    BuyerInfo: buyerInfo().concat(proofOfDelivery()).required().label('Buyer Information'),
    // Line items Information
    ItemList: yup.array().of(lineItem()).label('Line Items')
      .min(1)
      .max(1000),
    TotNetItemSales: yup.number().required().label('Total of Net  of  Item Sales'),
    // Sales Information - Discount Information
    Discount: discountInfo().required().label('Discount Information'),
    OtherTaxRev: yup.number().required().default(0).label('Other taxable revenue'),
    TotNetSalesAftDisct: yup.number().required().label('Total Net Sales After Discounts'),
    // Tax Information
    VATAmt: yup.number().required().label('VAT Amount'),
    WithholdIncome: yup.number().required().label('Withholding Tax-Income Tax'),
    WithholdBusVAT: yup.number().required().label('Withholding Tax-Business VAT'),
    WithholdBusPT: yup.number().required().label('Withholding Tax-Business Percentage'),
    // Non-taxable
    OtherNonTaxCharge: yup.number().required().label('Other Non-taxable charges'),
    //
    NetAmtPay: yup.number().required().label('Net Amount Payable'),
    ForCur: foreignCurr().optional(),
    // PTU Information
    PtuNum: yup.string().required().max(50).label('PTU Number/Acknowledgment Certificate Control Number'),
  });
}

function crmPosIssuedInvoice() {
  return yup.object().noUnknown().shape({
    // SI/OR/SB/DM/CM Management Information
    CompInvoiceId: yup.string().max(50).required().label('Company SI/OR/SB/DM/CM No.'),
    IssueDtm: yup.string().max(8).required().label('SI/OR/SB/DM/CM Issuance Date'),
    // E-Invoice Basic information
    EisUniqueId: yup.string().max(24).required().label('BIR e-invoice Unique ID'),
    DocType: yup.string().max(2).required().label('Document Type'),
    // - Invoice Correction
    CorrYN: yup.string().max(1).required().label('Correction Yes or Not')
      .oneOf(['Y', 'N']),
    CorrectionCd: yup.string().max(2).optional().label('e-Invoice correction code'),
    PrevUniqueId: yup.string().max(24).optional().label('E-Invoice Unique ID of the document to be corrected'),
    Rmk1: yup.string().max(500).optional().label('Remarks1'),
    // Seller Information
    SellerInfo: sellerInfo().required().label('Seller Information'),
    // Buyer Information
    BuyerInfo: buyerInfo({ required: false }),
    // Sales Information
    // - Sales Summary
    VATSales: yup.number().required().label('VATable Sales'),
    OtherTaxRev: yup.number().required().default(0).label('Other taxable revenue'),
    ExemptSales: yup.number().required().label('VAT Exempt Sales'),
    ZeroSales: yup.number().required().label('Zero Rated Sales'),
    TotSalesAmt: yup.number().required().label('Total Sales Amount'),
    // - Discount Information
    Discount: discountInfo().required().label('Discount Information'),
    // - Total Net Sales after discount
    TotNetSalesAftDisct: yup.number().required().label('Total Net Sales After Discounts'),
    // - Tax Information
    VATAmt: yup.number().required().label('VAT Amount'),
    WithholdIncome: yup.number().required().label('Withholding Tax-Income Tax'),
    WithholdBusVAT: yup.number().required().label('Withholding Tax-Business VAT'),
    WithholdBusPT: yup.number().required().label('Withholding Tax-Business Percentage'),
    // - Non-taxable
    OtherNonTaxCharge: yup.number().required().label('Other Non-taxable charges'),
    // - Net Amount Payable
    NetAmtPay: yup.number().required().label('Net Amount Payable'),
    // PTU Information
    PtuNum: yup.string().required().max(50).label('Permit To Use (PTU) Number'),
    Min: yup.string().required().max(50).label('Machine Identification Number(MIN)'),
    Msn: yup.string().required().max(50).label('Machine Serial Number (MSN)'),
  });
}

module.exports = {
  sellerInfo,
  buyerInfo,
  proofOfDelivery,
  lineItem,
  discountInfo,
  foreignCurr,
  casIssuedInvoice,
  crmPosIssuedInvoice,
};
