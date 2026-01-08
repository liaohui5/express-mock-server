import { Sequelize, DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "mock-server.db");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false,
});

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

const Article = sequelize.define(
  "Article",
  {
    id: {
      type: DataTypes.TEXT,
      primaryKey: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "createdAt",
    },
    updatedAt: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "updatedAt",
    },
  },
  {
    tableName: "articles",
    timestamps: false,
  },
);

async function initDatabase() {
  await sequelize.sync();

  const userCount = await User.count();
  if (userCount === 0) {
    const userId = crypto.randomUUID();
    // password: 123456 -> md5 -> bcrypt
    const hashedPassword = await bcrypt.hash(
      "e10adc3949ba59abbe56e057f20f883e",
      10,
    );
    await User.create({
      id: userId,
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
    });
  }

  const articleCount = await Article.count();
  if (articleCount === 0) {
    const now = new Date().toISOString();
    const items = [];
    for (let i = 0; i < 50; i++) {
      items.push({
        id: crypto.randomUUID(),
        title: `Sample Article ${i + 1}`,
        author: `Author ${i + 1}`,
        content: `This is the content of article ${i + 1}`,
        createdAt: now,
        updatedAt: now,
      });
    }
    await Article.bulkCreate(items);
  }
}

export { sequelize, User, Article, initDatabase };
