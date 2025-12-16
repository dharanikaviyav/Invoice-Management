import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceService } from '../services/invoiceService';
import { Invoice, InvoiceStatus } from '../types';
import { ArrowLeft, Printer, Download, BookOpen } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (id) {
      const data = InvoiceService.getInvoicePrintData(id);
      if (data) {
        setInvoice(data);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;

    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text("ProInvoice", 195, 20, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("402, Tech Park, Cyber City", 195, 26, { align: 'right' });
    doc.text("Gurugram, Haryana 122002", 195, 31, { align: 'right' });
    doc.text("support@proinvoice.in", 195, 36, { align: 'right' });

    doc.setFontSize(24);
    doc.setTextColor(0);
    doc.text("INVOICE", 14, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`#${invoice.number}`, 14, 40);

    doc.setDrawColor(230);
    doc.line(14, 45, 196, 45);

    // --- Info Section ---
    const startY = 55;
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("BILL TO", 14, startY);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(invoice.customerName, 14, startY + 6);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const addressLines = doc.splitTextToSize(invoice.customerAddress, 80);
    doc.text(addressLines, 14, startY + 11);

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("DATE ISSUED", 120, startY);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(new Date(invoice.date).toLocaleDateString('en-IN'), 120, startY + 6);

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("DUE DATE", 160, startY);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(new Date(invoice.dueDate).toLocaleDateString('en-IN'), 160, startY + 6);

    // --- Table ---
    const tableStartY = startY + 35;

    const tableData = invoice.items.map(item => [
      item.description,
      item.quantity,
      `Rs. ${item.unitPrice.toFixed(2)}`,
      `${item.taxRate}%`,
      `Rs. ${(item.quantity * item.unitPrice).toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: tableStartY,
      head: [['Description', 'Qty', 'Price', 'GST', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [37, 99, 235], // Blue 600
        textColor: [255, 255, 255], 
        fontStyle: 'bold',
      },
      styles: { 
        fontSize: 10, 
        cellPadding: 6,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // --- Totals ---
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10;
    
    if (finalY > 250) {
      doc.addPage();
      finalY = 20; 
    }

    const rightColX = 150;
    const valueColX = 195;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Subtotal:`, rightColX, finalY, { align: 'right' });
    doc.text(`Total GST:`, rightColX, finalY + 6, { align: 'right' });
    
    doc.setTextColor(0);
    doc.text(`Rs. ${invoice.subtotal.toFixed(2)}`, valueColX, finalY, { align: 'right' });
    doc.text(`Rs. ${invoice.taxTotal.toFixed(2)}`, valueColX, finalY + 6, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total:`, rightColX, finalY + 16, { align: 'right' });
    doc.setTextColor(37, 99, 235);
    doc.text(`Rs. ${invoice.grandTotal.toFixed(2)}`, valueColX, finalY + 16, { align: 'right' });

    if (invoice.notes) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text("NOTES", 14, finalY + 30);
      doc.setTextColor(100);
      doc.setFontSize(10);
      const noteLines = doc.splitTextToSize(invoice.notes, 180);
      doc.text(noteLines, 14, finalY + 36);
    }

    doc.save(`Invoice_${invoice.number}.pdf`);
  };

  return (
    <div className="animate-fade-in pb-12 print:pb-0">
      {/* Toolbar - Hidden when printing */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
          </div>
        </div>

        <div className="flex gap-2">
           <button 
            onClick={handleDownloadPDF}
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          >
            <Download size={16} className="mr-2" />
            Download PDF
          </button>
          <button 
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors shadow-sm text-sm font-medium"
          >
            <Printer size={16} className="mr-2" />
            Print
          </button>
        </div>
      </div>

      {/* Invoice Paper Layout */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl print:shadow-none print:rounded-none overflow-hidden print:w-full print:max-w-none">
        {/* Top Highlight Bar */}
        <div className="h-4 bg-blue-600 w-full print:h-4 print:bg-blue-600 print:block"></div>
        
        <div className="p-8 md:p-12 print:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div className="flex flex-col">
              {/* Logo Section */}
              <div className="flex items-center gap-3 mb-6 text-blue-600">
                <div className="p-2.5 bg-blue-600 text-white rounded-lg print:bg-blue-600 print:text-white">
                    <BookOpen size={24} strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-900">ProInvoice</span>
              </div>
              
              {/* Company Info */}
              <div className="text-gray-500 text-sm leading-relaxed">
                402, Tech Park, Cyber City<br/>
                Gurugram, Haryana 122002<br/>
                support@proinvoice.in
              </div>
            </div>

            <div className="text-right">
              <div className="text-5xl font-light text-slate-900 tracking-tight mb-2">INVOICE</div>
              <div className="text-gray-500 font-medium text-lg">#{invoice.number}</div>
              <div className="mt-4 inline-flex px-3 py-1 bg-gray-100 rounded text-sm font-bold text-gray-600 print:bg-gray-100 print:text-gray-600 border border-gray-200">
                {invoice.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="border-b border-gray-200 mb-10 print:border-gray-200"></div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-12">
            <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</div>
              <div className="text-slate-900 font-bold text-xl mb-2">{invoice.customerName}</div>
              <div className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
                {invoice.customerAddress}
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium text-sm">Date Issued</span>
                <span className="text-slate-900 font-semibold">{new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium text-sm">Due Date</span>
                <span className="text-slate-900 font-semibold">{new Date(invoice.dueDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 print:bg-gray-50 border-y border-gray-200">
                  <th className="text-left py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-[40%]">Description</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">GST</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-5 px-4 text-gray-900">
                      <div className="font-semibold text-sm">{item.description}</div>
                    </td>
                    <td className="py-5 px-4 text-right text-sm text-gray-600">{item.quantity}</td>
                    <td className="py-5 px-4 text-right text-sm text-gray-600">₹{item.unitPrice.toFixed(2)}</td>
                    <td className="py-5 px-4 text-right text-sm text-gray-600">{item.taxRate}%</td>
                    <td className="py-5 px-4 text-right text-sm font-bold text-slate-900">
                      ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 lg:w-5/12 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-semibold">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Total GST</span>
                <span className="text-slate-900 font-semibold">₹{invoice.taxTotal.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-slate-100 pt-4 mt-4 flex justify-between items-center">
                <span className="text-base font-bold text-slate-900">Grand Total</span>
                <span className="text-2xl font-bold text-blue-600 print:text-blue-600">₹{invoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-16 pt-8 border-t border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Notes & Payment Terms</div>
              <div className="text-gray-600 text-sm leading-relaxed">{invoice.notes}</div>
            </div>
          )}
          
          {/* Print Footer */}
          <div className="mt-20 text-center">
             <div className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-2">Thank you for your business</div>
             <div className="text-xs text-gray-300">Generated by ProInvoice System</div>
          </div>
        </div>
      </div>
    </div>
  );
};