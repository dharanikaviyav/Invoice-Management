import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvoiceService, calculateTotals } from '../services/invoiceService';
import { Customer, InvoiceItem, InvoiceStatus, Product } from '../types';
import { Plus, Trash2, Save, ArrowLeft, Calculator, AlertCircle } from 'lucide-react';

// Local interface for form handling where price and tax can be a string (for empty state)
interface FormInvoiceItem extends Omit<InvoiceItem, 'unitPrice' | 'taxRate'> {
  unitPrice: number | string;
  taxRate: number | string;
}

// Error state interface
interface FormErrors {
  customer?: string;
  items: { [key: string]: { description?: string; quantity?: string; unitPrice?: string; taxRate?: string } };
}

export const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // +15 days
  const [status, setStatus] = useState<InvoiceStatus>(InvoiceStatus.DRAFT);
  
  // Initialize items
  const [items, setItems] = useState<FormInvoiceItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: '', taxRate: '' }
  ]);
  const [notes, setNotes] = useState('');
  
  // Validation State
  const [errors, setErrors] = useState<FormErrors>({ items: {} });

  useEffect(() => {
    setCustomers(InvoiceService.getCustomers());
    setProducts(InvoiceService.getProducts());
  }, []);

  // Helper to safely convert form items to strict items for calculation
  const getStrictItems = (formItems: FormInvoiceItem[]): InvoiceItem[] => {
    return formItems.map(item => ({
      ...item,
      unitPrice: typeof item.unitPrice === 'string' ? (parseFloat(item.unitPrice) || 0) : item.unitPrice,
      taxRate: typeof item.taxRate === 'string' ? (parseFloat(item.taxRate) || 0) : item.taxRate
    }));
  };

  // Derived State
  const totals = calculateTotals(getStrictItems(items));

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: '', taxRate: '' }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
      
      // Cleanup error state for removed item
      const newItemErrors = { ...errors.items };
      delete newItemErrors[id];
      setErrors({ ...errors, items: newItemErrors });
    }
  };

  const handleItemChange = (id: string, field: keyof FormInvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-fill price if description matches a product
        if (field === 'description') {
           const product = products.find(p => p.name.toLowerCase() === (value as string).toLowerCase());
           if (product) {
             updatedItem.unitPrice = product.unitPrice;
           }
        }
        return updatedItem;
      }
      return item;
    }));

    // Clear specific field error on change
    if (errors.items[id]?.[field as keyof typeof errors.items.string]) {
      setErrors(prev => ({
        ...prev,
        items: {
          ...prev.items,
          [id]: {
            ...prev.items[id],
            [field]: undefined
          }
        }
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = { items: {} };
    let isValid = true;

    if (!selectedCustomerId) {
      newErrors.customer = "Customer selection is required";
      isValid = false;
    }

    items.forEach(item => {
      const itemErrors: { description?: string; quantity?: string; unitPrice?: string; taxRate?: string } = {};
      
      if (!item.description.trim()) {
        itemErrors.description = "Description is required";
        isValid = false;
      }

      if (item.quantity <= 0) {
        itemErrors.quantity = "Qty > 0";
        isValid = false;
      }

      // Convert unitPrice to number for validation if it's a string
      const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
      if (isNaN(price) || price < 0) {
        itemErrors.unitPrice = "Price ≥ 0";
        isValid = false;
      }

      const tax = typeof item.taxRate === 'string' ? parseFloat(item.taxRate) : item.taxRate;
      // Allow empty tax (defaults to 0), but if entered, must be valid
      if (item.taxRate !== '' && (isNaN(tax) || tax < 0 || tax > 100)) {
        itemErrors.taxRate = "0-100%";
        isValid = false;
      }

      if (Object.keys(itemErrors).length > 0) {
        newErrors.items[item.id] = itemErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const validItems = getStrictItems(items);

    InvoiceService.createInvoice({
      customerId: customer.id,
      customerName: customer.name,
      customerAddress: customer.address,
      date,
      dueDate,
      status,
      items: validItems,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      notes
    });

    navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-500">Create a new invoice for your customer.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8" noValidate>
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer <span className="text-red-500">*</span></label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setErrors({ ...errors, customer: undefined });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.customer ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                required
              >
                <option value="">Select a customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.customer && <p className="mt-1 text-xs text-red-500 font-medium flex items-center"><AlertCircle size={12} className="mr-1"/> {errors.customer}</p>}
            </div>
            
            {selectedCustomerId && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">Billing Address:</p>
                {customers.find(c => c.id === selectedCustomerId)?.address}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(InvoiceStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Line Items</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="pb-3 w-[40%]">Description <span className="text-red-500">*</span></th>
                  <th className="pb-3 w-[15%]">Quantity <span className="text-red-500">*</span></th>
                  <th className="pb-3 w-[20%]">Price <span className="text-red-500">*</span></th>
                  <th className="pb-3 w-[15%]">GST (%)</th>
                  <th className="pb-3 w-[10%] text-right">Total</th>
                  <th className="pb-3 w-[5%]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, index) => {
                  const itemErrors = errors.items[item.id] || {};
                  return (
                    <tr key={item.id} className="group">
                      <td className="py-4 pr-4 align-top">
                        <input
                          type="text"
                          list={`products-list-${item.id}`}
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Select or type item..."
                          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${itemErrors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                        <datalist id={`products-list-${item.id}`}>
                          {products.map(p => (
                            <option key={p.id} value={p.name} />
                          ))}
                        </datalist>
                        {itemErrors.description && <p className="mt-1 text-xs text-red-500">{itemErrors.description}</p>}
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${itemErrors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                        {itemErrors.quantity && <p className="mt-1 text-xs text-red-500">{itemErrors.quantity}</p>}
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                            className={`w-full pl-7 pr-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${itemErrors.unitPrice ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                          />
                        </div>
                        {itemErrors.unitPrice && <p className="mt-1 text-xs text-red-500">{itemErrors.unitPrice}</p>}
                      </td>
                      <td className="py-4 pr-4 align-top">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(item.id, 'taxRate', e.target.value)}
                          placeholder="0"
                          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${itemErrors.taxRate ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                        />
                         {itemErrors.taxRate && <p className="mt-1 text-xs text-red-500">{itemErrors.taxRate}</p>}
                      </td>
                      <td className="py-4 text-right font-medium text-gray-900 align-top pt-5">
                        ₹{((item.quantity * (typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) || 0 : item.unitPrice))).toFixed(2)}
                      </td>
                      <td className="py-4 text-right align-top pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                          disabled={items.length === 1}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus size={16} className="mr-1" />
            Add Line Item
          </button>
        </div>

        {/* Footer Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Notes / Payment Terms</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Enter notes about payment details or thank you message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Calculator size={20} className="mr-2 text-gray-400" />
              Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total GST</span>
                <span>₹{totals.taxTotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Grand Total</span>
                <span>₹{totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full mt-8 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center shadow-lg shadow-blue-900/10"
            >
              <Save size={18} className="mr-2" />
              Save Invoice
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};