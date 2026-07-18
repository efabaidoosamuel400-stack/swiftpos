import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([
    {
      id: 1,
      name: 'Wireless Headphones Pro',
      sellingPrice: 89.99,
      costPrice: 42.50,
      stock: 28,
      category: 'Electronics',
      image: 'https://picsum.photos/id/20/600/400'
    },
    {
      id: 2,
      name: 'Smart Watch Series 5',
      sellingPrice: 199.99,
      costPrice: 110.00,
      stock: 15,
      category: 'Electronics',
      image: 'https://picsum.photos/id/60/600/400'
    },
    {
      id: 3,
      name: 'Organic Green Tea (50 bags)',
      sellingPrice: 12.50,
      costPrice: 5.20,
      stock: 85,
      category: 'Beverages',
      image: 'https://picsum.photos/id/133/600/400'
    },
    {
      id: 4,
      name: 'Leather Notebook A5',
      sellingPrice: 24.99,
      costPrice: 9.80,
      stock: 42,
      category: 'Stationery',
      image: 'https://picsum.photos/id/201/600/400'
    },
    {
      id: 5,
      name: 'USB-C Fast Charger 65W',
      sellingPrice: 34.99,
      costPrice: 14.50,
      stock: 60,
      category: 'Accessories',
      image: 'https://picsum.photos/id/180/600/400'
    },
    {
      id: 6,
      name: 'Bluetooth Speaker Mini',
      sellingPrice: 49.99,
      costPrice: 22.00,
      stock: 8,
      category: 'Electronics',
      image: 'https://picsum.photos/id/251/600/400'
    },
    {
      id: 7,
      name: 'Premium Coffee Beans 1kg',
      sellingPrice: 28.75,
      costPrice: 13.40,
      stock: 33,
      category: 'Beverages',
      image: 'https://picsum.photos/id/292/600/400'
    },
    {
      id: 8,
      name: 'Ergonomic Mouse',
      sellingPrice: 39.99,
      costPrice: 16.80,
      stock: 5,
      category: 'Accessories',
      image: 'https://picsum.photos/id/367/600/400'
    },
    {
      id: 9,
      name: 'Desk Lamp LED',
      sellingPrice: 45.00,
      costPrice: 19.90,
      stock: 19,
      category: 'Home',
      image: 'https://picsum.photos/id/106/600/400'
    },
    {
      id: 10,
      name: 'Water Bottle Stainless 750ml',
      sellingPrice: 18.99,
      costPrice: 7.25,
      stock: 70,
      category: 'Lifestyle',
      image: 'https://picsum.photos/id/433/600/400'
    }
  ]);

  private nextId = 11;

  getProducts(): Observable<Product[]> {
    return this.productsSubject.asObservable();
  }

  getProductById(id: number): Product | undefined {
    return this.productsSubject.value.find(p => p.id === id);
  }

  addProduct(product: Omit<Product, 'id'>): void {
    const newProduct: Product = {
      ...product,
      id: this.nextId++
    };
    const current = this.productsSubject.value;
    this.productsSubject.next([...current, newProduct]);
  }

  updateProduct(updated: Product): void {
    const current = this.productsSubject.value.map(p =>
      p.id === updated.id ? { ...updated } : p
    );
    this.productsSubject.next(current);
  }

  deleteProduct(id: number): void {
    const current = this.productsSubject.value.filter(p => p.id !== id);
    this.productsSubject.next(current);
  }

  decreaseStock(productId: number, quantity: number): boolean {
    const products = this.productsSubject.value;
    const product = products.find(p => p.id === productId);
    if (!product || product.stock < quantity) {
      return false;
    }
    product.stock -= quantity;
    this.productsSubject.next([...products]);
    return true;
  }

  increaseStock(productId: number, quantity: number): void {
    const products = this.productsSubject.value;
    const product = products.find(p => p.id === productId);
    if (product) {
      product.stock += quantity;
      this.productsSubject.next([...products]);
    }
  }
}