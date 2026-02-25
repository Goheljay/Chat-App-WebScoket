import { ObjectId } from "mongodb";
export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
}

export interface ResponseUserDto {
  _id: ObjectId;
  email: string;
  name: string;
  createdAt: Date;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class User {
  _id?: ObjectId;
  email: string;
  name: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  isDeleted?: boolean;

  constructor(data: Partial<User>) {
    this.email = data.email || '';
    this.name = data.name || '';
    this.password = data.password || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.isDeleted = data.isDeleted || false;
  }
}