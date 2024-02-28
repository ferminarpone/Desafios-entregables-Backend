import CustomError from "../../errors/CustomError.js";
import EErrors from "../../errors/errors-enum.js";
import { generateCodeProductErrorInfo, generateFieldProductErrorInfo } from "../../errors/messages/product-creation-error.message.js";
import { productModel } from "../models/products.model.js";

class ProductServices {
  async getAllProducts(limit, page, sort, filter) {
    const query = {};
    if (filter !== undefined) {
      const [field, value] = filter.split(":");
      const validFields = [
        "title",
        "category",
        "description",
        "_id",
        "price",
        "code",
        "status",
      ];
      if (validFields.includes(field)) {
        if (["title", "category", "description"].includes(field)) {
          query[field] = { $regex: new RegExp(value, "i") };
        } else {
          query[field] = value;
        }
      } else {
        throw new Error("El campo que desea filtrar no existe.");
      }
    }
    const orderedQuery = productModel
      .find(query)
      .sort({ price: sort === "desc" ? -1 : 1 });
    try {
      const products = await productModel.paginate(orderedQuery, {
        page: page || 1,
        limit: limit || 10,
      });
      const newObject = {
        status: "succes",
        payload: products.docs,
        totalDocs: products.totalDocs,
        totalPages: products.totalPages,
        prevPage: products.prevPage,
        nextPage: products.nextPage,
        page: products.page,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
      };
      newObject.nextLink = `/products?page=${newObject.nextPage}&&limit=${limit}`;
      newObject.prevLink = `/products?page=${newObject.prevPage}&&limit=${limit}`;
      return newObject;
    } catch (e) {
      throw Error(e.message);
    }
  }

  async getProductById(id) {
    return await productModel.findById(id);
  }

  async createProduct(product) {
    const fieldsValidation = this.validateFields(product);
    const { title, description, price, code, category, stock } = product;
    if (fieldsValidation) {
     const error = CustomError.createError({
        name: "Product Create Error",
        cause: generateFieldProductErrorInfo({ title, description, price, code, category, stock }),
        message: "Error tratando de ingresar un producto, campos faltantes o invalidos",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }
    const codeValidation = await this.validateCode(product);
    if (codeValidation) {
      CustomError.createError({
        name: "Product Create Error",
        cause: generateCodeProductErrorInfo({code}),
        message: "Error tratando de ingresar un producto, code ya existente",
        code: EErrors.INVALID_TYPES_ERROR,
      });
    }
    return await productModel.create(product);
  }

  validateFields(product) {
    const arrayProduct = [
      product.title,
      product.description,
      product.price,
      product.code,
      product.category,
      product.stock,
    ];
    const required =
      arrayProduct.includes(undefined) || arrayProduct.includes("");
    return required;
  }

  async validateCode(product) {
    const products = await productModel.find();
    const validation = products.some((el) => el.code === product.code);
    return validation;
  }

  async updateProduct(id, product) {
    const codeValidation = await this.validateCode(product);
    if (codeValidation) {
      throw Error(
        `El 'code' del producto ingresado, ya existe en el gestionador de Productos.`
      );
    }
    return await productModel.findByIdAndUpdate(id, product);
  }

  async deleteProduct(id) {
    const product = await productModel.findById(id);
    if (!product) {
      throw Error(`El producto con id ${id} no existe.`);
    }
    return await productModel.findByIdAndDelete(id);
  }
}

export default new ProductServices();
