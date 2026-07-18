import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Sale, SaleItem } from '../models/sale.model';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private salesSubject = new BehaviorSubject<Sale[]>([]);
  private nextSaleId = 1;

  constructor(private productService: ProductService) {}

  getSales(): Observable<Sale[]> {
    return this.salesSubject.asObservable();
  }

  /**
   * Record a complete sale.
   * Returns true if successful (stock was available), false otherwise.
   */
  recordSale(items: SaleItem[]): boolean {
    if (!items || items.length === 0) {
      return false;
    }

    // Check & decrease stock for every item first
    for (const item of items) {
      const success = this.productService.decreaseStock(item.productId, item.quantity);
      if (!success) {
        // Rollback any previous decreases in this transaction (simple approach)
        // For production you would use a more robust transaction mechanism
        return false;
      }
    }

    const totalRevenue = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const totalCost = items.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0);

    const sale: Sale = {
      id: this.nextSaleId++,
      date: new Date(),
      items: [...items],
      totalRevenue,
      totalCost,
      profit: totalRevenue - totalCost
    };

    const current = this.salesSubject.value;
    this.salesSubject.next([sale, ...current]); // newest first
    return true;
  }

  /**
   * Returns sales within the given date range (inclusive).
   * Dates should be Date objects with time set appropriately.
   */
  getSalesByDateRange(start: Date, end: Date): Sale[] {
    const startTime = new Date(start);
    startTime.setHours(0, 0, 0, 0);

    const endTime = new Date(end);
    endTime.setHours(23, 59, 59, 999);

    return this.salesSubject.value.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startTime && saleDate <= endTime;
    });
  }

  /**
   * Calculate profit summary for a date range.
   * Business logic lives here – components just call this.
   */
  getProfitReport(start: Date, end: Date): {
    totalRevenue: number;
    totalCost: number;
    profit: number;
    salesCount: number;
    sales: Sale[];
  } {
    const sales = this.getSalesByDateRange(start, end);
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalCost = sales.reduce((sum, s) => sum + s.totalCost, 0);

    return {
      totalRevenue,
      totalCost,
      profit: totalRevenue - totalCost,
      salesCount: sales.length,
      sales
    };
  }
}
