import { ProductService } from '../../services/product.service';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SalesService } from '../../services/sales.service';
import { Product } from '../../models/product.model';
import { Sale } from '../../models/sale.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, AfterViewInit {
  products: Product[] = [];
  sales: Sale[] = [];

  // Product form
  productForm: FormGroup;
  editingProduct: Product | null = null;
  showProductModal = false;

  // Report
  startDate: string = '';
  endDate: string = '';
  report = {
    totalRevenue: 0,
    totalCost: 0,
    profit: 0,
    salesCount: 0,
    sales: [] as Sale[]
  };

  // Chart
  private chart: Chart | null = null;
  @ViewChild('profitChart') chartCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private productService: ProductService,
    private salesService: SalesService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sellingPrice: [0, [Validators.required, Validators.min(0.01)]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category: ['General'],
      image: ['']
    });
  }

  ngOnInit(): void {
    // Default date range: last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    this.endDate = today.toISOString().split('T')[0];
    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];

    this.productService.getProducts().subscribe(p => this.products = p);
    this.salesService.getSales().subscribe(s => {
      this.sales = s;
      this.generateReport();
    });
  }

  ngAfterViewInit(): void {
    // Chart will be created when report is generated
  }

  // ========== Product CRUD ==========
  openAddModal(): void {
    this.editingProduct = null;
    this.productForm.reset({
      name: '',
      sellingPrice: 0,
      costPrice: 0,
      stock: 0,
      category: 'General',
      image: ''
    });
    this.showProductModal = true;
  }

  openEditModal(product: Product): void {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      sellingPrice: product.sellingPrice,
      costPrice: product.costPrice,
      stock: product.stock,
      category: product.category || 'General',
      image: product.image || ''
    });
    this.showProductModal = true;
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const val = this.productForm.value;
    if (this.editingProduct) {
      this.productService.updateProduct({
        ...this.editingProduct,
        ...val
      });
    } else {
      this.productService.addProduct(val);
    }
    this.closeModal();
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id);
    }
  }

  closeModal(): void {
    this.showProductModal = false;
    this.editingProduct = null;
  }

  // ========== Reports ==========
  generateReport(): void {
    if (!this.startDate || !this.endDate) return;

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    this.report = this.salesService.getProfitReport(start, end);
    setTimeout(() => this.renderChart(), 100);
  }

  private renderChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    // Group sales by day for the chart
    const dayMap = new Map<string, number>();
    this.report.sales.forEach(s => {
      const day = new Date(s.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
      dayMap.set(day, (dayMap.get(day) || 0) + s.profit);
    });

    const labels = Array.from(dayMap.keys()).sort();
    const data = labels.map(l => dayMap.get(l) || 0);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(l => {
          const d = new Date(l);
          return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Daily Profit ($)',
          data,
          backgroundColor: 'rgba(13, 110, 253, 0.7)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Profit: $${Number(ctx.raw).toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (v) => '$' + v
            }
          }
        }
      }
    });
  }

  isLowStock(stock: number): boolean {
    return stock <= 8;
  }
}
