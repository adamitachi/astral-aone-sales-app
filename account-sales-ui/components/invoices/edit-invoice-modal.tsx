'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
}

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  unit: string;
  productCode: string;
  taxRate: number;
  sortOrder: number;
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
}

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditInvoice: (invoice: any) => void;
  invoice: Invoice;
  customers: Customer[];
}

export default function EditInvoiceModal({ isOpen, onClose, onEditInvoice, invoice, customers }: EditInvoiceModalProps) {
  const [formData, setFormData] = useState({
    id: 0,
    invoiceNumber: '',
    customerId: '',
    invoiceDate: '',
    dueDate: '',
    status: 'Draft',
    taxRate: 0,
    discountAmount: 0,
    notes: '',
    terms: '',
    currency: 'USD'
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Initialize form data when invoice changes
  useEffect(() => {
    if (invoice) {
      setFormData({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId.toString(),
        invoiceDate: invoice.invoiceDate.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        status: invoice.status,
        taxRate: invoice.taxRate,
        discountAmount: invoice.discountAmount,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
        currency: invoice.currency
      });

      // Sort items by sortOrder and set them
      const sortedItems = [...invoice.items].sort((a, b) => a.sortOrder - b.sortOrder);
      setItems(sortedItems.map(item => ({
        ...item,
        unit: item.unit || 'pcs',
        productCode: item.productCode || ''
      })));
    }
  }, [invoice]);

  const calculateLineTotal = (quantity: number, unitPrice: number): number => {
    return Math.round(quantity * unitPrice * 100) / 100;
  };

  const calculateSubTotal = (): number => {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const calculateTaxAmount = (): number => {
    const subTotal = calculateSubTotal();
    return Math.round(subTotal * (formData.taxRate / 100) * 100) / 100;
  };

  const calculateTotal = (): number => {
    const subTotal = calculateSubTotal();
    const taxAmount = calculateTaxAmount();
    return Math.round((subTotal + taxAmount - formData.discountAmount) * 100) / 100;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Recalculate line total when quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].lineTotal = calculateLineTotal(
        updatedItems[index].quantity,
        updatedItems[index].unitPrice
      );
    }

    // Update sort order
    updatedItems[index].sortOrder = index;

    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      lineTotal: 0,
      unit: 'pcs',
      productCode: '',
      taxRate: 0,
      sortOrder: items.length
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = items.filter((_, i) => i !== index);
      // Update sort orders
      updatedItems.forEach((item, i) => {
        item.sortOrder = i;
      });
      setItems(updatedItems);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customerId) {
      alert('Please select a customer');
      return;
    }

    if (items.some(item => !item.description.trim())) {
      alert('Please fill in all item descriptions');
      return;
    }

    const invoiceData = {
      id: formData.id,
      invoiceNumber: formData.invoiceNumber,
      customerId: parseInt(formData.customerId),
      invoiceDate: formData.invoiceDate,
      dueDate: formData.dueDate,
      status: formData.status,
      subTotal: calculateSubTotal(),
      taxRate: formData.taxRate,
      taxAmount: calculateTaxAmount(),
      discountAmount: formData.discountAmount,
      totalAmount: calculateTotal(),
      notes: formData.notes,
      terms: formData.terms,
      currency: formData.currency,
      items: items.filter(item => item.description.trim() !== ''),
      updatedAt: new Date().toISOString(),
      // Preserve existing fields
      createdAt: invoice.createdAt,
      paidAmount: invoice.paidAmount,
      paidDate: invoice.paidDate
    };

    onEditInvoice(invoiceData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: formData.currency,
    }).format(amount);
  };

  const canEdit = formData.status === 'Draft' || formData.status === 'Sent';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Invoice - {formData.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        {!canEdit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> This invoice has status "{formData.status}". Some fields may be read-only to maintain data integrity.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customer">Customer *</Label>
              <Select 
                value={formData.customerId} 
                onValueChange={(value) => handleInputChange('customerId', value)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="invoiceDate">Invoice Date *</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                disabled={!canEdit}
                required
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => handleInputChange('currency', value)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="MYR">MYR (RM)</SelectItem>
                  <SelectItem value="SGD">SGD (S$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Invoice Number (Read-only) */}
          <div>
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Invoice number cannot be changed after creation</p>
          </div>

          {/* Invoice Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice Items</CardTitle>
              {canEdit && (
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Label>Description *</Label>
                      <Input
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        disabled={!canEdit}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Qty *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        disabled={!canEdit}
                        required
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Unit</Label>
                      <Select 
                        value={item.unit} 
                        onValueChange={(value) => handleItemChange(index, 'unit', value)}
                        disabled={!canEdit}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pcs">Pcs</SelectItem>
                          <SelectItem value="hrs">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="m">Meters</SelectItem>
                          <SelectItem value="ft">Feet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2">
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        disabled={!canEdit}
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <Label>Product Code</Label>
                      <Input
                        placeholder="SKU/Code"
                        value={item.productCode}
                        onChange={(e) => handleItemChange(index, 'productCode', e.target.value)}
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="col-span-1">
                      <Label>Line Total</Label>
                      <div className="p-2 bg-gray-50 rounded border text-right font-medium">
                        {formatCurrency(item.lineTotal)}
                      </div>
                    </div>

                    <div className="col-span-1">
                      {canEdit && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Invoice Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateSubTotal())}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>Discount:</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountAmount}
                      onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
                      className="w-24 h-8"
                    />
                  </div>
                  <span className="font-medium">-{formatCurrency(formData.discountAmount)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(calculateTaxAmount())}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>

                {invoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Paid:</span>
                      <span>{formatCurrency(invoice.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-red-600">
                      <span>Balance:</span>
                      <span>{formatCurrency(calculateTotal() - invoice.paidAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or comments..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                placeholder="Payment terms and conditions..."
                value={formData.terms}
                onChange={(e) => handleInputChange('terms', e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Update Invoice
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
