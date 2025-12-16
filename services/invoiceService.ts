import { Invoice, InvoiceItem, InvoiceStatus, InvoiceSummary, Customer, Product } from '../types';

// Mock Data Initialization
const STORAGE_KEY_INVOICES = 'proinvoice_invoices';
const STORAGE_KEY_CUSTOMERS = 'proinvoice_customers';

const seedCustomers: Customer[] = [
  // Male Names converted to businesses
  { id: 'c1', name: 'Aarav Enterprises', email: 'contact@aaravent.in', address: '101, MG Road, Bengaluru, KA 560001' },
  { id: 'c2', name: 'Aditya Infotech', email: 'info@adityatech.com', address: 'Unit 45, Cyber City, Gurugram, HR 122002' },
  { id: 'c3', name: 'Akash Logistics', email: 'dispatch@akashlogistics.com', address: 'Plot 12, Transport Nagar, Pune, MH 411044' },
  { id: 'c4', name: 'Aman Traders', email: 'sales@amantraders.co.in', address: '56, Chandni Chowk, New Delhi, DL 110006' },
  { id: 'c5', name: 'Anirudh Consultants', email: 'hr@anirudhcons.com', address: 'B-Wing, Mittal Towers, Nariman Point, Mumbai, MH 400021' },
  { id: 'c6', name: 'Arjun Constructions', email: 'projects@arjunconst.com', address: 'Road No. 12, Banjara Hills, Hyderabad, TS 500034' },
  { id: 'c7', name: 'Ashwin Electronics', email: 'support@ashwinelec.com', address: 'Lamington Road, Mumbai, MH 400007' },
  { id: 'c8', name: 'Bhavesh Textiles', email: 'orders@bhaveshtex.com', address: 'Ring Road, Surat, GJ 395002' },
  { id: 'c9', name: 'Chetan Hardwares', email: 'store@chetanhardware.com', address: 'Lohiya Nagar, Ghaziabad, UP 201001' },
  { id: 'c10', name: 'Darshan Travels', email: 'bookings@darshantravels.com', address: 'Navrangpura, Ahmedabad, GJ 380009' },
  { id: 'c11', name: 'Deepak Associates', email: 'legal@deepakassoc.com', address: 'Connaught Place, New Delhi, DL 110001' },
  { id: 'c12', name: 'Dev Industries', email: 'factory@devind.com', address: 'Peenya Industrial Area, Bengaluru, KA 560058' },
  { id: 'c13', name: 'Dinesh Chemicals', email: 'lab@dineshchem.com', address: 'GIDC, Vadodara, GJ 390010' },
  { id: 'c14', name: 'Gaurav Solutions', email: 'it@gauravsol.com', address: 'Salt Lake Sector V, Kolkata, WB 700091' },
  { id: 'c15', name: 'Harish Automobiles', email: 'service@harishauto.com', address: 'Anna Salai, Chennai, TN 600002' },
  { id: 'c16', name: 'Karthik Systems', email: 'admin@karthiksys.com', address: 'Electronic City, Bengaluru, KA 560100' },
  { id: 'c17', name: 'Krishna Foods', email: 'orders@krishnafoods.com', address: 'Lalbagh Road, Lucknow, UP 226001' },
  { id: 'c18', name: 'Mahesh Steel Works', email: 'supply@maheshsteel.com', address: 'Industrial Area, Ludhiana, PB 141003' },
  { id: 'c19', name: 'Manish Marketing', email: 'promo@manishmkt.com', address: 'C.G. Road, Ahmedabad, GJ 380006' },
  { id: 'c20', name: 'Mohit Mobiles', email: 'sales@mohitmobiles.com', address: 'Karol Bagh, New Delhi, DL 110005' },
  { id: 'c21', name: 'Nikhil Interiors', email: 'design@nikhilinteriors.com', address: 'Koregaon Park, Pune, MH 411001' },
  { id: 'c22', name: 'Prakash Printers', email: 'print@prakashpress.com', address: 'Sivakasi, Tamil Nadu, TN 626123' },
  { id: 'c23', name: 'Rahul Agencies', email: 'distributor@rahulagencies.com', address: 'Station Road, Jaipur, RJ 302006' },
  { id: 'c24', name: 'Rajesh Exports', email: 'global@rajeshexp.com', address: 'SEZ, Noida, UP 201305' },
  { id: 'c25', name: 'Ramesh General Store', email: 'shop@rameshstore.com', address: 'T. Nagar, Chennai, TN 600017' },
  { id: 'c26', name: 'Rohit Pharma', email: 'meds@rohitpharma.com', address: 'Baddi, Himachal Pradesh, HP 173205' },
  { id: 'c27', name: 'Sandeep Security', email: 'guards@sandeepsec.com', address: 'Indiranagar, Bengaluru, KA 560038' },
  { id: 'c28', name: 'Sanjay Garments', email: 'fashion@sanjaygarments.com', address: 'Fashion Street, Mumbai, MH 400020' },
  { id: 'c29', name: 'Shankar Services', email: 'repair@shankarservices.com', address: 'Main Road, Ranchi, JH 834001' },
  { id: 'c30', name: 'Suresh Sweets', email: 'mithai@sureshsweets.com', address: 'Bikaner, Rajasthan, RJ 334001' },
  { id: 'c31', name: 'Varun Beverages', email: 'dist@varunbev.com', address: 'Phase III, Gurgaon, HR 122010' },
  { id: 'c32', name: 'Venkatesh Hardware', email: 'tools@venkatesh.com', address: 'Chickpet, Bengaluru, KA 560053' },
  { id: 'c33', name: 'Vijay Motors', email: 'cars@vijaymotors.com', address: 'Jubilee Hills, Hyderabad, TS 500033' },
  { id: 'c34', name: 'Vinay Vegetables', email: 'fresh@vinayveg.com', address: 'Koyambedu Market, Chennai, TN 600107' },
  
  // Female Names converted to businesses
  { id: 'c35', name: 'Aarti Designs', email: 'creative@aartidesigns.com', address: 'Hauz Khas Village, New Delhi, DL 110016' },
  { id: 'c36', name: 'Ananya Events', email: 'party@ananyaevents.com', address: 'Juhu Tara Road, Mumbai, MH 400049' },
  { id: 'c37', name: 'Anjali Arts', email: 'gallery@anjaliarts.com', address: 'Fort Kochi, Kochi, KL 682001' },
  { id: 'c38', name: 'Bhavya Boutiques', email: 'style@bhavyaboutique.com', address: 'Brigade Road, Bengaluru, KA 560001' },
  { id: 'c39', name: 'Chitra Studios', email: 'photo@chitrastudios.com', address: 'Kodambakkam, Chennai, TN 600024' },
  { id: 'c40', name: 'Deepika Decor', email: 'home@deepikadecor.com', address: 'Banjara Hills, Hyderabad, TS 500034' },
  { id: 'c41', name: 'Divya Daily Needs', email: 'grocery@divyastore.com', address: 'Sector 18, Noida, UP 201301' },
  { id: 'c42', name: 'Gayathri Gifts', email: 'corp@gayathrigifts.com', address: 'Mylapore, Chennai, TN 600004' },
  { id: 'c43', name: 'Kavya Kitchens', email: 'food@kavyakitchens.com', address: 'Indore, Madhya Pradesh, MP 452001' },
  { id: 'c44', name: 'Keerthi Consultancy', email: 'jobs@keerthicons.com', address: 'Technopark, Trivandrum, KL 695581' },
  { id: 'c45', name: 'Lakshmi Gold House', email: 'jewels@lakshmigold.com', address: 'Thrissur, Kerala, KL 680001' },
  { id: 'c46', name: 'Meena Markets', email: 'retail@meenamarkets.com', address: 'Paltan Bazar, Guwahati, AS 781008' },
  { id: 'c47', name: 'Nandhini Nursery', email: 'plants@nandhininursery.com', address: 'Whitefield, Bengaluru, KA 560066' },
  { id: 'c48', name: 'Neha Networks', email: 'net@nehanetworks.com', address: 'Hinjewadi, Pune, MH 411057' },
  { id: 'c49', name: 'Pooja Packaging', email: 'boxes@poojapack.com', address: 'Okhla Ind. Estate, New Delhi, DL 110020' },
  { id: 'c50', name: 'Priya Publications', email: 'books@priyapub.com', address: 'College Street, Kolkata, WB 700009' },
  { id: 'c51', name: 'Radhika Real Estate', email: 'homes@radhikarealty.com', address: 'Vashi, Navi Mumbai, MH 400703' },
  { id: 'c52', name: 'Rekha Recipes', email: 'cook@rekharecipes.com', address: 'Civil Lines, Jaipur, RJ 302006' },
  { id: 'c53', name: 'Sandhya Salons', email: 'beauty@sandhyasalons.com', address: 'Model Town, Ludhiana, PB 141002' },
  { id: 'c54', name: 'Saranya Silks', email: 'sarees@saranyasilks.com', address: 'Kanchipuram, Tamil Nadu, TN 631501' },
  { id: 'c55', name: 'Shalini Shoes', email: 'footwear@shalinishoes.com', address: 'Agra, Uttar Pradesh, UP 282001' },
  { id: 'c56', name: 'Shreya Shipping', email: 'cargo@shreyaship.com', address: 'Kandla Port, Gujarat, GJ 370210' },
  { id: 'c57', name: 'Sita Sourcing', email: 'vendor@sitasourcing.com', address: 'Tirupur, Tamil Nadu, TN 641604' },
  { id: 'c58', name: 'Sneha Software', email: 'dev@snehasoft.com', address: 'Madhapur, Hyderabad, TS 500081' },
  { id: 'c59', name: 'Swathi Spices', email: 'export@swathispices.com', address: 'Guntur, Andhra Pradesh, AP 522004' },
  { id: 'c60', name: 'Uma Udyog', email: 'mfg@umaudyog.com', address: 'Howrah, West Bengal, WB 711101' },
  { id: 'c61', name: 'Vaishnavi Ventures', email: 'invest@vaishnaviven.com', address: 'Bandra Kurla Complex, Mumbai, MH 400051' },
  { id: 'c62', name: 'Vidya Vihar Schools', email: 'admin@vidyavihar.edu', address: 'Sikar, Rajasthan, RJ 332001' },
  { id: 'c63', name: 'Yamini Yarns', email: 'textile@yaminiyarns.com', address: 'Coimbatore, Tamil Nadu, TN 641001' },
  { id: 'c64', name: 'Zoya Zones', email: 'arch@zoyazones.com', address: 'DLF Phase 5, Gurgaon, HR 122009' },

  // Mixed / Other Names
  { id: 'c65', name: 'Aadi Automations', email: 'robotics@aadiauto.com', address: 'Pimpri-Chinchwad, Pune, MH 411018' },
  { id: 'c66', name: 'Akshay Agro', email: 'seeds@akshayagro.com', address: 'Nasik, Maharashtra, MH 422001' },
  { id: 'c67', name: 'Amrit Ayurveda', email: 'wellness@amritayurveda.com', address: 'Haridwar, Uttarakhand, UK 249401' },
  { id: 'c68', name: 'Arya Architects', email: 'plan@aryaarch.com', address: 'Sector 17, Chandigarh, CH 160017' },
  { id: 'c69', name: 'Chaitanya Chemicals', email: 'solvents@chaitanyachem.com', address: 'Ankleshwar, Gujarat, GJ 393002' },
  { id: 'c70', name: 'Devika Dairy', email: 'milk@devikadairy.com', address: 'Anand, Gujarat, GJ 388001' },
  { id: 'c71', name: 'Harsha Hotels', email: 'stay@harshahotels.com', address: 'Udaipur, Rajasthan, RJ 313001' },
  { id: 'c72', name: 'Ishan Instruments', email: 'labgear@ishaninst.com', address: 'Ambala Cantt, Haryana, HR 133001' },
  { id: 'c73', name: 'Jai Jute Works', email: 'bags@jaijute.com', address: 'Barrackpore, Kolkata, WB 700120' },
  { id: 'c74', name: 'Kiran Ceramics', email: 'tiles@kiranceramics.com', address: 'Morbi, Gujarat, GJ 363641' },
  { id: 'c75', name: 'Krithika Crafts', email: 'handicraft@krithika.com', address: 'Mysore, Karnataka, KA 570001' },
  { id: 'c76', name: 'Manju Motors', email: 'bikes@manjumotors.com', address: 'Bhopal, Madhya Pradesh, MP 462001' },
  { id: 'c77', name: 'Neel Networks', email: 'wifi@neelnetworks.com', address: 'Panaji, Goa, GA 403001' },
  { id: 'c78', name: 'Nirmal Nursery', email: 'green@nirmalplants.com', address: 'Dehradun, Uttarakhand, UK 248001' },
  { id: 'c79', name: 'Pavan Power', email: 'solar@pavanpower.com', address: 'Jaisalmer, Rajasthan, RJ 345001' },
  { id: 'c80', name: 'Ritu Retails', email: 'mall@rituretails.com', address: 'Saket, New Delhi, DL 110017' },
  { id: 'c81', name: 'Sagar Seafoods', email: 'export@sagarsea.com', address: 'Veraval, Gujarat, GJ 362265' },
  { id: 'c82', name: 'Sakshi Solar', email: 'energy@sakshisolar.com', address: 'Rewa, Madhya Pradesh, MP 486001' },
  { id: 'c83', name: 'Shashi Sports', email: 'cricket@shashisports.com', address: 'Meerut, Uttar Pradesh, UP 250002' },
  { id: 'c84', name: 'Shivani Steels', email: 'rods@shivanisteels.com', address: 'Bhilai, Chhattisgarh, CT 490001' },
  { id: 'c85', name: 'Soham Solutions', email: 'consult@sohamsol.com', address: 'Infocity, Bhubaneswar, OD 751024' },
  { id: 'c86', name: 'Tanvi Tech', email: 'app@tanvitech.com', address: 'Kochi, Kerala, KL 682030' },
  { id: 'c87', name: 'Tejas Transport', email: 'trucks@tejastrans.com', address: 'Namakkal, Tamil Nadu, TN 637001' },
  { id: 'c88', name: 'Trisha Textiles', email: 'fabric@trishatex.com', address: 'Panipat, Haryana, HR 132103' },
  { id: 'c89', name: 'Uday Upholstery', email: 'sofa@udayupholstery.com', address: 'Kirti Nagar, New Delhi, DL 110015' },
  { id: 'c90', name: 'Vani Ventures', email: 'startup@vaniventures.com', address: 'HSR Layout, Bengaluru, KA 560102' },

  // South Indian / Tamil Names
  { id: 'c91', name: 'Balaji Bakers', email: 'cakes@balajibakers.com', address: 'Adyar, Chennai, TN 600020' },
  { id: 'c92', name: 'Ezhil Exports', email: 'ship@ezhilexports.com', address: 'Tuticorin, Tamil Nadu, TN 628004' },
  { id: 'c93', name: 'Ilayaraja Instruments', email: 'music@ilayaraja.com', address: 'Saligramam, Chennai, TN 600093' },
  { id: 'c94', name: 'Kalyani Kalyana Mandapam', email: 'wedding@kalyani.com', address: 'Madurai, Tamil Nadu, TN 625001' },
  { id: 'c95', name: 'Murugan Mills', email: 'oil@muruganmills.com', address: 'Erode, Tamil Nadu, TN 638001' },
  { id: 'c96', name: 'Parvathi Pearls', email: 'gems@parvathipearls.com', address: 'Hyderabad, Telangana, TS 500002' },
  { id: 'c97', name: 'Senthil Supplies', email: 'wholesale@senthil.com', address: 'Salem, Tamil Nadu, TN 636001' },
  { id: 'c98', name: 'Subramanian & Co', email: 'ca@subramanian.com', address: 'Coimbatore, Tamil Nadu, TN 641018' },
  { id: 'c99', name: 'Thirumal Traders', email: 'rice@thirumaltraders.com', address: 'Thanjavur, Tamil Nadu, TN 613001' },
  { id: 'c100', name: 'Yasmin Yarns', email: 'silk@yasminyarns.com', address: 'Varanasi, Uttar Pradesh, UP 221010' }
];

const mockProducts: Product[] = [
  { id: 'p1', name: 'Web Development Services', unitPrice: 5000.00 },
  { id: 'p2', name: 'Consulting Hours', unitPrice: 2500.00 },
  { id: 'p3', name: 'Server Maintenance (Annual)', unitPrice: 15000.00 },
  { id: 'p4', name: 'Cloud Hosting Setup', unitPrice: 8500.00 },
  { id: 'p5', name: 'SEO Optimization Package', unitPrice: 12000.00 },
  { id: 'p6', name: 'Logo Design & Branding', unitPrice: 6500.00 },
  { id: 'p7', name: 'Content Writing (per 1000 words)', unitPrice: 1500.00 },
  { id: 'p8', name: 'Software License (Per User)', unitPrice: 3500.00 },
  { id: 'p9', name: 'On-site Support Visit', unitPrice: 2000.00 },
  { id: 'p10', name: 'Network Installation', unitPrice: 25000.00 }
];

// Helper to calculate totals
export const calculateTotals = (items: InvoiceItem[]): InvoiceSummary => {
  let subtotal = 0;
  let taxTotal = 0;

  items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    const lineTax = lineTotal * (item.taxRate / 100);
    subtotal += lineTotal;
    taxTotal += lineTax;
  });

  return {
    subtotal,
    taxTotal,
    grandTotal: subtotal + taxTotal
  };
};

// API Service Simulation
export const InvoiceService = {
  getCustomers: (): Customer[] => {
    const stored = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(seedCustomers));
      return seedCustomers;
    }
    // If we have stored customers but it looks like the old small list (length < 10), re-seed with the new big list
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length < 10) {
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(seedCustomers));
      return seedCustomers;
    }
    return parsed;
  },

  getProducts: (): Product[] => {
    return mockProducts;
  },

  getAllInvoices: (): Invoice[] => {
    const stored = localStorage.getItem(STORAGE_KEY_INVOICES);
    return stored ? JSON.parse(stored) : [];
  },

  getInvoiceById: (id: string): Invoice | undefined => {
    const invoices = InvoiceService.getAllInvoices();
    return invoices.find(inv => inv.id === id);
  },

  // Backend endpoint simulation for Print/PDF access
  getInvoicePrintData: (id: string): Invoice | undefined => {
    // In a real application, this might fetch a specialized print layout or generate a PDF blob
    // For this simulation, it retrieves the invoice data to be rendered by the client-side print view
    return InvoiceService.getInvoiceById(id);
  },

  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'number'>): Invoice => {
    const invoices = InvoiceService.getAllInvoices();
    
    // Generate new ID and Invoice Number
    const newId = crypto.randomUUID();
    const nextNum = invoices.length + 1;
    const invoiceNumber = `INV-${nextNum.toString().padStart(4, '0')}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: newId,
      number: invoiceNumber,
    };

    invoices.unshift(newInvoice); // Add to top of list
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
    return newInvoice;
  },

  updateInvoiceStatus: (id: string, status: InvoiceStatus): void => {
    const invoices = InvoiceService.getAllInvoices();
    const index = invoices.findIndex(inv => inv.id === id);
    if (index !== -1) {
      invoices[index].status = status;
      localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
    }
  },

  deleteInvoice: (id: string): void => {
    const invoices = InvoiceService.getAllInvoices();
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(filtered));
  }
};