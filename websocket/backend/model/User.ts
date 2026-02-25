
export class User {
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