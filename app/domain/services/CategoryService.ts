import type { Category, CreateCategoryRequest, UpdateCategoryRequest, CategoryOption } from '../entities/Category';
import type { CategoryRepository } from '../repositories/CategoryRepository';

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor(categoryRepository: CategoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async getAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.getAll();
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    return await this.categoryRepository.getById(categoryId);
  }

  async getCategoryByNumber(categoryNumber: number): Promise<Category | null> {
    return await this.categoryRepository.getByNumber(categoryNumber);
  }

  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    return await this.categoryRepository.create(request);
  }

  async updateCategory(categoryId: string, request: UpdateCategoryRequest): Promise<Category> {
    return await this.categoryRepository.update(categoryId, request);
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.categoryRepository.delete(categoryId);
  }

  async getNextCategoryNumber(): Promise<number> {
    return await this.categoryRepository.getNextCategoryNumber();
  }

  async getCategoryOptions(): Promise<CategoryOption[]> {
    const categories = await this.getAllCategories();
    return categories
      .sort((a, b) => a.categoryNumber - b.categoryNumber)
      .map(category => ({
        value: category.categoryNumber,
        label: category.name,
        displayText: `${category.categoryNumber} - ${category.name}`
      }));
  }

  getCategoryDisplayText(categoryNumber: number | null, categories: Category[]): string {
    if (!categoryNumber) return 'Sin categoría';
    
    const category = categories.find(cat => cat.categoryNumber === categoryNumber);
    return category ? `${category.categoryNumber} - ${category.name}` : `Categoría ${categoryNumber}`;
  }

  validateCategoryData(name: string, categoryNumber: number, existingCategories: Category[], excludeCategoryId?: string): { isValid: boolean; error?: string } {
    if (!name.trim()) {
      return { isValid: false, error: 'El nombre de la categoría es requerido' };
    }

    if (name.length > 100) {
      return { isValid: false, error: 'El nombre no puede exceder 100 caracteres' };
    }

    if (!categoryNumber || categoryNumber <= 0) {
      return { isValid: false, error: 'El número de categoría debe ser mayor a 0' };
    }

    // Check for duplicate category number
    const duplicateNumber = existingCategories.find(cat => 
      cat.categoryNumber === categoryNumber && cat.categoryId !== excludeCategoryId
    );
    if (duplicateNumber) {
      return { isValid: false, error: `El número ${categoryNumber} ya está en uso` };
    }

    // Check for duplicate category name
    const duplicateName = existingCategories.find(cat => 
      cat.name.toLowerCase().trim() === name.toLowerCase().trim() && cat.categoryId !== excludeCategoryId
    );
    if (duplicateName) {
      return { isValid: false, error: `Ya existe una categoría con el nombre "${name}"` };
    }

    return { isValid: true };
  }
}
