'use client';

import React, { useState } from 'react';
import { DollarSign, CreditCard, Banknote, Building } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phoneNumber?: string;
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
}

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPayment: (payment: any) => void;
  invoice: Invoice;
}

const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Credit/Debit Card', icon: CreditCard },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building },
  { value: 'check', label: 'Check', icon: DollarSign },
  { value: 'online', label: 'Online Payment', icon: CreditCard },
  { value: 'other', label: 'Other', icon: DollarSign }
];

export default function AddPaymentModal({ isOpen, onClose, onAddPayment, invoice }: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    reference: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const balanceAmount = invoice.totalAmount - invoice.paidAmount;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid payment amount';
    } else if (parseFloat(formData.amount) > balanceAmount) {
      newErrors.amount = `Payment amount cannot exceed balance of ${formatCurrency(balanceAmount)}`;
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Please select a payment date';
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData = {
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      reference: formData.reference.trim() || null,
      notes: formData.notes.trim() || null
    };

    onAddPayment(paymentData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      reference: '',
      notes: ''
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const setFullPayment = () => {
    setFormData(prev => ({
      ...prev,
      amount: balanceAmount.toString()
    }));
  };

  const getPaymentMethodIcon = (method: string) => {
    const paymentMethod = paymentMethods.find(pm => pm.value === method);
    if (paymentMethod) {
      const Icon = paymentMethod.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <DollarSign className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Add Payment
          </DialogTitle>
        </DialogHeader>

        {/* Invoice Summary */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Invoice:</span>
              <span className="font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Customer:</span>
              <span>{invoice.customer.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Invoice Date:</span>
              <span>{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Due Date:</span>
              <span>{formatDate(invoice.dueDate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge className={
                invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }>
                {invoice.status}
              </Badge>
            </div>
            
            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid Amount:</span>
                <span>{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-red-600">
                <span>Outstanding Balance:</span>
                <span>{formatCurrency(balanceAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Payment Amount *</Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={balanceAmount}
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={errors.amount ? 'border-red-500' : ''}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={setFullPayment}
                  className="whitespace-nowrap"
                >
                  Pay Full
                </Button>
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                className={errors.paymentDate ? 'border-red-500' : ''}
                required
              />
              {errors.paymentDate && (
                <p className="text-sm text-red-600 mt-1">{errors.paymentDate}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select 
              value={formData.paymentMethod} 
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <div className="flex items-center gap-2">
                      <method.icon className="h-4 w-4" />
                      {method.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-red-600 mt-1">{errors.paymentMethod}</p>
            )}
          </div>

          <div>
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              placeholder="Transaction ID, Check number, etc."
              value={formData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional reference for tracking (e.g., transaction ID, check number)
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this payment..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Payment Preview */}
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Payment Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Amount:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(formData.amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Balance:</span>
                  <span className="font-medium">
                    {formatCurrency(Math.max(0, balanceAmount - parseFloat(formData.amount)))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>New Status:</span>
                  <Badge className={
                    balanceAmount - parseFloat(formData.amount) <= 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }>
                    {balanceAmount - parseFloat(formData.amount) <= 0 ? 'Paid' : 'Partial'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={!formData.amount || parseFloat(formData.amount) <= 0}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
