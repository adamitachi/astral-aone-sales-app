'use client';

import React from 'react';
import { Download, Mail, Printer, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
}

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  unit?: string;
  productCode?: string;
  taxRate: number;
  sortOrder: number;
}

interface Payment {
  id: number;
  paymentNumber: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customer: Customer;
  invoiceDate: string;
  dueDate: string;
  status: string;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  paidAmount: number;
  paidDate?: string;
  items: InvoiceItem[];
  payments: Payment[];
}

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-800',
  'Sent': 'bg-blue-100 text-blue-800',
  'Paid': 'bg-green-100 text-green-800',
  'Partial': 'bg-yellow-100 text-yellow-800',
  'Overdue': 'bg-red-100 text-red-800',
  'Cancelled': 'bg-gray-100 text-gray-600'
};

export default function ViewInvoiceModal({ isOpen, onClose, invoice }: ViewInvoiceModalProps) {
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = () => {
    window.open(`/invoices/${invoice.id}/pdf`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailInvoice = () => {
    const subject = `Invoice ${invoice.invoiceNumber}`;
    const body = `Dear ${invoice.customer.name},\n\nPlease find attached your invoice ${invoice.invoiceNumber} for ${formatCurrency(invoice.totalAmount, invoice.currency)}.\n\nThank you for your business!`;
    
    if (invoice.customer.email) {
      window.open(`mailto:${invoice.customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } else {
      alert('Customer email not available');
    }
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(invoice.invoiceNumber);
    // You could add a toast notification here
  };

  const balanceAmount = invoice.totalAmount - invoice.paidAmount;
  const isOverdue = new Date(invoice.dueDate) < new Date() && balanceAmount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-2xl">Invoice Details</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEmailInvoice}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Invoice #:</span>
                  <span className="font-mono">{invoice.invoiceNumber}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyInvoiceNumber}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge className={`ml-2 ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                    {invoice.status}
                  </Badge>
                  {isOverdue && (
                    <Badge className="ml-2 bg-red-100 text-red-800">
                      Overdue
                    </Badge>
                  )}
                </div>
                <div>
                  <span className="font-medium">Issue Date:</span>
                  <span className="ml-2">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div>
                  <span className="font-medium">Due Date:</span>
                  <span className={`ml-2 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Currency:</span>
                  <span className="ml-2">{invoice.currency}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{invoice.customer.name}</span>
                </div>
                {invoice.customer.email && (
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{invoice.customer.email}</span>
                  </div>
                )}
                {invoice.customer.phoneNumber && (
                  <div>
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{invoice.customer.phoneNumber}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Customer ID:</span>
                  <span className="ml-2">#{invoice.customer.id}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Product Code</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.sort((a, b) => a.sortOrder - b.sortOrder).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.productCode || '-'}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-center">{item.unit || 'pcs'}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice, invoice.currency)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.lineTotal, invoice.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Invoice Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {/* Notes */}
              {invoice.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Terms */}
              {invoice.terms && (
                <Card className={invoice.notes ? "mt-4" : ""}>
                  <CardHeader>
                    <CardTitle className="text-lg">Terms & Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{invoice.terms}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subTotal, invoice.currency)}</span>
                </div>

                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discountAmount, invoice.currency)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-green-600">
                  <span>Paid:</span>
                  <span>{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
                </div>

                <div className={`flex justify-between font-bold ${balanceAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  <span>Balance:</span>
                  <span>{formatCurrency(balanceAmount, invoice.currency)}</span>
                </div>

                {invoice.paidDate && (
                  <div className="text-sm text-gray-600">
                    Paid on: {formatDate(invoice.paidDate)}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                        <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell>{payment.reference || '-'}</TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatCurrency(payment.amount, invoice.currency)}
                        </TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2">{formatDate(invoice.createdAt)}</span>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2">{formatDate(invoice.updatedAt)}</span>
              </div>
              <div>
                <span className="font-medium">Invoice ID:</span>
                <span className="ml-2">#{invoice.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
