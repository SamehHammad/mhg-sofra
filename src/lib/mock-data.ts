// بيانات تجريبية لنظام طباعة وإدارة الشيكات

export const countries = [
  { id: '1', name: 'الولايات المتحدة', nameEn: 'United States', code: 'US', direction: 'ltr' as const },
  { id: '2', name: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', code: 'AE', direction: 'rtl' as const },
  { id: '3', name: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', code: 'SA', direction: 'rtl' as const },
  { id: '4', name: 'المملكة المتحدة', nameEn: 'United Kingdom', code: 'GB', direction: 'ltr' as const },
  { id: '5', name: 'جمهورية مصر العربية', nameEn: 'Egypt', code: 'EG', direction: 'rtl' as const },
];

export const banks = {
  'US': [
    { id: 'b1', name: 'بنك تشيس', nameEn: 'Chase Bank', code: 'CHASE' },
    { id: 'b2', name: 'بنك أوف أمريكا', nameEn: 'Bank of America', code: 'BOA' },
    { id: 'b3', name: 'ويلز فارجو', nameEn: 'Wells Fargo', code: 'WF' },
  ],
  'AE': [
    { id: 'b4', name: 'بنك الإمارات دبي الوطني', nameEn: 'Emirates NBD', code: 'ENBD' },
    { id: 'b5', name: 'بنك أبوظبي التجاري', nameEn: 'Abu Dhabi Commercial Bank', code: 'ADCB' },
    { id: 'b6', name: 'بنك أبوظبي الأول', nameEn: 'First Abu Dhabi Bank', code: 'FAB' },
  ],
  'SA': [
    { id: 'b7', name: 'مصرف الراجحي', nameEn: 'Al Rajhi Bank', code: 'RAJHI' },
    { id: 'b8', name: 'البنك الأهلي السعودي', nameEn: 'Saudi National Bank', code: 'SNB' },
    { id: 'b9', name: 'بنك الرياض', nameEn: 'Riyad Bank', code: 'RIYAD' },
  ],
  'GB': [
    { id: 'b10', name: 'بنك إتش إس بي سي', nameEn: 'HSBC', code: 'HSBC' },
    { id: 'b11', name: 'بنك باركليز', nameEn: 'Barclays', code: 'BARC' },
  ],
  'EG': [
    { id: 'b12', name: 'البنك الأهلي المصري', nameEn: 'National Bank of Egypt', code: 'NBE' },
    { id: 'b13', name: 'بنك مصر', nameEn: 'Banque Misr', code: 'MISR' },
  ],
};

export const checkTemplates = [
  { id: 't1', name: 'شيك أعمال قياسي', nameEn: 'Standard Business Check', bankCode: 'CHASE', preview: '/templates/standard.png' },
  { id: 't2', name: 'تصميم شيك فاخر', nameEn: 'Premium Check Design', bankCode: 'CHASE', preview: '/templates/premium.png' },
  { id: 't3', name: 'تخطيط كلاسيكي', nameEn: 'Classic Layout', bankCode: 'BOA', preview: '/templates/classic.png' },
  { id: 't4', name: 'عصري بسيط', nameEn: 'Modern Minimalist', bankCode: 'ENBD', preview: '/templates/modern.png' },
];

export const currencies = [
  { code: 'USD', symbol: '$', name: 'دولار أمريكي', nameEn: 'US Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي', nameEn: 'UAE Dirham' },
  { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي', nameEn: 'Saudi Riyal' },
  { code: 'GBP', symbol: '£', name: 'جنيه إسترليني', nameEn: 'British Pound' },
  { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري', nameEn: 'Egyptian Pound' },
];

export const checkFields = [
  { id: 'date', label: 'التاريخ', labelEn: 'Date', type: 'date' },
  { id: 'beneficiary', label: 'ادفع لأمر', labelEn: 'Pay to the Order of', type: 'text' },
  { id: 'amount', label: 'المبلغ (رقمي)', labelEn: 'Amount (Numeric)', type: 'number' },
  { id: 'amountWords', label: 'المبلغ (بالحروف)', labelEn: 'Amount (Words)', type: 'text' },
  { id: 'memo', label: 'ملاحظة', labelEn: 'Memo', type: 'text' },
  { id: 'signature', label: 'التوقيع', labelEn: 'Signature', type: 'text' },
  { id: 'checkNumber', label: 'رقم الشيك', labelEn: 'Check Number', type: 'text' },
];

export const mockPrintedChecks = [
  {
    id: 'CHK-001',
    checkNumber: '1001',
    date: '15-12-2025',
    beneficiary: 'شركة الأعمال المتقدمة',
    beneficiaryEn: 'ABC Corporation',
    amount: 5000.00,
    currency: 'SAR',
    status: 'printed',
    printedBy: 'أحمد محمد',
    printedByEn: 'Ahmed Mohammed',
    printedAt: '15-12-2025 10:30 صباحاً',
    printedAtEn: '2025-12-15 10:30 AM',
  },
  {
    id: 'CHK-002',
    checkNumber: '1002',
    date: '15-12-2025',
    beneficiary: 'مؤسسة التوريدات الشاملة',
    beneficiaryEn: 'XYZ Supplies Inc',
    amount: 3250.50,
    currency: 'SAR',
    status: 'printed',
    printedBy: 'فاطمة علي',
    printedByEn: 'Fatima Ali',
    printedAt: '15-12-2025 11:15 صباحاً',
    printedAtEn: '2025-12-15 11:15 AM',
  },
  {
    id: 'CHK-003',
    checkNumber: '1003',
    date: '16-12-2025',
    beneficiary: 'شركة الحلول التقنية',
    beneficiaryEn: 'Tech Solutions Ltd',
    amount: 12500.00,
    currency: 'SAR',
    status: 'voided',
    printedBy: 'أحمد محمد',
    printedByEn: 'Ahmed Mohammed',
    printedAt: '16-12-2025 09:00 صباحاً',
    printedAtEn: '2025-12-16 09:00 AM',
  },
  {
    id: 'CHK-004',
    checkNumber: '1004',
    date: '16-12-2025',
    beneficiary: 'مكتب اللوازم المكتبية',
    beneficiaryEn: 'Office Supplies Co',
    amount: 850.75,
    currency: 'SAR',
    status: 'printed',
    printedBy: 'فاطمة علي',
    printedByEn: 'Fatima Ali',
    printedAt: '16-12-2025 02:45 مساءً',
    printedAtEn: '2025-12-16 02:45 PM',
  },
  {
    id: 'CHK-005',
    checkNumber: '1005',
    date: '17-12-2025',
    beneficiary: 'وكالة التسويق الإبداعية',
    beneficiaryEn: 'Marketing Agency LLC',
    amount: 7800.00,
    currency: 'SAR',
    status: 'printed',
    printedBy: 'أحمد محمد',
    printedByEn: 'Ahmed Mohammed',
    printedAt: '17-12-2025 08:20 صباحاً',
    printedAtEn: '2025-12-17 08:20 AM',
  },
];

export const mockBatchChecks = [
  {
    id: '1',
    checkNumber: '2001',
    beneficiary: 'مورد الخدمات أ',
    beneficiaryEn: 'Vendor A',
    amount: 1500.00,
    date: '17-12-2025',
    status: 'pending',
  },
  {
    id: '2',
    checkNumber: '2002',
    beneficiary: 'مورد الخدمات ب',
    beneficiaryEn: 'Vendor B',
    amount: 2300.50,
    date: '17-12-2025',
    status: 'pending',
  },
  {
    id: '3',
    checkNumber: '2003',
    beneficiary: 'مورد الخدمات ج',
    beneficiaryEn: 'Vendor C',
    amount: 3450.00,
    date: '17-12-2025',
    status: 'pending',
  },
];

export const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Calibri',
  'Tahoma',
];

export const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

export const alignments = ['left', 'center', 'right'] as const;

export const rotations = [0, 90, 180, 270] as const;

