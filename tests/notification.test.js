const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const express = require("express");
const request = require("supertest");

// Stub auth so we don't need real JWT cookies — inject a fixed user instead.
const mockUserId = new mongoose.Types.ObjectId();
jest.mock("../src/middlewares/auth", () => (req, res, next) => {
  req.user = { _id: mockUserId };
  next();
});

const notificationRouter = require("../src/routes/notification");
const Notification = require("../src/models/notification");

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());

  app = express();
  app.use(express.json());
  app.use("/", notificationRouter);
});

afterEach(async () => {
  await Notification.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

const seed = (overrides = {}) =>
  Notification.create({
    recipientId: String(mockUserId),
    senderName: "Aarav",
    type: "message",
    title: "New message from Aarav",
    body: "hi",
    read: false,
    ...overrides,
  });

describe("GET /notifications", () => {
  test("returns the user's notifications with an unread count, newest first", async () => {
    await seed({ title: "older", createdAt: new Date(Date.now() - 10000) });
    await seed({ title: "newer", read: true });

    const res = await request(app).get("/notifications");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].title).toBe("newer"); // sorted desc by createdAt
    expect(res.body.unreadCount).toBe(1); // only the "older" one is unread
  });

  test("does not leak other users' notifications", async () => {
    await seed(); // mine
    await seed({ recipientId: String(new mongoose.Types.ObjectId()), title: "someone else" });

    const res = await request(app).get("/notifications");

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("New message from Aarav");
  });

  test("respects the limit query param (capped at 50)", async () => {
    await Promise.all(Array.from({ length: 5 }, (_, i) => seed({ title: `n${i}` })));

    const res = await request(app).get("/notifications?limit=3");

    expect(res.body.data).toHaveLength(3);
  });
});

describe("PATCH /notifications/read-all", () => {
  test("marks every unread notification as read", async () => {
    await seed();
    await seed();

    const res = await request(app).patch("/notifications/read-all");
    expect(res.status).toBe(200);

    const remaining = await Notification.countDocuments({
      recipientId: String(mockUserId),
      read: false,
    });
    expect(remaining).toBe(0);
  });
});

describe("PATCH /notifications/:id/read", () => {
  test("marks a single notification read", async () => {
    const n = await seed();

    const res = await request(app).patch(`/notifications/${n._id}/read`);

    expect(res.status).toBe(200);
    expect(res.body.data.read).toBe(true);
  });

  test("404s when the notification belongs to someone else", async () => {
    const other = await seed({ recipientId: String(new mongoose.Types.ObjectId()) });

    const res = await request(app).patch(`/notifications/${other._id}/read`);

    expect(res.status).toBe(404);
  });
});
