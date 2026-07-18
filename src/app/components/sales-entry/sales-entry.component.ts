import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { SalesService } from '../../services/sales.service';
import { Product } from '../../models/product.model';
import { SaleItem } from '../../models/sale.model';

interface CartItem extends SaleItem {
  maxStock: number;
}

@Component({
  selector: 'app-sales-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-entry.component.html',
  styleUrl: './sales-entry.component.scss'
})
export class SalesEntryComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  cart: CartItem[] = [];
  selectedQty: { [key: number]: number } = {};
  recentSales: any[] = [];
  message = '';
  messageType: 'success' | 'danger' | '' = '';

  constructor(
    private productService: ProductService,
    private salesService: SalesService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(prods => {
      this.products = prods;
      this.applyFilter();
      // Initialize qty selectors
      prods.forEach(p => {
        if (!this.selectedQty[p.id]) this.selectedQty[p.id] = 1;
      });
    });

    this.salesService.getSales().subscribe(sales => {
      this.recentSales = sales.slice(0, 8); // last 8
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.category && p.category.toLowerCase().includes(term))
      );
    }
  }

  addToCart(product: Product): void {
    const qty = this.selectedQty[product.id] || 1;
    if (qty < 1) return;

    if (product.stock < qty) {
      this.showMessage(`Only ${product.stock} left in stock for ${product.name}`, 'danger');
      return;
    }

    const existing = this.cart.find(c => c.productId === product.id);
    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > product.stock) {
        this.showMessage(`Cannot add more. Max stock: ${product.stock}`, 'danger');
        return;
      }
      existing.quantity = newQty;
      existing.lineTotal = existing.quantity * existing.unitPrice;
    } else {
      this.cart.push({
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice: product.sellingPrice,
        costPrice: product.costPrice,
        lineTotal: qty * product.sellingPrice,
        maxStock: product.stock
      });
    }
    this.selectedQty[product.id] = 1;
    this.showMessage(`${product.name} added to cart`, 'success');
  }

  updateCartQty(item: CartItem, newQty: number): void {
    if (newQty < 1) {
      this.removeFromCart(item.productId);
      return;
    }
    if (newQty > item.maxStock) {
      this.showMessage(`Max available: ${item.maxStock}`, 'danger');
      return;
    }
    item.quantity = newQty;
    item.lineTotal = newQty * item.unitPrice;
  }

  removeFromCart(productId: number): void {
    this.cart = this.cart.filter(c => c.productId !== productId);
  }

  get cartTotal(): number {
    return this.cart.reduce((sum, i) => sum + i.lineTotal, 0);
  }

  get cartCount(): number {
    return this.cart.reduce((sum, i) => sum + i.quantity, 0);
  }

  completeSale(): void {
    if (this.cart.length === 0) {
      this.showMessage('Cart is empty', 'danger');
      return;
    }

    const items: SaleItem[] = this.cart.map(c => ({
      productId: c.productId,
      productName: c.productName,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      costPrice: c.costPrice,
      lineTotal: c.lineTotal
    }));

    const success = this.salesService.recordSale(items);
    if (success) {
      this.showMessage(`Sale completed! Total: $${this.cartTotal.toFixed(2)}`, 'success');
      this.cart = [];
    } else {
      this.showMessage('Sale failed – insufficient stock on one or more items', 'danger');
    }
  }

  clearCart(): void {
    this.cart = [];
  }

  private showMessage(msg: string, type: 'success' | 'danger'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 3500);
  }

  isLowStock(stock: number): boolean {
    return stock <= 8;
  }
}
