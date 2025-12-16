import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InvoiceService } from '../services/invoiceService';
import { Invoice, InvoiceStatus, Customer } from '../types';
import { Plus, Search, Eye, Filter, Printer, Trash2, X, Calendar } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const navigate = useNavigate();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [clientFilter, setClientFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInvoices(InvoiceService.getAllInvoices());
    setCustomers(InvoiceService.getCustomers());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this invoice?')) {
      InvoiceService.deleteInvoice(id);
      // Reload invoices
      setInvoices(InvoiceService.getAllInvoices());
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setClientFilter('ALL');
    setDateRange({ start: '', end: '' });
  };

  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.PAID: return 'bg-green-100 text-green-700 border-green-200';
      case InvoiceStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case InvoiceStatus.OVERDUE: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    // Text Search (Invoice Number)
    const matchesSearch = inv.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Client Filter
    const matchesClient = clientFilter === 'ALL' || inv.customerId === clientFilter;
    
    // Status Filter
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    
    // Date Range Filter
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && inv.date >= dateRange.start;
    }
    if (dateRange.end) {
      matchesDate = matchesDate && inv.date <= dateRange.end;
    }
    
    return matchesSearch && matchesClient && matchesStatus && matchesDate;
  });

  const activeFiltersCount = [
    searchTerm, 
    statusFilter !== 'ALL', 
    clientFilter !== 'ALL', 
    dateRange.start, 
    dateRange.end
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">Manage your billing and invoicing.</p>
        </div>
        <Link 
          to="/create"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={18} className="mr-2" />
          Create Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{invoices.reduce((acc, curr) => acc + curr.grandTotal, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Outstanding Invoices</p>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {invoices.filter(i => i.status === InvoiceStatus.PENDING).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Clients</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {new Set(invoices.map(i => i.customerId)).size}
          </p>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by invoice number..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Toggle (Mobile/Tablet) */}
            <button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className="lg:hidden flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter size={16} className="mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Clear Filters Button (Desktop) */}
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters}
                className="hidden lg:flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={16} className="mr-1" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Extended Filters */}
          <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isFilterExpanded ? 'block' : 'hidden lg:grid'}`}>
            
            {/* Client Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Client</label>
              <select 
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Clients</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'ALL')}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                {Object.values(InvoiceStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">From Date</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Date Range End */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">To Date</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Mobile Clear Button */}
            {activeFiltersCount > 0 && (
              <button 
                onClick={clearFilters}
                className="lg:hidden flex items-center justify-center px-4 py-2 mt-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200"
              >
                <X size={16} className="mr-2" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">Invoice #</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Client</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Date</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={48} className="text-gray-200 mb-4" />
                      <p className="text-lg font-medium text-gray-900">No invoices found</p>
                      <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                      <button 
                         onClick={clearFilters}
                         className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr 
                    key={invoice.id} 
                    onClick={() => navigate(`/invoice/${invoice.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{invoice.customerAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(invoice.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ₹{invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/invoice/${invoice.id}`); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" 
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(invoice.id, e)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};